import { css, html, type PropertyDeclarations } from 'lit';
import { formatNumber, resources } from '@capitalist-charts/core';
import { parseSymbolRef, type QuoteSnapshot } from '@capitalist-charts/schema/base';
import { type CompactQuote, type IndexList } from '@capitalist-charts/schema/views';
import { CapElement, quoteSub, resourceSub, type Sub } from './base.js';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';

useExtraStrings();

/**
 * Approximate index points each member added today: previous index level × weight × move.
 * Weights are as published (at the last rebalance or close), so the sum is close to, not exactly,
 * the index change; the widget labels them as approximate.
 */
export function contributions(list: CompactQuote[], indexPrevLevel: number): Array<{ q: CompactQuote; pts: number }> {
  return list
    .filter((q) => q.w !== undefined && q.cp !== null)
    .map((q) => ({ q, pts: (indexPrevLevel * (q.w! / 100) * q.cp!) / 100 }));
}

/** `<cap-index-contributors index="PSX:KSE100">`: the members lifting and dragging the index today, in approximate points. */
export class CapIndexContributors extends CapElement {
  static override properties: PropertyDeclarations = { index: { type: String }, rows: { type: Number } };
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 300px; }
      .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
      h3 { margin: 0 0 4px; font-size: 0.72rem; color: var(--_muted); font-weight: 600; }
      .row { display: grid; grid-template-columns: 56px 1fr 52px; gap: 6px; align-items: center; font-size: 0.78rem; padding: 3px 0; }
      .row a { color: inherit; font-weight: 600; text-decoration: none; }
      .bar { height: 8px; border-radius: 2px; }
    `,
  ];
  index = 'PSX:KSE100';
  rows = 6;
  private ref() {
    return parseSymbolRef(this.index);
  }
  protected override subscriptions(): Sub[] {
    const r = this.ref();
    if (!r) return [];
    try {
      return [resourceSub(resources.list(r.market, r.symbol)), quoteSub(r.market, r.symbol)];
    } catch {
      return [];
    }
  }
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const r = this.ref();
    if (!r) return this.message(this.s('contributors'), this.s('notFound'));
    const list = this.val<IndexList>(resources.list(r.market, r.symbol));
    const iq = this.val<QuoteSnapshot>(quoteSub(r.market, r.symbol));
    if (list?.notFound) return this.message(this.s('contributors'), this.s('notFound'));
    if (!list?.data || !iq?.data) return list?.failed ? this.message(this.s('contributors'), this.s('unavailable')) : this.skeleton(8, this.s('contributors'));
    const q = iq.data;
    const prev = q.c === null ? q.p : q.p - q.c;
    const all = contributions(list.data.items, prev).sort((a, b) => b.pts - a.pts);
    const n = Math.max(1, Math.min(15, this.rows || 6));
    const lift = all.filter((x) => x.pts > 0).slice(0, n);
    const drag = all.filter((x) => x.pts < 0).slice(-n).reverse();
    const max = Math.max(0.01, ...[...lift, ...drag].map((x) => Math.abs(x.pts)));
    const row = (x: { q: CompactQuote; pts: number }) => html`<div class="row">
      ${this.link(this.quotePath(r.market, x.q.s), x.q.s, x.q.s)}
      <span class="bar" style="width:${(Math.abs(x.pts) / max) * 100}%;background:${x.pts > 0 ? 'var(--_up)' : 'var(--_down)'}"></span>
      <span class="num ${x.pts > 0 ? 'up' : 'down'}" style="text-align:end">${x.pts > 0 ? '+' : '−'}${formatNumber(Math.abs(x.pts), 1)}</span></div>`;
    return this.frame(
      html`${this.s('contributors')} <span class="sub">· ${q.n}</span>`,
      html`<div class="row" style="grid-template-columns:auto auto;justify-content:space-between"><span class="sub">${this.s('pointsApprox')}</span>${this.change(q.cp)}</div>
        <div class="cols"><div><h3>${this.s('lifting')}</h3>${lift.map(row)}</div><div><h3>${this.s('dragging')}</h3>${drag.map(row)}</div></div>`,
    );
  }
}
define('cap-index-contributors', CapIndexContributors);
declare global {
  interface HTMLElementTagNameMap {
    'cap-index-contributors': CapIndexContributors;
  }
}
