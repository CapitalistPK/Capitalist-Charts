import { css, html, svg, type PropertyDeclarations } from 'lit';
import { formatCompact, formatPercent, formatPrice, resources } from '@capitalist-charts/core';
import { moveIntensity, treemap } from '@capitalist-charts/core/render';
import { MARKET_PATTERN } from '@capitalist-charts/schema/base';
import { type MarketMap, type MarketMapItem } from '@capitalist-charts/schema/views';
import { CapElement, resourceSub, type Sub } from './base.js';
import { define } from './runtime.js';
import { SizeWatcher } from './size.js';

const HEADER = 15;

/** Tile colour: flat grey shading to up/down colour with the size of the move (±5% = full). */
function tileFill(cp: number | null): string {
  const k = Math.round(moveIntensity(cp, 3) * 70) + 22;
  const tone = cp === null || cp === 0 ? 'var(--_flat)' : cp > 0 ? 'var(--_up)' : 'var(--_down)';
  return `color-mix(in srgb, ${tone} ${k}%, var(--_surface))`;
}

/**
 * `<cap-market-map market="PSX">`: every listed company as a tile sized by market cap and coloured
 * by today's move, grouped by sector. Tiles link to the company page; hover shows the details.
 */
export class CapMarketMap extends CapElement {
  static override properties: PropertyDeclarations = { market: { type: String }, sector: { type: String }, tip: { state: true } };
  static override styles = [
    ...CapElement.styles,
    css`
      :host { min-width: 300px; }
      .card { height: 100%; }
      .bd { flex: 1; min-height: 0; padding: 6px var(--_pad); }
      .plot { position: relative; width: 100%; height: 100%; min-height: 160px; }
      .plot > svg { display: block; position: absolute; inset: 0; direction: ltr; }
      .plot { overflow: hidden; }
      a text { pointer-events: none; }
      .sec { fill: var(--_muted); font-size: 10px; font-weight: 600; }
      .lbl { font-weight: 600; text-anchor: middle; }
      a:focus-visible rect { stroke: var(--_accent); stroke-width: 2; }
      .tip { position: absolute; pointer-events: none; background: var(--_bg); border: 1px solid var(--_border); border-radius: 8px; padding: 6px 8px; font-size: 0.75rem; box-shadow: 0 6px 18px rgb(0 0 0 / 0.14); z-index: 2; max-width: 220px; }
    `,
  ];

  market = 'PSX';
  sector = '';
  private tip: { x: number; y: number; item: MarketMapItem; sector: string } | null = null;
  private readonly size = new SizeWatcher(() => this.requestUpdate());

  private res() {
    return MARKET_PATTERN.test(this.market) ? resources.map(this.market) : null;
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

  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const r = this.res();
    if (!r) return this.message(this.market, this.s('unavailable'));
    const u = this.val<MarketMap>(r);
    if (!u?.data) return u?.notFound || u?.failed ? this.message(this.s('marketMap'), this.s('unavailable')) : this.skeleton(6, this.s('marketMap'));
    const wanted = this.sector.trim().toLowerCase();
    const sectors = u.data.sectors.filter((s) => !wanted || s.n.toLowerCase() === wanted);
    const W = this.size.w;
    const H = this.size.h;
    let tiles = svg``;
    if (W > 0 && H > 0) {
      const outer = treemap(sectors, (s) => s.items.reduce((a, i) => a + i.mc, 0), { x: 0, y: 0, w: W, h: H });
      tiles = svg`${outer.map((sec) => {
        const showHead = sec.h > 40 && sec.w > 50;
        const inner = treemap(sec.item.items, (i) => i.mc, { x: sec.x + 1, y: sec.y + (showHead ? HEADER : 1), w: sec.w - 2, h: sec.h - (showHead ? HEADER : 1) - 1 });
        return svg`<g>
          ${showHead ? svg`<text class="sec" x=${sec.x + 3} y=${sec.y + 11}>${sec.item.n.length * 6 > sec.w ? `${sec.item.n.slice(0, Math.max(2, Math.floor(sec.w / 6) - 1))}…` : sec.item.n}</text>` : ''}
          ${inner.map((t) => {
            const i = t.item;
            const fs = Math.max(8, Math.min(16, Math.sqrt(t.w * t.h) / 5));
            const fits = t.w > fs * i.s.length * 0.62 + 4 && t.h > fs * 1.2;
            const both = fits && t.h > fs * 2.6;
            return svg`<a href=${this.siteHref(this.quotePath(this.market, i.s))} target="_blank" rel="noopener" aria-label=${`${i.s} ${formatPercent(i.cp)}`}
                @click=${(e: MouseEvent) => this.onLink(e, i.s)}
                @pointermove=${(e: PointerEvent) => (this.tip = { x: e.offsetX, y: e.offsetY, item: i, sector: sec.item.n })}
                @pointerleave=${() => (this.tip = null)}>
              <rect x=${t.x + 0.5} y=${t.y + 0.5} width=${Math.max(0, t.w - 1)} height=${Math.max(0, t.h - 1)} rx="2" fill=${tileFill(i.cp)} opacity=${i.st ? 0.75 : 1}></rect>
              ${fits ? svg`<text class="lbl" fill=${moveIntensity(i.cp, 3) > 0.45 ? '#fff' : 'var(--_text)'} x=${t.x + t.w / 2} y=${t.y + t.h / 2 + (both ? -fs * 0.15 : fs * 0.35)} font-size=${fs}>${i.s}</text>` : ''}
              ${both ? svg`<text class="lbl" fill=${moveIntensity(i.cp, 3) > 0.45 ? '#fff' : 'var(--_text)'} x=${t.x + t.w / 2} y=${t.y + t.h / 2 + fs * 0.95} font-size=${fs * 0.75} font-weight="400">${formatPercent(i.cp)}</text>` : ''}
            </a>`;
          })}
        </g>`;
      })}`;
    }
    const tip = this.tip;
    return this.frame(
      html`${this.s('marketMap')} <span class="sub">· ${this.market}${wanted && sectors[0] ? ` · ${sectors[0].n}` : ''}</span>`,
      html`<div class="plot">
        ${W ? html`<svg width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="group" aria-label=${this.s('marketMap')}>${tiles}</svg>` : ''}
        ${tip
          ? html`<div class="tip" style="left:${Math.min(tip.x + 12, Math.max(0, W - 200))}px;top:${Math.min(tip.y + 12, Math.max(0, H - 80))}px">
              <b>${tip.item.s}</b> <span class="sub">${tip.item.n}</span><br />
              <span class="num">${formatPrice(tip.item.p)}</span> ${this.change(tip.item.cp)}<br />
              <span class="sub">${tip.sector} · ${this.s('mcap')} ${formatCompact(tip.item.mc)}</span>
            </div>`
          : ''}
      </div>`,
    );
  }
}

define('cap-market-map', CapMarketMap);

declare global {
  interface HTMLElementTagNameMap {
    'cap-market-map': CapMarketMap;
  }
}
