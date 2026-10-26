import { fillMu, type StripParams } from "./render-strip";

export type StripEvent = {
  token: number;
  phase: "preview" | "full";
  y: number;
  width: number;
  height: number;
  rows: number;
  mu: Float32Array;
};

export type Engine = {
  render: (job: {
    cx: number;
    cy: number;
    span: number;
    maxIter: number;
    width: number;
    height: number;
  }) => number;
  destroy: () => void;
};

type Phase = "preview" | "full";

type Task = StripParams & { token: number; phase: Phase };

type Slot = { worker: Worker; busy: boolean };

export function createEngine(handlers: {
  onStrip: (event: StripEvent) => void;
  onPhase: (token: number, phase: Phase) => void;
}): Engine {
  let dead = false;
  let token = 0;
  let queue: Task[] = [];
  let phaseLeft = 0;
  let mainMode = false;
  let pumping = false;
  const slots: Slot[] = [];

  let current: {
    cx: number;
    cy: number;
    span: number;
    maxIter: number;
    width: number;
    height: number;
  } | null = null;

  function workerCount(): number {
    const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
    return Math.max(1, Math.min(6, cores));
  }

  function dispatch() {
    if (dead) return;
    if (mainMode) {
      pumpMain();
      return;
    }
    while (queue.length) {
      const slot = slots.find((s) => !s.busy);
      if (!slot) return;
      const task = queue.shift();
      if (!task) return;
      slot.busy = true;
      slot.worker.postMessage({ type: "render", ...task });
    }
  }

  function finishTask(taskToken: number, phase: Phase) {
    if (taskToken !== token) return;
    phaseLeft--;
    if (phaseLeft > 0) return;
    handlers.onPhase(taskToken, phase);
    if (phase === "preview" && current && taskToken === token) {
      enqueue(token, "full", current.width, current.height, current);
    }
  }

  function onWorkerMessage(slot: Slot, data: { type?: string; token?: number; phase?: Phase; y?: number; width?: number; height?: number; rows?: number; mu?: Float32Array }) {
    slot.busy = false;
    if (dead) return;
    if (data?.type === "strip" && data.mu && data.token === token && data.phase && typeof data.y === "number") {
      handlers.onStrip({
        token: data.token,
        phase: data.phase,
        y: data.y,
        width: data.width ?? 0,
        height: data.height ?? 0,
        rows: data.rows ?? 0,
        mu: data.mu,
      });
      finishTask(data.token, data.phase);
    }
    dispatch();
  }

  function failToMain() {
    if (mainMode || dead) return;
    mainMode = true;
    for (const slot of slots) {
      slot.busy = false;
      slot.worker.terminate();
    }
    slots.length = 0;
    if (current) {
      queue = [];
      enqueue(token, "preview", Math.max(80, Math.round(current.width / 4)), Math.max(60, Math.round(current.height / 4)), current);
    }
  }

  try {
    const n = workerCount();
    for (let i = 0; i < n; i++) {
      const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
      const slot: Slot = { worker, busy: false };
      worker.onmessage = (ev: MessageEvent) => onWorkerMessage(slot, ev.data);
      worker.onerror = () => {
        failToMain();
      };
      slots.push(slot);
    }
  } catch {
    mainMode = true;
  }
  if (slots.length === 0) mainMode = true;

  function enqueue(
    taskToken: number,
    phase: Phase,
    width: number,
    height: number,
    job: { cx: number; cy: number; span: number; maxIter: number },
  ) {
    const band = phase === "preview" ? Math.max(1, Math.ceil(height / Math.max(1, slots.length || 2))) : mainMode ? 16 : 40;
    const tasks: Task[] = [];
    for (let y = 0; y < height; y += band) {
      tasks.push({
        token: taskToken,
        phase,
        width,
        height,
        y0: y,
        y1: Math.min(height, y + band),
        cx: job.cx,
        cy: job.cy,
        span: job.span,
        maxIter: job.maxIter,
      });
    }
    if (phase === "full") {
      const mid = height / 2;
      tasks.sort((a, b) => Math.abs((a.y0 + a.y1) / 2 - mid) - Math.abs((b.y0 + b.y1) / 2 - mid));
    }
    phaseLeft = tasks.length;
    queue = tasks;
    dispatch();
  }

  function pumpMain() {
    if (pumping || dead) return;
    const task = queue.shift();
    if (!task) return;
    pumping = true;
    setTimeout(() => {
      pumping = false;
      if (dead || task.token !== token) {
        pumpMain();
        return;
      }
      const mu = fillMu(task, () => task.token !== token);
      if (dead || !mu || task.token !== token) {
        pumpMain();
        return;
      }
      handlers.onStrip({
        token: task.token,
        phase: task.phase,
        y: task.y0,
        width: task.width,
        height: task.height,
        rows: task.y1 - task.y0,
        mu,
      });
      finishTask(task.token, task.phase);
      pumpMain();
    }, 0);
  }

  return {
    render(job) {
      const my = ++token;
      current = job;
      queue = [];
      if (!mainMode) {
        for (const slot of slots) slot.worker.postMessage({ type: "cancel" });
      }
      const pw = Math.max(80, Math.round(job.width / 4));
      const ph = Math.max(60, Math.round(job.height / 4));
      enqueue(my, "preview", pw, ph, job);
      return my;
    },
    destroy() {
      dead = true;
      token++;
      queue = [];
      for (const slot of slots) slot.worker.terminate();
      slots.length = 0;
    },
  };
}
