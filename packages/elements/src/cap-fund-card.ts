import { css, html, type PropertyDeclarations } from 'lit';
import { formatCompact, formatPercent, formatPrice, resources } from '@capitalist-charts/core';
import { areaPath, linear, linePath } from '@capitalist-charts/core/render';
import { FUND_RETURN_PERIODS, FUND_SLUG_PATTERN, type FundCard } from '@capitalist-charts/schema/views';
import { CapElement, resourceSub, type Sub } from './base.js';
import { define } from './runtime.js';
import { parts } from './parts.js';
import { SizeWatcher } from './size.js';

let uid = 0;

/** `<cap-fund-card fund="meezan-islamic-fund">`: NAV, returns by period, a one-year NAV chart and the category rank. */
export class CapFundCard extends CapElement {
  static override properties: PropertyDeclarations = { fund: { type: String } };
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 280px; }
      .meta { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; font-size: 0.72rem; color: var(--_muted); }
      .badge { border: 1px solid var(--_border); border-radius: 99px; padding: 0 7px; }
      .badge.sh { color: var(--_up); border-color: color-mix(in srgb, var(--_up) 40%, transparent); }
      .nav { display: flex; align-items: baseline; gap: 8px; }
      .nav .px { font-size: 1.4rem; font-weight: 600; }
      .rets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
      .ret { background: var(--_surface); border-radius: 8px; padding: 5px 8px; font-size: 0.7rem; color: var(--_muted); }
      .ret b { display: block; font-size: 0.86rem; color: var(--_text); font-weight: 600; }
      .plot { height: 70px; }
    `,
  ];

  fund = '';
  private readonly size = new SizeWatcher(() => this.requestUpdate());
  private readonly gid = `cfc${++uid}`;

  private res() {
    const slug = this.fund.trim().toLowerCase();
    return FUND_SLUG_PATTERN.test(slug) ? resources.fund(slug) : null;
  }
  protected override subscriptions(): Sub[] {
    const r = this.res();
    return r ? [resourceSub(r)] : [];
  }
  override updated(): void {
    this.size.observe(this.renderRoot.querySelector('.plot'));
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.size.disconnect();
  }

  private spark(f: FundCard) {
    const W = this.size.w;
    const H = this.size.h;
    if (!W || f.spark.length < 2) return '';
    const vals = f.spark.map((p) => p[1]);
    const y = linear(Math.min(...vals), Math.max(...vals), H - 2, 2);
    const pts = f.spark.map((p, i) => [(i / (f.spark.length - 1)) * W, y(p[1])] as const);
    const up = vals[vals.length - 1]! >= vals[0]!;
    const c = up ? 'var(--_up)' : 'var(--_down)';
    return html`<svg class="chart" width=${W} height=${H} aria-hidden="true">
      <defs><linearGradient id=${this.gid} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color=${c} stop-opacity="0.2"></stop><stop offset="1" stop-color=${c} stop-opacity="0"></stop></linearGradient></defs>
      <path d=${areaPath(pts, H)} fill=${`url(#${this.gid})`}></path><path d=${linePath(pts)} fill="none" stroke=${c} stroke-width="1.5"></path></svg>`;
  }

  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const r = this.res();
    if (!r) return this.message(this.s('fund'), this.s('notFound'));
    const u = this.val<FundCard>(r);
    if (u?.notFound) return this.message(this.fund, this.s('notFound'));
    if (!u?.data) return u?.failed ? this.message(this.s('fund'), this.s('unavailable')) : this.skeleton(6, this.s('fund'));
    const f = u.data;
    // Most NAVs are published to 2 decimals, some to 4: show what was published.
    const navDigits = Math.abs(f.nav * 100 - Math.round(f.nav * 100)) < 1e-6 ? 2 : 4;
    const nd = new Date(`${f.navDate}T00:00:00Z`).toLocaleDateString(this.locale === 'ur' ? 'ur-PK' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    return this.frame(
      this.link(`/funds/${f.slug}`, f.n, undefined, 'rowlink'),
      html`<div class="meta"><span>${f.amc}</span><span class="badge">${f.cat}</span>${f.shariah ? html`<span class="badge sh">${this.s('shariah')} ✓</span>` : ''}</div>
        <div class="nav"><span class="sub">${this.s('nav')}</span><span class="px num">${formatPrice(f.nav, navDigits)}</span><span class="sub num">${nd}</span></div>
        <div class="rets">${FUND_RETURN_PERIODS.filter((k) => k in f.r).map((k) => {
          const v = f.r[k] ?? null;
          return html`<div class="ret">${k}<b class="num ${v === null ? 'flat' : v > 0 ? 'up' : v < 0 ? 'down' : 'flat'}">${v === null ? '–' : formatPercent(v)}</b></div>`;
        })}</div>
        <div class="plot">${this.spark(f)}</div>
        <div class="meta">${f.rank ? html`<span>${this.s('rank')} <b class="num">${f.rank.pos}</b> ${this.s('of')} <span class="num">${f.rank.of}</span> · 1Y</span>` : ''}
          ${f.aum !== null ? html`<span>${this.s('aum')} <span class="num">PKR ${formatCompact(f.aum)}</span></span>` : ''}</div>`,
      { foot: `${this.s('nav')} ${nd}` },
    );
  }
}

define('cap-fund-card', CapFundCard);

declare global {
  interface HTMLElementTagNameMap {
    'cap-fund-card': CapFundCard;
  }
}
