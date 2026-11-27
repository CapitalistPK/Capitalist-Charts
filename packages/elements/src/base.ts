import { html, LitElement, svg, type PropertyDeclarations, type PropertyValues, type TemplateResult } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { direction, formatPercent, ICONS, type IconName, type Poller, type QuoteState, type Resource, type ResourceUpdate } from '@capitalist-charts/core';
import type { WidgetConfig } from '@capitalist-charts/schema/base';
import { loadLocale, t, type StringKey } from './i18n.js';
import { getRuntime, hostBlocked, onRuntimeReplaced } from './runtime.js';
import { base, tokens } from './styles.js';
import { RESERVED_HEIGHTS, isInlineWidget } from './reserve.js';

export const SITE = 'https://capitalist.pk';


/** One data subscription a widget holds. Keys identify the data, so equal keys share one request. */
export interface Sub {
  key: string;
  start(poller: Poller, on: (u: ResourceUpdate<unknown>) => void): () => void;
}

export const quoteSub = (market: string, symbol: string): Sub => ({
  key: `q:${market}:${symbol}`,
  start: (p, on) => p.subscribe(market, symbol, (u) => on({ data: u.quote, status: u.status, notFound: u.notFound, failed: u.failed })),
});

export const resourceSub = <T>(r: Resource<T>): Sub => ({
  key: `r:${r.path}`,
  start: (p, on) => p.subscribeResource(r, on as (u: ResourceUpdate<T>) => void),
});

export interface TabOption {
  key: string;
  label: string;
}

/** Detail of the cancellable `cap:link` event fired before a widget opens a capitalist.pk page. */
export interface CapLinkDetail {
  href: string;
  widget: string;
  symbol?: string;
}

/**
 * Shared behaviour of every Capitalist Charts widget: theme, palette, density and locale
 * attributes; the config switches (disabled widgets, blocked domains); the attribution link; and
 * the cancellable `cap:link` event hosts use to route clicks themselves.
 */
export abstract class CapElement extends LitElement {
  static override styles = [tokens, base];

  static override properties: PropertyDeclarations = {
    theme: { type: String, reflect: true },
    palette: { type: String, reflect: true },
    density: { type: String, reflect: true },
    locale: { type: String, reflect: true },
    blockedReason: { state: true },
  };

  theme: 'auto' | 'light' | 'dark' | 'transparent' = 'auto';
  palette: 'pk' | 'cvd' = 'pk';
  density: 'comfortable' | 'compact' = 'comfortable';
  locale: 'en' | 'ur' = 'en';
  protected blockedReason: 'blocked' | 'off' | null = null;
  private offConfig: (() => void) | null = null;
  /** Active subscriptions by key, and the latest update for each. */
  private readonly active = new Map<string, () => void>();
  protected readonly got = new Map<string, ResourceUpdate<unknown>>();
  private announced = false;

  private offReplaced: (() => void) | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.applyReservation();
    const rt = getRuntime();
    this.bindRuntime();
    rt.impression(this.localName);
    this.offReplaced = onRuntimeReplaced(() => {
      // The data source changed under us: release the old poller's subscriptions, take new ones.
      this.offConfig?.();
      this.stopData();
      this.blockedReason = null;
      this.bindRuntime();
      if (!this.blockedReason) this.startData();
    });
    if (!this.blockedReason) this.syncSubs();
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, old, value);
    if (name === 'shape' && old !== value && this.isConnected) this.applyReservation();
  }

  private applyReservation(): void {
    const inline = isInlineWidget(this.localName, this.getAttribute('shape'));
    this.toggleAttribute('data-cap-inline', inline);
    this.style.setProperty('--_reserved-height', `${RESERVED_HEIGHTS[this.localName] ?? 420}px`);
  }

  private bindRuntime(): void {
    const rt = getRuntime();
    this.applyConfig(rt.current());
    this.offConfig = rt.onConfig((config) => this.applyConfig(config));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.offConfig?.();
    this.offConfig = null;
    this.offReplaced?.();
    this.offReplaced = null;
    this.dropSubs();
  }

  /**
   * The data this widget needs, derived from its attributes. Re-evaluated before every render:
   * changed keys are subscribed and dropped keys released, so attribute changes just work.
   */
  protected subscriptions(): Sub[] {
    return [];
  }

  /** The latest update for a subscription or resource, if any has arrived. */
  protected val<T>(of: Sub | Resource<T>): ResourceUpdate<T> | undefined {
    const key = 'key' in of ? of.key : `r:${of.path}`;
    return this.got.get(key) as ResourceUpdate<T> | undefined;
  }

  private syncSubs(): void {
    let subs: Sub[];
    try {
      subs = this.subscriptions();
    } catch {
      subs = []; // an invalid attribute: the widget renders its own message
    }
    const want = new Map(subs.map((s) => [s.key, s]));
    for (const [key, stop] of this.active) {
      if (want.has(key)) continue;
      stop();
      this.active.delete(key);
      this.got.delete(key);
    }
    const poller = getRuntime().poller;
    for (const [key, sub] of want) {
      if (this.active.has(key)) continue;
      this.active.set(key, () => undefined);
      const stop = sub.start(poller, (u) => this.onSub(key, u));
      if (this.active.has(key)) this.active.set(key, stop);
      else stop();
    }
  }

  private dropSubs(): void {
    for (const stop of this.active.values()) stop();
    this.active.clear();
    this.got.clear();
    this.announced = false;
  }

  private onSub(key: string, u: ResourceUpdate<unknown>): void {
    if (!this.active.has(key)) return;
    this.got.set(key, u);
    const detail = { key, notFound: u.notFound, failed: u.failed };
    if (u.notFound || (u.failed && u.data === null)) this.emit('cap:error', detail);
    else if (!this.announced) {
      this.announced = true;
      this.emit('cap:ready', detail);
    } else this.emit('cap:update', detail);
    this.requestUpdate();
  }

  protected emit(name: string, detail: unknown): boolean {
    return this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable: name === 'cap:link' || name === 'cap:select' }));
  }

  /** Applies the operator switches. A blocked or disabled widget stops fetching until re-enabled. */
  protected applyConfig(config: WidgetConfig): void {
    const host = typeof location !== 'undefined' ? location.hostname : '';
    const next = hostBlocked(config, host) ? 'blocked' : config.disabled.includes(this.localName) ? 'off' : null;
    if (next === this.blockedReason) return;
    const wasActive = this.blockedReason === null;
    this.blockedReason = next;
    if (wasActive && next !== null) this.stopData();
    else if (!wasActive && next === null && this.isConnected) this.startData();
  }

  /** Called when the widget is re-enabled; widgets with their own subscriptions extend it. */
  protected startData(): void {
    this.syncSubs();
  }
  /** Called when the widget is switched off or blocked. */
  protected stopData(): void {
    this.dropSubs();
  }

  /** The capitalist.pk page for a symbol. PSX pages exist; other markets fall back to search. */
  protected quotePath(market: string, symbol: string): string {
    return market === 'PSX' ? `/psx/${symbol.toLowerCase()}` : `/search?q=${encodeURIComponent(`${market}:${symbol}`)}`;
  }

  override willUpdate(changed: PropertyValues): void {
    if (changed.has('locale')) {
      this.setAttribute('dir', this.locale === 'ur' ? 'rtl' : 'ltr');
      void loadLocale(this.locale)?.then(() => this.requestUpdate());
    }
    if (this.isConnected && !this.blockedReason) this.syncSubs();
  }

  /* ---------- Shared pieces of the widget anatomy ---------- */

  /** Header, body, footer. Every widget uses this so they look and behave alike. */
  protected frame(head: TemplateResult | string, body: TemplateResult, opts: { pill?: TemplateResult; foot?: TemplateResult | string; cls?: string; label?: string } = {}): TemplateResult {
    return html`<section class="card ${opts.cls ?? ''}" part="card" aria-label=${opts.label ?? (typeof head === 'string' ? head : this.localName)}>
      <div class="hd" part="header"><div class="title">${head}</div>${opts.pill ?? ''}</div>
      <div class="bd" part="body">${body}</div>
      <div class="ft" part="footer">${this.attribution()}<span class="num">${opts.foot ?? ''}</span></div>
    </section>`;
  }

  /** Placeholder rows matching the final layout, so nothing jumps when data arrives. */
  protected skeleton(rows = 4, head = ''): TemplateResult {
    return this.frame(
      head || html`<span class="skel" style="display:inline-block;height:12px;width:120px"></span>`,
      html`<div class="skel-body" aria-busy="true">${Array.from({ length: rows }, (_, i) => html`<div class="skel-row"><span class="skel" style="width:24px"></span><span class="skel" style="width:${90 - ((i * 17) % 40)}%"></span><span class="skel" style="width:46px"></span></div>`)}</div><slot hidden></slot>`,
    );
  }

  /** Empty or error state inside the normal frame. */
  protected message(head: TemplateResult | string, text: string): TemplateResult {
    return this.frame(head, html`<p class="sub" style="white-space:normal">${text}</p>`);
  }

  /** Accessible tab list (arrow keys move between tabs). */
  protected tabs(options: readonly TabOption[], current: string, select: (key: string) => void, label = ''): TemplateResult {
    const move = (e: KeyboardEvent) => {
      const i = options.findIndex((o) => o.key === current);
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const rtl = this.getAttribute('dir') === 'rtl' ? -1 : 1;
      const next = options[(i + d * rtl + options.length) % options.length]!;
      select(next.key);
      void this.updateComplete.then(() => (this.renderRoot.querySelector(`[data-tab="${next.key}"]`) as HTMLElement | null)?.focus());
    };
    return html`<div class="tabs" role="tablist" aria-label=${label} @keydown=${move}>
      ${options.map(
        (o) => html`<button type="button" role="tab" data-tab=${o.key} aria-selected=${String(o.key === current)} tabindex=${o.key === current ? 0 : -1} @click=${() => select(o.key)}>${o.label}</button>`,
      )}
    </div>`;
  }

  /** A link to a capitalist.pk page, with the cancellable `cap:link` event. */
  protected link(path: string, content: TemplateResult | string, symbol?: string, cls = ''): TemplateResult {
    return html`<a class=${cls} href=${this.siteHref(path)} target="_blank" rel="noopener" @click=${(e: MouseEvent) => this.onLink(e, symbol)}>${content}</a>`;
  }

  protected s(key: StringKey): string {
    return t(this.locale, key);
  }

  protected icon(name: IconName): TemplateResult {
    return html`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${unsafeSVG(ICONS[name])}</svg>`;
  }

  /** capitalist.pk link with UTM tags naming the widget and the embedding site. */
  protected siteHref(path: string): string {
    const url = new URL(path, SITE);
    url.searchParams.set('utm_source', 'widget');
    url.searchParams.set('utm_medium', this.localName);
    if (typeof location !== 'undefined' && location.hostname) url.searchParams.set('utm_campaign', location.hostname);
    return url.toString();
  }

  /** Click handler for every outbound link: fires `cap:link`; a host that cancels it keeps the click. */
  protected onLink(event: MouseEvent, symbol?: string): void {
    const a = (event.currentTarget as HTMLAnchorElement | null) ?? null;
    if (!a) return;
    const detail: CapLinkDetail = { href: a.href, widget: this.localName, ...(symbol ? { symbol } : {}) };
    const allowed = this.dispatchEvent(new CustomEvent<CapLinkDetail>('cap:link', { detail, bubbles: true, composed: true, cancelable: true }));
    if (!allowed) event.preventDefault();
  }

  protected attribution(): TemplateResult {
    return html`<a class="attr" href=${this.siteHref('/')} target="_blank" rel="noopener" @click=${(e: MouseEvent) => this.onLink(e)}>${this.s('data')} ${this.icon('external')}</a>`;
  }

  protected statusPill(state: QuoteState, label?: string): TemplateResult {
    const key: StringKey = state === 'live' ? 'live' : state === 'unknown-symbol' ? 'notFound' : state;
    return html`<span class="status" data-state=${state}><span class="dot"></span>${label ?? this.s(key)}</span>`;
  }

  protected change(cp: number | null): TemplateResult {
    const dir = direction(cp);
    const icon = dir === 'up' ? 'tri-up' : dir === 'down' ? 'tri-down' : 'flat';
    return html`<span class="chg ${dir}">${this.icon(icon)}${formatPercent(cp)}</span>`;
  }

  protected blockedNotice(): TemplateResult {
    return html`<div class="card"><p class="notice">${this.s(this.blockedReason === 'blocked' ? 'blocked' : 'off')}</p></div>`;
  }

  /** A coloured monogram; logos are trademarks of their owners and are not part of this package. */
  protected monogram(symbol: string): TemplateResult {
    let h = 0;
    for (let i = 0; i < symbol.length; i += 1) h = (h * 31 + symbol.charCodeAt(i)) % 360;
    return html`<span class="logo" style="background:hsl(${h} 45% 30%)" aria-hidden="true">${symbol.slice(0, 3)}</span>`;
  }
}

export { svg };
