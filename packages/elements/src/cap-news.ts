import { analytics } from '@capitalist-charts/core/analytics';
import { css, html, type PropertyDeclarations } from 'lit';
import { formatAge } from '@capitalist-charts/core';
import { MARKET_PATTERN, parseSymbolRef } from '@capitalist-charts/schema/base';
import { type News } from '@capitalist-charts/schema/analytics';
import { CapElement, resourceSub, type Sub } from './base.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';

useExtraStrings();

/**
 * `<cap-news>` (market-wide) or `<cap-news symbol="PSX:LUCK">`: the latest stories with
 * Capitalist's summary. Stories open on capitalist.pk, where every source outlet is listed.
 */
export class CapNews extends CapElement {
  static override properties: PropertyDeclarations = { symbol: { type: String }, market: { type: String }, rows: { type: Number }, summaries: { type: String } };
  static override styles = [
    ...CapElement.styles,
    css`
      :host { min-width: 260px; }
      ol { margin: 0; padding: 0; list-style: none; }
      li { height: 78px; box-sizing: border-box; padding: 6px 0; border-bottom: 1px solid var(--_border); overflow: hidden; }
      li:last-child { border-bottom: 0; }
      li a { color: inherit; text-decoration: none; font-weight: 600; font-size: 0.86rem; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      li a:hover, li a:focus-visible { color: var(--_accent); }
      p { margin: 3px 0 0; font-size: 0.78rem; line-height: 1.35; color: var(--_muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .meta { font-size: 0.68rem; color: var(--_faint); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    `,
  ];
  symbol = '';
  market = 'PSX';
  rows = 6;
  /** `false` hides the summaries for a compact list. */
  summaries = 'true';
  private res() {
    if (this.symbol.trim()) {
      const r = parseSymbolRef(this.symbol);
      return r ? analytics.news(r.market, r.symbol) : null;
    }
    return MARKET_PATTERN.test(this.market) ? analytics.news(this.market) : null;
  }
  protected override subscriptions(): Sub[] {
    const r = this.res();
    return r ? [resourceSub(r)] : [];
  }
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const r = this.res();
    const title = html`${this.s('news')}${this.symbol.trim() ? html` <span class="sub">· ${this.symbol.toUpperCase()}</span>` : ''}`;
    if (!r) return this.message(title, this.s('notFound'));
    const u = this.val<News>(r);
    if (u?.notFound) return this.message(title, this.s('notFound'));
    if (!u?.data) return u?.failed ? this.message(title, this.s('unavailable')) : this.skeleton(6, this.s('news'));
    const now = Math.floor(Date.now() / 1000);
    const rows = u.data.rows.slice(0, Math.max(1, Math.min(20, this.rows || 6)));
    if (!rows.length) return this.message(title, this.s('noNews'));
    return this.frame(
      title,
      html`<ol>${rows.map((n) => html`<li>
        ${this.link(`/news/${n.slug}`, html`<span dir="auto">${n.t}</span>`)}
        ${this.summaries !== 'false' && n.sum ? html`<p dir="auto"><span class="sr">${this.s('summaryLabel')}: </span>${n.sum}</p>` : ''}
        <div class="meta">${formatAge(n.d, now)}${n.out ? ` · ${n.out}` : ''}${n.syms.length ? ` · ${n.syms.join(', ')}` : ''}</div>
      </li>`)}</ol>`,
    );
  }
}
define('cap-news', CapNews);
declare global {
  interface HTMLElementTagNameMap {
    'cap-news': CapNews;
  }
}
