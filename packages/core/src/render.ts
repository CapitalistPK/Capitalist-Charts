import type { Bar } from '@capitalist-charts/schema/views';

/**
 * Pure geometry for the small charts: no DOM, so the same code draws SVG in the browser and is
 * unit-tested in Node. Widgets turn the results into SVG elements.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Scale {
  (v: number): number;
  min: number;
  max: number;
}

/** Linear scale from [min, max] to [to, from] (SVG y grows downwards, so pass (top, bottom) reversed as needed). */
export function linear(min: number, max: number, from: number, to: number): Scale {
  const span = max - min || Math.abs(max) || 1;
  const lo = max - min ? min : min - span / 2;
  const s = ((v: number) => from + ((v - lo) / (max - min || span)) * (to - from)) as Scale;
  s.min = lo;
  s.max = max - min ? max : max + span / 2;
  return s;
}

/** Min and max of every value a set of bars can draw (lows and highs). */
export function extent(bars: readonly Bar[], useClose = false): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const b of bars) {
    lo = Math.min(lo, useClose ? b[4] : b[3]);
    hi = Math.max(hi, useClose ? b[4] : b[2]);
  }
  return Number.isFinite(lo) ? [lo, hi] : [0, 1];
}

const f = (n: number) => Math.round(n * 10) / 10;

/** SVG path through points. */
export function linePath(points: ReadonlyArray<readonly [number, number]>): string {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('');
}

/** Closed area under a line down to `baseY`. */
export function areaPath(points: ReadonlyArray<readonly [number, number]>, baseY: number): string {
  if (!points.length) return '';
  const first = points[0]!;
  const last = points[points.length - 1]!;
  return `${linePath(points)}L${f(last[0])} ${f(baseY)}L${f(first[0])} ${f(baseY)}Z`;
}

/** Heikin-Ashi bars from ordinary OHLC bars. */
export function heikinAshi(bars: readonly Bar[]): Bar[] {
  const out: Bar[] = [];
  for (let i = 0; i < bars.length; i += 1) {
    const [t, o, h, l, c, v] = bars[i]!;
    const close = (o + h + l + c) / 4;
    const prev = out[i - 1];
    const open = prev ? (prev[1] + prev[4]) / 2 : (o + c) / 2;
    out.push([t, open, Math.max(h, open, close), Math.min(l, open, close), close, v]);
  }
  return out;
}

export interface CandleGeom {
  x: number;
  /** Body left edge and width. */
  bx: number;
  bw: number;
  top: number;
  bottom: number;
  high: number;
  low: number;
  up: boolean;
}

/** Candle (or OHLC bar) geometry for bars spread evenly across a box. */
export function candles(bars: readonly Bar[], box: Box, y: Scale): CandleGeom[] {
  const n = Math.max(1, bars.length);
  const slot = box.w / n;
  const bw = Math.max(1, Math.min(14, slot * 0.7));
  return bars.map(([, o, h, l, c], i) => {
    const x = box.x + slot * (i + 0.5);
    const a = y(o);
    const b = y(c);
    return { x, bx: x - bw / 2, bw, top: Math.min(a, b), bottom: Math.max(a, b, Math.min(a, b) + 1), high: y(h), low: y(l), up: c >= o };
  });
}

/** Evenly spread x positions (index-based, so gaps between sessions do not show as flat lines). */
export function xAt(i: number, n: number, box: Box): number {
  return n <= 1 ? box.x + box.w / 2 : box.x + (box.w * i) / (n - 1);
}

/** Up to `count` round tick values covering [min, max]. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (!(max > min)) return [min];
  const raw = (max - min) / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) out.push(Math.round(v / step) * step);
  return out;
}

export interface TreemapRect<T> extends Box {
  item: T;
}

/**
 * Squarified treemap (Bruls, Huizing, van Wijk): tiles keep close to square, which keeps small
 * companies readable. Items with no positive value are left out.
 */
export function treemap<T>(items: readonly T[], value: (item: T) => number, box: Box): Array<TreemapRect<T>> {
  const list = items.map((item) => ({ item, v: value(item) })).filter((d) => d.v > 0 && Number.isFinite(d.v)).sort((a, b) => b.v - a.v);
  const total = list.reduce((s, d) => s + d.v, 0);
  const out: Array<TreemapRect<T>> = [];
  if (!total || box.w <= 0 || box.h <= 0) return out;
  const scale = (box.w * box.h) / total;
  let rest = { ...box };
  let row: Array<{ item: T; a: number }> = [];

  const worst = (r: Array<{ a: number }>, side: number) => {
    const sum = r.reduce((s, d) => s + d.a, 0);
    let max = 0;
    let min = Infinity;
    for (const d of r) {
      max = Math.max(max, d.a);
      min = Math.min(min, d.a);
    }
    return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min));
  };
  const layout = (r: Array<{ item: T; a: number }>) => {
    const sum = r.reduce((s, d) => s + d.a, 0);
    if (rest.w >= rest.h) {
      const w = sum / rest.h;
      let y = rest.y;
      for (const d of r) {
        const h = d.a / w;
        out.push({ item: d.item, x: rest.x, y, w, h });
        y += h;
      }
      rest = { x: rest.x + w, y: rest.y, w: rest.w - w, h: rest.h };
    } else {
      const h = sum / rest.w;
      let x = rest.x;
      for (const d of r) {
        const w = d.a / h;
        out.push({ item: d.item, x, y: rest.y, w, h });
        x += w;
      }
      rest = { x: rest.x, y: rest.y + h, w: rest.w, h: rest.h - h };
    }
  };

  for (const d of list) {
    const node = { item: d.item, a: d.v * scale };
    const side = Math.min(rest.w, rest.h);
    if (row.length === 0 || worst([...row, node], side) <= worst(row, side)) row.push(node);
    else {
      layout(row);
      row = [node];
    }
  }
  if (row.length) layout(row);
  return out;
}

/** Colour mix weight for a percent move: 0 at flat, 1 at ±`cap` percent or beyond. */
export function moveIntensity(cp: number | null, cap = 5): number {
  if (cp === null || !Number.isFinite(cp)) return 0;
  return Math.min(1, Math.abs(cp) / cap);
}
