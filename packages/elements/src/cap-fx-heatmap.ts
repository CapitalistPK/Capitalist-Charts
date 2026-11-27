import { css, html } from 'lit';
import { formatNumber, formatPercent, resources } from '@capitalist-charts/core';
import { moveIntensity } from '@capitalist-charts/core/render';
import type { FxRates } from '@capitalist-charts/schema/views';
import { CapElement, resourceSub, type Sub } from './base.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';

useExtraStrings();

/** `<cap-fx-heatmap>`: the rupee against major currencies today, as tiles coloured by the day's move. */
export class CapFxHeatmap extends CapElement {
  static override styles = [
    ...CapElement.styles,
    css`
      :host { min-width: 260px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 6px; }
      .tile { border-radius: 8px; padding: 8px; display: flex; flex-direction: column; gap: 2px; font-size: 0.74rem; }
      .tile b { font-size: 0.86rem; }
    `,
  ];
  protected override subscriptions(): Sub[] {
    return [resourceSub(resources.fx('PKR'))];
  }
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const u = this.val<FxRates>(resources.fx('PKR'));
    if (!u?.data) return u?.failed || u?.notFound ? this.message(this.s('fxHeat'), this.s('unavailable')) : this.skeleton(4, this.s('fxHeat'));
    const fx = u.data;
    return this.frame(
      html`${this.s('fxHeat')} <span class="sub">· ${this.s('perPkr')}</span>`,
      html`<div class="grid">${fx.rates.slice(0, 16).map((r) => {
        const k = Math.round(moveIntensity(r.cp) * 60) + 8;
        const tone = r.cp === null || r.cp === 0 ? 'var(--_flat)' : r.cp > 0 ? 'var(--_down)' : 'var(--_up)';
        // Up means the currency got dearer in rupees: the rupee weakened, shown in the "down" colour.
        return html`<div class="tile" style="background:color-mix(in srgb, ${tone} ${k}%, var(--_surface))" title=${r.n}>
          <b>${r.c}</b><span class="num">${formatNumber(r.r, r.r >= 100 ? 2 : r.r >= 1 ? 3 : 4)}</span><span class="num">${formatPercent(r.cp)}</span></div>`;
      })}</div>`,
      { foot: new Date(fx.t * 1000).toLocaleString(this.locale === 'ur' ? 'ur-PK' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' }) },
    );
  }
}
define('cap-fx-heatmap', CapFxHeatmap);
declare global {
  interface HTMLElementTagNameMap {
    'cap-fx-heatmap': CapFxHeatmap;
  }
}
