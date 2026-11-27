import { analytics } from '@capitalist-charts/core/analytics';
import { css, html, type PropertyDeclarations } from 'lit';
import { formatCompact, formatPercent } from '@capitalist-charts/core';
import { CATEGORY_PATTERN, LEADER_PERIODS, type FundLeaders, type LeaderPeriod } from '@capitalist-charts/schema/analytics';
import { CapElement, resourceSub, type Sub } from './base.js';
import { useExtraStrings } from './i18n-extra.js';
import { parts } from './parts.js';
import { define } from './runtime.js';

useExtraStrings();

/** `<cap-fund-leaderboard category="equity" period="1Y">`: the best funds in a category by annualised return. */
export class CapFundLeaderboard extends CapElement {
  static override properties: PropertyDeclarations = { category: { type: String }, period: { type: String, reflect: true }, rows: { type: Number } };
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 280px; }
      ol { margin: 0; padding: 0; list-style: none; counter-reset: r; }
      li { height: 44px; box-sizing: border-box; display: grid; grid-template-columns: 22px minmax(0, 1fr) auto; gap: 8px; align-items: center; padding: 4px 0; border-bottom: 1px solid var(--_border); font-size: 0.8rem; counter-increment: r; overflow: hidden; }
      li:last-child { border-bottom: 0; }
      li::before { content: counter(r); color: var(--_faint); font-size: 0.72rem; text-align: center; }
      li a { color: inherit; text-decoration: none; font-weight: 600; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .end { text-align: end; }
    `,
  ];
  category = 'equity';
  period: LeaderPeriod = '1Y';
  rows = 10;
  private res() {
    const c = this.category.trim().toLowerCase();
    const p = (LEADER_PERIODS as readonly string[]).includes(this.period) ? this.period : '1Y';
    return CATEGORY_PATTERN.test(c) ? analytics.leaders(c, p) : null;
  }
  protected override subscriptions(): Sub[] {
    const r = this.res();
    return r ? [resourceSub(r)] : [];
  }
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const r = this.res();
    if (!r) return this.message(this.s('leaders'), this.s('notFound'));
    const u = this.val<FundLeaders>(r);
    if (u?.notFound) return this.message(this.s('leaders'), this.s('notFound'));
    if (!u?.data) return u?.failed ? this.message(this.s('leaders'), this.s('unavailable')) : this.skeleton(8, this.s('leaders'));
    const d = u.data;
    return this.frame(
      html`${this.s('leaders')} <span class="sub">· ${d.label}</span>`,
      html`${this.tabs(LEADER_PERIODS.map((k) => ({ key: k, label: k })), d.p, (k) => {
          this.period = k as LeaderPeriod;
          this.emit('cap:select', { period: k });
        }, this.s('period'))}
        <ol>${d.rows.slice(0, Math.max(1, Math.min(20, this.rows || 10))).map((f) => html`<li>
          <span style="min-width:0;overflow:hidden"><span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title=${f.n}>${this.link(`/funds/${f.slug}`, f.n)}</span><span class="sub" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.amc ?? ''}${f.sh ? ` · ${this.s('shariah')} ✓` : ''}</span></span>
          <span class="end"><span class="num ${f.r >= 0 ? 'up' : 'down'}">${formatPercent(f.r, 1)}</span><div class="sub num">${f.aum === null ? '' : `PKR ${formatCompact(f.aum)}`}</div></span></li>`)}</ol>`,
      { foot: `${d.p} ${this.s('annualised')}` },
    );
  }
}
define('cap-fund-leaderboard', CapFundLeaderboard);
declare global {
  interface HTMLElementTagNameMap {
    'cap-fund-leaderboard': CapFundLeaderboard;
  }
}
