import { analytics } from '@capitalist-charts/core/analytics';
import { css, html } from 'lit';
import { formatCompact, formatNumber } from '@capitalist-charts/core';
import type { Insiders } from '@capitalist-charts/schema/analytics';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';
import { SymbolView } from './symbol-view.js';

useExtraStrings();

/** `<cap-insider-trades symbol="PSX:SYS">`: directors' and officers' disclosed trades, with net buying over 90 days and a year. */
export class CapInsiderTrades extends SymbolView<Insiders> {
  static override styles = [
    ...SymbolView.styles,
    parts,
    css`
      :host { min-width: 300px; }
      .stats { display: flex; gap: 14px; font-size: 0.75rem; color: var(--_muted); flex-wrap: wrap; }
      .stats b { font-weight: 600; }
      .who { max-width: 140px; overflow: hidden; text-overflow: ellipsis; }
    `,
  ];
  protected readonly titleKey = 'insiders' as const;
  protected resourceFor(m: string, s: string) {
    return analytics.insiders(m, s);
  }
  protected body(d: Insiders) {
    const net = (n: number | null) => (n === null ? '–' : html`<b class="num ${n > 0 ? 'up' : n < 0 ? 'down' : 'flat'}">${n > 0 ? '+' : n < 0 ? '−' : ''}${formatCompact(Math.abs(n))} ${this.s('shares')}</b>`);
    if (!d.rows.length) return html`<p class="sub">${this.s('noInsiders')}</p>`;
    return html`<div class="stats"><span>${this.s('net90')} ${net(d.net90)}</span><span>${this.s('net365')} ${net(d.net365)}</span></div>
      <table class="t"><tbody>${d.rows.slice(0, 8).map((r) => html`<tr>
        <td class="num">${r.d}</td>
        <td><div class="who" title=${r.who}>${r.who}</div>${r.role ? html`<div class="sub">${r.role}</div>` : ''}</td>
        <td class="r"><span class=${r.side === 'buy' ? 'up' : r.side === 'sell' ? 'down' : 'flat'}>${r.side === 'buy' ? this.s('bought') : r.side === 'sell' ? this.s('sold') : ''}</span>
          <div class="sub num">${r.q === null ? '' : formatCompact(r.q)}${r.px === null ? '' : ` @ ${formatNumber(r.px, 2)}`}</div></td></tr>`)}</tbody></table>`;
  }
}
define('cap-insider-trades', CapInsiderTrades);
declare global {
  interface HTMLElementTagNameMap {
    'cap-insider-trades': CapInsiderTrades;
  }
}
