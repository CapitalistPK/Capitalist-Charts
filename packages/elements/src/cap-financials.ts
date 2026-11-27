import { analytics } from '@capitalist-charts/core/analytics';
import { css, html } from 'lit';
import { formatCompact, formatNumber } from '@capitalist-charts/core';
import type { Financials } from '@capitalist-charts/schema/analytics';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';
import { SymbolView } from './symbol-view.js';

useExtraStrings();

/**
 * `<cap-financials symbol="PSX:OGDC" period="annual">`: revenue and profit bars with EPS, by fiscal
 * period exactly as published (a June-year company's "Q1 2026" is July to September 2025).
 */
export class CapFinancials extends SymbolView<Financials> {
  static override properties = { ...SymbolView.properties, period: { type: String, reflect: true } };
  static override styles = [
    ...SymbolView.styles,
    parts,
    css`
      :host { min-width: 300px; }
      .bars { direction: ltr; display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 6px; align-items: end; height: 120px; }
      .col { display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 0; height: 100%; justify-content: flex-end; }
      .pair { display: flex; gap: 2px; align-items: flex-end; width: 100%; justify-content: center; flex: 1; }
      .pair span { width: 42%; max-width: 16px; border-radius: 3px 3px 0 0; min-height: 1px; }
      .rv { background: color-mix(in srgb, var(--_accent) 55%, transparent); } .pr { background: var(--_up); } .pr.neg { background: var(--_down); }
      .lbl { font-size: 0.62rem; color: var(--_faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
      .key { display: flex; gap: 12px; font-size: 0.7rem; color: var(--_muted); }
      .key i { display: inline-block; width: 9px; height: 9px; border-radius: 2px; margin-inline-end: 4px; vertical-align: -1px; }
    `,
  ];
  period: 'annual' | 'quarterly' = 'annual';
  protected readonly titleKey = 'financials' as const;
  protected override rows = 6;
  protected resourceFor(m: string, s: string) {
    return analytics.financials(m, s, this.period === 'quarterly' ? 'quarterly' : 'annual');
  }
  protected body(f: Financials) {
    const rows = [...f.rows].reverse();
    const max = Math.max(1, ...rows.map((r) => Math.max(r.rv ?? 0, Math.abs(r.pr ?? 0))));
    const h = (v: number | null) => `${(Math.abs(v ?? 0) / max) * 100}%`;
    return html`${this.tabs(
        [{ key: 'annual', label: this.s('annual') }, { key: 'quarterly', label: this.s('quarterly') }],
        f.per,
        (k) => {
          this.period = k as 'annual' | 'quarterly';
          this.emit('cap:select', { period: k });
        },
        this.s('period'),
      )}
      <div class="key"><span><i class="rv"></i>${this.s('revenue')}</span><span><i class="pr" style="background:var(--_up)"></i>${this.s('profit')}</span></div>
      <div class="bars" role="img" aria-label=${`${this.s('revenue')} / ${this.s('profit')}`}>
        ${rows.map((r) => html`<div class="col" title=${`${r.p}: ${this.s('revenue')} ${formatCompact(r.rv)}, ${this.s('profit')} ${formatCompact(r.pr)}`}>
          <div class="pair"><span class="rv" style="height:${h(r.rv)}"></span><span class="pr ${(r.pr ?? 0) < 0 ? 'neg' : ''}" style="height:${h(r.pr)}"></span></div>
          <span class="lbl">${r.p}</span></div>`)}
      </div>
      <table class="t">
        <thead><tr><th>${this.s('period')}</th><th class="r">${this.s('revenue')}</th><th class="r">${this.s('profit')}</th><th class="r">${this.s('eps')}</th></tr></thead>
        <tbody>${f.rows.slice(0, 4).map((r) => html`<tr><td>${r.p}</td><td class="r num">${r.rv === null ? '–' : formatCompact(r.rv)}</td>
          <td class="r num ${(r.pr ?? 0) < 0 ? 'down' : ''}">${r.pr === null ? '–' : formatCompact(r.pr)}</td><td class="r num">${r.eps === null ? '–' : formatNumber(r.eps, 2)}</td></tr>`)}</tbody>
      </table>`;
  }
  protected override foot(f: Financials) {
    return `${f.cur} · ${f.basis} · ${this.s('fiscalNote')}`;
  }
}
define('cap-financials', CapFinancials);
declare global {
  interface HTMLElementTagNameMap {
    'cap-financials': CapFinancials;
  }
}
