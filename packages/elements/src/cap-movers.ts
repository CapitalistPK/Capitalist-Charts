import { css, html, type PropertyDeclarations } from 'lit';
import { formatCompact, formatPrice, resources } from '@capitalist-charts/core';
import { MARKET_PATTERN } from '@capitalist-charts/schema/base';
import { type CompactQuote, type Movers } from '@capitalist-charts/schema/views';
import { CapElement, resourceSub, type Sub } from './base.js';
import { define } from './runtime.js';
import { parts } from './parts.js';

type Tab = 'gainers' | 'losers' | 'active';
const TABS: readonly Tab[] = ['gainers', 'losers', 'active'];

/** `<cap-movers market="PSX" tab="gainers">`: live top gainers, losers and most active shares. */
export class CapMovers extends CapElement {
  static override properties: PropertyDeclarations = { market: { type: String }, tab: { type: String, reflect: true }, rows: { type: Number } };
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 260px; }
      ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
      li { height: 38px; box-sizing: border-box; border-bottom: 1px solid var(--_border); overflow: hidden; }
      li:last-child { border-bottom: 0; }
      li a { height: 100%; padding: 4px 0; }
      .sym { font-weight: 600; font-size: 0.85rem; }
      .grow .sub { display: block; }
      .end { text-align: end; display: flex; flex-direction: column; align-items: flex-end; font-size: 0.82rem; }
    `,
  ];

  market = 'PSX';
  tab: Tab = 'gainers';
  rows = 10;

  private res() {
    return MARKET_PATTERN.test(this.market) ? resources.movers(this.market) : null;
  }
  protected override subscriptions(): Sub[] {
    const r = this.res();
    return r ? [resourceSub(r)] : [];
  }

  private row(q: CompactQuote, tab: Tab) {
    return html`<li title=${q.n}>${this.link(
      this.quotePath(this.market, q.s),
      html`${this.monogram(q.s)}<span class="grow"><span class="sym">${q.s}</span><br /><span class="sub">${q.n}</span></span>
        <span class="end"><span class="num">${formatPrice(q.p)}</span>${tab === 'active' ? html`<span class="sub num">${formatCompact(q.vol)}</span>` : this.change(q.cp)}</span>`,
      q.s,
      'rowlink',
    )}</li>`;
  }

  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const r = this.res();
    if (!r) return this.message(this.market, this.s('unavailable'));
    const u = this.val<Movers>(r);
    if (!u?.data) return u?.notFound || u?.failed ? this.message(this.s('movers'), this.s('unavailable')) : this.skeleton(8, this.s('movers'));
    const tab = TABS.includes(this.tab) ? this.tab : 'gainers';
    const list = u.data[tab].slice(0, Math.max(1, Math.min(10, this.rows || 10)));
    return this.frame(
      html`${this.s('movers')} <span class="sub">· ${this.market}</span>`,
      html`${this.tabs(TABS.map((k) => ({ key: k, label: this.s(k === 'active' ? 'active' : k) })), tab, (k) => {
          this.tab = k as Tab;
          this.emit('cap:select', { tab: k });
        }, this.s('movers'))}
        <ol>${list.map((q) => this.row(q, tab))}</ol>`,
    );
  }
}

define('cap-movers', CapMovers);

declare global {
  interface HTMLElementTagNameMap {
    'cap-movers': CapMovers;
  }
}
