export type PaletteId = "glacier" | "ember" | "tide" | "ink";

type Stop = { t: number; hex: string };

export type Palette = {
  id: PaletteId;
  name: string;
  stops: Stop[];
  rgb: Uint8Array;
  css: string;
};

const SIZE = 1024;

const DEFS: { id: PaletteId; name: string; stops: Stop[] }[] = [
  {
    id: "glacier",
    name: "Glacier",
    stops: [
      { t: 0, hex: "#10202c" },
      { t: 0.18, hex: "#1c4d62" },
      { t: 0.36, hex: "#3e8ea3" },
      { t: 0.52, hex: "#e7eef1" },
      { t: 0.68, hex: "#9eb8c4" },
      { t: 0.84, hex: "#245066" },
      { t: 1, hex: "#10202c" },
    ],
  },
  {
    id: "ember",
    name: "Ember",
    stops: [
      { t: 0, hex: "#1a100e" },
      { t: 0.2, hex: "#7a2e18" },
      { t: 0.4, hex: "#e08a45" },
      { t: 0.55, hex: "#f6efe4" },
      { t: 0.72, hex: "#c46a4a" },
      { t: 0.88, hex: "#4a2a28" },
      { t: 1, hex: "#1a100e" },
    ],
  },
  {
    id: "tide",
    name: "Tide",
    stops: [
      { t: 0, hex: "#0d1714" },
      { t: 0.22, hex: "#14584a" },
      { t: 0.42, hex: "#3eae96" },
      { t: 0.58, hex: "#e7f3ee" },
      { t: 0.76, hex: "#7d9e92" },
      { t: 0.9, hex: "#1c3f36" },
      { t: 1, hex: "#0d1714" },
    ],
  },
  {
    id: "ink",
    name: "Ink",
    stops: [
      { t: 0, hex: "#141416" },
      { t: 0.28, hex: "#4a4a52" },
      { t: 0.48, hex: "#f4f4f5" },
      { t: 0.66, hex: "#a1a1aa" },
      { t: 0.84, hex: "#2e2e33" },
      { t: 1, hex: "#141416" },
    ],
  },
];

function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function srgbToLin(c: number): number {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function linToSrgb(x: number): number {
  const y = x <= 0.0031308 ? x * 12.92 : 1.055 * x ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, y)) * 255);
}

function bake(stops: Stop[]): Uint8Array {
  const lin = stops.map((s) => ({ t: s.t, rgb: hexRgb(s.hex).map(srgbToLin) as [number, number, number] }));
  const out = new Uint8Array(SIZE * 3);
  for (let i = 0; i < SIZE; i++) {
    const t = i / (SIZE - 1);
    let j = 0;
    while (j < lin.length - 2 && t > lin[j + 1]!.t) j++;
    const a = lin[j]!;
    const b = lin[j + 1]!;
    const u = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
    for (let k = 0; k < 3; k++) {
      out[i * 3 + k] = linToSrgb(a.rgb[k] + (b.rgb[k] - a.rgb[k]) * u);
    }
  }
  return out;
}

export const PALETTE_SIZE = SIZE;

export const PALETTES: Palette[] = DEFS.map((d) => ({
  ...d,
  rgb: bake(d.stops),
  css: `linear-gradient(90deg, ${d.stops.map((s) => `${s.hex} ${Math.round(s.t * 100)}%`).join(", ")})`,
}));

const BY_ID = new Map(PALETTES.map((p) => [p.id, p]));

export function isPaletteId(value: string): value is PaletteId {
  return BY_ID.has(value as PaletteId);
}

export function paletteById(id: PaletteId): Palette {
  return BY_ID.get(id) ?? PALETTES[0]!;
}

export const VOID_CSS = "#09090b";
const VOID = [9, 9, 11];

export function colorize(mu: Float32Array, palette: Uint8Array, out: Uint8ClampedArray): void {
  const n = mu.length;
  const last = SIZE - 1;
  for (let i = 0; i < n; i++) {
    const m = mu[i] ?? -1;
    const o = i << 2;
    if (m < 0) {
      out[o] = VOID[0]!;
      out[o + 1] = VOID[1]!;
      out[o + 2] = VOID[2]!;
      out[o + 3] = 255;
      continue;
    }
    const shade = 0.28 + 0.72 * (1 - Math.exp(-m * 0.055));
    let t = m * 0.017;
    t -= Math.floor(t);
    const p = ((t * last) | 0) * 3;
    out[o] = (palette[p] ?? 0) * shade;
    out[o + 1] = (palette[p + 1] ?? 0) * shade;
    out[o + 2] = (palette[p + 2] ?? 0) * shade;
    out[o + 3] = 255;
  }
}
