import { css, html, type PropertyDeclarations } from 'lit';
import { formatChange, formatClock, formatPrice, quoteState } from '@capitalist-charts/core';
import { parseSymbolRef, type MarketStatus, type QuoteSnapshot } from '@capitalist-charts/schema/base';
import { CapElement, quoteSub, type Sub } from './base.js';
import { define } from './runtime.js';
import { parts } from './parts.js';

const MAX = 8;

/**
 * `<cap-market-summary indices="PSX:KSE100,PSX:KMI30">`: the main indices, today's breadth
 * (advancing vs declining shares) and the session status, all live.
 */
export class CapMarketSummary extends CapElement {
  static override properties: PropertyDeclarations = { indices: { type: String } };
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 280px; }
      .breadth { display: flex; height: 8px; border-radius: 99px; overflow: hidden; background: var(--_surface); }
      .breadth span { display: block; height: 100%; }
      .legend { display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--_muted); gap: 8px; flex-wrap: wrap; }
    `,
  ];

  indices = 'PSX:KSE100,PSX:KSE30,PSX:KMI30,PSX:ALLSHR';

  private refs() {
    return this.indices
      .split(',')
      .map((s) => parseSymbolRef(s))
      .filter((r): r is { market: string; symbol: string } => r !== null)
      .slice(0, MAX);
  }
  protected override subscriptions(): Sub[] {
    return this.refs().map((r) => quoteSub(r.market, r.symbol));
  }

  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const refs = this.refs();
    const rows = refs.map((r) => ({ r, u: this.val<QuoteSnapshot>(quoteSub(r.market, r.symbol)) }));
    if (!rows.some((x) => x.u?.data)) return this.skeleton(refs.length + 1, this.s('marketSummary'));
    const status: MarketStatus | null = rows.find((x) => x.u?.status)?.u?.status ?? null;
    const first = rows.find((x) => x.u?.data)!;
    const nowSec = Math.floor(Date.now() / 1000);
    const state = quoteState(first.u!.data, status, nowSec);
    const adv = status?.advancers;
    const dec = status?.decliners;
    const unc = status?.unchanged;
    const total = (adv ?? 0) + (dec ?? 0) + (unc ?? 0);
    const pct = (n = 0) => `${total ? (n / total) * 100 : 0}%`;
    return this.frame(
      html`${this.s('marketSummary')} <span class="sub">· ${first.r.market}</span>`,
      html`<table class="t">
          <thead><tr><th>${this.s('symbol')}</th><th class="r">${this.s('price')}</th><th class="r">${this.s('change')}</th></tr></thead>
          <tbody>${rows.map(({ r, u }) => {
            const q = u?.data;
            return html`<tr>
              <td>${this.link(this.quotePath(r.market, r.symbol), q?.n ?? r.symbol, r.symbol)}</td>
              <td class="r num">${q ? formatPrice(q.p) : '–'}</td>
              <td class="r">${q ? html`<span class="num ${(q.c ?? 0) > 0 ? 'up' : (q.c ?? 0) < 0 ? 'down' : 'flat'}">${formatChange(q.c)}</span> ${this.change(q.cp)}` : ''}</td>
            </tr>`;
          })}</tbody>
        </table>
        ${total
          ? html`<div role="img" aria-label=${`${this.s('breadth')}: ${adv} ${this.s('advancers')}, ${dec} ${this.s('decliners')}, ${unc} ${this.s('unchanged')}`}>
              <div class="breadth"><span style="width:${pct(adv)};background:var(--_up)"></span><span style="width:${pct(unc)};background:var(--_flat)"></span><span style="width:${pct(dec)};background:var(--_down)"></span></div>
              <div class="legend" style="margin-top:6px">
                <span class="up">▲ ${adv} ${this.s('advancers')}</span><span>${unc} ${this.s('unchanged')}</span><span class="down">▼ ${dec} ${this.s('decliners')}</span>
              </div>
            </div>`
          : ''}`,
      { pill: this.statusPill(state, state === 'live' && first.u?.data ? `${this.s('live')} · ${formatClock(first.u.data.t)}` : undefined) },
    );
  }
}

define('cap-market-summary', CapMarketSummary);

declare global {
  interface HTMLElementTagNameMap {
    'cap-market-summary': CapMarketSummary;
  }
}
