import { isPaletteId, type PaletteId } from "./palette";

export type FractalView = {
  cx: number;
  cy: number;
  span: number;
  maxIter: number;
  paletteId: PaletteId;
};

export const SPAN_MIN = 1e-14;
export const SPAN_MAX = 6;
export const ITER_MIN = 64;
export const ITER_MAX = 4000;

/** Complex width that frames the whole set for a given bitmap aspect. */
export function overviewSpan(width: number, height: number): number {
  const aspect = height / Math.max(1, width);
  const needW = 3.05;
  const needH = 2.55;
  return Math.min(SPAN_MAX, Math.max(needW, needH / aspect));
}

export function overviewView(width: number, height: number, paletteId: PaletteId): FractalView {
  return {
    cx: -0.7,
    cy: 0,
    span: overviewSpan(width, height),
    maxIter: 280,
    paletteId,
  };
}

export const PRESETS: {
  id: string;
  name: string;
  cx: number;
  cy: number;
  span: number;
  maxIter: number;
}[] = [
  { id: "overview", name: "Overview", cx: -0.7, cy: 0, span: 3.4, maxIter: 280 },
  { id: "valley", name: "Valley", cx: -0.7463, cy: 0.1102, span: 0.005, maxIter: 520 },
  { id: "seahorse", name: "Seahorse", cx: -0.743643887037151, cy: 0.13182590420533, span: 0.00018, maxIter: 900 },
  { id: "spiral", name: "Spiral", cx: -0.7269, cy: 0.1889, span: 0.012, maxIter: 640 },
  { id: "satellite", name: "Satellite", cx: -1.768778833, cy: 0, span: 0.045, maxIter: 700 },
  { id: "feather", name: "Feather", cx: -0.16070135, cy: 1.0375665, span: 0.03, maxIter: 520 },
];

export function clampSpan(span: number): number {
  if (!Number.isFinite(span)) return 3.4;
  return Math.min(SPAN_MAX, Math.max(SPAN_MIN, span));
}

export function clampIter(n: number): number {
  if (!Number.isFinite(n)) return 280;
  return Math.min(ITER_MAX, Math.max(ITER_MIN, Math.round(n)));
}

export function zoomAt(
  view: FractalView,
  px: number,
  py: number,
  bw: number,
  bh: number,
  factor: number,
): FractalView {
  const span1 = clampSpan(view.span * factor);
  const scale0 = view.span / bw;
  const wx = view.cx + (px - bw / 2) * scale0;
  const wy = view.cy - (py - bh / 2) * scale0;
  const scale1 = span1 / bw;
  return {
    ...view,
    span: span1,
    cx: wx - (px - bw / 2) * scale1,
    cy: wy + (py - bh / 2) * scale1,
  };
}

export function panBy(view: FractalView, dxPx: number, dyPx: number, bw: number): FractalView {
  const scale = view.span / bw;
  return { ...view, cx: view.cx - dxPx * scale, cy: view.cy + dyPx * scale };
}

const HOME_SPAN = 3.4;

export function formatMag(span: number, base = HOME_SPAN): string {
  const mag = base / span;
  if (!Number.isFinite(mag) || mag <= 0) return "—";
  if (mag < 10) return `${mag.toFixed(2)}×`;
  if (mag < 1e3) return `${Math.round(mag)}×`;
  if (mag < 1e6) return `${(mag / 1e3).toFixed(mag < 1e4 ? 2 : 1)}k×`;
  if (mag < 1e9) return `${(mag / 1e6).toFixed(2)}M×`;
  return `${mag.toExponential(1)}×`;
}

export function formatCoord(value: number, span: number): string {
  if (!Number.isFinite(value)) return "0";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e4 || abs < 1e-4)) return value.toExponential(3);
  const raw = Math.ceil(-Math.log10(Math.max(span, 1e-16))) + 2;
  const digits = Math.min(12, Math.max(2, raw));
  return value.toFixed(digits);
}

export function formatPair(view: FractalView): string {
  const re = formatCoord(view.cx, view.span);
  const im = formatCoord(Math.abs(view.cy), view.span);
  const sign = view.cy < 0 ? "-" : "+";
  return `${re} ${sign} ${im}i`;
}

export function precisionLimited(span: number): boolean {
  return span < 5e-13;
}

export function needsMoreIterations(view: FractalView): boolean {
  const mag = HOME_SPAN / view.span;
  if (mag < 500) return false;
  const suggested = 180 + Math.log10(mag) * 210;
  return view.maxIter < suggested * 0.5;
}

const STORAGE_KEY = "cardioid.view.v1";

export function loadView(): FractalView | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<FractalView>;
    if (typeof data.cx !== "number" || typeof data.cy !== "number" || typeof data.span !== "number") {
      return null;
    }
    if (!Number.isFinite(data.cx) || !Number.isFinite(data.cy) || !Number.isFinite(data.span)) return null;
    const paletteId = typeof data.paletteId === "string" && isPaletteId(data.paletteId) ? data.paletteId : "glacier";
    return {
      cx: data.cx,
      cy: data.cy,
      span: clampSpan(data.span),
      maxIter: clampIter(typeof data.maxIter === "number" ? data.maxIter : 280),
      paletteId,
    };
  } catch {
    return null;
  }
}

export function saveView(view: FractalView): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(view));
  } catch {
    /* private mode */
  }
}
