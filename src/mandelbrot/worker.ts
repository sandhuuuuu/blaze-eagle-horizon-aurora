import { fillMu } from "./render-strip";

type RenderMsg = {
  type: "render";
  token: number;
  phase: "preview" | "full";
  width: number;
  height: number;
  y0: number;
  y1: number;
  cx: number;
  cy: number;
  span: number;
  maxIter: number;
};

type InMsg = { type: "cancel" } | RenderMsg;

const scope = self as unknown as {
  onmessage: ((ev: MessageEvent<InMsg>) => void) | null;
  postMessage: (data: unknown, transfer?: Transferable[]) => void;
};

let generation = 0;

scope.onmessage = (ev) => {
  const data = ev.data;
  if (!data || data.type === "cancel") {
    generation++;
    return;
  }
  if (data.type !== "render") return;
  const gen = ++generation;
  const mu = fillMu(
    {
      width: data.width,
      height: data.height,
      y0: data.y0,
      y1: data.y1,
      cx: data.cx,
      cy: data.cy,
      span: data.span,
      maxIter: data.maxIter,
    },
    () => gen !== generation,
  );
  if (!mu || gen !== generation) {
    scope.postMessage({ type: "abort" });
    return;
  }
  const payload = {
    type: "strip" as const,
    token: data.token,
    phase: data.phase,
    y: data.y0,
    width: data.width,
    height: data.height,
    rows: data.y1 - data.y0,
    mu,
  };
  scope.postMessage(payload, [mu.buffer]);
};
