import { css, html, type PropertyDeclarations } from 'lit';
import { parseSymbolRef } from '@capitalist-charts/schema/base';
import { CapElement, SITE } from './base.js';
import { define } from './runtime.js';

/** SmartCharts' public, framable chart page. */
export const ADVANCED_CHART_PATH = '/pro/charts/embed/advanced';

const LIST = /^[A-Za-z0-9:.,_-]{0,200}$/;
const TOKEN = /^[A-Za-z0-9_-]{1,24}$/;

/**
 * `<cap-advanced-chart symbol="PSX:OGDC">`: the full SmartCharts engine in an iframe (chart types,
 * indicators, drawing tools, intervals, compare, replay). The iframe is its own origin: it cannot
 * read the host page, and the host page cannot reach into it.
 */
export class CapAdvancedChart extends CapElement {
  static override properties: PropertyDeclarations = {
    symbol: { type: String },
    interval: { type: String },
    chartType: { type: String, attribute: 'chart-type' },
    studies: { type: String },
    compare: { type: String },
    hideTopToolbar: { type: String, attribute: 'hide-top-toolbar' },
    hideSideToolbar: { type: String, attribute: 'hide-side-toolbar' },
    allowSymbolChange: { type: String, attribute: 'allow-symbol-change' },
    events: { type: String },
    loaded: { state: true },
  };
  static override styles = [
    ...CapElement.styles,
    css`
      :host { min-width: 300px; }
      .card { height: 100%; position: relative; }
      iframe { border: 0; width: 100%; flex: 1; min-height: 0; display: block; background: var(--_bg); }
      .skel { position: absolute; inset: 0 0 26px; border-radius: 0; }
      .ft { padding-top: 6px; }
    `,
  ];

  symbol = 'PSX:KSE100';
  interval = '1D';
  chartType = 'candles';
  studies = '';
  compare = '';
  hideTopToolbar = 'false';
  hideSideToolbar = 'false';
  allowSymbolChange = 'true';
  events = 'true';
  private loaded = false;

  /** The iframe URL; only validated values are passed on. */
  src(): string | null {
    const r = parseSymbolRef(this.symbol);
    if (!r) return null;
    const url = new URL(ADVANCED_CHART_PATH, SITE);
    const q = url.searchParams;
    q.set('symbol', `${r.market}:${r.symbol}`);
    if (TOKEN.test(this.interval)) q.set('interval', this.interval);
    if (TOKEN.test(this.chartType)) q.set('type', this.chartType);
    if (this.studies && LIST.test(this.studies)) q.set('studies', this.studies);
    const cmp = this.compare
      .split(',')
      .map((s) => parseSymbolRef(s))
      .filter((x): x is { market: string; symbol: string } => !!x)
      .slice(0, 4)
      .map((x) => `${x.market}:${x.symbol}`);
    if (cmp.length) q.set('compare', cmp.join(','));
    if (this.hideTopToolbar === 'true') q.set('top', '0');
    if (this.hideSideToolbar === 'true') q.set('side', '0');
    if (this.allowSymbolChange === 'false') q.set('lock', '1');
    if (this.events === 'false') q.set('events', '0');
    q.set('theme', this.theme === 'dark' || this.theme === 'light' ? this.theme : 'auto');
    q.set('locale', this.locale === 'ur' ? 'ur' : 'en');
    q.set('utm_source', 'widget');
    return url.toString();
  }

  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const src = this.src();
    if (!src) return this.message(this.symbol, this.s('notFound'));
    const r = parseSymbolRef(this.symbol)!;
    return html`<div class="card" part="card">
      ${this.loaded ? '' : html`<div class="skel" aria-hidden="true"></div>`}
      <iframe
        src=${src}
        title=${`${r.symbol} ${this.s('chart')}`}
        loading="lazy"
        referrerpolicy="origin"
        allow="fullscreen; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
        @load=${() => {
          this.loaded = true;
          this.emit('cap:ready', { symbol: `${r.market}:${r.symbol}` });
        }}
      ></iframe>
      <div class="ft" part="footer">${this.attribution()}${this.link(this.quotePath(r.market, r.symbol), this.s('openChart'), r.symbol, 'attr')}</div>
    </div>`;
  }
}

define('cap-advanced-chart', CapAdvancedChart);

declare global {
  interface HTMLElementTagNameMap {
    'cap-advanced-chart': CapAdvancedChart;
  }
}
