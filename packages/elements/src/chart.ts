import { html, nothing, svg, type TemplateResult } from 'lit';
import { formatCompact, formatPrice } from '@capitalist-charts/core';
import { areaPath, candles, extent, heikinAshi, linePath, linear, niceTicks, xAt, type Box } from '@capitalist-charts/core/render';
import type { Bar, Series } from '@capitalist-charts/schema/views';

export const CHART_TYPES = ['area', 'line', 'candles', 'bars', 'heikin-ashi'] as const;
export type ChartType = (typeof CHART_TYPES)[number];

export interface ChartOptions {
  type: ChartType;
  width: number;
  height: number;
  /** Draw volume bars along the bottom. */
  volume?: boolean;
  /** Price axis labels on the trailing edge. */
  axis?: boolean;
  /** Index of the bar under the pointer. */
  hover?: number | null;
  /** Other series drawn as percent-change lines (switches the chart to percent mode). */
  compare?: Array<{ label: string; bars: Bar[]; color: string }>;
  /** Dashed reference line, e.g. the previous close on a 1D chart. */
  baseline?: number | null;
  /** Unique id prefix for gradients (several charts on one page). */
  id: string;
}

const AXIS_W = 46;
const VOL_SHARE = 0.18;

/** Time label for a bar: clock time for intraday ranges, a date otherwise. */
export function barTime(t: number, interval: string, locale = 'en'): string {
  const intraday = /m$|h$/.test(interval);
  const opts: Intl.DateTimeFormatOptions = intraday
    ? { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Karachi', day: interval === '5m' ? undefined : 'numeric', month: interval === '5m' ? undefined : 'short' }
    : { day: 'numeric', month: 'short', year: interval === '1w' ? 'numeric' : undefined, timeZone: 'Asia/Karachi' };
  return new Intl.DateTimeFormat(locale === 'ur' ? 'ur-PK' : 'en-GB', opts).format(new Date(t * 1000));
}

/** Percent change of each close from the first close. */
const pctPoints = (bars: Bar[]) => {
  const first = bars[0]?.[4] || 1;
  return bars.map((b) => ((b[4] - first) / first) * 100);
};

/**
 * Draws one price series (plus optional compare lines and volume) as an SVG sized in real pixels,
 * so text stays crisp at any size. Bars are spread evenly by index, so nights and weekends do not
 * show as flat stretches.
 */
export function drawChart(series: Series, o: ChartOptions): TemplateResult {
  const W = Math.max(60, o.width);
  const H = Math.max(40, o.height);
  const bars = o.type === 'heikin-ashi' ? heikinAshi(series.b) : series.b;
  const n = bars.length;
  const axis = o.axis ? AXIS_W : 0;
  const volH = o.volume ? Math.round(H * VOL_SHARE) : 0;
  const plot: Box = { x: 2, y: 6, w: W - axis - 4, h: H - volH - 12 };
  const pct = !!o.compare?.length;

  const values = pct ? [pctPoints(series.b), ...o.compare!.map((c) => pctPoints(c.bars))].flat() : [];
  let [lo, hi] = pct ? [Math.min(0, ...values), Math.max(0, ...values)] : extent(bars, o.type === 'area' || o.type === 'line');
  if (!pct && o.baseline != null) {
    lo = Math.min(lo, o.baseline);
    hi = Math.max(hi, o.baseline);
  }
  const pad = (hi - lo) * 0.06 || Math.abs(hi) * 0.01 || 1;
  const y = linear(lo - pad, hi + pad, plot.y + plot.h, plot.y);
  const up = n > 1 ? bars[n - 1]![4] >= (o.baseline ?? bars[0]![4]) : true;
  const stroke = up ? 'var(--_up)' : 'var(--_down)';
  const xs = (i: number) => xAt(i, n, plot);

  const grid = o.axis
    ? niceTicks(y.min, y.max, Math.max(2, Math.floor(plot.h / 46))).map((t) => (Math.abs(t) < 1e-9 ? 0 : t)).map(
        (v) => svg`<line class="grid" x1=${plot.x} x2=${plot.x + plot.w} y1=${y(v)} y2=${y(v)}></line>
          <text class="axis" x=${W - 2} y=${y(v) + 3} text-anchor="end">${pct ? `${v > 0 ? '+' : ''}${formatPrice(v, Math.abs(v) < 10 ? 1 : 0)}%` : formatPrice(v, v >= 1000 ? 0 : 2)}</text>`,
      )
    : nothing;

  let main: TemplateResult;
  if (pct) {
    const pts = pctPoints(series.b).map((v, i) => [xs(i), y(v)] as const);
    main = svg`<path d=${linePath(pts)} fill="none" stroke="var(--_accent)" stroke-width="1.6"></path>`;
  } else if (o.type === 'area' || o.type === 'line') {
    const pts = bars.map((b, i) => [xs(i), y(b[4])] as const);
    main = svg`${o.type === 'area'
      ? svg`<defs><linearGradient id=${`${o.id}-g`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color=${stroke} stop-opacity="0.22"></stop><stop offset="1" stop-color=${stroke} stop-opacity="0"></stop></linearGradient></defs>
        <path d=${areaPath(pts, plot.y + plot.h)} fill=${`url(#${o.id}-g)`}></path>`
      : nothing}<path d=${linePath(pts)} fill="none" stroke=${stroke} stroke-width="1.6" stroke-linejoin="round"></path>`;
  } else {
    const geo = candles(bars, plot, y);
    main = svg`${geo.map((c) => {
      const col = c.up ? 'var(--_up)' : 'var(--_down)';
      if (o.type === 'bars') {
        const tick = Math.max(2, c.bw / 2);
        const open = c.up ? c.bottom : c.top;
        const close = c.up ? c.top : c.bottom;
        return svg`<path d=${`M${c.x} ${c.high}V${c.low}M${c.x - tick} ${open}H${c.x}M${c.x} ${close}H${c.x + tick}`} stroke=${col} stroke-width="1.2"></path>`;
      }
      return svg`<line x1=${c.x} x2=${c.x} y1=${c.high} y2=${c.low} stroke=${col}></line><rect x=${c.bx} y=${c.top} width=${c.bw} height=${c.bottom - c.top} fill=${col}></rect>`;
    })}`;
  }

  const compare = pct
    ? o.compare!.map((c) => {
        const pts = pctPoints(c.bars).map((v, i, all) => [xAt(i, all.length, plot), y(v)] as const);
        return svg`<path d=${linePath(pts)} fill="none" stroke=${c.color} stroke-width="1.3"></path>`;
      })
    : nothing;

  let volume: TemplateResult | typeof nothing = nothing;
  if (volH) {
    const vmax = Math.max(1, ...series.b.map((b) => b[5] ?? 0));
    const slot = plot.w / Math.max(1, n);
    const bw = Math.max(1, Math.min(10, slot * 0.7));
    volume = svg`${series.b.map((b, i) => {
      const h = ((b[5] ?? 0) / vmax) * (volH - 4);
      return svg`<rect x=${xs(i) - bw / 2} y=${H - h} width=${bw} height=${h} fill=${b[4] >= b[1] ? 'var(--_up)' : 'var(--_down)'} opacity="0.35"></rect>`;
    })}`;
  }

  const base = !pct && o.baseline != null ? svg`<line x1=${plot.x} x2=${plot.x + plot.w} y1=${y(o.baseline)} y2=${y(o.baseline)} stroke="var(--_faint)" stroke-dasharray="3 3"></line>` : nothing;
  const h = o.hover;
  const cross =
    h != null && h >= 0 && h < n
      ? svg`<line x1=${xs(h)} x2=${xs(h)} y1=${plot.y} y2=${H} stroke="var(--_faint)" stroke-dasharray="2 3"></line>
        <circle cx=${xs(h)} cy=${y(pct ? pctPoints(series.b)[h]! : bars[h]![4])} r="3" fill="var(--_bg)" stroke=${pct ? 'var(--_accent)' : stroke} stroke-width="1.5"></circle>`
      : nothing;

  return html`<svg class="chart" width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="img" aria-hidden="true">${grid}${base}${volume}${main}${compare}${cross}</svg>`;
}

/** Bar index under a pointer x position inside a chart of `width`. */
export function hoverIndex(x: number, width: number, n: number, axis: boolean): number {
  const w = Math.max(1, width - (axis ? AXIS_W : 0) - 4);
  return Math.max(0, Math.min(n - 1, Math.round(((x - 2) / w) * (n - 1))));
}

/** Visually hidden summary table for screen readers. */
export function chartTable(series: Series, label: string): TemplateResult {
  const b = series.b;
  if (!b.length) return html``;
  const first = b[0]!;
  const last = b[b.length - 1]!;
  const [lo, hi] = extent(b);
  return html`<table class="sr"><caption>${label}</caption>
    <tr><th>Open</th><td>${formatPrice(first[1])}</td></tr><tr><th>High</th><td>${formatPrice(hi)}</td></tr>
    <tr><th>Low</th><td>${formatPrice(lo)}</td></tr><tr><th>Last</th><td>${formatPrice(last[4])}</td></tr>
    <tr><th>Volume (last bar)</th><td>${formatCompact(last[5])}</td></tr></table>`;
}
