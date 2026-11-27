import { analytics } from '@capitalist-charts/core/analytics';
import { css, html } from 'lit';
import { } from '@capitalist-charts/core';
import type { Profile } from '@capitalist-charts/schema/analytics';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';
import { SymbolView } from './symbol-view.js';

useExtraStrings();

/**
 * `<cap-shariah symbol="PSX:MEBL">`: Shariah status as a text badge (never a religious symbol).
 * `shape="inline"` renders a badge for running text; the default is a small card with the source.
 */
export class CapShariah extends SymbolView<Profile> {
  static override properties = { ...SymbolView.properties, shape: { type: String, reflect: true } };
  static override styles = [
    ...SymbolView.styles,
    css`
      :host([shape='inline']) { display: inline-block; contain: none; vertical-align: baseline; min-width: 22ch; font-size: inherit; line-height: inherit; font-variant-numeric: tabular-nums; }
      :host([shape='inline']) a { color: inherit; text-decoration: none; }
      .badge { display: inline-flex; align-items: center; gap: 4px; min-width: 7em; justify-content: center; border-radius: 99px; padding: 0 9px; font-size: 0.78rem; line-height: 1; box-shadow: inset 0 0 0 1px var(--_border); white-space: nowrap; }
      .ok { color: var(--_up); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--_up) 45%, transparent); }
    `,
  ];
  shape: 'card' | 'inline' = 'card';
  protected readonly titleKey = 'shariah' as const;
  protected override rows = 2;
  protected resourceFor(m: string, s: string) {
    return analytics.profile(m, s);
  }
  private badge(p: Profile) {
    if (!p.shariah) return html`<span class="badge">${this.s('shariah')}: ${this.s('unavailable')}</span>`;
    return html`<span class="badge ${p.shariah.ok ? 'ok' : ''}">${this.s(p.shariah.ok ? 'shariahOk' : 'shariahNo')}${p.shariah.ok ? ' ✓' : ''}</span>`;
  }
  protected body(p: Profile) {
    return html`<div>${this.badge(p)}</div>
      ${p.shariah?.src || p.shariah?.eff ? html`<span class="sub" style="white-space:normal">${p.shariah.src ? `${this.s('source')}: ${p.shariah.src}` : ''}${p.shariah.eff ? ` · ${this.s('since')} ${p.shariah.eff}` : ''}</span>` : ''}`;
  }
  override render() {
    if (this.shape !== 'inline') return super.render();
    const res = this.resource();
    const p = res ? this.val<Profile>(res)?.data : null;
    return p ? this.link(this.quotePath(p.m, p.s), this.badge(p), p.s) : html`<span class="badge" aria-busy="true"><span class="skel" style="display:inline-block;width:5em;height:1em"></span></span><slot hidden></slot>`;
  }
}
define('cap-shariah', CapShariah);
declare global {
  interface HTMLElementTagNameMap {
    'cap-shariah': CapShariah;
  }
}
