import { css, html, type PropertyDeclarations } from 'lit';
import { formatCompact, resources } from '@capitalist-charts/core';
import { MARKET_PATTERN } from '@capitalist-charts/schema/base';
import { type MarketMap } from '@capitalist-charts/schema/views';
import { CapElement, resourceSub, type Sub } from './base.js';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';

useExtraStrings();

export interface SectorRow {
  n: string;
  /** Market-cap-weighted change, percent. */
  cp: number | null;
  mc: number;
  up: number;
  down: number;
  count: number;
}

/** Sector rows from the market map: cap-weighted move, size, and how many names rose or fell. */
export function sectorRows(map: MarketMap): SectorRow[] {
  return map.sectors
    .map((s) => {
      let mc = 0;
      let w = 0;
      let up = 0;
      let down = 0;
      for (const i of s.items) {
        mc += i.mc;
        if (i.cp !== null) {
          // Weight by yesterday's cap, so today's move does not weight itself.
          const prev = i.mc / (1 + i.cp / 100);
          w += prev * i.cp;
          if (i.cp > 0) up += 1;
          else if (i.cp < 0) down += 1;
        }
      }
      const base = s.items.reduce((a, i) => a + (i.cp === null ? 0 : i.mc / (1 + i.cp / 100)), 0);
      return { n: s.n, cp: base > 0 ? w / base : null, mc, up, down, count: s.items.length };
    })
    .sort((a, b) => (b.cp ?? -Infinity) - (a.cp ?? -Infinity));
}

/** `<cap-sector-performance>`: every sector's move today (weighted by market cap) with its breadth. */
export class CapSectorPerformance extends CapElement {
  static override properties: PropertyDeclarations = { market: { type: String }, rows: { type: Number } };
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 300px; }
      .b { display: flex; height: 6px; width: 64px; border-radius: 99px; overflow: hidden; background: var(--_surface); margin-inline-start: auto; }
      .b span { height: 100%; }
    `,
  ];
  market = 'PSX';
  rows = 12;
  protected override subscriptions(): Sub[] {
    return MARKET_PATTERN.test(this.market) ? [resourceSub(resources.map(this.market))] : [];
  }
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    if (!MARKET_PATTERN.test(this.market)) return this.message(this.market, this.s('unavailable'));
    const u = this.val<MarketMap>(resources.map(this.market));
    if (!u?.data) return u?.failed || u?.notFound ? this.message(this.s('sectorPerf'), this.s('unavailable')) : this.skeleton(8, this.s('sectorPerf'));
    const rows = sectorRows(u.data).slice(0, Math.max(1, Math.min(40, this.rows || 12)));
    return this.frame(
      html`${this.s('sectorPerf')} <span class="sub">· ${this.market}</span>`,
      html`<table class="t">
        <thead><tr><th>${this.s('sector')}</th><th class="r">${this.s('change')}</th><th class="r">${this.s('mcap')}</th><th class="r">${this.s('breadth')}</th></tr></thead>
        <tbody>${rows.map((r) => html`<tr>
          <td style="white-space:normal">${r.n}</td>
          <td class="r">${this.change(r.cp)}</td>
          <td class="r num">${formatCompact(r.mc)}</td>
          <td class="r"><span class="b" role="img" aria-label=${`${r.up} ${this.s('advancers')}, ${r.down} ${this.s('decliners')}`}>
            <span style="width:${(r.up / Math.max(1, r.count)) * 100}%;background:var(--_up)"></span><span style="flex:1"></span><span style="width:${(r.down / Math.max(1, r.count)) * 100}%;background:var(--_down)"></span></span></td>
        </tr>`)}</tbody></table>`,
    );
  }
}
define('cap-sector-performance', CapSectorPerformance);
declare global {
  interface HTMLElementTagNameMap {
    'cap-sector-performance': CapSectorPerformance;
  }
}
