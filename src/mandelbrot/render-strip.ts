const BAILOUT = 65536;

export type StripParams = {
  width: number;
  height: number;
  y0: number;
  y1: number;
  cx: number;
  cy: number;
  span: number;
  maxIter: number;
};

/**
 * Smooth escape time for one strip. Negative values are interior.
 * Returns null if `aborted` fires between rows.
 */
export function fillMu(p: StripParams, aborted: () => boolean): Float32Array | null {
  const { width, height, y0, y1, cx, cy, span, maxIter } = p;
  const rows = y1 - y0;
  if (rows <= 0 || width <= 0) return new Float32Array(0);
  const mu = new Float32Array(width * rows);
  const scale = span / width;
  const halfW = width * 0.5;
  const halfH = height * 0.5;

  for (let y = y0; y < y1; y++) {
    if ((y & 1) === 0 && aborted()) return null;
    const im = cy - (y + 0.5 - halfH) * scale;
    const re0 = cx + (0.5 - halfW) * scale;
    const rowOff = (y - y0) * width;
    const im2 = im * im;

    for (let x = 0; x < width; x++) {
      const re = re0 + x * scale;

      const qr = re - 0.25;
      const q = qr * qr + im2;
      if (q * (q + qr) <= 0.25 * im2) {
        mu[rowOff + x] = -1;
        continue;
      }
      const br = re + 1;
      if (br * br + im2 <= 0.0625) {
        mu[rowOff + x] = -1;
        continue;
      }

      let zr = 0;
      let zi = 0;
      let zr2 = 0;
      let zi2 = 0;
      let n = 0;
      let savedR = 0;
      let savedI = 0;
      let period = 0;

      while (n < maxIter && zr2 + zi2 <= BAILOUT) {
        zi = 2 * zr * zi + im;
        zr = zr2 - zi2 + re;
        zr2 = zr * zr;
        zi2 = zi * zi;
        n++;
        if (zr === savedR && zi === savedI) {
          n = maxIter;
          break;
        }
        if (++period >= 24) {
          period = 0;
          savedR = zr;
          savedI = zi;
        }
      }

      if (n >= maxIter) {
        mu[rowOff + x] = -1;
      } else {
        const log2mag = 0.5 * Math.log2(zr2 + zi2);
        mu[rowOff + x] = n - Math.log2(log2mag);
      }
    }
  }

  return mu;
}
