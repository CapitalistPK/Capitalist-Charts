import { analytics } from '@capitalist-charts/core/analytics';
import { css, html } from 'lit';
import { formatNumber } from '@capitalist-charts/core';
import type { Seasonality } from '@capitalist-charts/schema/analytics';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';
import { SymbolView } from './symbol-view.js';

useExtraStrings();

/** `<cap-seasonality symbol="PSX:KSE100">`: average return in each calendar month, with how often it was positive. */
export class CapSeasonality extends SymbolView<Seasonality> {
  static override styles = [
    ...SymbolView.styles,
    css`
      :host { min-width: 300px; }
      .grid { direction: ltr; display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; align-items: end; height: 140px; position: relative; }
      .grid::after { content: ''; position: absolute; inset-inline: 0; top: 50%; border-top: 1px solid var(--_border); }
      .m { display: flex; flex-direction: column; height: 100%; position: relative; }
      .bar { position: absolute; inset-inline: 15%; border-radius: 2px; }
      .lbls { direction: ltr; display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; font-size: 0.6rem; color: var(--_faint); text-align: center; }
    `,
  ];
  protected readonly titleKey = 'seasonality' as const;
  protected resourceFor(m: string, s: string) {
    return analytics.seasonality(m, s);
  }
  protected body(d: Seasonality) {
    const max = Math.max(0.5, ...d.rows.map((r) => Math.abs(r.avg ?? 0)));
    const month = (mo: number) => new Date(Date.UTC(2026, mo - 1, 1)).toLocaleString(this.locale === 'ur' ? 'ur-PK' : 'en-GB', { month: 'short', timeZone: 'UTC' });
    return html`<div class="grid" role="img" aria-label=${this.s('seasonality')}>
        ${d.rows.map((r) => {
          const v = r.avg ?? 0;
          const h = (Math.abs(v) / max) * 50;
          const tip = `${month(r.mo)}: ${r.avg === null ? '–' : `${formatNumber(r.avg, 1)}%`} · ${this.s('positiveYears')} ${r.up === null ? '–' : `${formatNumber(r.up * 100, 0)}%`} (${r.n} ${this.s('years')})`;
          return html`<div class="m" title=${tip}><span class="bar" style="${v >= 0 ? `bottom:50%` : `top:50%`};height:${h}%;background:${v >= 0 ? 'var(--_up)' : 'var(--_down)'}"></span></div>`;
        })}
      </div>
      <div class="lbls">${d.rows.map((r) => html`<span>${month(r.mo).slice(0, 3)}</span>`)}</div>
      <table class="sr"><caption>${this.s('avgReturn')}</caption>${d.rows.map((r) => html`<tr><th>${month(r.mo)}</th><td>${r.avg ?? ''}</td><td>${r.up ?? ''}</td><td>${r.n}</td></tr>`)}</table>`;
  }
  protected override foot(d: Seasonality) {
    return `${d.from}–${d.to}`;
  }
}
define('cap-seasonality', CapSeasonality);
declare global {
  interface HTMLElementTagNameMap {
    'cap-seasonality': CapSeasonality;
  }
}
