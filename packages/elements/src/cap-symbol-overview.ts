import { css, html, type PropertyDeclarations } from 'lit';
import { formatChange, formatCompact, formatPercent, formatPrice, quoteState, resources } from '@capitalist-charts/core';
import { parseSymbolRef, type QuoteSnapshot } from '@capitalist-charts/schema/base';
import { SERIES_RANGES, type Series, type SeriesRange } from '@capitalist-charts/schema/views';
import { CapElement, quoteSub, resourceSub, type Sub } from './base.js';
import { barTime, CHART_TYPES, chartTable, drawChart, hoverIndex, type ChartType } from './chart.js';
import { define } from './runtime.js';
import { parts } from './parts.js';
import { SizeWatcher } from './size.js';

const MAX = 4;
const COMPARE_COLOURS = ['#d97706', '#7c3aed', '#0891b2'];
let uid = 0;

/**
 * `<cap-symbol-overview symbols="PSX:OGDC,PSX:PPL" range="1Y" chart-type="candles">`: a larger
 * chart with volume, an OHLC legend that follows the pointer, range and chart-type switches, and
 * up to three compare symbols drawn as percent-change lines.
 */
export class CapSymbolOverview extends CapElement {
  static override properties: PropertyDeclarations = {
    symbols: { type: String },
    range: { type: String, reflect: true },
    chartType: { type: String, attribute: 'chart-type', reflect: true },
    volume: { type: String },
    hover: { state: true },
  };
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 300px; }
      .card { height: 100%; }
      .bd { flex: 1; min-height: 0; }
      .top { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
      .px { font-size: 1.5rem; font-weight: 600; }
      .legend { display: flex; gap: 10px; flex-wrap: wrap; font-size: 0.72rem; color: var(--_muted); min-height: 1.2em; }
      .legend b { color: var(--_text); font-weight: 500; }
      .key { display: inline-flex; align-items: center; gap: 4px; }
      .sw { width: 10px; height: 3px; border-radius: 2px; display: inline-block; }
      .plot { flex: 1; min-height: 120px; position: relative; touch-action: pan-y; }
      .bar { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
      select { font: inherit; font-size: 0.72rem; color: var(--_text); background: var(--_surface); border: 0; border-radius: 6px; padding: 4px 6px; min-height: 26px; }
    `,
  ];

  symbols = 'PSX:KSE100';
  range: SeriesRange = '1Y';
  chartType: ChartType = 'candles';
  volume = 'true';
  private hover: number | null = null;
  private readonly size = new SizeWatcher(() => this.requestUpdate());
  private readonly gid = `cso${++uid}`;

  private refs() {
    const seen = new Set<string>();
    return this.symbols
      .split(',')
      .map((s) => parseSymbolRef(s))
      .filter((r): r is { market: string; symbol: string } => !!r && !seen.has(`${r.market}:${r.symbol}`) && !!seen.add(`${r.market}:${r.symbol}`))
      .slice(0, MAX);
  }
  private safeRange(): SeriesRange {
    return (SERIES_RANGES as readonly string[]).includes(this.range) ? this.range : '1Y';
  }

  protected override subscriptions(): Sub[] {
    const refs = this.refs();
    const range = this.safeRange();
    const subs = refs.map((r) => resourceSub(resources.series(r.market, r.symbol, range)));
    if (refs[0]) subs.push(quoteSub(refs[0].market, refs[0].symbol));
    return subs;
  }

  override updated(): void {
    this.size.observe(this.renderRoot.querySelector('.plot'));
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.size.disconnect();
  }

  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const refs = this.refs();
    const main = refs[0];
    if (!main) return this.message(this.symbols, this.s('notFound'));
    const range = this.safeRange();
    const q = this.val<QuoteSnapshot>(quoteSub(main.market, main.symbol));
    const s0 = this.val<Series>(resources.series(main.market, main.symbol, range));
    if (q?.notFound || s0?.notFound) return this.message(main.symbol, this.s('notFound'));
    if (!s0?.data && !q?.data) return this.skeleton(6, main.symbol);
    const series = s0?.data ?? null;
    const quote = q?.data ?? null;
    const others = refs.slice(1).map((r, i) => ({ ref: r, data: this.val<Series>(resources.series(r.market, r.symbol, range))?.data ?? null, color: COMPARE_COLOURS[i]! }));
    const compare = others.filter((o) => o.data?.b.length).map((o) => ({ label: o.ref.symbol, bars: o.data!.b, color: o.color }));
    const type = (CHART_TYPES as readonly string[]).includes(this.chartType) ? this.chartType : 'candles';
    const bars = series?.b ?? [];
    const hb = this.hover !== null ? bars[this.hover] : undefined;
    const state = quoteState(quote, q?.status, Math.floor(Date.now() / 1000), { failed: q?.failed ?? false });
    const onMove = (e: PointerEvent) => {
      const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
      if (bars.length) this.hover = hoverIndex(e.clientX - box.left, box.width, bars.length, true);
    };
    const legend = hb
      ? html`<span class="num">${barTime(hb[0], series!.i, this.locale)}</span>
          <span>${this.s('open')} <b class="num">${formatPrice(hb[1])}</b></span><span>${this.s('high')} <b class="num">${formatPrice(hb[2])}</b></span>
          <span>${this.s('low')} <b class="num">${formatPrice(hb[3])}</b></span><span>${this.s('close')} <b class="num">${formatPrice(hb[4])}</b></span>
          <span>${this.s('vol')} <b class="num">${formatCompact(hb[5])}</b></span>`
      : compare.length
        ? html`<span class="key"><span class="sw" style="background:var(--_accent)"></span>${main.symbol}</span>${compare.map(
            (c) => html`<span class="key"><span class="sw" style="background:${c.color}"></span>${c.label} <b class="num">${formatPercent(((c.bars.at(-1)![4] - c.bars[0]![4]) / c.bars[0]![4]) * 100)}</b></span>`,
          )}`
        : '';
    const head = html`${this.link(this.quotePath(main.market, main.symbol), main.symbol, main.symbol, 'rowlink')} <span class="sub">${quote?.n ?? ''}</span>`;
    const body = html`
      <div class="top">
        <span class="px num">${quote ? formatPrice(quote.p) : ''}</span>
        ${quote ? html`<span class="num ${(quote.c ?? 0) > 0 ? 'up' : (quote.c ?? 0) < 0 ? 'down' : 'flat'}">${formatChange(quote.c)}</span>${this.change(quote.cp)}` : ''}
      </div>
      <div class="legend">${legend}</div>
      <div class="plot" @pointermove=${onMove} @pointerleave=${() => (this.hover = null)}>
        ${series && bars.length && this.size.w
          ? drawChart(series, { type, width: this.size.w, height: this.size.h, id: this.gid, axis: true, volume: this.volume !== 'false' && !compare.length, hover: this.hover, compare, baseline: range === '1D' ? series.pc : null })
          : series ? html`<p class="sub">${this.s('noData')}</p>` : html`<div class="skel" style="height:100%"></div>`}
        ${series ? chartTable(series, `${main.symbol} ${range}`) : ''}
      </div>
      <div class="bar">
        ${this.tabs(SERIES_RANGES.map((k) => ({ key: k, label: k })), range, (k) => {
          this.range = k as SeriesRange;
          this.hover = null;
          this.emit('cap:select', { range: k });
        }, this.s('range'))}
        <select aria-label=${this.s('chartType')} .value=${type} @change=${(e: Event) => (this.chartType = (e.target as HTMLSelectElement).value as ChartType)}>
          ${CHART_TYPES.map((t) => html`<option value=${t} ?selected=${t === type}>${t}</option>`)}
        </select>
      </div>`;
    return this.frame(head, body, { pill: this.statusPill(state), label: `${main.symbol} ${this.s('chart')}` });
  }
}

define('cap-symbol-overview', CapSymbolOverview);

declare global {
  interface HTMLElementTagNameMap {
    'cap-symbol-overview': CapSymbolOverview;
  }
}
