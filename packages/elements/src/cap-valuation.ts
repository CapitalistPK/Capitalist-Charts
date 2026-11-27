import { analytics } from '@capitalist-charts/core/analytics';
import { css, html } from 'lit';
import { formatCompact, formatNumber } from '@capitalist-charts/core';
import type { Ratios, Valuation } from '@capitalist-charts/schema/analytics';
import type { StringKey } from './i18n.js';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';
import { SymbolView } from './symbol-view.js';

useExtraStrings();

/** Lower is cheaper for these; higher is better for the rest. */
const LOWER_BETTER = new Set<keyof Ratios>(['pe', 'pb', 'ev']);
const KEYS: Array<keyof Ratios> = ['pe', 'pb', 'ev', 'dy', 'roe', 'nm'];
const pct = new Set<keyof Ratios>(['dy', 'roe', 'nm']);

/** `<cap-valuation symbol="PSX:LUCK">`: the company's ratios against its sector median, with peers. */
export class CapValuation extends SymbolView<Valuation> {
  static override styles = [...SymbolView.styles, parts, css`:host { min-width: 300px; } .wrap { overflow-x: auto; } td.me { font-weight: 600; }`];
  protected readonly titleKey = 'valuation' as const;
  protected resourceFor(m: string, s: string) {
    return analytics.valuation(m, s);
  }
  private fmt(k: keyof Ratios, v: number | null) {
    return v === null ? '–' : pct.has(k) ? `${formatNumber(v, 1)}%` : formatNumber(v, 1);
  }
  protected body(d: Valuation, market: string) {
    const better = (k: keyof Ratios) => {
      const a = d.r[k];
      const b = d.med[k];
      if (a === null || b === null || a === b) return 'flat';
      return (a < b) === LOWER_BETTER.has(k) ? 'up' : 'down';
    };
    return html`<table class="t">
        <thead><tr><th></th><th class="r">${d.s}</th><th class="r">${this.s('sectorMedian')}</th></tr></thead>
        <tbody>${KEYS.map((k) => html`<tr><td>${this.s(k as StringKey)}</td><td class="r num me ${better(k)}">${this.fmt(k, d.r[k])}</td><td class="r num">${this.fmt(k, d.med[k])}</td></tr>`)}</tbody>
      </table>
      ${d.peers.length
        ? html`<div class="wrap"><table class="t">
            <thead><tr><th>${this.s('peers')}</th><th class="r">${this.s('mcap')}</th><th class="r">${this.s('pe')}</th><th class="r">${this.s('pb')}</th><th class="r">${this.s('dy')}</th></tr></thead>
            <tbody>${d.peers.slice(0, 6).map(
              (p) => html`<tr><td>${this.link(this.quotePath(market, p.s), p.s, p.s)}</td><td class="r num">${p.mc === null ? '–' : formatCompact(p.mc)}</td>
                <td class="r num">${this.fmt('pe', p.pe)}</td><td class="r num">${this.fmt('pb', p.pb)}</td><td class="r num">${this.fmt('dy', p.dy)}</td></tr>`,
            )}</tbody></table></div>`
        : ''}`;
  }
  protected override foot(d: Valuation) {
    return `${d.sec ?? ''}${d.sec ? ' · ' : ''}${d.as}`;
  }
}
define('cap-valuation', CapValuation);
declare global {
  interface HTMLElementTagNameMap {
    'cap-valuation': CapValuation;
  }
}
