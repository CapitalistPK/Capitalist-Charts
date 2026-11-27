import { css, html, type PropertyDeclarations } from 'lit';
import { resources } from '@capitalist-charts/core';
import { parseSymbolRef } from '@capitalist-charts/schema/base';
import { EVENT_TYPES, type Calendar, type EventType } from '@capitalist-charts/schema/views';
import { CapElement, resourceSub, type Sub } from './base.js';
import type { StringKey } from './i18n.js';
import { define } from './runtime.js';
import { parts } from './parts.js';

/** Letter marks match the D/B/R/S marks on Capitalist charts. */
const MARK_COLOUR: Record<EventType, string> = { D: '#0f766e', B: '#7c3aed', R: '#b45309', S: '#be185d', E: '#1d4ed8', A: '#475569' };

/**
 * `<cap-corporate-calendar>`: upcoming dividends, bonuses, rights, splits, results and AGMs.
 * With `symbol`, one company's recent and upcoming events. Type chips filter the list.
 */
export class CapCorporateCalendar extends CapElement {
  static override properties: PropertyDeclarations = { symbol: { type: String }, types: { type: String } };
  static override styles = [
    ...CapElement.styles,
    parts,
    css`
      :host { min-width: 260px; }
      .chips { display: flex; gap: 4px; flex-wrap: wrap; }
      .chips button { font: inherit; font-size: 0.7rem; border: 1px solid var(--_border); background: transparent; color: var(--_muted); border-radius: 99px; padding: 2px 8px; cursor: pointer; min-height: 24px; }
      .chips button[aria-pressed='true'] { background: var(--_surface); color: var(--_text); border-color: var(--_text); }
      ol { list-style: none; margin: 0; padding: 0; }
      li { height: 34px; box-sizing: border-box; display: grid; grid-template-columns: 52px 22px minmax(0, 1fr) auto; gap: 8px; align-items: center; padding: 4px 0; border-bottom: 1px solid var(--_border); font-size: 0.8rem; overflow: hidden; }
      li:last-child { border-bottom: 0; }
      li.past { color: var(--_faint); }
      .d { color: var(--_muted); font-size: 0.72rem; }
      .mark { width: 20px; height: 20px; border-radius: 5px; color: #fff; font-size: 0.68rem; font-weight: 700; display: grid; place-items: center; }
      .grow { overflow: hidden; }
      .grow .sub { display: block; }
      .x { text-align: end; color: var(--_muted); white-space: nowrap; }
    `,
  ];

  symbol = '';
  types = 'D,B,R,S,E,A';
  private offTypes = new Set<EventType>();

  private res() {
    if (!this.symbol.trim()) return resources.calendar('PSX');
    const r = parseSymbolRef(this.symbol);
    return r ? resources.calendar(r.market, r.symbol) : null;
  }
  protected override subscriptions(): Sub[] {
    const r = this.res();
    return r ? [resourceSub(r)] : [];
  }

  private toggle(e: EventType): void {
    if (this.offTypes.has(e)) this.offTypes.delete(e);
    else this.offTypes.add(e);
    this.requestUpdate();
    this.emit('cap:select', { hidden: [...this.offTypes] });
  }

  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const r = this.res();
    const title = this.symbol.trim() ? html`${this.s('calendar')} <span class="sub">· ${this.symbol.toUpperCase()}</span>` : this.s('calendar');
    if (!r) return this.message(title, this.s('notFound'));
    const u = this.val<Calendar>(r);
    if (u?.notFound) return this.message(title, this.s('notFound'));
    if (!u?.data) return u?.failed ? this.message(title, this.s('unavailable')) : this.skeleton(8, this.s('calendar'));
    const allowed = new Set(this.types.split(',').map((x) => x.trim().toUpperCase()).filter((x): x is EventType => (EVENT_TYPES as readonly string[]).includes(x)));
    const kinds = EVENT_TYPES.filter((e) => allowed.has(e));
    const today = new Date().toISOString().slice(0, 10);
    const items = u.data.items.filter((i) => allowed.has(i.e) && !this.offTypes.has(i.e));
    const fmt = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString(this.locale === 'ur' ? 'ur-PK' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    return this.frame(
      title,
      html`<div class="chips" role="group" aria-label=${this.s('calendar')}>
          ${kinds.map((e) => html`<button type="button" aria-pressed=${String(!this.offTypes.has(e))} @click=${() => this.toggle(e)}>${e} · ${this.s(`ev${e}` as StringKey)}</button>`)}
        </div>
        ${items.length
          ? html`<ol>${items.map(
              (i) => html`<li class=${i.d < today ? 'past' : ''}>
                <span class="d num">${fmt(i.d)}</span>
                <span class="mark" style="background:${MARK_COLOUR[i.e]}" title=${this.s(`ev${i.e}` as StringKey)} aria-label=${this.s(`ev${i.e}` as StringKey)}>${i.e}</span>
                <span class="grow">${this.link(this.quotePath(u.data!.m, i.s), html`<b title=${i.s}>${i.s}</b>`, i.s, 'rowlink')}<span class="sub" title=${i.n}>${i.n}</span></span>
                <span class="x num">${i.x}</span>
              </li>`,
            )}</ol>`
          : html`<p class="sub">${this.s('noEvents')}</p>`}`,
    );
  }
}

define('cap-corporate-calendar', CapCorporateCalendar);

declare global {
  interface HTMLElementTagNameMap {
    'cap-corporate-calendar': CapCorporateCalendar;
  }
}
