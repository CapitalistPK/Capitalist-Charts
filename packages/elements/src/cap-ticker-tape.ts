import { css, html, type PropertyDeclarations, type PropertyValues } from 'lit';
import { formatPrice, resources, type QuoteUpdate, type ResourceUpdate } from '@capitalist-charts/core';
import { parseSymbolRef } from '@capitalist-charts/schema/base';
import { type CompactQuote, type IndexList } from '@capitalist-charts/schema/views';
import { CapElement } from './base.js';
import { define, getRuntime } from './runtime.js';

const MAX_SYMBOLS = 40;

/**
 * `<cap-ticker-tape symbols="PSX:KSE100,PSX:OGDC,PSX:HBL">`: a scrolling strip of live prices.
 * It pauses on hover and focus, has a visible pause button (WCAG 2.2.2), and does not move at all
 * for visitors who prefer reduced motion (it becomes a scrollable row instead).
 */
export class CapTickerTape extends CapElement {
  static override properties: PropertyDeclarations = { symbols: { type: String }, index: { type: String }, speed: { type: Number }, paused: { state: true } };
  static override styles = [
    ...CapElement.styles,
    css`
      .tape { flex-direction: row; align-items: center; height: 46px; }
      button.pause { flex: none; border: 0; background: transparent; color: var(--_muted); width: 40px; height: 100%; cursor: pointer; border-inline-end: 1px solid var(--_border); display: grid; place-items: center; }
      .viewport { flex: 1 1 0; width: 0; overflow: hidden; min-width: 0; mask-image: linear-gradient(90deg, transparent, #000 24px, #000 calc(100% - 24px), transparent); }
      .track { display: inline-flex; white-space: nowrap; animation: scroll var(--_dur, 40s) linear infinite; }
      .tape:hover .track, .tape:focus-within .track, .paused .track { animation-play-state: paused; }
      .item { display: inline-flex; gap: 6px; align-items: center; padding: 0 14px; font-size: 0.82rem; border-inline-end: 1px solid var(--_border); color: inherit; text-decoration: none; }
      .item b { font-weight: 600; }
      .attr-wrap { flex: none; padding: 0 12px; font-size: 0.68rem; border-inline-start: 1px solid var(--_border); height: 100%; display: flex; align-items: center; }
      @media (max-width: 480px) { .attr-wrap { padding: 0 8px; font-size: 0; } .attr-wrap .ico { font-size: 0.8rem; } }
      @keyframes scroll { to { transform: translateX(-50%); } }
      :host(:dir(rtl)) .track { animation-name: scroll-rtl; }
      @keyframes scroll-rtl { to { transform: translateX(50%); } }
      @media (prefers-reduced-motion: reduce) { .track { animation: none; } .viewport { overflow-x: auto; mask-image: none; } button.pause { display: none; } }
    `,
  ];

  symbols = 'PSX:KSE100,PSX:KSE30,PSX:KMI30';
  /** Instead of `symbols`: every constituent of this index (one request for the whole list). */
  index = '';
  private list: ResourceUpdate<IndexList> | null = null;
  /** Seconds for one full loop. */
  speed = 40;
  private paused = false;
  private readonly data = new Map<string, QuoteUpdate>();
  private unsubs: Array<() => void> = [];

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.blockedReason) this.listen();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopData();
  }

  protected override startData(): void {
    this.listen();
  }

  protected override stopData(): void {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
  }

  override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (((changed.has('symbols') && changed.get('symbols') !== undefined) || (changed.has('index') && changed.get('index') !== undefined)) && !this.blockedReason) this.listen();
  }

  private refs() {
    const seen = new Set<string>();
    return this.symbols
      .split(',')
      .map((s) => parseSymbolRef(s))
      .filter((r): r is { market: string; symbol: string } => r !== null && !seen.has(`${r.market}:${r.symbol}`) && !!seen.add(`${r.market}:${r.symbol}`))
      .slice(0, MAX_SYMBOLS);
  }

  private indexRef() {
    return this.index.trim() ? parseSymbolRef(this.index) : null;
  }

  private listen(): void {
    this.unsubs.forEach((u) => u());
    this.data.clear();
    this.list = null;
    const poller = getRuntime().poller;
    let first = true;
    const idx = this.indexRef();
    if (idx) {
      this.unsubs = [
        poller.subscribeResource(resources.list(idx.market, idx.symbol), (u) => {
          this.list = u;
          if (first && u.data) {
            first = false;
            this.dispatchEvent(new CustomEvent('cap:ready', { bubbles: true, composed: true }));
          }
          this.requestUpdate();
        }),
      ];
      return;
    }
    this.unsubs = this.refs().map((r) =>
      poller.subscribe(r.market, r.symbol, (u) => {
        this.data.set(`${u.market}:${u.symbol}`, u);
        if (first) {
          first = false;
          this.dispatchEvent(new CustomEvent('cap:ready', { bubbles: true, composed: true }));
        }
        this.requestUpdate();
      }),
    );
  }

  private item(q: CompactQuote, m: string) {
    return html`<a class="item" href=${this.siteHref(this.quotePath(m, q.s))} target="_blank" rel="noopener" @click=${(e: MouseEvent) => this.onLink(e, q.s)}
      ><b>${q.s}</b><span class="num">${formatPrice(q.p)}</span>${this.change(q.cp)}</a
    >`;
  }

  private items() {
    const idx = this.indexRef();
    if (idx) {
      const items = this.list?.data?.items;
      if (!items) return [html`<span class="item"><b>${idx.symbol}</b><span class="skel" style="width:48px;height:10px"></span></span>`];
      return items.map((q) => this.item(q, idx.market));
    }
    return this.refs().map((r) => {
      const q = this.data.get(`${r.market}:${r.symbol}`)?.quote;
      if (!q) return html`<span class="item"><b>${r.symbol}</b><span class="skel" style="width:48px;height:10px"></span></span>`;
      return html`<a class="item" href=${this.siteHref(this.quotePath(q.m, q.s))} target="_blank" rel="noopener" @click=${(e: MouseEvent) => this.onLink(e, q.s)}
        ><b>${q.k === 'index' ? q.n : q.s}</b><span class="num">${formatPrice(q.p)}</span>${this.change(q.cp)}</a
      >`;
    });
  }

  // The second copy only makes the scroll loop seamless. `inert` keeps its links out of the tab
  // order; aria-hidden alone would leave keyboard users tabbing into invisible duplicates.
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const items = this.items();
    return html`<div class="card tape ${this.paused ? 'paused' : ''}" role="region" aria-label="Ticker tape" part="card" style="--_dur:${Math.max(10, this.speed)}s">
      <button class="pause" type="button" aria-pressed=${String(this.paused)} aria-label=${this.s(this.paused ? 'play' : 'pause')} @click=${() => (this.paused = !this.paused)}>
        ${this.icon(this.paused ? 'play' : 'pause')}
      </button>
      <div class="viewport"><div class="track">${items}<span aria-hidden="true" inert style="display:inline-flex">${items}</span></div></div>
      <div class="attr-wrap">${this.attribution()}</div>
    </div>`;
  }
}

define('cap-ticker-tape', CapTickerTape);

declare global {
  interface HTMLElementTagNameMap {
    'cap-ticker-tape': CapTickerTape;
  }
}
