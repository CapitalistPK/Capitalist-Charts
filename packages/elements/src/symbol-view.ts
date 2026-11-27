import { html, type PropertyDeclarations, type TemplateResult } from 'lit';
import type { Resource } from '@capitalist-charts/core';
import { parseSymbolRef } from '@capitalist-charts/schema/base';
import { useExtraStrings } from './i18n-extra.js';
import { CapElement, resourceSub, type Sub } from './base.js';
import type { StringKey } from './i18n.js';

useExtraStrings();

/**
 * A widget showing one cached summary (L1) for one symbol: profile, valuation, dividends...
 * Subclasses name the resource and draw the body; loading, unknown-symbol and unavailable states
 * are handled here so every such widget behaves the same.
 */
export abstract class SymbolView<T> extends CapElement {
  static override properties: PropertyDeclarations = { symbol: { type: String } };

  symbol = 'PSX:OGDC';
  protected abstract readonly titleKey: StringKey;
  protected abstract resourceFor(market: string, symbol: string): Resource<T>;
  protected abstract body(data: T, market: string): TemplateResult;
  protected foot(_data: T): TemplateResult | string {
    return '';
  }
  protected rows = 5;

  protected ref() {
    return parseSymbolRef(this.symbol);
  }

  protected resource(): Resource<T> | null {
    const r = this.ref();
    if (!r) return null;
    try {
      return this.resourceFor(r.market, r.symbol);
    } catch {
      return null;
    }
  }

  protected override subscriptions(): Sub[] {
    const r = this.resource();
    return r ? [resourceSub(r)] : [];
  }

  protected head(symbol: string, market: string): TemplateResult {
    return html`${this.s(this.titleKey)} <span class="sub">· ${this.link(this.quotePath(market, symbol), symbol, symbol)}</span>`;
  }

  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const r = this.ref();
    const res = this.resource();
    if (!r || !res) return this.message(this.s(this.titleKey), this.s('notFound'));
    const u = this.val<T>(res);
    if (u?.notFound) return this.message(this.head(r.symbol, r.market), this.s('notFound'));
    if (!u?.data) return u?.failed ? this.message(this.head(r.symbol, r.market), this.s('unavailable')) : this.skeleton(this.rows, this.s(this.titleKey));
    return this.frame(this.head(r.symbol, r.market), this.body(u.data, r.market), { foot: this.foot(u.data) });
  }
}
