import { css, html, type PropertyDeclarations } from 'lit';
import { formatFlow, resources } from '@capitalist-charts/core';
import { FLOW_PERIODS, type FlowPeriod, type Flows } from '@capitalist-charts/schema/views';
import { CapElement, resourceSub, type Sub } from './base.js';
import { define } from './runtime.js';
import { parts } from './parts.js';

const money = formatFlow;

/**
 * `<cap-fipi-lipi period="1D">`: net buying and selling by foreign and local investor types, and
 * the sectors foreigners bought and sold. Foreign and local nets mirror each other, so each group
 * is drawn on its own scale side by side instead of being added up.
 */
export class CapFipiLipi extends CapElement {
  static override properties: PropertyDeclarations = { period: { type: String, reflect: true } };
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 300px; }
      .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
      h3 { margin: 0 0 4px; font-size: 0.74rem; font-weight: 600; color: var(--_muted); text-transform: uppercase; letter-spacing: 0.03em; }
      .row { display: grid; grid-template-columns: minmax(118px, 1.4fr) 1.5fr 62px; gap: 6px; align-items: center; font-size: 0.76rem; padding: 3px 0; }
      .lbl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .track { position: relative; height: 10px; }
      .track::before { content: ''; position: absolute; inset-inline-start: 50%; top: -2px; bottom: -2px; border-inline-start: 1px solid var(--_border); }
      .bar { position: absolute; top: 0; height: 100%; border-radius: 2px; }
      .val { text-align: end; }
    `,
  ];

  period: FlowPeriod = '1D';

  private safe(): FlowPeriod {
    return (FLOW_PERIODS as readonly string[]).includes(this.period) ? this.period : '1D';
  }
  protected override subscriptions(): Sub[] {
    return [resourceSub(resources.flows('PSX', this.safe()))];
  }

  private bars(rows: Array<{ n: string; net: number }>, unit: string) {
    const max = Math.max(1, ...rows.map((r) => Math.abs(r.net)));
    return rows.map((r) => {
      const w = (Math.abs(r.net) / max) * 50;
      const side = r.net >= 0 ? `inset-inline-start:50%` : `inset-inline-end:50%`;
      return html`<div class="row" role="listitem">
        <span class="lbl" title=${r.n}>${r.n}</span>
        <span class="track" aria-hidden="true"><span class="bar" style="${side};width:${w}%;background:${r.net >= 0 ? 'var(--_up)' : 'var(--_down)'}"></span></span>
        <span class="val num ${r.net >= 0 ? 'up' : 'down'}">${money(r.net, unit)}</span>
      </div>`;
    });
  }

  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const period = this.safe();
    const u = this.val<Flows>(resources.flows('PSX', period));
    if (!u?.data) return u?.notFound || u?.failed ? this.message(this.s('flows'), this.s('unavailable')) : this.skeleton(8, this.s('flows'));
    const f = u.data;
    const foreign = f.types.filter((t) => t.g === 'foreign');
    const local = f.types.filter((t) => t.g === 'local');
    const range = f.from === f.to ? f.to : `${f.from} – ${f.to}`;
    return this.frame(
      html`${this.s('flows')} <span class="sub">· ${f.m}</span>`,
      html`${this.tabs(FLOW_PERIODS.map((k) => ({ key: k, label: k })), period, (k) => {
          this.period = k as FlowPeriod;
          this.emit('cap:select', { period: k });
        }, this.s('range'))}
        <div class="cols">
          <div><h3>${this.s('foreign')}</h3><div role="list">${this.bars(foreign, f.unit)}</div></div>
          <div><h3>${this.s('local')}</h3><div role="list">${this.bars(local, f.unit)}</div></div>
          ${f.sectors.length ? html`<div><h3>${this.s('sectors')}</h3><div role="list">${this.bars(f.sectors.slice(0, 8), f.unit)}</div></div>` : ''}
        </div>`,
      { foot: html`<span class="num">${range}</span>` },
    );
  }
}

define('cap-fipi-lipi', CapFipiLipi);

declare global {
  interface HTMLElementTagNameMap {
    'cap-fipi-lipi': CapFipiLipi;
  }
}
