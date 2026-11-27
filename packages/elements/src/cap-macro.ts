import { analytics } from '@capitalist-charts/core/analytics';
import { css, html, svg, type PropertyDeclarations } from 'lit';
import { formatNumber } from '@capitalist-charts/core';
import { areaPath, linear, linePath } from '@capitalist-charts/core/render';
import { MACRO_CODE_PATTERN, type Macro } from '@capitalist-charts/schema/analytics';
import { CapElement, resourceSub, type Sub } from './base.js';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';
import { SizeWatcher } from './size.js';

useExtraStrings();

/**
 * `<cap-macro code="PAK.CPI.YOY">`: one economic indicator: the latest value, its history and,
 * when the model has one, a forecast fan (the band is the 10th to 90th percentile).
 */
export class CapMacro extends CapElement {
  static override properties: PropertyDeclarations = { code: { type: String } };
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 280px; }
      .card { height: 100%; }
      .bd { flex: 1; min-height: 0; }
      .top { display: flex; align-items: baseline; gap: 8px; }
      .top b { font-size: 1.4rem; }
      .plot { flex: 1; min-height: 80px; }
    `,
  ];
  code = '';
  private readonly size = new SizeWatcher(() => this.requestUpdate());
  private res() {
    const c = this.code.trim().toUpperCase();
    return MACRO_CODE_PATTERN.test(c) ? analytics.macro(c) : null;
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
  private draw(m: Macro) {
    const W = this.size.w;
    const H = this.size.h;
    if (!W || !H || m.pts.length < 2) return '';
    const n = m.pts.length + m.fc.length;
    const x = (i: number) => (i / Math.max(1, n - 1)) * (W - 40);
    const vals = [...m.pts.map((p) => p[1]), ...m.fc.flatMap((f) => [f.v, f.lo ?? f.v, f.hi ?? f.v])];
    const y = linear(Math.min(...vals), Math.max(...vals), H - 4, 4);
    const hist = m.pts.map((p, i) => [x(i), y(p[1])] as const);
    const last = hist[hist.length - 1]!;
    const fcLine = [last, ...m.fc.map((f, i) => [x(m.pts.length + i), y(f.v)] as const)];
    const band = m.fc.length
      ? `M${last[0]} ${last[1]}${m.fc.map((f, i) => `L${x(m.pts.length + i)} ${y(f.hi ?? f.v)}`).join('')}${[...m.fc].reverse().map((f, i) => `L${x(m.pts.length + m.fc.length - 1 - i)} ${y(f.lo ?? f.v)}`).join('')}Z`
      : '';
    return html`<svg class="chart" width=${W} height=${H} aria-hidden="true">
      <path d=${areaPath(hist, H)} fill="color-mix(in srgb, var(--_accent) 12%, transparent)"></path>
      <path d=${linePath(hist)} fill="none" stroke="var(--_accent)" stroke-width="1.6"></path>
      ${band ? svg`<path d=${band} fill="color-mix(in srgb, var(--_warn) 18%, transparent)"></path><path d=${linePath(fcLine)} fill="none" stroke="var(--_warn)" stroke-width="1.4" stroke-dasharray="4 3"></path>` : ''}
      ${y.max > 0 && y.min < 0 ? svg`<line class="grid" x1="0" x2=${W - 40} y1=${y(0)} y2=${y(0)}></line>` : ''}
      <text class="axis" x=${W - 2} y=${y(y.max) + 10} text-anchor="end">${formatNumber(y.max, m.dec)}</text>
      <text class="axis" x=${W - 2} y=${y(y.min) - 2} text-anchor="end">${formatNumber(y.min, m.dec)}</text>
    </svg>`;
  }
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const r = this.res();
    if (!r) return this.message(this.s('macro'), this.s('notFound'));
    const u = this.val<Macro>(r);
    if (u?.notFound) return this.message(this.s('macro'), this.s('notFound'));
    if (!u?.data) return u?.failed ? this.message(this.s('macro'), this.s('unavailable')) : this.skeleton(5, this.s('macro'));
    const m = u.data;
    const last = m.pts[m.pts.length - 1];
    const prev = m.pts[m.pts.length - 2];
    const delta = last && prev ? last[1] - prev[1] : null;
    const good = delta === null || delta === 0 || m.good === null ? 'flat' : (delta > 0) === (m.good === 'up') ? 'up' : 'down';
    const unit = m.u === 'percent' ? '%' : ` ${m.u}`;
    return this.frame(
      html`${m.n}`,
      html`<div class="top"><b class="num">${last ? `${formatNumber(last[1], m.dec)}${unit}` : '–'}</b>
          ${delta !== null ? html`<span class="num ${good}">${delta > 0 ? '+' : delta < 0 ? '−' : ''}${formatNumber(Math.abs(delta), m.dec)}</span>` : ''}
          <span class="sub">${last ? last[0] : ''}</span></div>
        <div class="plot">${this.draw(m)}</div>
        ${m.fc.length ? html`<span class="sub">${this.s('forecast')}: <span class="num">${formatNumber(m.fc[m.fc.length - 1]!.v, m.dec)}${unit}</span> (${m.fc[m.fc.length - 1]!.d})</span>` : ''}`,
      { foot: m.src ?? '' },
    );
  }
}
define('cap-macro', CapMacro);
declare global {
  interface HTMLElementTagNameMap {
    'cap-macro': CapMacro;
  }
}
