import { analytics } from '@capitalist-charts/core/analytics';
import { css, html } from 'lit';
import { formatNumber } from '@capitalist-charts/core';
import type { Dividends } from '@capitalist-charts/schema/analytics';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';
import { SymbolView } from './symbol-view.js';

useExtraStrings();

/** `<cap-dividends symbol="PSX:FFC">`: yield, the next announced entitlement and the payout history. */
export class CapDividends extends SymbolView<Dividends> {
  static override styles = [
    ...SymbolView.styles,
    parts,
    css`
      :host { min-width: 280px; }
      .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .stat { background: var(--_surface); border-radius: 8px; padding: 6px 9px; font-size: 0.7rem; color: var(--_muted); }
      .stat b { display: block; font-size: 1rem; color: var(--_text); font-weight: 600; }
    `,
  ];
  protected readonly titleKey = 'dividends' as const;
  protected resourceFor(m: string, s: string) {
    return analytics.dividends(m, s);
  }
  protected body(d: Dividends) {
    const fmtDate = (x: string) => new Date(`${x}T00:00:00Z`).toLocaleDateString(this.locale === 'ur' ? 'ur-PK' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
    return html`<div class="stats">
        <div class="stat">${this.s('yield')}<b class="num">${d.y === null ? '–' : `${formatNumber(d.y, 1)}%`}</b></div>
        <div class="stat">${this.s('nextEntitlement')}<b class="num" style="font-size:.82rem">${d.next ? html`<bdi>${fmtDate(d.next.d)}</bdi> · <bdi>${d.next.x}</bdi>` : '–'}</b></div>
      </div>
      <table class="t">
        <thead><tr><th>${this.s('payout')}</th><th class="r">%</th><th class="r">${this.s('perShare')}</th><th class="r">${this.s('period')}</th></tr></thead>
        <tbody>${d.rows.slice(0, 8).map((r) => html`<tr>
          <td class="num">${fmtDate(r.d)}</td>
          <td class="r num">${r.dp !== null ? `${formatNumber(r.dp, 0)}%` : r.bonus !== null ? `${formatNumber(r.bonus, 0)}% B` : r.right !== null ? `${formatNumber(r.right, 0)}% R` : '–'}</td>
          <td class="r num">${r.dps === null ? '–' : `Rs ${formatNumber(r.dps, 2)}`}</td><td class="r">${r.p ?? ''}</td></tr>`)}</tbody>
      </table>`;
  }
}
define('cap-dividends', CapDividends);
declare global {
  interface HTMLElementTagNameMap {
    'cap-dividends': CapDividends;
  }
}
