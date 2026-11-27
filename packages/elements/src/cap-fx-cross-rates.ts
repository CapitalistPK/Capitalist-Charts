import { css, html, type PropertyDeclarations } from 'lit';
import { formatNumber, resources } from '@capitalist-charts/core';
import { CURRENCY_PATTERN, type FxRates } from '@capitalist-charts/schema/views';
import { CapElement, resourceSub, type Sub } from './base.js';
import { define } from './runtime.js';
import { parts } from './parts.js';

const MAX = 8;

/** Enough digits to be useful at any magnitude (0.0036 JPY... 356.2 GBP). */
function rate(n: number): string {
  const d = n >= 100 ? 2 : n >= 1 ? 3 : n >= 0.01 ? 4 : 6;
  return formatNumber(n, d);
}

/**
 * `<cap-fx-cross-rates currencies="PKR,USD,EUR,GBP">`: a cross-rate table. Each cell is how many
 * units of the row currency buy one unit of the column currency, derived from rupee rates.
 */
export class CapFxCrossRates extends CapElement {
  static override properties: PropertyDeclarations = { currencies: { type: String } };
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 300px; }
      .wrap { overflow-x: auto; }
      th[scope='row'] { font-weight: 600; color: var(--_text); font-size: 0.78rem; }
      td.diag { color: var(--_faint); text-align: center; }
    `,
  ];

  currencies = 'PKR,USD,EUR,GBP,SAR,AED,CNY';

  protected override subscriptions(): Sub[] {
    return [resourceSub(resources.fx('PKR'))];
  }

  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const u = this.val<FxRates>(resources.fx('PKR'));
    if (!u?.data) return u?.notFound || u?.failed ? this.message(this.s('fx'), this.s('unavailable')) : this.skeleton(6, this.s('fx'));
    const fx = u.data;
    const per = new Map<string, number>([[fx.base, 1], ...fx.rates.map((r) => [r.c, r.r] as [string, number])]);
    const list = [...new Set(this.currencies.split(',').map((c) => c.trim().toUpperCase()))].filter((c) => CURRENCY_PATTERN.test(c) && per.has(c)).slice(0, MAX);
    const when = new Date(fx.t * 1000).toLocaleString(this.locale === 'ur' ? 'ur-PK' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' });
    return this.frame(
      this.s('fx'),
      html`<div class="wrap" tabindex="0" role="region" aria-label=${this.s('fx')}><table class="t">
          <caption class="sr">${this.s('fxNote')}</caption>
          <thead><tr><th></th>${list.map((c) => html`<th class="r" scope="col">${c}</th>`)}</tr></thead>
          <tbody>${list.map(
            (row) => html`<tr><th scope="row">${row}</th>${list.map((col) =>
              row === col ? html`<td class="diag">—</td>` : html`<td class="r num">${rate(per.get(col)! / per.get(row)!)}</td>`,
            )}</tr>`,
          )}</tbody>
        </table></div>
        <p class="sub" style="white-space:normal;font-size:.68rem">${this.s('fxNote')}</p>`,
      { foot: `${this.s('updated')} ${when}` },
    );
  }
}

define('cap-fx-cross-rates', CapFxCrossRates);

declare global {
  interface HTMLElementTagNameMap {
    'cap-fx-cross-rates': CapFxCrossRates;
  }
}
