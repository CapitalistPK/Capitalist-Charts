import { analytics } from '@capitalist-charts/core/analytics';
import { css, html, type PropertyDeclarations } from 'lit';
import { formatCompact, formatNumber, formatPrice } from '@capitalist-charts/core';
import { MARKET_PATTERN } from '@capitalist-charts/schema/base';
import { SCREEN_PRESETS, type Screen, type ScreenPreset } from '@capitalist-charts/schema/analytics';
import { CapElement, resourceSub, type Sub } from './base.js';
import type { StringKey } from './i18n.js';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';

useExtraStrings();

/** `<cap-screener preset="momentum">`: the top names for a preset screen, refreshed hourly. */
export class CapScreener extends CapElement {
  static override properties: PropertyDeclarations = { market: { type: String }, preset: { type: String, reflect: true }, presets: { type: String } };
  static override styles = [...CapElement.styles, parts, css`:host { min-width: 320px; } .wrap { overflow-x: auto; }`];
  market = 'PSX';
  preset: ScreenPreset = 'momentum';
  /** Presets offered as tabs (comma-separated); empty = only `preset`. */
  presets = 'momentum,breakouts,unusual_volume,relative_strength';
  private safe(): ScreenPreset {
    return (SCREEN_PRESETS as readonly string[]).includes(this.preset) ? this.preset : 'momentum';
  }
  protected override subscriptions(): Sub[] {
    return MARKET_PATTERN.test(this.market) ? [resourceSub(analytics.screener(this.market, this.safe()))] : [];
  }
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    if (!MARKET_PATTERN.test(this.market)) return this.message(this.market, this.s('unavailable'));
    const preset = this.safe();
    const u = this.val<Screen>(analytics.screener(this.market, preset));
    const tabs = this.presets.split(',').map((p) => p.trim()).filter((p): p is ScreenPreset => (SCREEN_PRESETS as readonly string[]).includes(p));
    const tabBar = tabs.length > 1 ? this.tabs(tabs.map((k) => ({ key: k, label: this.s(k as StringKey) })), preset, (k) => {
      this.preset = k as ScreenPreset;
      this.emit('cap:select', { preset: k });
    }, this.s('screener')) : '';
    if (!u?.data) return u?.failed || u?.notFound ? this.message(this.s('screener'), this.s('unavailable')) : this.skeleton(8, this.s('screener'));
    return this.frame(
      html`${this.s('screener')} <span class="sub">· ${this.s(preset as StringKey)}</span>`,
      html`${tabBar}<div class="wrap"><table class="t">
        <thead><tr><th>${this.s('symbol')}</th><th class="r">${this.s('price')}</th><th class="r">${this.s('change')}</th><th class="r">${this.s('r1m')}</th><th class="r">${this.s('mcap')}</th><th class="r">${this.s('pe')}</th></tr></thead>
        <tbody>${u.data.rows.map((r) => html`<tr>
          <td>${this.link(this.quotePath(this.market, r.s), r.s, r.s)}<div class="sub">${r.sec ?? ''}</div></td>
          <td class="r num">${r.px === null ? '–' : formatPrice(r.px)}</td><td class="r">${this.change(r.cp)}</td>
          <td class="r num ${(r.r1m ?? 0) > 0 ? 'up' : (r.r1m ?? 0) < 0 ? 'down' : ''}">${r.r1m === null ? '–' : `${formatNumber(r.r1m, 1)}%`}</td>
          <td class="r num">${formatCompact(r.mc)}</td><td class="r num">${r.pe === null ? '–' : formatNumber(r.pe, 1)}</td></tr>`)}</tbody>
      </table></div>`,
    );
  }
}
define('cap-screener', CapScreener);
declare global {
  interface HTMLElementTagNameMap {
    'cap-screener': CapScreener;
  }
}
