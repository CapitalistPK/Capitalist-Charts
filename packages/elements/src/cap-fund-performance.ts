import { css, html, type PropertyDeclarations } from 'lit';
import { formatPercent, formatPrice, resources } from '@capitalist-charts/core';
import { FUND_RETURN_PERIODS, FUND_SLUG_PATTERN, type FundCard } from '@capitalist-charts/schema/views';
import { CapElement, resourceSub, type Sub } from './base.js';
import { drawChart } from './chart.js';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';
import { SizeWatcher } from './size.js';

useExtraStrings();

let uid = 0;

/** `<cap-fund-performance fund="meezan-islamic-fund">`: returns by period as bars, and the NAV over a year. */
export class CapFundPerformance extends CapElement {
  static override properties: PropertyDeclarations = { fund: { type: String } };
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 300px; }
      .card { height: 100%; }
      .bd { flex: 1; min-height: 0; }
      .rets { direction: ltr; display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; align-items: end; height: 90px; position: relative; }
      .ret { display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; gap: 3px; font-size: 0.66rem; color: var(--_muted); }
      .ret i { display: block; width: 60%; border-radius: 3px 3px 0 0; min-height: 1px; }
      .plot { flex: 1; min-height: 80px; }
    `,
  ];
  fund = '';
  private readonly size = new SizeWatcher(() => this.requestUpdate());
  private readonly gid = `cfp${++uid}`;
  private slug() {
    const s = this.fund.trim().toLowerCase();
    return FUND_SLUG_PATTERN.test(s) ? s : null;
  }
  protected override subscriptions(): Sub[] {
    const s = this.slug();
    return s ? [resourceSub(resources.fund(s))] : [];
  }
  override updated(): void {
    this.size.observe(this.renderRoot.querySelector('.plot'));
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.size.disconnect();
  }
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const slug = this.slug();
    if (!slug) return this.message(this.s('fundPerf'), this.s('notFound'));
    const u = this.val<FundCard>(resources.fund(slug));
    if (u?.notFound) return this.message(this.s('fundPerf'), this.s('notFound'));
    if (!u?.data) return u?.failed ? this.message(this.s('fundPerf'), this.s('unavailable')) : this.skeleton(6, this.s('fundPerf'));
    const f = u.data;
    const vals = FUND_RETURN_PERIODS.map((k) => f.r[k] ?? null);
    const max = Math.max(1, ...vals.map((v) => Math.abs(v ?? 0)));
    const series = { v: 1 as const, s: 'NAV', m: 'MUFAP', r: '1Y' as const, i: '1d', pc: null, b: f.spark.map(([t, v]) => [t, v, v, v, v, null] as [number, number, number, number, number, null]) };
    return this.frame(
      this.link(`/funds/${f.slug}`, f.n, undefined, 'rowlink'),
      html`<span class="sub">${f.cat}${f.shariah ? ` · ${this.s('shariah')} ✓` : ''} · ${this.s('nav')} <span class="num">${formatPrice(f.nav, 2)}</span></span>
        <div class="rets" role="img" aria-label=${this.s('returns')}>
          ${FUND_RETURN_PERIODS.map((k, i) => {
            const v = vals[i] ?? null;
            return html`<div class="ret"><span class="num ${v === null ? '' : v >= 0 ? 'up' : 'down'}">${v === null ? '–' : formatPercent(v, 1)}</span>
              <i style="height:${((Math.abs(v ?? 0)) / max) * 55}%;background:${(v ?? 0) >= 0 ? 'var(--_up)' : 'var(--_down)'}"></i><span>${k}</span></div>`;
          })}
        </div>
        <div class="plot">${f.spark.length > 1 && this.size.w ? drawChart(series, { type: 'area', width: this.size.w, height: this.size.h, id: this.gid, axis: true }) : ''}</div>`,
      { foot: html`${f.rank ? `${this.s('rank')} ${f.rank.pos} ${this.s('of')} ${f.rank.of} · ` : ''}${this.s('nav')} ${f.navDate}` },
    );
  }
}
define('cap-fund-performance', CapFundPerformance);
declare global {
  interface HTMLElementTagNameMap {
    'cap-fund-performance': CapFundPerformance;
  }
}
