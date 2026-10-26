import { useEffect, useRef, useState } from "react";
import { ChevronDown, Minus, Plus, RotateCcw, SlidersHorizontal } from "lucide-react";
import { colorize, paletteById, PALETTES, VOID_CSS, type PaletteId } from "@/mandelbrot/palette";
import { fillMu } from "@/mandelbrot/render-strip";
import type { Engine, StripEvent } from "@/mandelbrot/engine";
import {
  ITER_MAX,
  ITER_MIN,
  PRESETS,
  clampIter,
  formatMag,
  formatPair,
  loadView,
  needsMoreIterations,
  overviewSpan,
  overviewView,
  panBy,
  precisionLimited,
  saveView,
  zoomAt,
  type FractalView,
} from "@/mandelbrot/view";

const INITIAL: FractalView = {
  cx: -0.7,
  cy: 0,
  span: 3.4,
  maxIter: 280,
  paletteId: "glacier",
};

function chooseSize(cssW: number, cssH: number): { w: number; h: number } {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  let w = Math.max(2, Math.round(cssW * dpr));
  let h = Math.max(2, Math.round(cssH * dpr));
  const cap = 1_250_000;
  const pixels = w * h;
  if (pixels > cap) {
    const k = Math.sqrt(cap / pixels);
    w = Math.max(2, Math.round(w * k));
    h = Math.max(2, Math.round(h * k));
  }
  return { w, h };
}

function paintView(
  screen: HTMLCanvasElement,
  buffer: HTMLCanvasElement,
  live: FractalView,
  base: FractalView,
) {
  const ctx = screen.getContext("2d", { alpha: false });
  if (!ctx) return;
  const W = buffer.width;
  const H = buffer.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = VOID_CSS;
  ctx.fillRect(0, 0, screen.width, screen.height);
  if (W < 2 || H < 2 || base.span <= 0) return;
  const S = live.span / base.span;
  const baseScale = base.span / W;
  const A = (live.cx - base.cx) / baseScale + W / 2 - (W / 2) * S;
  const B = (base.cy - live.cy) / baseScale + H / 2 - (H / 2) * S;
  const identity =
    Math.abs(S - 1) < 1e-6 && Math.abs(A) < 0.35 && Math.abs(B) < 0.35 && screen.width === W && screen.height === H;
  if (!identity) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.setTransform(1 / S, 0, 0, 1 / S, -A / S, -B / S);
  }
  ctx.drawImage(buffer, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export function Explorer() {
  const screenRef = useRef<HTMLCanvasElement>(null);
  const [hud, setHud] = useState<FractalView>(INITIAL);
  const [homeSpan, setHomeSpan] = useState(3.4);
  const [presetId, setPresetId] = useState<string | null>("overview");
  const [panelOpen, setPanelOpen] = useState(true);
  const [hint, setHint] = useState(true);
  const [rendering, setRendering] = useState(true);
  const [progress, setProgress] = useState(0);
  const [panning, setPanning] = useState(false);

  const api = useRef({
    setIter: (_n: number) => {},
    setPalette: (_id: PaletteId) => {},
    preset: (_id: string) => {},
    reset: () => {},
    zoomCenter: (_factor: number) => {},
    togglePanel: () => {},
  });

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;

    const viewRef = { current: { ...INITIAL } };
    const stableRef: { current: FractalView | null } = { current: null };
    const sizeRef = { current: { w: 2, h: 2 } };
    const bufferRef: { current: HTMLCanvasElement | null } = { current: null };
    const previewRef: { current: HTMLCanvasElement | null } = { current: null };
    const engineRef: { current: Engine | null } = { current: null };
    const jobTokenRef = { current: 0 };
    const jobViewRef = { current: { ...INITIAL } };
    const cacheReadyRef = { current: false };
    const cacheRef: { current: { view: FractalView; w: number; h: number; mu: Float32Array } | null } = {
      current: null,
    };
    const alive = { current: true };
    let animToken = 0;
    let commitTimer = 0;
    let fitTimer = 0;
    let hudFrame = 0;
    let hintTimer = 0;

    const stored = loadView();
    if (stored) {
      viewRef.current = stored;
      setPresetId(null);
      setHud(stored);
    }

    function publish() {
      if (hudFrame) return;
      hudFrame = requestAnimationFrame(() => {
        hudFrame = 0;
        if (!alive.current) return;
        setHud({ ...viewRef.current });
      });
    }

    function ensureBuffer(w: number, h: number) {
      let buffer = bufferRef.current;
      if (!buffer || buffer.width !== w || buffer.height !== h) {
        buffer = document.createElement("canvas");
        buffer.width = w;
        buffer.height = h;
        bufferRef.current = buffer;
      }
      return buffer;
    }

    function paint() {
      const buffer = bufferRef.current;
      const base = stableRef.current;
      if (!buffer || !base) return;
      paintView(screen!, buffer, viewRef.current, base);
    }

    function drawQuick(view: FractalView) {
      const { w, h } = sizeRef.current;
      if (w < 2 || h < 2) return;
      const qw = Math.max(72, Math.round(w / 5));
      const qh = Math.max(48, Math.round(h / 5));
      const mu = fillMu(
        {
          width: qw,
          height: qh,
          y0: 0,
          y1: qh,
          cx: view.cx,
          cy: view.cy,
          span: view.span,
          maxIter: Math.min(view.maxIter, 240),
        },
        () => false,
      );
      if (!mu) return;
      const small = document.createElement("canvas");
      small.width = qw;
      small.height = qh;
      const sctx = small.getContext("2d");
      if (!sctx) return;
      const image = sctx.createImageData(qw, qh);
      colorize(mu, paletteById(view.paletteId).rgb, image.data);
      sctx.putImageData(image, 0, 0);
      const buffer = ensureBuffer(w, h);
      const bctx = buffer.getContext("2d");
      if (!bctx) return;
      bctx.setTransform(1, 0, 0, 1, 0, 0);
      bctx.imageSmoothingEnabled = true;
      bctx.imageSmoothingQuality = "high";
      bctx.drawImage(small, 0, 0, w, h);
      stableRef.current = { ...view };
      paint();
    }

    function commitNow() {
      window.clearTimeout(commitTimer);
      cacheReadyRef.current = false;
      const engine = engineRef.current;
      const { w, h } = sizeRef.current;
      if (!engine || w < 2 || h < 2) return;
      const view = { ...viewRef.current };
      jobViewRef.current = view;
      setRendering(true);
      setProgress(0.04);
      jobTokenRef.current = engine.render({
        cx: view.cx,
        cy: view.cy,
        span: view.span,
        maxIter: view.maxIter,
        width: w,
        height: h,
      });
    }

    function commitSoon(ms: number) {
      window.clearTimeout(commitTimer);
      commitTimer = window.setTimeout(commitNow, ms);
    }

    function cancelAnim() {
      animToken++;
    }

    function animateTo(target: FractalView) {
      const from = { ...viewRef.current };
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const ratio = target.span / from.span;
      const dist = Math.hypot(target.cx - from.cx, target.cy - from.cy) / Math.max(from.span, 1e-16);
      if (reduce || !stableRef.current || ratio < 0.3 || ratio > 3.2 || dist > 1.15) {
        cancelAnim();
        viewRef.current = target;
        publish();
        drawQuick(target);
        commitNow();
        return;
      }
      const id = ++animToken;
      const t0 = performance.now();
      const step = (now: number) => {
        if (!alive.current || id !== animToken) return;
        const u = Math.min(1, (now - t0) / 280);
        const e = 1 - (1 - u) ** 3;
        viewRef.current = {
          ...target,
          cx: from.cx + (target.cx - from.cx) * e,
          cy: from.cy + (target.cy - from.cy) * e,
          span: from.span * (target.span / from.span) ** e,
        };
        publish();
        paint();
        if (u < 1) requestAnimationFrame(step);
        else {
          viewRef.current = { ...target };
          commitNow();
        }
      };
      requestAnimationFrame(step);
    }

    function dismissHint() {
      setHint(false);
    }

    function geometryMatches(view: FractalView, w: number, h: number) {
      const cache = cacheRef.current;
      if (!cache) return false;
      return (
        cache.w === w &&
        cache.h === h &&
        cache.view.cx === view.cx &&
        cache.view.cy === view.cy &&
        cache.view.span === view.span &&
        cache.view.maxIter === view.maxIter
      );
    }

    function recolorCache() {
      const cache = cacheRef.current;
      const { w, h } = sizeRef.current;
      if (!cacheReadyRef.current || !cache || !geometryMatches(viewRef.current, w, h)) return false;
      const buffer = ensureBuffer(w, h);
      const ctx = buffer.getContext("2d");
      if (!ctx) return false;
      const image = ctx.createImageData(w, h);
      colorize(cache.mu, paletteById(viewRef.current.paletteId).rgb, image.data);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.putImageData(image, 0, 0);
      stableRef.current = { ...viewRef.current };
      paint();
      saveView(viewRef.current);
      return true;
    }

    function onStrip(event: StripEvent) {
      if (!alive.current || event.token !== jobTokenRef.current) return;
      const pal = paletteById(viewRef.current.paletteId).rgb;
      if (event.phase === "preview") {
        let preview = previewRef.current;
        if (!preview || preview.width !== event.width || preview.height !== event.height) {
          preview = document.createElement("canvas");
          preview.width = event.width;
          preview.height = event.height;
          previewRef.current = preview;
        }
        const ctx = preview.getContext("2d");
        if (!ctx) return;
        const image = ctx.createImageData(event.width, event.rows);
        colorize(event.mu, pal, image.data);
        ctx.putImageData(image, 0, event.y);
        return;
      }
      const { w, h } = sizeRef.current;
      if (event.width !== w || event.height !== h) return;
      const buffer = ensureBuffer(w, h);
      const ctx = buffer.getContext("2d");
      if (!ctx) return;
      const image = ctx.createImageData(event.width, event.rows);
      colorize(event.mu, pal, image.data);
      ctx.putImageData(image, 0, event.y);
      let cache = cacheRef.current;
      if (!cache || cache.view !== jobViewRef.current || cache.w !== w || cache.h !== h) {
        cache = { view: jobViewRef.current, w, h, mu: new Float32Array(w * h) };
        cacheRef.current = cache;
      }
      cache.mu.set(event.mu, event.y * event.width);
      if (!stableRef.current) stableRef.current = { ...jobViewRef.current };
      paint();
      const band = 40;
      const total = Math.ceil(h / band);
      setProgress((p) => Math.min(0.98, Math.max(p, 0.08) + 0.9 / total));
    }

    function onPhase(token: number, phase: "preview" | "full") {
      if (!alive.current || token !== jobTokenRef.current) return;
      const { w, h } = sizeRef.current;
      if (phase === "preview") {
        const preview = previewRef.current;
        const buffer = ensureBuffer(w, h);
        const ctx = buffer.getContext("2d");
        if (preview && ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(preview, 0, 0, w, h);
          stableRef.current = { ...jobViewRef.current };
          paint();
        }
        setProgress(0.12);
        return;
      }
      stableRef.current = { ...jobViewRef.current };
      cacheReadyRef.current = true;
      setRendering(false);
      setProgress(1);
      saveView(jobViewRef.current);
    }

    function fit() {
      const rect = screen!.getBoundingClientRect();
      const next = chooseSize(rect.width, rect.height);
      const fitted = overviewSpan(next.w, next.h);
      setHomeSpan(fitted);
      if (next.w === sizeRef.current.w && next.h === sizeRef.current.h && screen!.width === next.w) {
        return;
      }
      sizeRef.current = next;
      screen!.width = next.w;
      screen!.height = next.h;
      cacheRef.current = null;
      cacheReadyRef.current = false;
      ensureBuffer(next.w, next.h);
      drawQuick(viewRef.current);
      commitSoon(70);
    }

    if (!stored) {
      const rect = screen.getBoundingClientRect();
      const next = chooseSize(rect.width, rect.height);
      sizeRef.current = next;
      const fitted = overviewView(next.w, next.h, viewRef.current.paletteId);
      viewRef.current = fitted;
      setHud(fitted);
      setHomeSpan(fitted.span);
    }

    fit();

    const reducedHint = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    hintTimer = window.setTimeout(() => setHint(false), reducedHint ? 4000 : 7400);

    let engine: Engine | null = null;
    void import("@/mandelbrot/engine").then(({ createEngine }) => {
      if (!alive.current) return;
      engine = createEngine({ onStrip, onPhase });
      engineRef.current = engine;
      commitNow();
    });

    const observer = new ResizeObserver(() => {
      window.clearTimeout(fitTimer);
      fitTimer = window.setTimeout(fit, 80);
    });
    observer.observe(screen);

    const pointers = new Map<number, { x: number; y: number }>();
    let mode: "none" | "draw" | "pinch" = "none";
    let dragged = false;
    let pinchDist = 0;
    let downCssX = 0;
    let downCssY = 0;

    function toBitmap(clientX: number, clientY: number) {
      const rect = screen!.getBoundingClientRect();
      const { w, h } = sizeRef.current;
      return {
        x: ((clientX - rect.left) / Math.max(1, rect.width)) * w,
        y: ((clientY - rect.top) / Math.max(1, rect.height)) * h,
      };
    }

    function pinchMetrics() {
      const pts = [...pointers.values()];
      if (pts.length < 2) return null;
      const dx = pts[0]!.x - pts[1]!.x;
      const dy = pts[0]!.y - pts[1]!.y;
      return {
        dist: Math.hypot(dx, dy),
        midX: (pts[0]!.x + pts[1]!.x) / 2,
        midY: (pts[0]!.y + pts[1]!.y) / 2,
      };
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      screen!.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, toBitmap(e.clientX, e.clientY));
      cancelAnim();
      if (pointers.size >= 2) {
        mode = "pinch";
        dragged = true;
        const m = pinchMetrics();
        pinchDist = m?.dist ?? 0;
        setPanning(true);
      } else {
        mode = "draw";
        dragged = false;
        downCssX = e.clientX;
        downCssY = e.clientY;
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (!pointers.has(e.pointerId)) return;
      const prev = pointers.get(e.pointerId)!;
      const next = toBitmap(e.clientX, e.clientY);
      pointers.set(e.pointerId, next);
      if (mode === "pinch") {
        const m = pinchMetrics();
        if (m && pinchDist > 0) {
          const factor = pinchDist / m.dist;
          viewRef.current = zoomAt(viewRef.current, m.midX, m.midY, sizeRef.current.w, sizeRef.current.h, factor);
          pinchDist = m.dist;
          setPresetId(null);
          publish();
          paint();
        }
        return;
      }
      if (mode !== "draw") return;
      const dx = e.clientX - downCssX;
      const dy = e.clientY - downCssY;
      if (!dragged && dx * dx + dy * dy > 16) {
        dragged = true;
        setPanning(true);
        dismissHint();
        setPresetId(null);
      }
      if (!dragged) return;
      viewRef.current = panBy(viewRef.current, next.x - prev.x, next.y - prev.y, sizeRef.current.w);
      publish();
      paint();
    }

    function endGesture() {
      if (dragged) commitSoon(40);
      mode = "none";
      dragged = false;
      setPanning(false);
    }

    function onPointerUp(e: PointerEvent) {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      if (pointers.size === 0) {
        if (mode === "draw" && !dragged) {
          const p = toBitmap(e.clientX, e.clientY);
          const factor = e.shiftKey ? 2 : 0.5;
          dismissHint();
          setPresetId(null);
          animateTo(zoomAt(viewRef.current, p.x, p.y, sizeRef.current.w, sizeRef.current.h, factor));
          mode = "none";
          setPanning(false);
          return;
        }
        endGesture();
        return;
      }
      if (mode === "pinch" && pointers.size < 2) {
        mode = "draw";
        dragged = true;
        const m = pinchMetrics();
        pinchDist = m?.dist ?? 0;
      }
    }

    function onPointerCancel(e: PointerEvent) {
      pointers.delete(e.pointerId);
      if (pointers.size === 0) endGesture();
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      cancelAnim();
      dismissHint();
      setPresetId(null);
      const raw = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 160 : e.deltaY;
      const factor = Math.min(1.35, Math.max(0.74, Math.exp(raw * 0.0014)));
      const p = toBitmap(e.clientX, e.clientY);
      viewRef.current = zoomAt(viewRef.current, p.x, p.y, sizeRef.current.w, sizeRef.current.h, factor);
      publish();
      paint();
      commitSoon(140);
    }

    function onContext(e: MouseEvent) {
      e.preventDefault();
      cancelAnim();
      dismissHint();
      setPresetId(null);
      const p = toBitmap(e.clientX, e.clientY);
      animateTo(zoomAt(viewRef.current, p.x, p.y, sizeRef.current.w, sizeRef.current.h, 2));
    }

    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const { w, h } = sizeRef.current;
      const v = viewRef.current;
      const fine = e.shiftKey ? 0.03 : 0.09;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPresetId(null);
        viewRef.current = panBy(v, -w * fine, 0, w);
        publish();
        paint();
        commitSoon(90);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setPresetId(null);
        viewRef.current = panBy(v, w * fine, 0, w);
        publish();
        paint();
        commitSoon(90);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setPresetId(null);
        viewRef.current = panBy(v, 0, -h * fine, w);
        publish();
        paint();
        commitSoon(90);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setPresetId(null);
        viewRef.current = panBy(v, 0, h * fine, w);
        publish();
        paint();
        commitSoon(90);
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setPresetId(null);
        animateTo(zoomAt(v, w / 2, h / 2, w, h, 0.62));
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setPresetId(null);
        animateTo(zoomAt(v, w / 2, h / 2, w, h, 1.62));
      } else if (e.key === "[" ) {
        api.current.setIter(v.maxIter - 48);
      } else if (e.key === "]") {
        api.current.setIter(v.maxIter + 48);
      } else if (e.key === "0" || e.key === "r" || e.key === "R" || e.key === "Home") {
        e.preventDefault();
        api.current.reset();
      }
    }

    screen.addEventListener("pointerdown", onPointerDown);
    screen.addEventListener("pointermove", onPointerMove);
    screen.addEventListener("pointerup", onPointerUp);
    screen.addEventListener("pointercancel", onPointerCancel);
    screen.addEventListener("wheel", onWheel, { passive: false });
    screen.addEventListener("contextmenu", onContext);
    window.addEventListener("keydown", onKey);

    api.current.setIter = (n: number) => {
      const maxIter = clampIter(n);
      if (maxIter === viewRef.current.maxIter) return;
      viewRef.current = { ...viewRef.current, maxIter };
      setPresetId(null);
      publish();
      commitSoon(130);
    };
    api.current.setPalette = (id: PaletteId) => {
      if (viewRef.current.paletteId === id) return;
      viewRef.current = { ...viewRef.current, paletteId: id };
      publish();
      if (!recolorCache()) commitNow();
    };
    api.current.preset = (id: string) => {
      const preset = PRESETS.find((item) => item.id === id);
      if (!preset) return;
      const { w, h } = sizeRef.current;
      const paletteId = viewRef.current.paletteId;
      const next =
        preset.id === "overview"
          ? overviewView(w, h, paletteId)
          : {
              cx: preset.cx,
              cy: preset.cy,
              span: preset.span,
              maxIter: preset.maxIter,
              paletteId,
            };
      setPresetId(preset.id);
      dismissHint();
      animateTo(next);
    };
    api.current.reset = () => {
      const { w, h } = sizeRef.current;
      setPresetId("overview");
      dismissHint();
      animateTo(overviewView(w, h, viewRef.current.paletteId));
    };
    api.current.zoomCenter = (factor: number) => {
      const { w, h } = sizeRef.current;
      setPresetId(null);
      dismissHint();
      animateTo(zoomAt(viewRef.current, w / 2, h / 2, w, h, factor));
    };
    api.current.togglePanel = () => setPanelOpen((open) => !open);

    return () => {
      alive.current = false;
      window.clearTimeout(commitTimer);
      window.clearTimeout(fitTimer);
      window.clearTimeout(hintTimer);
      if (hudFrame) cancelAnimationFrame(hudFrame);
      observer.disconnect();
      screen.removeEventListener("pointerdown", onPointerDown);
      screen.removeEventListener("pointermove", onPointerMove);
      screen.removeEventListener("pointerup", onPointerUp);
      screen.removeEventListener("pointercancel", onPointerCancel);
      screen.removeEventListener("wheel", onWheel);
      screen.removeEventListener("contextmenu", onContext);
      window.removeEventListener("keydown", onKey);
      engine?.destroy();
      engineRef.current = null;
    };
    // Mount-only: engine, gestures, and storage live for the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const limited = precisionLimited(hud.span);
  const iterNote = needsMoreIterations(hud);
  const magLabel = formatMag(hud.span, homeSpan);

  return (
    <main className="explorer">
      <canvas
        ref={screenRef}
        className={panning ? "stage is-panning" : "stage"}
        role="application"
        aria-label="Mandelbrot set. Drag to pan, click to zoom in, right-click to zoom out, scroll or pinch to zoom."
        tabIndex={0}
      />

      <header className="topbar">
        <div className="brand">
          <p className="wordmark">Cardioid</p>
          <p className="eyebrow">Mandelbrot set</p>
        </div>
        <div className="readout">
          <p>{formatPair(hud)}</p>
          <p>
            {magLabel}
            <span className="dot" aria-hidden="true" />
            {hud.maxIter} iterations
          </p>
        </div>
      </header>

      <p className={hint ? "hint" : "hint is-gone"}>
        <span className="hint-fine">Drag to pan. Click to dive in. Scroll to zoom.</span>
        <span className="hint-coarse">Drag to pan. Tap to dive in. Pinch to zoom.</span>
      </p>

      {panelOpen ? (
        <section className="dock" aria-label="Fractal controls">
          {rendering ? (
            <div className="progress" style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
          ) : null}
          <div className="presets" role="group" aria-label="Places">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="chip"
                aria-pressed={presetId === preset.id}
                onClick={() => api.current.preset(preset.id)}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="iter-row">
            <label className="iter-label" htmlFor="iterations">
              Iterations
            </label>
            <span className="iter-value">{hud.maxIter}</span>
          </div>
          <input
            id="iterations"
            className="iter"
            type="range"
            min={ITER_MIN}
            max={ITER_MAX}
            step={16}
            value={hud.maxIter}
            aria-valuemin={ITER_MIN}
            aria-valuemax={ITER_MAX}
            aria-valuenow={hud.maxIter}
            aria-valuetext={`${hud.maxIter} iterations`}
            suppressHydrationWarning
            onChange={(event) => api.current.setIter(Number(event.target.value))}
          />
          {limited ? (
            <p className="note">Past double precision. Finer detail will break apart.</p>
          ) : iterNote ? (
            <p className="note">Raise iterations to resolve this depth.</p>
          ) : null}

          <div className="dock-row">
            <div className="swatches" role="group" aria-label="Color palette">
              {PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  type="button"
                  className="swatch"
                  aria-pressed={hud.paletteId === palette.id}
                  aria-label={palette.name}
                  title={palette.name}
                  onClick={() => api.current.setPalette(palette.id)}
                >
                  <span className="swatch-fill" style={{ backgroundImage: palette.css }} />
                </button>
              ))}
            </div>
            <div className="zoom-group">
              <button type="button" className="icon-btn" aria-label="Zoom out" onClick={() => api.current.zoomCenter(1.8)}>
                <Minus strokeWidth={1.75} />
              </button>
              <button type="button" className="icon-btn" aria-label="Zoom in" onClick={() => api.current.zoomCenter(0.55)}>
                <Plus strokeWidth={1.75} />
              </button>
              <button type="button" className="text-btn" onClick={() => api.current.reset()}>
                <RotateCcw strokeWidth={1.75} />
                Reset
              </button>
              <button type="button" className="icon-btn" aria-label="Hide controls" onClick={() => api.current.togglePanel()}>
                <ChevronDown strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <button type="button" className="show-controls" onClick={() => api.current.togglePanel()}>
          <SlidersHorizontal strokeWidth={1.75} />
          Controls
        </button>
      )}
    </main>
  );
}
