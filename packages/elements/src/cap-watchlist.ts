import { css, html, type PropertyDeclarations } from 'lit';
import { formatChange, formatCompact, formatPrice, quoteState } from '@capitalist-charts/core';
import { parseSymbolRef, type QuoteSnapshot } from '@capitalist-charts/schema/base';
import { CapElement, quoteSub, type Sub } from './base.js';
import { parts } from './parts.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';

useExtraStrings();

const MAX = 30;

/** `<cap-watchlist symbols="PSX:OGDC,PSX:HBL,...">`: a live table of up to 30 symbols, sortable by any column. */
export class CapWatchlist extends CapElement {
  static override properties: PropertyDeclarations = { symbols: { type: String }, sort: { type: String } };
  static override styles = [...CapElement.styles, parts, css`:host { min-width: 300px; } th button { all: unset; cursor: pointer; } th button:focus-visible { outline: 2px solid var(--_accent); }`];
  symbols = 'PSX:KSE100,PSX:OGDC,PSX:HBL,PSX:LUCK,PSX:ENGRO';
  /** Column to sort by: `symbol`, `price`, `change` or `vol` (prefix `-` for descending). */
  sort = '';
  private refs() {
    const seen = new Set<string>();
    return this.symbols.split(',').map((s) => parseSymbolRef(s)).filter((r): r is { market: string; symbol: string } => !!r && !seen.has(`${r.market}:${r.symbol}`) && !!seen.add(`${r.market}:${r.symbol}`)).slice(0, MAX);
  }
  protected override subscriptions(): Sub[] {
    return this.refs().map((r) => quoteSub(r.market, r.symbol));
  }
  private th(key: string, label: string, right = true) {
    const active = this.sort.replace('-', '') === key;
    const desc = this.sort.startsWith('-');
    return html`<th class=${right ? 'r' : ''} aria-sort=${active ? (desc ? 'descending' : 'ascending') : 'none'}><button type="button" @click=${() => {
      this.sort = active && !desc ? `-${key}` : active ? '' : key;
      this.emit('cap:select', { sort: this.sort });
    }}>${label}${active ? (desc ? ' ↓' : ' ↑') : ''}</button></th>`;
  }
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const rows = this.refs().map((r) => ({ r, u: this.val<QuoteSnapshot>(quoteSub(r.market, r.symbol)) }));
    if (!rows.some((x) => x.u?.data)) return this.skeleton(Math.min(8, rows.length + 1), this.s('watchlist'));
    const key = this.sort.replace('-', '');
    const dir = this.sort.startsWith('-') ? -1 : 1;
    const val = (q: QuoteSnapshot | null | undefined) => (!q ? null : key === 'price' ? q.p : key === 'change' ? q.cp : key === 'vol' ? q.vol : null);
    if (key) rows.sort((a, b) => (key === 'symbol' ? a.r.symbol.localeCompare(b.r.symbol) : (val(a.u?.data) ?? -Infinity) - (val(b.u?.data) ?? -Infinity)) * dir);
    const status = rows.find((x) => x.u?.status)?.u?.status;
    const first = rows.find((x) => x.u?.data)!.u!.data!;
    return this.frame(
      this.s('watchlist'),
      html`<table class="t">
        <thead><tr>${this.th('symbol', this.s('symbol'), false)}${this.th('price', this.s('price'))}${this.th('change', this.s('change'))}${this.th('vol', this.s('vol'))}</tr></thead>
        <tbody>${rows.map(({ r, u }) => {
          const q = u?.data;
          return html`<tr>
            <td>${this.link(this.quotePath(r.market, r.symbol), q?.k === 'index' ? q.n : r.symbol, r.symbol)}${u?.notFound ? html` <span class="sub">${this.s('notFound')}</span>` : ''}</td>
            <td class="r num">${q ? formatPrice(q.p) : '–'}</td>
            <td class="r">${q ? html`<span class="num ${(q.c ?? 0) > 0 ? 'up' : (q.c ?? 0) < 0 ? 'down' : 'flat'}">${formatChange(q.c)}</span> ${this.change(q.cp)}` : ''}</td>
            <td class="r num">${q ? formatCompact(q.vol) : ''}</td></tr>`;
        })}</tbody></table>`,
      { pill: this.statusPill(quoteState(first, status, Math.floor(Date.now() / 1000))) },
    );
  }
}
define('cap-watchlist', CapWatchlist);
declare global {
  interface HTMLElementTagNameMap {
    'cap-watchlist': CapWatchlist;
  }
}
