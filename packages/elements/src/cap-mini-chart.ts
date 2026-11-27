import { css, html, type PropertyDeclarations } from 'lit';
import { formatChange, formatPrice, quoteState, resources } from '@capitalist-charts/core';
import { parseSymbolRef, type QuoteSnapshot } from '@capitalist-charts/schema/base';
import { SERIES_RANGES, type Series, type SeriesRange } from '@capitalist-charts/schema/views';
import { CapElement, quoteSub, resourceSub, type Sub } from './base.js';
import { barTime, CHART_TYPES, chartTable, drawChart, hoverIndex, type ChartType } from './chart.js';
import { define } from './runtime.js';
import { parts } from './parts.js';
import { SizeWatcher } from './size.js';

let uid = 0;
/**
 * `<cap-mini-chart symbol="PSX:OGDC" range="1D" chart-type="area">`: live price and change over a
 * small chart with range tabs. The chart is a cached summary (at most 300 bars); the price on top
 * is live.
 */
export class CapMiniChart extends CapElement {
  static override properties: PropertyDeclarations = {
    symbol: { type: String },
    range: { type: String, reflect: true },
    chartType: { type: String, attribute: 'chart-type' },
    hover: { state: true },
  };
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 240px; }
      .card { height: 100%; }
      .bd { flex: 1; min-height: 0; padding-bottom: 4px; }
      .top { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
      .px { font-size: 1.35rem; font-weight: 600; }
      .plot { flex: 1; min-height: 60px; position: relative; }
      .tip { position: absolute; top: 0; inset-inline-start: 0; font-size: 0.7rem; color: var(--_muted); background: var(--_bg); padding: 0 4px; border-radius: 4px; pointer-events: none; }
      .tabs { margin-top: 2px; flex: none; }
      .tabs button { padding: 3px 7px; min-height: 24px; }
    `,
  ];

  symbol = 'PSX:KSE100';
  range: SeriesRange = '1D';
  chartType: ChartType = 'area';
  private hover: number | null = null;
  private readonly size = new SizeWatcher(() => this.requestUpdate());
  private readonly gid = `cmc${++uid}`;

  private ref() {
    return parseSymbolRef(this.symbol);
  }
  private safeRange(): SeriesRange {
    return (SERIES_RANGES as readonly string[]).includes(this.range) ? this.range : '1D';
  }

  protected override subscriptions(): Sub[] {
    const r = this.ref();
    if (!r) return [];
    return [quoteSub(r.market, r.symbol), resourceSub(resources.series(r.market, r.symbol, this.safeRange()))];
  }

  override updated(): void {
    this.size.observe(this.renderRoot.querySelector('.plot'));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.size.disconnect();
  }

  private pick(range: string): void {
    this.range = range as SeriesRange;
    this.hover = null;
    this.emit('cap:select', { range });
  }

  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const r = this.ref();
    if (!r) return this.message(this.symbol, this.s('notFound'));
    const q = this.val<QuoteSnapshot>(quoteSub(r.market, r.symbol));
    const sr = this.val<Series>(resources.series(r.market, r.symbol, this.safeRange()));
    if (q?.notFound) return this.message(r.symbol, this.s('notFound'));
    if (!q?.data && !sr?.data) return this.skeleton(3, r.symbol);
    const quote = q?.data ?? null;
    const series = sr?.data ?? null;
    const state = quoteState(quote, q?.status, Math.floor(Date.now() / 1000), { failed: q?.failed ?? false });
    const type = (CHART_TYPES as readonly string[]).includes(this.chartType) ? this.chartType : 'area';
    const bars = series?.b ?? [];
    const hb = this.hover !== null ? bars[this.hover] : undefined;

    const onMove = (e: PointerEvent) => {
      const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
      if (bars.length) this.hover = hoverIndex(e.clientX - box.left, box.width, bars.length, false);
    };
    const head = html`${this.link(this.quotePath(r.market, r.symbol), r.symbol, r.symbol, 'rowlink')} <span class="sub">${quote?.n ?? ''}</span>`;
    const body = html`
      <div class="top">
        <span class="px num">${quote ? formatPrice(quote.p) : ''}</span>
        ${quote ? html`<span class="num ${(quote.c ?? 0) > 0 ? 'up' : (quote.c ?? 0) < 0 ? 'down' : 'flat'}">${formatChange(quote.c)}</span>${this.change(quote.cp)}` : ''}
      </div>
      <div class="plot" @pointermove=${onMove} @pointerleave=${() => (this.hover = null)}>
        ${series && bars.length && this.size.w
          ? drawChart(series, { type, width: this.size.w, height: this.size.h, id: this.gid, hover: this.hover, baseline: series.r === '1D' ? series.pc : null })
          : series && !bars.length
            ? html`<p class="sub">${this.s('noData')}</p>`
            : html`<div class="skel" style="height:100%"></div>`}
        ${hb ? html`<span class="tip num">${barTime(hb[0], series!.i, this.locale)} · ${formatPrice(hb[4])}</span>` : ''}
        ${series ? chartTable(series, `${r.symbol} ${series.r}`) : ''}
      </div>
      ${this.tabs(SERIES_RANGES.map((k) => ({ key: k, label: k })), this.safeRange(), (k) => this.pick(k), this.s('range'))}
    `;
    return this.frame(head, body, { pill: this.statusPill(state), label: `${r.symbol} ${this.s('chart')}` });
  }
}

define('cap-mini-chart', CapMiniChart);

declare global {
  interface HTMLElementTagNameMap {
    'cap-mini-chart': CapMiniChart;
  }
}
