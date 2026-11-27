import { analytics } from '@capitalist-charts/core/analytics';
import { css, html, type PropertyDeclarations } from 'lit';
import { formatCompact, formatNumber, formatPrice } from '@capitalist-charts/core';
import { MARKET_PATTERN } from '@capitalist-charts/schema/base';
import { type Futures } from '@capitalist-charts/schema/analytics';
import { CapElement, resourceSub, type Sub } from './base.js';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';

useExtraStrings();

/** `<cap-futures-board>`: PSX single-stock futures with price, change, volume and front-month basis. */
export class CapFuturesBoard extends CapElement {
  static override properties: PropertyDeclarations = { market: { type: String }, rows: { type: Number } };
  static override styles = [...CapElement.styles, parts, css`:host { min-width: 320px; } .wrap { overflow-x: auto; }`];
  market = 'PSX';
  rows = 15;
  protected override subscriptions(): Sub[] {
    return MARKET_PATTERN.test(this.market) ? [resourceSub(analytics.futures(this.market))] : [];
  }
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    if (!MARKET_PATTERN.test(this.market)) return this.message(this.market, this.s('unavailable'));
    const u = this.val<Futures>(analytics.futures(this.market));
    if (!u?.data) return u?.failed || u?.notFound ? this.message(this.s('futures'), this.s('unavailable')) : this.skeleton(8, this.s('futures'));
    return this.frame(
      html`${this.s('futures')} <span class="sub">· ${this.market}</span>`,
      html`<div class="wrap"><table class="t">
        <thead><tr><th>${this.s('contract')}</th><th class="r">${this.s('price')}</th><th class="r">${this.s('change')}</th><th class="r">${this.s('vol')}</th><th class="r">${this.s('basis')}</th></tr></thead>
        <tbody>${u.data.rows.slice(0, Math.max(1, Math.min(40, this.rows || 15))).map((r) => html`<tr>
          <td>${this.link(this.quotePath(this.market, r.u), r.k, r.u)}</td><td class="r num">${r.p === null ? '–' : formatPrice(r.p)}</td>
          <td class="r">${this.change(r.cp)}</td><td class="r num">${formatCompact(r.vol)}</td><td class="r num">${r.bs === null ? '' : `${formatNumber(r.bs, 2)}%`}</td></tr>`)}</tbody>
      </table></div>`,
    );
  }
}
define('cap-futures-board', CapFuturesBoard);
declare global {
  interface HTMLElementTagNameMap {
    'cap-futures-board': CapFuturesBoard;
  }
}
