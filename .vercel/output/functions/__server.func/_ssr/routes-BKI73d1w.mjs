import { i as __toESM } from "../_runtime.mjs";
import { G as require_jsx_runtime, K as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Minus, i as Plus, n as SlidersHorizontal, o as ChevronDown, r as RotateCcw } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BKI73d1w.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var BAILOUT = 65536;
/**
* Smooth escape time for one strip. Negative values are interior.
* Returns null if `aborted` fires between rows.
*/
function fillMu(p, aborted) {
	const { width, height, y0, y1, cx, cy, span, maxIter } = p;
	const rows = y1 - y0;
	if (rows <= 0 || width <= 0) return /* @__PURE__ */ new Float32Array(0);
	const mu = new Float32Array(width * rows);
	const scale = span / width;
	const halfW = width * .5;
	const halfH = height * .5;
	for (let y = y0; y < y1; y++) {
		if ((y & 1) === 0 && aborted()) return null;
		const im = cy - (y + .5 - halfH) * scale;
		const re0 = cx + (.5 - halfW) * scale;
		const rowOff = (y - y0) * width;
		const im2 = im * im;
		for (let x = 0; x < width; x++) {
			const re = re0 + x * scale;
			const qr = re - .25;
			const q = qr * qr + im2;
			if (q * (q + qr) <= .25 * im2) {
				mu[rowOff + x] = -1;
				continue;
			}
			const br = re + 1;
			if (br * br + im2 <= .0625) {
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
			if (n >= maxIter) mu[rowOff + x] = -1;
			else {
				const log2mag = .5 * Math.log2(zr2 + zi2);
				mu[rowOff + x] = n - Math.log2(log2mag);
			}
		}
	}
	return mu;
}
var SIZE = 1024;
var DEFS = [
	{
		id: "glacier",
		name: "Glacier",
		stops: [
			{
				t: 0,
				hex: "#10202c"
			},
			{
				t: .18,
				hex: "#1c4d62"
			},
			{
				t: .36,
				hex: "#3e8ea3"
			},
			{
				t: .52,
				hex: "#e7eef1"
			},
			{
				t: .68,
				hex: "#9eb8c4"
			},
			{
				t: .84,
				hex: "#245066"
			},
			{
				t: 1,
				hex: "#10202c"
			}
		]
	},
	{
		id: "ember",
		name: "Ember",
		stops: [
			{
				t: 0,
				hex: "#1a100e"
			},
			{
				t: .2,
				hex: "#7a2e18"
			},
			{
				t: .4,
				hex: "#e08a45"
			},
			{
				t: .55,
				hex: "#f6efe4"
			},
			{
				t: .72,
				hex: "#c46a4a"
			},
			{
				t: .88,
				hex: "#4a2a28"
			},
			{
				t: 1,
				hex: "#1a100e"
			}
		]
	},
	{
		id: "tide",
		name: "Tide",
		stops: [
			{
				t: 0,
				hex: "#0d1714"
			},
			{
				t: .22,
				hex: "#14584a"
			},
			{
				t: .42,
				hex: "#3eae96"
			},
			{
				t: .58,
				hex: "#e7f3ee"
			},
			{
				t: .76,
				hex: "#7d9e92"
			},
			{
				t: .9,
				hex: "#1c3f36"
			},
			{
				t: 1,
				hex: "#0d1714"
			}
		]
	},
	{
		id: "ink",
		name: "Ink",
		stops: [
			{
				t: 0,
				hex: "#141416"
			},
			{
				t: .28,
				hex: "#4a4a52"
			},
			{
				t: .48,
				hex: "#f4f4f5"
			},
			{
				t: .66,
				hex: "#a1a1aa"
			},
			{
				t: .84,
				hex: "#2e2e33"
			},
			{
				t: 1,
				hex: "#141416"
			}
		]
	}
];
function hexRgb(hex) {
	const n = parseInt(hex.slice(1), 16);
	return [
		n >> 16 & 255,
		n >> 8 & 255,
		n & 255
	];
}
function srgbToLin(c) {
	const x = c / 255;
	return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4;
}
function linToSrgb(x) {
	const y = x <= .0031308 ? x * 12.92 : 1.055 * x ** (1 / 2.4) - .055;
	return Math.round(Math.min(1, Math.max(0, y)) * 255);
}
function bake(stops) {
	const lin = stops.map((s) => ({
		t: s.t,
		rgb: hexRgb(s.hex).map(srgbToLin)
	}));
	const out = new Uint8Array(SIZE * 3);
	for (let i = 0; i < SIZE; i++) {
		const t = i / 1023;
		let j = 0;
		while (j < lin.length - 2 && t > lin[j + 1].t) j++;
		const a = lin[j];
		const b = lin[j + 1];
		const u = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
		for (let k = 0; k < 3; k++) out[i * 3 + k] = linToSrgb(a.rgb[k] + (b.rgb[k] - a.rgb[k]) * u);
	}
	return out;
}
var PALETTES = DEFS.map((d) => ({
	...d,
	rgb: bake(d.stops),
	css: `linear-gradient(90deg, ${d.stops.map((s) => `${s.hex} ${Math.round(s.t * 100)}%`).join(", ")})`
}));
var BY_ID = new Map(PALETTES.map((p) => [p.id, p]));
function isPaletteId(value) {
	return BY_ID.has(value);
}
function paletteById(id) {
	return BY_ID.get(id) ?? PALETTES[0];
}
var VOID_CSS = "#09090b";
var VOID = [
	9,
	9,
	11
];
function colorize(mu, palette, out) {
	const n = mu.length;
	const last = 1023;
	for (let i = 0; i < n; i++) {
		const m = mu[i] ?? -1;
		const o = i << 2;
		if (m < 0) {
			out[o] = VOID[0];
			out[o + 1] = VOID[1];
			out[o + 2] = VOID[2];
			out[o + 3] = 255;
			continue;
		}
		const shade = .28 + .72 * (1 - Math.exp(-m * .055));
		let t = m * .017;
		t -= Math.floor(t);
		const p = (t * last | 0) * 3;
		out[o] = (palette[p] ?? 0) * shade;
		out[o + 1] = (palette[p + 1] ?? 0) * shade;
		out[o + 2] = (palette[p + 2] ?? 0) * shade;
		out[o + 3] = 255;
	}
}
var SPAN_MIN = 1e-14;
var ITER_MAX = 4e3;
/** Complex width that frames the whole set for a given bitmap aspect. */
function overviewSpan(width, height) {
	const aspect = height / Math.max(1, width);
	return Math.min(6, Math.max(3.05, 2.55 / aspect));
}
function overviewView(width, height, paletteId) {
	return {
		cx: -.7,
		cy: 0,
		span: overviewSpan(width, height),
		maxIter: 280,
		paletteId
	};
}
var PRESETS = [
	{
		id: "overview",
		name: "Overview",
		cx: -.7,
		cy: 0,
		span: 3.4,
		maxIter: 280
	},
	{
		id: "valley",
		name: "Valley",
		cx: -.7463,
		cy: .1102,
		span: .005,
		maxIter: 520
	},
	{
		id: "seahorse",
		name: "Seahorse",
		cx: -.743643887037151,
		cy: .13182590420533,
		span: 18e-5,
		maxIter: 900
	},
	{
		id: "spiral",
		name: "Spiral",
		cx: -.7269,
		cy: .1889,
		span: .012,
		maxIter: 640
	},
	{
		id: "satellite",
		name: "Satellite",
		cx: -1.768778833,
		cy: 0,
		span: .045,
		maxIter: 700
	},
	{
		id: "feather",
		name: "Feather",
		cx: -.16070135,
		cy: 1.0375665,
		span: .03,
		maxIter: 520
	}
];
function clampSpan(span) {
	if (!Number.isFinite(span)) return 3.4;
	return Math.min(6, Math.max(SPAN_MIN, span));
}
function clampIter(n) {
	if (!Number.isFinite(n)) return 280;
	return Math.min(ITER_MAX, Math.max(64, Math.round(n)));
}
function zoomAt(view, px, py, bw, bh, factor) {
	const span1 = clampSpan(view.span * factor);
	const scale0 = view.span / bw;
	const wx = view.cx + (px - bw / 2) * scale0;
	const wy = view.cy - (py - bh / 2) * scale0;
	const scale1 = span1 / bw;
	return {
		...view,
		span: span1,
		cx: wx - (px - bw / 2) * scale1,
		cy: wy + (py - bh / 2) * scale1
	};
}
function panBy(view, dxPx, dyPx, bw) {
	const scale = view.span / bw;
	return {
		...view,
		cx: view.cx - dxPx * scale,
		cy: view.cy + dyPx * scale
	};
}
var HOME_SPAN = 3.4;
function formatMag(span, base = HOME_SPAN) {
	const mag = base / span;
	if (!Number.isFinite(mag) || mag <= 0) return "—";
	if (mag < 10) return `${mag.toFixed(2)}×`;
	if (mag < 1e3) return `${Math.round(mag)}×`;
	if (mag < 1e6) return `${(mag / 1e3).toFixed(mag < 1e4 ? 2 : 1)}k×`;
	if (mag < 1e9) return `${(mag / 1e6).toFixed(2)}M×`;
	return `${mag.toExponential(1)}×`;
}
function formatCoord(value, span) {
	if (!Number.isFinite(value)) return "0";
	const abs = Math.abs(value);
	if (abs !== 0 && (abs >= 1e4 || abs < 1e-4)) return value.toExponential(3);
	const raw = Math.ceil(-Math.log10(Math.max(span, 1e-16))) + 2;
	const digits = Math.min(12, Math.max(2, raw));
	return value.toFixed(digits);
}
function formatPair(view) {
	const re = formatCoord(view.cx, view.span);
	const im = formatCoord(Math.abs(view.cy), view.span);
	return `${re} ${view.cy < 0 ? "-" : "+"} ${im}i`;
}
function precisionLimited(span) {
	return span < 5e-13;
}
function needsMoreIterations(view) {
	const mag = HOME_SPAN / view.span;
	if (mag < 500) return false;
	const suggested = 180 + Math.log10(mag) * 210;
	return view.maxIter < suggested * .5;
}
var STORAGE_KEY = "cardioid.view.v1";
function loadView() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (typeof data.cx !== "number" || typeof data.cy !== "number" || typeof data.span !== "number") return null;
		if (!Number.isFinite(data.cx) || !Number.isFinite(data.cy) || !Number.isFinite(data.span)) return null;
		const paletteId = typeof data.paletteId === "string" && isPaletteId(data.paletteId) ? data.paletteId : "glacier";
		return {
			cx: data.cx,
			cy: data.cy,
			span: clampSpan(data.span),
			maxIter: clampIter(typeof data.maxIter === "number" ? data.maxIter : 280),
			paletteId
		};
	} catch {
		return null;
	}
}
function saveView(view) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(view));
	} catch {}
}
var INITIAL = {
	cx: -.7,
	cy: 0,
	span: 3.4,
	maxIter: 280,
	paletteId: "glacier"
};
function chooseSize(cssW, cssH) {
	const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
	let w = Math.max(2, Math.round(cssW * dpr));
	let h = Math.max(2, Math.round(cssH * dpr));
	const cap = 125e4;
	const pixels = w * h;
	if (pixels > cap) {
		const k = Math.sqrt(cap / pixels);
		w = Math.max(2, Math.round(w * k));
		h = Math.max(2, Math.round(h * k));
	}
	return {
		w,
		h
	};
}
function paintView(screen, buffer, live, base) {
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
	const A = (live.cx - base.cx) / baseScale + W / 2 - W / 2 * S;
	const B = (base.cy - live.cy) / baseScale + H / 2 - H / 2 * S;
	if (!(Math.abs(S - 1) < 1e-6 && Math.abs(A) < .35 && Math.abs(B) < .35 && screen.width === W && screen.height === H)) {
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";
		ctx.setTransform(1 / S, 0, 0, 1 / S, -A / S, -B / S);
	}
	ctx.drawImage(buffer, 0, 0);
	ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function Explorer() {
	const screenRef = (0, import_react.useRef)(null);
	const [hud, setHud] = (0, import_react.useState)(INITIAL);
	const [homeSpan, setHomeSpan] = (0, import_react.useState)(3.4);
	const [presetId, setPresetId] = (0, import_react.useState)("overview");
	const [panelOpen, setPanelOpen] = (0, import_react.useState)(true);
	const [hint, setHint] = (0, import_react.useState)(true);
	const [rendering, setRendering] = (0, import_react.useState)(true);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [panning, setPanning] = (0, import_react.useState)(false);
	const api = (0, import_react.useRef)({
		setIter: (_n) => {},
		setPalette: (_id) => {},
		preset: (_id) => {},
		reset: () => {},
		zoomCenter: (_factor) => {},
		togglePanel: () => {}
	});
	(0, import_react.useEffect)(() => {
		const screen = screenRef.current;
		if (!screen) return;
		const viewRef = { current: { ...INITIAL } };
		const stableRef = { current: null };
		const sizeRef = { current: {
			w: 2,
			h: 2
		} };
		const bufferRef = { current: null };
		const previewRef = { current: null };
		const engineRef = { current: null };
		const jobTokenRef = { current: 0 };
		const jobViewRef = { current: { ...INITIAL } };
		const cacheReadyRef = { current: false };
		const cacheRef = { current: null };
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
		function ensureBuffer(w, h) {
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
			paintView(screen, buffer, viewRef.current, base);
		}
		function drawQuick(view) {
			const { w, h } = sizeRef.current;
			if (w < 2 || h < 2) return;
			const qw = Math.max(72, Math.round(w / 5));
			const qh = Math.max(48, Math.round(h / 5));
			const mu = fillMu({
				width: qw,
				height: qh,
				y0: 0,
				y1: qh,
				cx: view.cx,
				cy: view.cy,
				span: view.span,
				maxIter: Math.min(view.maxIter, 240)
			}, () => false);
			if (!mu) return;
			const small = document.createElement("canvas");
			small.width = qw;
			small.height = qh;
			const sctx = small.getContext("2d");
			if (!sctx) return;
			const image = sctx.createImageData(qw, qh);
			colorize(mu, paletteById(view.paletteId).rgb, image.data);
			sctx.putImageData(image, 0, 0);
			const bctx = ensureBuffer(w, h).getContext("2d");
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
			setProgress(.04);
			jobTokenRef.current = engine.render({
				cx: view.cx,
				cy: view.cy,
				span: view.span,
				maxIter: view.maxIter,
				width: w,
				height: h
			});
		}
		function commitSoon(ms) {
			window.clearTimeout(commitTimer);
			commitTimer = window.setTimeout(commitNow, ms);
		}
		function cancelAnim() {
			animToken++;
		}
		function animateTo(target) {
			const from = { ...viewRef.current };
			const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			const ratio = target.span / from.span;
			const dist = Math.hypot(target.cx - from.cx, target.cy - from.cy) / Math.max(from.span, 1e-16);
			if (reduce || !stableRef.current || ratio < .3 || ratio > 3.2 || dist > 1.15) {
				cancelAnim();
				viewRef.current = target;
				publish();
				drawQuick(target);
				commitNow();
				return;
			}
			const id = ++animToken;
			const t0 = performance.now();
			const step = (now) => {
				if (!alive.current || id !== animToken) return;
				const u = Math.min(1, (now - t0) / 280);
				const e = 1 - (1 - u) ** 3;
				viewRef.current = {
					...target,
					cx: from.cx + (target.cx - from.cx) * e,
					cy: from.cy + (target.cy - from.cy) * e,
					span: from.span * (target.span / from.span) ** e
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
		function geometryMatches(view, w, h) {
			const cache = cacheRef.current;
			if (!cache) return false;
			return cache.w === w && cache.h === h && cache.view.cx === view.cx && cache.view.cy === view.cy && cache.view.span === view.span && cache.view.maxIter === view.maxIter;
		}
		function recolorCache() {
			const cache = cacheRef.current;
			const { w, h } = sizeRef.current;
			if (!cacheReadyRef.current || !cache || !geometryMatches(viewRef.current, w, h)) return false;
			const ctx = ensureBuffer(w, h).getContext("2d");
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
		function onStrip(event) {
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
			const ctx = ensureBuffer(w, h).getContext("2d");
			if (!ctx) return;
			const image = ctx.createImageData(event.width, event.rows);
			colorize(event.mu, pal, image.data);
			ctx.putImageData(image, 0, event.y);
			let cache = cacheRef.current;
			if (!cache || cache.view !== jobViewRef.current || cache.w !== w || cache.h !== h) {
				cache = {
					view: jobViewRef.current,
					w,
					h,
					mu: new Float32Array(w * h)
				};
				cacheRef.current = cache;
			}
			cache.mu.set(event.mu, event.y * event.width);
			if (!stableRef.current) stableRef.current = { ...jobViewRef.current };
			paint();
			const total = Math.ceil(h / 40);
			setProgress((p) => Math.min(.98, Math.max(p, .08) + .9 / total));
		}
		function onPhase(token, phase) {
			if (!alive.current || token !== jobTokenRef.current) return;
			const { w, h } = sizeRef.current;
			if (phase === "preview") {
				const preview = previewRef.current;
				const ctx = ensureBuffer(w, h).getContext("2d");
				if (preview && ctx) {
					ctx.setTransform(1, 0, 0, 1, 0, 0);
					ctx.imageSmoothingEnabled = true;
					ctx.imageSmoothingQuality = "high";
					ctx.drawImage(preview, 0, 0, w, h);
					stableRef.current = { ...jobViewRef.current };
					paint();
				}
				setProgress(.12);
				return;
			}
			stableRef.current = { ...jobViewRef.current };
			cacheReadyRef.current = true;
			setRendering(false);
			setProgress(1);
			saveView(jobViewRef.current);
		}
		function fit() {
			const rect = screen.getBoundingClientRect();
			const next = chooseSize(rect.width, rect.height);
			const fitted = overviewSpan(next.w, next.h);
			setHomeSpan(fitted);
			if (next.w === sizeRef.current.w && next.h === sizeRef.current.h && screen.width === next.w) return;
			sizeRef.current = next;
			screen.width = next.w;
			screen.height = next.h;
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
		hintTimer = window.setTimeout(() => setHint(false), reducedHint ? 4e3 : 7400);
		let engine = null;
		import("./engine-YPDtauqM.mjs").then(({ createEngine }) => {
			if (!alive.current) return;
			engine = createEngine({
				onStrip,
				onPhase
			});
			engineRef.current = engine;
			commitNow();
		});
		const observer = new ResizeObserver(() => {
			window.clearTimeout(fitTimer);
			fitTimer = window.setTimeout(fit, 80);
		});
		observer.observe(screen);
		const pointers = /* @__PURE__ */ new Map();
		let mode = "none";
		let dragged = false;
		let pinchDist = 0;
		let downCssX = 0;
		let downCssY = 0;
		function toBitmap(clientX, clientY) {
			const rect = screen.getBoundingClientRect();
			const { w, h } = sizeRef.current;
			return {
				x: (clientX - rect.left) / Math.max(1, rect.width) * w,
				y: (clientY - rect.top) / Math.max(1, rect.height) * h
			};
		}
		function pinchMetrics() {
			const pts = [...pointers.values()];
			if (pts.length < 2) return null;
			const dx = pts[0].x - pts[1].x;
			const dy = pts[0].y - pts[1].y;
			return {
				dist: Math.hypot(dx, dy),
				midX: (pts[0].x + pts[1].x) / 2,
				midY: (pts[0].y + pts[1].y) / 2
			};
		}
		function onPointerDown(e) {
			if (e.button !== 0) return;
			screen.setPointerCapture(e.pointerId);
			pointers.set(e.pointerId, toBitmap(e.clientX, e.clientY));
			cancelAnim();
			if (pointers.size >= 2) {
				mode = "pinch";
				dragged = true;
				pinchDist = pinchMetrics()?.dist ?? 0;
				setPanning(true);
			} else {
				mode = "draw";
				dragged = false;
				downCssX = e.clientX;
				downCssY = e.clientY;
			}
		}
		function onPointerMove(e) {
			if (!pointers.has(e.pointerId)) return;
			const prev = pointers.get(e.pointerId);
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
		function onPointerUp(e) {
			if (!pointers.has(e.pointerId)) return;
			pointers.delete(e.pointerId);
			if (pointers.size === 0) {
				if (mode === "draw" && !dragged) {
					const p = toBitmap(e.clientX, e.clientY);
					const factor = e.shiftKey ? 2 : .5;
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
				pinchDist = pinchMetrics()?.dist ?? 0;
			}
		}
		function onPointerCancel(e) {
			pointers.delete(e.pointerId);
			if (pointers.size === 0) endGesture();
		}
		function onWheel(e) {
			e.preventDefault();
			cancelAnim();
			dismissHint();
			setPresetId(null);
			const raw = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 160 : e.deltaY;
			const factor = Math.min(1.35, Math.max(.74, Math.exp(raw * .0014)));
			const p = toBitmap(e.clientX, e.clientY);
			viewRef.current = zoomAt(viewRef.current, p.x, p.y, sizeRef.current.w, sizeRef.current.h, factor);
			publish();
			paint();
			commitSoon(140);
		}
		function onContext(e) {
			e.preventDefault();
			cancelAnim();
			dismissHint();
			setPresetId(null);
			const p = toBitmap(e.clientX, e.clientY);
			animateTo(zoomAt(viewRef.current, p.x, p.y, sizeRef.current.w, sizeRef.current.h, 2));
		}
		function onKey(e) {
			const target = e.target;
			if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
			const { w, h } = sizeRef.current;
			const v = viewRef.current;
			const fine = e.shiftKey ? .03 : .09;
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
				animateTo(zoomAt(v, w / 2, h / 2, w, h, .62));
			} else if (e.key === "-" || e.key === "_") {
				e.preventDefault();
				setPresetId(null);
				animateTo(zoomAt(v, w / 2, h / 2, w, h, 1.62));
			} else if (e.key === "[") api.current.setIter(v.maxIter - 48);
			else if (e.key === "]") api.current.setIter(v.maxIter + 48);
			else if (e.key === "0" || e.key === "r" || e.key === "R" || e.key === "Home") {
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
		api.current.setIter = (n) => {
			const maxIter = clampIter(n);
			if (maxIter === viewRef.current.maxIter) return;
			viewRef.current = {
				...viewRef.current,
				maxIter
			};
			setPresetId(null);
			publish();
			commitSoon(130);
		};
		api.current.setPalette = (id) => {
			if (viewRef.current.paletteId === id) return;
			viewRef.current = {
				...viewRef.current,
				paletteId: id
			};
			publish();
			if (!recolorCache()) commitNow();
		};
		api.current.preset = (id) => {
			const preset = PRESETS.find((item) => item.id === id);
			if (!preset) return;
			const { w, h } = sizeRef.current;
			const paletteId = viewRef.current.paletteId;
			const next = preset.id === "overview" ? overviewView(w, h, paletteId) : {
				cx: preset.cx,
				cy: preset.cy,
				span: preset.span,
				maxIter: preset.maxIter,
				paletteId
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
		api.current.zoomCenter = (factor) => {
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
	}, []);
	const limited = precisionLimited(hud.span);
	const iterNote = needsMoreIterations(hud);
	const magLabel = formatMag(hud.span, homeSpan);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "explorer",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: screenRef,
				className: panning ? "stage is-panning" : "stage",
				role: "application",
				"aria-label": "Mandelbrot set. Drag to pan, click to zoom in, right-click to zoom out, scroll or pinch to zoom.",
				tabIndex: 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "topbar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "brand",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "wordmark",
						children: "Cardioid"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Mandelbrot set"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "readout",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: formatPair(hud) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						magLabel,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "dot",
							"aria-hidden": "true"
						}),
						hud.maxIter,
						" iterations"
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: hint ? "hint" : "hint is-gone",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hint-fine",
					children: "Drag to pan. Click to dive in. Scroll to zoom."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hint-coarse",
					children: "Drag to pan. Tap to dive in. Pinch to zoom."
				})]
			}),
			panelOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "dock",
				"aria-label": "Fractal controls",
				children: [
					rendering ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "progress",
						style: { transform: `scaleX(${Math.max(.04, progress)})` }
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "presets",
						role: "group",
						"aria-label": "Places",
						children: PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "chip",
							"aria-pressed": presetId === preset.id,
							onClick: () => api.current.preset(preset.id),
							children: preset.name
						}, preset.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "iter-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "iter-label",
							htmlFor: "iterations",
							children: "Iterations"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "iter-value",
							children: hud.maxIter
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "iterations",
						className: "iter",
						type: "range",
						min: 64,
						max: ITER_MAX,
						step: 16,
						value: hud.maxIter,
						"aria-valuemin": 64,
						"aria-valuemax": ITER_MAX,
						"aria-valuenow": hud.maxIter,
						"aria-valuetext": `${hud.maxIter} iterations`,
						suppressHydrationWarning: true,
						onChange: (event) => api.current.setIter(Number(event.target.value))
					}),
					limited ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "note",
						children: "Past double precision. Finer detail will break apart."
					}) : iterNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "note",
						children: "Raise iterations to resolve this depth."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "dock-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "swatches",
							role: "group",
							"aria-label": "Color palette",
							children: PALETTES.map((palette) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "swatch",
								"aria-pressed": hud.paletteId === palette.id,
								"aria-label": palette.name,
								title: palette.name,
								onClick: () => api.current.setPalette(palette.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "swatch-fill",
									style: { backgroundImage: palette.css }
								})
							}, palette.id))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "zoom-group",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "icon-btn",
									"aria-label": "Zoom out",
									onClick: () => api.current.zoomCenter(1.8),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { strokeWidth: 1.75 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "icon-btn",
									"aria-label": "Zoom in",
									onClick: () => api.current.zoomCenter(.55),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { strokeWidth: 1.75 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "text-btn",
									onClick: () => api.current.reset(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { strokeWidth: 1.75 }), "Reset"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "icon-btn",
									"aria-label": "Hide controls",
									onClick: () => api.current.togglePanel(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { strokeWidth: 1.75 })
								})
							]
						})]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "show-controls",
				onClick: () => api.current.togglePanel(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { strokeWidth: 1.75 }), "Controls"]
			})
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Explorer, {});
}
//#endregion
export { fillMu as n, routes_exports as t };
