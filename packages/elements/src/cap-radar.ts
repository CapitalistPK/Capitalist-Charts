import { analytics } from '@capitalist-charts/core/analytics';
import { css, html } from 'lit';
import { formatNumber, formatPrice } from '@capitalist-charts/core';
import type { Radar } from '@capitalist-charts/schema/analytics';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';
import { SymbolView } from './symbol-view.js';

useExtraStrings();

/**
 * `<cap-radar symbol="PSX:OGDC">`: the Capitalist Radar read with its drivers and, always shown,
 * what the read lacks. Transparency is the point: every input is visible.
 */
export class CapRadar extends SymbolView<Radar> {
  static override styles = [
    ...SymbolView.styles,
    css`
      :host { min-width: 280px; }
      .read { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
      .read b { font-size: 1.25rem; text-transform: capitalize; }
      .drv { display: grid; grid-template-columns: minmax(90px, 1fr) 2fr 42px; gap: 6px; align-items: center; font-size: 0.76rem; }
      .track { position: relative; height: 8px; border-radius: 99px; background: var(--_surface); }
      .track::after { content: ''; position: absolute; inset-block: -2px; inset-inline-start: 50%; width: 1px; background: var(--_border); }
      .track span { position: absolute; inset-block: 0; border-radius: 99px; }
      .drv .num { text-align: end; }
      ul { margin: 0; padding-inline-start: 16px; font-size: 0.72rem; color: var(--_muted); }
      h3 { margin: 4px 0 0; font-size: 0.7rem; color: var(--_faint); font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
    `,
  ];
  protected readonly titleKey = 'radar' as const;
  protected override rows = 6;
  protected resourceFor(m: string, s: string) {
    return analytics.radar(m, s);
  }
  protected body(r: Radar) {
    const tone = /attract|accum|buy|bull/i.test(r.d) ? 'up' : /risk|avoid|reduce|sell|bear/i.test(r.d) ? 'down' : 'flat';
    // Scores are unbounded; scale to the largest so the bars compare layers within this read.
    const max = Math.max(0.5, ...r.drv.map((d) => Math.abs(d.sc ?? 0)));
    return html`<div class="read"><b class=${tone}>${r.d}</b>${r.hz ? html`<span class="sub">${r.hz}</span>` : ''}
        ${r.cf !== null ? html`<span class="sub">${this.s('confidence')} <span class="num">${formatNumber(r.cf * 100, 0)}%</span></span>` : ''}</div>
      ${r.lo !== null && r.hi !== null ? html`<span class="sub">${this.s('expectedRange')} <span class="num">${formatPrice(r.lo)} – ${formatPrice(r.hi)}</span></span>` : ''}
      <h3>${this.s('drivers')}</h3>
      ${r.drv.map((d) => {
        const sc = d.sc ?? 0;
        const w = (Math.abs(sc) / max) * 50;
        const label = d.sc === null ? '–' : `${sc > 0 ? '+' : sc < 0 ? '−' : ''}${formatNumber(Math.abs(sc), 2)}`;
        return html`<div class="drv"><span dir="auto">${d.l}</span>
          <span class="track" role="img" aria-label=${`${d.l}: ${label}`}><span style="inset-inline-start:${sc >= 0 ? 50 : 50 - w}%;width:${w}%;background:${d.dir === 'up' ? 'var(--_up)' : d.dir === 'down' ? 'var(--_down)' : 'var(--_flat)'}"></span></span>
          <span class="num sub">${label}</span></div>`;
      })}
      ${r.warn.length ? html`<h3>${this.s('whatsMissing')}</h3><ul>${r.warn.map((w) => html`<li dir="auto">${w}</li>`)}</ul>` : ''}`;
  }
  protected override foot(r: Radar) {
    return r.as;
  }
}
define('cap-radar', CapRadar);
declare global {
  interface HTMLElementTagNameMap {
    'cap-radar': CapRadar;
  }
}
