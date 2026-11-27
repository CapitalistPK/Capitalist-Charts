import { analytics } from '@capitalist-charts/core/analytics';
import { css, html } from 'lit';
import { formatCompact, formatNumber } from '@capitalist-charts/core';
import type { Profile } from '@capitalist-charts/schema/analytics';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';
import { SymbolView } from './symbol-view.js';

useExtraStrings();

/** `<cap-company-profile symbol="PSX:LUCK">`: what the company does, its sector, shares, free float and Shariah status. */
export class CapCompanyProfile extends SymbolView<Profile> {
  static override styles = [
    ...SymbolView.styles,
    parts,
    css`
      :host { min-width: 280px; }
      .desc { font-size: 0.82rem; line-height: 1.5; color: var(--_muted); margin: 0; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }
      dl { display: grid; grid-template-columns: auto 1fr; gap: 5px 12px; margin: 0; font-size: 0.8rem; }
      dt { color: var(--_faint); } dd { margin: 0; text-align: end; }
    `,
  ];
  protected readonly titleKey = 'profile' as const;
  protected resourceFor(m: string, s: string) {
    return analytics.profile(m, s);
  }
  protected override head(symbol: string, market: string) {
    return html`${this.link(this.quotePath(market, symbol), symbol, symbol)} <span class="sub">· ${this.s('profile')}</span>`;
  }
  protected body(p: Profile) {
    const row = (k: Parameters<CapCompanyProfile['s']>[0], v: string | null) => (v ? html`<dt>${this.s(k)}</dt><dd class="num">${v}</dd>` : '');
    return html`<div class="title" style="white-space:normal">${p.n}</div>
      ${p.desc ? html`<p class="desc" dir="auto">${p.desc}</p>` : ''}
      <dl>
        ${row('sector', p.sec)}${p.ind && p.ind !== p.sec ? row('industry', p.ind) : ''}
        ${row('mcap', p.mc === null ? null : `PKR ${formatCompact(p.mc)}`)}
        ${row('listedShares', p.sh === null ? null : formatCompact(p.sh))}
        ${row('freeFloat', p.ffp === null ? (p.ff === null ? null : formatCompact(p.ff)) : `${formatNumber(p.ffp, 1)}%`)}
        ${row('faceValue', p.fv === null ? null : `Rs ${formatNumber(p.fv, 2)}`)}
        ${row('fiscalYear', p.fye)}
        ${p.shariah ? html`<dt>${this.s('shariah')}</dt><dd><span class=${p.shariah.ok ? 'up' : 'flat'}>${this.s(p.shariah.ok ? 'shariahOk' : 'shariahNo')}${p.shariah.ok ? ' ✓' : ''}</span></dd>` : ''}
      </dl>`;
  }
}
define('cap-company-profile', CapCompanyProfile);
declare global {
  interface HTMLElementTagNameMap {
    'cap-company-profile': CapCompanyProfile;
  }
}
