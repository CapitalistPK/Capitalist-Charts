import { analytics } from '@capitalist-charts/core/analytics';
import { css, html, type PropertyDeclarations } from 'lit';
import { formatNumber } from '@capitalist-charts/core';
import type { TaxSlabs } from '@capitalist-charts/schema/analytics';
import { CapElement, resourceSub, type Sub } from './base.js';
import { useExtraStrings } from './i18n-extra.js';
import { define } from './runtime.js';

useExtraStrings();

/** Annual tax on annual taxable income: the band's base plus its rate on the excess, then any surcharge. */
export function salaryTax(annual: number, t: TaxSlabs): number {
  if (!(annual > 0)) return 0;
  const slab = t.slabs.find((s) => annual > s.from && (s.to === null || annual <= s.to)) ?? t.slabs[0];
  if (!slab) return 0;
  let tax = slab.base + ((annual - slab.from) * slab.rate) / 100;
  if (t.surcharge && annual > t.surcharge.over) tax += (tax * t.surcharge.rate) / 100;
  return Math.max(0, Math.round(tax));
}

/** `<cap-tax-calculator salary="250000">`: monthly tax and take-home pay for a salaried person, from the current Finance Act slabs. */
export class CapTaxCalculator extends CapElement {
  static override properties: PropertyDeclarations = { salary: { type: Number } };
  static override styles = [
    ...CapElement.styles,
    css`
      :host { min-width: 260px; }
      label { font-size: 0.75rem; color: var(--_muted); display: flex; flex-direction: column; gap: 4px; }
      input { font: inherit; font-size: 1rem; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--_border); background: var(--_bg); color: var(--_text); min-height: 40px; }
      .out { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .o { background: var(--_surface); border-radius: 8px; padding: 6px 9px; font-size: 0.7rem; color: var(--_muted); }
      .o b { display: block; font-size: 1rem; color: var(--_text); font-weight: 600; }
    `,
  ];
  salary = 150_000;
  protected override subscriptions(): Sub[] {
    return [resourceSub(analytics.tax())];
  }
  override render() {
    if (this.blockedReason) return this.blockedNotice();
    const u = this.val<TaxSlabs>(analytics.tax());
    if (!u?.data) return u?.failed || u?.notFound ? this.message(this.s('tax'), this.s('unavailable')) : this.skeleton(4, this.s('tax'));
    const t = u.data;
    const monthly = Number.isFinite(this.salary) && this.salary > 0 ? Math.min(this.salary, 1e9) : 0;
    const annualTax = salaryTax(monthly * 12, t);
    const pkr = (n: number) => `Rs ${formatNumber(n, 0)}`;
    return this.frame(
      html`${this.s('tax')} <span class="sub">· ${this.s('taxYear')} ${t.ty}</span>`,
      html`<label>${this.s('monthlySalary')}
          <input type="number" inputmode="numeric" min="0" step="1000" .value=${String(monthly)} @input=${(e: Event) => {
            this.salary = Number((e.target as HTMLInputElement).value);
            this.emit('cap:select', { salary: this.salary });
          }} /></label>
        <div class="out" aria-live="polite">
          <div class="o">${this.s('monthlyTax')}<b class="num">${pkr(annualTax / 12)}</b></div>
          <div class="o">${this.s('takeHome')}<b class="num">${pkr(monthly - annualTax / 12)}</b></div>
          <div class="o">${this.s('annualTax')}<b class="num">${pkr(annualTax)}</b></div>
          <div class="o">${this.s('effectiveRate')}<b class="num">${monthly ? `${formatNumber((annualTax / (monthly * 12)) * 100, 2)}%` : '–'}</b></div>
        </div>
        <span class="sub" style="white-space:normal">${this.s('taxNote')} ${t.src}</span>`,
    );
  }
}
define('cap-tax-calculator', CapTaxCalculator);
declare global {
  interface HTMLElementTagNameMap {
    'cap-tax-calculator': CapTaxCalculator;
  }
}
