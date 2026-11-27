import { css, html, type PropertyDeclarations } from 'lit';
import { formatAge, formatChange, formatClock, formatCompact, formatPrice, quoteState } from '@capitalist-charts/core';
import { parseSymbolRef, type QuoteSnapshot } from '@capitalist-charts/schema/base';
import { CapElement, quoteSub, type Sub } from './base.js';
import { define } from './runtime.js';

/**
 * `<cap-ticker-tag symbol="PSX:OGDC">OGDC</cap-ticker-tag>`: a live price inside running text.
 * Hover or keyboard focus opens a small quote card. The light-DOM text is the fallback for
 * search engines and readers without JavaScript.
 */
export class CapTickerTag extends CapElement {
  static override properties: PropertyDeclarations = { symbol: { type: String }, show: { type: String }, open: { state: true } };
  static override styles = [
    ...CapElement.styles,
    css`
      :host { display: inline-block; contain: none; position: relative; min-width: 32ch; vertical-align: baseline; font-size: inherit; line-height: inherit; font-variant-numeric: tabular-nums; }
      .tag { display: inline-flex; align-items: baseline; gap: 4px; color: inherit; text-decoration: none; box-shadow: inset 0 -1px 0 currentColor; line-height: inherit; font-size: inherit; white-space: nowrap; }
      .tag .num { display: inline-block; min-width: 10ch; text-align: end; font-variant-numeric: tabular-nums; }
      .tag b { font-weight: 600; }
      /* Plain inline text, not a flex box: a flex box takes its baseline from the arrow icon and
         lifts the host's line by a couple of pixels. */
      .tag .chg { display: inline; }
      .tag .chg .ico { width: 0.85em; height: 0.85em; vertical-align: -0.05em; }
      .pop { position: absolute; z-index: 10; top: calc(100% + 6px); inset-inline-start: 0; width: 230px; box-shadow: 0 8px 24px rgb(0 0 0 / 0.16); font-size: 0.85rem; white-space: normal; }
      .px { font-size: 1.2rem; font-weight: 600; }
      .row { display: flex; gap: 8px; align-items: baseline; }
    `,
  ];

  symbol = 'PSX:KSE100';
  show: 'price' | 'change' | 'both' = 'both';
  private open = false;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  protected override subscriptions(): Sub[] {
    const r = parseSymbolRef(this.symbol);
    return r ? [quoteSub(r.market, r.symbol)] : [];
  }

  private setOpen(v: boolean): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    if (v) this.open = true;
    else this.closeTimer = setTimeout(() => (this.open = false), 150);
  }

  override render() {
    const r = parseSymbolRef(this.symbol);
    if (this.blockedReason || !r) return html`<slot></slot>`;
    const u = this.val<QuoteSnapshot>(quoteSub(r.market, r.symbol));
    const q = u?.data;
    if (!q) return html`<slot>${r.symbol}</slot>`;
    const nowSec = Math.floor(Date.now() / 1000);
    const state = quoteState(q, u?.status, nowSec, { failed: u?.failed ?? false });
    const label = q.k === 'index' ? q.n : q.s;
    return html`<span @mouseenter=${() => this.setOpen(true)} @mouseleave=${() => this.setOpen(false)} @focusin=${() => this.setOpen(true)} @focusout=${() => this.setOpen(false)}
      @keydown=${(e: KeyboardEvent) => e.key === 'Escape' && (this.open = false)}>
      <a class="tag" href=${this.siteHref(this.quotePath(q.m, q.s))} target="_blank" rel="noopener" aria-describedby="pop" @click=${(e: MouseEvent) => this.onLink(e, q.s)}>
        <b>${label}</b>${this.show !== 'change' ? html`<span class="num">${formatPrice(q.p)}</span>` : ''}${this.show !== 'price' ? this.change(q.cp) : ''}
      </a>
      ${this.open
        ? html`<span class="card pop" id="pop" role="tooltip">
            <span class="hd">${this.monogram(q.s)}<span class="title">${q.s}</span>${this.statusPill(state, state === 'live' ? `${this.s('live')} · ${formatClock(q.t)}` : undefined)}</span>
            <span class="bd"><span class="sub">${q.n}</span>
              <span class="row"><span class="px num">${formatPrice(q.p)}</span><span class="num ${(q.c ?? 0) > 0 ? 'up' : (q.c ?? 0) < 0 ? 'down' : 'flat'}">${formatChange(q.c)}</span>${this.change(q.cp)}</span>
              <span class="sub">${this.s('vol')} <span class="num">${formatCompact(q.vol)}</span></span></span>
            <span class="ft">${this.attribution()}<span class="num">${formatAge(q.t, nowSec)}</span></span>
          </span>`
        : ''}
    </span>`;
  }
}

define('cap-ticker-tag', CapTickerTag);

declare global {
  interface HTMLElementTagNameMap {
    'cap-ticker-tag': CapTickerTag;
  }
}
