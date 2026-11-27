import { css, html, nothing, type PropertyDeclarations, type PropertyValues } from 'lit';
import { formatAge, formatChange, formatClock, formatCompact, formatPrice, quoteState, type QuoteUpdate } from '@capitalist-charts/core';
import { parseSymbolRef } from '@capitalist-charts/schema/base';
import { CapElement } from './base.js';
import { define, getRuntime } from './runtime.js';

/**
 * `<cap-quote symbol="PSX:OGDC">`: one symbol's live price card.
 *
 * Events: `cap:ready` (first data), `cap:update` (every change), `cap:error` (unknown symbol or
 * failed request), `cap:link` (cancellable, before opening capitalist.pk).
 * Light-DOM children (e.g. a plain link) stay in the page for search engines and no-JS readers.
 */
export class CapQuote extends CapElement {
  static override properties: PropertyDeclarations = { symbol: { type: String } };
  static override styles = [
    ...CapElement.styles,
    css`
      :host { min-width: 220px; }
      .px { font-size: 1.7rem; font-weight: 600; line-height: 1.1; letter-spacing: -0.01em; border-radius: 4px; }
      .row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
      .kv { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 0.74rem; color: var(--_muted); }
      .kv b { color: var(--_text); font-weight: 500; }
    `,
  ];

  symbol = 'PSX:KSE100';
  private data: QuoteUpdate | null = null;
  private unsubscribe: (() => void) | null = null;
  private ready = false;
  private flash: 'up' | 'down' | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.blockedReason) this.listen();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopData();
  }

  protected override startData(): void {
    this.listen();
  }

  protected override stopData(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has('symbol') && changed.get('symbol') !== undefined && !this.blockedReason) this.listen();
  }

  private listen(): void {
    this.unsubscribe?.();
    this.data = null;
    this.ready = false;
    const ref = parseSymbolRef(this.symbol);
    if (!ref) {
      this.data = { market: 'PSX', symbol: this.symbol, quote: null, status: null, notFound: true, failed: false };
      this.requestUpdate();
      return;
    }
    this.unsubscribe = getRuntime().poller.subscribe(ref.market, ref.symbol, (u) => this.onData(u));
  }

  private onData(u: QuoteUpdate): void {
    const prev = this.data?.quote?.p;
    this.flash = prev !== undefined && u.quote && u.quote.p !== prev ? (u.quote.p > prev ? 'up' : 'down') : null;
    this.data = u;
    const detail = { symbol: `${u.market}:${u.symbol}`, quote: u.quote, notFound: u.notFound };
    if (u.notFound || (u.failed && !u.quote)) this.dispatchEvent(new CustomEvent('cap:error', { detail, bubbles: true, composed: true }));
    else if (!this.ready) {
      this.ready = true;
      this.dispatchEvent(new CustomEvent('cap:ready', { detail, bubbles: true, composed: true }));
    } else this.dispatchEvent(new CustomEvent('cap:update', { detail, bubbles: true, composed: true }));
    this.requestUpdate();
  }

  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const u = this.data;
    const nowSec = Math.floor(Date.now() / 1000);
    const state = quoteState(u?.quote, u?.status, nowSec, { notFound: u?.notFound ?? false, failed: u?.failed ?? false });
    const ref = parseSymbolRef(this.symbol);
    const symbol = ref?.symbol ?? this.symbol;

    if (state === 'loading') {
      return html`<div class="card" aria-busy="true">
        <div class="hd"><span class="logo skel"></span><div style="flex:1"><div class="skel" style="height:12px;width:60%"></div></div></div>
        <div class="bd"><div class="skel" style="height:30px;width:55%"></div><div class="skel" style="height:12px;width:40%"></div></div>
        <div class="ft"><span class="skel" style="height:9px;width:90px"></span></div>
        <slot hidden></slot>
      </div>`;
    }
    if (state === 'unknown-symbol') {
      return html`<div class="card"><div class="hd">${this.icon('search')}<div class="title">${symbol}</div></div>
        <div class="bd"><span>${this.s('notFound')}</span>
        <a class="attr" style="color:var(--_accent)" href=${this.siteHref(`/search?q=${encodeURIComponent(symbol)}`)} target="_blank" rel="noopener" @click=${(e: MouseEvent) => this.onLink(e, symbol)}>${this.s('search')} ${this.icon('chevron')}</a></div>
        <div class="ft">${this.attribution()}</div></div>`;
    }
    if (state === 'unavailable' || !u?.quote) {
      return html`<div class="card"><div class="hd">${this.monogram(symbol)}<div class="title">${symbol}</div>${this.statusPill('unavailable')}</div>
        <div class="bd"><span class="sub">${this.s('unavailable')}</span></div>
        <div class="ft">${this.attribution()}</div></div>`;
    }
    const q = u.quote;
    const statusLabel =
      state === 'live' ? `${this.s('live')} · ${formatClock(q.t)}` : state === 'closed' ? `${this.s('closed')}` : state === 'stale' ? `${this.s('updated')} ${formatAge(q.t, nowSec)}` : undefined;
    const pricePath = this.quotePath(q.m, q.s);
    const digits = 2;
    return html`<div class="card" part="card">
      <div class="hd" part="header">
        ${this.monogram(q.s)}
        <div style="min-width:0">
          <div class="title"><a href=${this.siteHref(pricePath)} target="_blank" rel="noopener" style="color:inherit;text-decoration:none" @click=${(e: MouseEvent) => this.onLink(e, q.s)}>${q.s}</a> <span class="sub">· ${q.m}</span></div>
          <div class="sub">${q.n}</div>
        </div>
        ${this.statusPill(state, statusLabel)}
      </div>
      <div class="bd" part="body">
        <div class="row"><span class="px ${this.flash ? `flash-${this.flash}` : ''}" aria-live="off">${formatPrice(q.p, digits)}</span>${q.k === 'index' ? nothing : html`<span class="sub">PKR</span>`}</div>
        <div class="row" style="font-size:.86rem"><span class="num ${q.c === null ? 'flat' : q.c > 0 ? 'up' : q.c < 0 ? 'down' : 'flat'}">${formatChange(q.c)}</span>${this.change(q.cp)}</div>
        <div class="kv"><span>${this.s('vol')} <b class="num">${formatCompact(q.vol)}</b></span></div>
        <span class="sr">${q.n} ${formatPrice(q.p)} ${formatChange(q.c)} (${q.cp ?? ''}%)</span>
      </div>
      <div class="ft" part="footer">${this.attribution()}<span class="num">${state === 'live' ? formatAge(q.t, nowSec) : ''}</span></div>
    </div>`;
  }
}

define('cap-quote', CapQuote);

declare global {
  interface HTMLElementTagNameMap {
    'cap-quote': CapQuote;
  }
}
