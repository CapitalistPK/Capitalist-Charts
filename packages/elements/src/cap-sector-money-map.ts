import { css, html } from 'lit';
import { formatFlow, resources } from '@capitalist-charts/core';
import { FLOW_PERIODS, type Flows } from '@capitalist-charts/schema/views';
import { CapElement, resourceSub, type Sub } from './base.js';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';

useExtraStrings();

/**
 * `<cap-sector-money-map>`: where foreign money went by sector over a day, a week and a month,
 * as a heat table. Each cell is the foreign net in dollars; colour strength is scaled per period.
 */
export class CapSectorMoneyMap extends CapElement {
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 320px; }
      td.cell { text-align: end; font-size: 0.74rem; border-radius: 4px; }
    `,
  ];
  protected override subscriptions(): Sub[] {
    return FLOW_PERIODS.map((p) => resourceSub(resources.flows('PSX', p)));
  }
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const data = FLOW_PERIODS.map((p) => this.val<Flows>(resources.flows('PSX', p)));
    if (!data.some((d) => d?.data)) return data.every((d) => d?.failed || d?.notFound) ? this.message(this.s('moneyMap'), this.s('unavailable')) : this.skeleton(8, this.s('moneyMap'));
    const sectors = new Map<string, Array<number | null>>();
    data.forEach((d, i) => d?.data?.sectors.forEach((s) => {
      const row = sectors.get(s.n) ?? [null, null, null];
      row[i] = s.net;
      sectors.set(s.n, row);
    }));
    const max = FLOW_PERIODS.map((_, i) => Math.max(1, ...[...sectors.values()].map((r) => Math.abs(r[i] ?? 0))));
    const rows = [...sectors.entries()].sort((a, b) => Math.abs(b[1][2] ?? b[1][1] ?? b[1][0] ?? 0) - Math.abs(a[1][2] ?? a[1][1] ?? a[1][0] ?? 0)).slice(0, 14);
    const unit = data.find((d) => d?.data)?.data?.unit ?? 'USD';
    const cell = (v: number | null, i: number) => {
      if (v === null) return html`<td class="cell sub">–</td>`;
      // Capped at 45%: the default up/down colours are dark in the light theme and light in the dark
      // theme, so a stronger tint would drop the cell text below 4.5:1 in one of them.
      const k = Math.round((Math.abs(v) / max[i]!) * 37) + 8;
      return html`<td class="cell num" data-value="true" title=${formatFlow(v, unit)} style="background:color-mix(in srgb, ${v >= 0 ? 'var(--_up)' : 'var(--_down)'} ${k}%, transparent)">${formatFlow(v, unit)}</td>`;
    };
    const to = data.find((d) => d?.data)?.data?.to ?? '';
    return this.frame(
      html`${this.s('moneyMap')} <span class="sub">· ${this.s('foreignNet')}</span>`,
      html`<table class="t">
        <thead><tr><th>${this.s('sector')}</th>${FLOW_PERIODS.map((p) => html`<th class="r">${p}</th>`)}</tr></thead>
        <tbody>${rows.map(([n, vals]) => html`<tr><td style="white-space:normal">${n}</td>${vals.map((v, i) => cell(v, i))}</tr>`)}</tbody></table>`,
      { foot: to },
    );
  }
}
define('cap-sector-money-map', CapSectorMoneyMap);
declare global {
  interface HTMLElementTagNameMap {
    'cap-sector-money-map': CapSectorMoneyMap;
  }
}
