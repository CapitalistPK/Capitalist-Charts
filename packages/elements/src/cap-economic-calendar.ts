import { analytics } from '@capitalist-charts/core/analytics';
import { css, html, type PropertyDeclarations } from 'lit';
import { } from '@capitalist-charts/core';
import type { EconCalendar } from '@capitalist-charts/schema/analytics';
import { CapElement, resourceSub, type Sub } from './base.js';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';

useExtraStrings();

/** `<cap-economic-calendar currencies="PKR,USD">`: upcoming economic releases with forecast, previous and actual. */
export class CapEconomicCalendar extends CapElement {
  static override properties: PropertyDeclarations = { currencies: { type: String }, impact: { type: String } };
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 300px; }
      .imp { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--_flat); }
      .imp.high { background: var(--_down); } .imp.medium { background: var(--_warn); }
      .wrap { overflow-x: auto; }
    `,
  ];
  /** Currencies shown (empty = all). */
  currencies = '';
  /** Lowest impact shown: `low`, `medium` or `high`. */
  impact = 'low';
  protected override subscriptions(): Sub[] {
    return [resourceSub(analytics.econ())];
  }
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const u = this.val<EconCalendar>(analytics.econ());
    if (!u?.data) return u?.failed || u?.notFound ? this.message(this.s('econ'), this.s('unavailable')) : this.skeleton(8, this.s('econ'));
    const want = new Set(this.currencies.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean));
    const rank = (i: string | null) => (i === 'high' ? 3 : i === 'medium' ? 2 : 1);
    const floor = rank(this.impact);
    const rows = u.data.rows.filter((r) => (!want.size || want.has(r.c)) && rank(r.i) >= floor);
    if (!rows.length) return this.message(this.s('econ'), this.s('noEcon'));
    const fmt = (d: string, at: number | null) =>
      at !== null
        ? new Date(at * 1000).toLocaleString(this.locale === 'ur' ? 'ur-PK' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' })
        : new Date(`${d}T00:00:00Z`).toLocaleDateString(this.locale === 'ur' ? 'ur-PK' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    return this.frame(
      this.s('econ'),
      html`<div class="wrap"><table class="t">
        <thead><tr><th></th><th></th><th>${this.s('econ')}</th><th class="r">${this.s('forecast')}</th><th class="r">${this.s('previous')}</th><th class="r">${this.s('actual')}</th></tr></thead>
        <tbody>${rows.map((r) => html`<tr>
          <td class="num sub">${fmt(r.d, r.at)}</td>
          <td><span class="imp ${r.i ?? ''}" title=${`${this.s('impact')}: ${r.i ?? ''}`}></span> ${r.c}</td>
          <td style="white-space:normal" dir="auto">${r.t}</td>
          <td class="r num">${r.f ?? ''}</td><td class="r num">${r.prev ?? ''}</td><td class="r num">${r.a ?? ''}</td></tr>`)}</tbody>
      </table></div>`,
    );
  }
}
define('cap-economic-calendar', CapEconomicCalendar);
declare global {
  interface HTMLElementTagNameMap {
    'cap-economic-calendar': CapEconomicCalendar;
  }
}
