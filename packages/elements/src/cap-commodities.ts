import { analytics } from '@capitalist-charts/core/analytics';
import { css, html } from 'lit';
import { formatNumber, formatPrice } from '@capitalist-charts/core';
import type { Commodities } from '@capitalist-charts/schema/analytics';
import { CapElement, resourceSub, type Sub } from './base.js';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';

useExtraStrings();

/** `<cap-commodities>`: gold, oil, cotton and other market prices, with Pakistan's petrol and diesel prices. */
export class CapCommodities extends CapElement {
  static override styles = [...CapElement.styles, parts, css`:host { min-width: 280px; } h3 { margin: 6px 0 0; font-size: 0.72rem; color: var(--_muted); font-weight: 600; }`];
  protected override subscriptions(): Sub[] {
    return [resourceSub(analytics.commodities())];
  }
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const u = this.val<Commodities>(analytics.commodities());
    if (!u?.data) return u?.failed || u?.notFound ? this.message(this.s('commodities'), this.s('unavailable')) : this.skeleton(8, this.s('commodities'));
    const d = u.data;
    return this.frame(
      this.s('commodities'),
      html`<table class="t"><tbody>${d.rows.map((r) => html`<tr>
          <td>${r.n}<div class="sub">${r.u ? `${r.cur} / ${r.u}` : r.cur}</div></td>
          <td class="r num">${formatPrice(r.p, r.p >= 100 ? 2 : 3)}</td><td class="r">${this.change(r.cp)}</td></tr>`)}</tbody></table>
        ${d.fuel.length ? html`<h3>${this.s('fuel')}</h3><table class="t"><tbody>${d.fuel.map((f) => html`<tr>
          <td>${f.n}<div class="sub">${f.d}</div></td><td class="r num">Rs ${formatNumber(f.p, 2)} <span class="sub">${this.s('perLitre')}</span></td></tr>`)}</tbody></table>` : ''}`,
      { foot: new Date(d.t * 1000).toLocaleString(this.locale === 'ur' ? 'ur-PK' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' }) },
    );
  }
}
define('cap-commodities', CapCommodities);
declare global {
  interface HTMLElementTagNameMap {
    'cap-commodities': CapCommodities;
  }
}
