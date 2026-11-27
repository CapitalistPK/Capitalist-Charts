import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mockAdapter } from '@capitalist-charts/core';
import { configureCapitalistCharts } from '@capitalist-charts/elements';

beforeAll(() => {
  configureCapitalistCharts({ adapter: mockAdapter({ seed: 1 }) });
});
afterEach(() => {
  document.body.innerHTML = '';
});

const shadowText = (el: Element) => el.shadowRoot?.textContent?.replace(/\s+/g, ' ') ?? '';

describe('<cap-quote>', () => {
  it('renders a live price from the data source and fires cap:ready', async () => {
    const ready = vi.fn();
    const el = document.createElement('cap-quote');
    el.setAttribute('symbol', 'PSX:OGDC');
    el.addEventListener('cap:ready', ready);
    document.body.append(el);
    await vi.waitFor(() => expect(shadowText(el)).toContain('Oil & Gas Development'), { timeout: 2000 });
    expect(shadowText(el)).toMatch(/1\d\d\.\d\d/);
    expect(shadowText(el)).toContain('Data by Capitalist');
    expect(ready).toHaveBeenCalledOnce();
  });

  it('shows "Symbol not found" with a search link for an unknown symbol', async () => {
    const el = document.createElement('cap-quote');
    el.setAttribute('symbol', 'PSX:NOPE');
    document.body.append(el);
    await vi.waitFor(() => expect(shadowText(el)).toContain('Symbol not found'), { timeout: 2000 });
    const link = el.shadowRoot!.querySelector('a[href*="search"]') as HTMLAnchorElement;
    expect(link.href).toContain('q=NOPE');
    expect(link.href).toContain('utm_source=widget');
  });

  it('lets the host cancel outbound clicks through cap:link', async () => {
    const el = document.createElement('cap-quote');
    el.setAttribute('symbol', 'PSX:HBL');
    document.body.append(el);
    await vi.waitFor(() => expect(shadowText(el)).toContain('Habib Bank'), { timeout: 2000 });
    const seen: unknown[] = [];
    document.addEventListener('cap:link', (e) => {
      seen.push((e as CustomEvent).detail);
      e.preventDefault();
    }, { once: true });
    const a = el.shadowRoot!.querySelector('.title a') as HTMLAnchorElement;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
    a.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(seen[0]).toMatchObject({ widget: 'cap-quote', symbol: 'HBL' });
  });

  it('switches to right-to-left for Urdu', async () => {
    const el = document.createElement('cap-quote');
    el.setAttribute('symbol', 'PSX:OGDC');
    el.setAttribute('locale', 'ur');
    document.body.append(el);
    await vi.waitFor(() => expect(shadowText(el)).toContain('ڈیٹا: کیپٹلسٹ'), { timeout: 2000 });
    expect(el.getAttribute('dir')).toBe('rtl');
  });
});

describe('<cap-ticker-tape>', () => {
  it('renders every symbol once (plus the loop copy) and toggles pause', async () => {
    const el = document.createElement('cap-ticker-tape');
    el.setAttribute('symbols', 'PSX:OGDC, PSX:HBL, PSX:OGDC, bad/sym');
    document.body.append(el);
    await vi.waitFor(() => expect(el.shadowRoot!.querySelectorAll('a.item').length).toBe(4), { timeout: 2000 });
    const button = el.shadowRoot!.querySelector('button.pause') as HTMLButtonElement;
    expect(button.getAttribute('aria-pressed')).toBe('false');
    button.click();
    await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    expect(el.shadowRoot!.querySelector('button.pause')!.getAttribute('aria-pressed')).toBe('true');
    expect(el.shadowRoot!.querySelector('.card')!.classList.contains('paused')).toBe(true);
  });
});

describe('failure states and operator switches', () => {
  it('shows "Unavailable" instead of crashing when the first request fails', async () => {
    const { configureCapitalistCharts: configure } = await import('@capitalist-charts/elements');
    const { mockAdapter: mock } = await import('@capitalist-charts/core');
    const base = mock();
    configure({ adapter: { ...base, quote: async () => Promise.reject(new Error('offline')) } });
    const el = document.createElement('cap-quote');
    el.setAttribute('symbol', 'PSX:OGDC');
    document.body.append(el);
    await vi.waitFor(() => expect(shadowText(el)).toContain('Unavailable'), { timeout: 2000 });
    configure({ adapter: mock({ seed: 1 }) });
  });

  it('stops a widget when its tag is disabled in the operator config', async () => {
    const { configureCapitalistCharts: configure } = await import('@capitalist-charts/elements');
    const { mockAdapter: mock } = await import('@capitalist-charts/core');
    const base = mock();
    configure({ adapter: { ...base, config: async () => ({ v: 1 as const, pollMs: 2000, level: 1, disabled: ['cap-quote'], blockedDomains: [] }) } });
    await new Promise((r) => setTimeout(r, 0));
    const el = document.createElement('cap-quote');
    el.setAttribute('symbol', 'PSX:OGDC');
    document.body.append(el);
    await vi.waitFor(() => expect(shadowText(el)).toContain('switched off'), { timeout: 2000 });
    configure({ adapter: mock({ seed: 1 }) });
  });
});

describe('data source replaced after widgets connect', () => {
  it('moves connected widgets (own and generic subscriptions) to the new source', async () => {
    const quote = document.createElement('cap-quote');
    quote.setAttribute('symbol', 'PSX:OGDC');
    const movers = document.createElement('cap-movers');
    document.body.append(quote, movers);
    await vi.waitFor(() => expect(shadowText(quote)).toContain('Oil & Gas Development'), { timeout: 2000 });
    await vi.waitFor(() => expect(shadowText(movers)).toContain('Top movers'), { timeout: 2000 });
    // A framework configures late: a different source with other names.
    configureCapitalistCharts({
      adapter: mockAdapter({ seed: 2, symbols: [{ symbol: 'OGDC', name: 'Replaced Source Co', price: 50, sector: 'X', shares: 1 }, { symbol: 'ZZZ', name: 'Zed', price: 9, sector: 'X', shares: 1 }] }),
    });
    await vi.waitFor(() => expect(shadowText(quote)).toContain('Replaced Source Co'), { timeout: 3000 });
    await vi.waitFor(() => expect(shadowText(movers)).toContain('ZZZ'), { timeout: 3000 });
    configureCapitalistCharts({ adapter: mockAdapter({ seed: 1 }) });
  });
});

describe('every launch widget renders from sample data', () => {
  const cases: Array<[string, Record<string, string>, string]> = [
    ['cap-ticker-tag', { symbol: 'PSX:OGDC' }, 'OGDC'],
    ['cap-ticker-tape', { index: 'KSE100' }, 'HBL'],
    ['cap-mini-chart', { symbol: 'PSX:LUCK', range: '3M' }, 'Lucky Cement'],
    ['cap-symbol-overview', { symbols: 'PSX:OGDC,PSX:PPL', range: '1Y' }, 'PPL'],
    ['cap-market-summary', { indices: 'PSX:KSE100,PSX:KMI30' }, 'KMI-30'],
    ['cap-movers', { tab: 'active' }, 'Most active'],
    ['cap-market-map', {}, 'Market map'],
    ['cap-fx-cross-rates', { currencies: 'PKR,USD,EUR' }, 'EUR'],
    ['cap-fipi-lipi', { period: '1W' }, 'Foreign corporates'],
    ['cap-fund-card', { fund: 'sample-fund' }, 'Rank'],
    ['cap-corporate-calendar', { symbol: 'PSX:LUCK' }, 'LUCK'],
    ['cap-advanced-chart', { symbol: 'PSX:OGDC' }, 'Data by Capitalist'],
  ];
  for (const [tag, attrs, text] of cases) {
    it(tag, async () => {
      await import('@capitalist-charts/elements');
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      document.body.append(el);
      await vi.waitFor(() => expect(shadowText(el)).toContain(text), { timeout: 3000 });
    });
  }

  it('builds an advanced-chart iframe URL from validated values only', async () => {
    const el = document.createElement('cap-advanced-chart') as HTMLElement & { src(): string | null };
    el.setAttribute('symbol', 'PSX:OGDC');
    el.setAttribute('studies', 'RSI,"><script>');
    el.setAttribute('compare', 'PSX:PPL,bad sym!,PSX:HBL');
    document.body.append(el);
    const url = new URL(el.src()!);
    expect(url.origin + url.pathname).toBe('https://capitalist.pk/pro/charts/embed/advanced');
    expect(url.searchParams.get('studies')).toBeNull();
    expect(url.searchParams.get('compare')).toBe('PSX:PPL,PSX:HBL');
  });
});

describe('every later widget renders from sample data', () => {
  const cases: Array<[string, Record<string, string>, string]> = [
    ['cap-sector-performance', {}, 'Commercial Banks'],
    ['cap-index-contributors', { index: 'PSX:KSE100' }, 'Lifting'],
    ['cap-sector-money-map', {}, 'Cement'],
    ['cap-valuation', { symbol: 'PSX:HBL' }, 'Sector median'],
    ['cap-financials', { symbol: 'PSX:OGDC', period: 'quarterly' }, 'EPS'],
    ['cap-dividends', { symbol: 'PSX:FFC' }, 'Next entitlement'],
    ['cap-insider-trades', { symbol: 'PSX:SYS' }, 'Net, 90 days'],
    ['cap-radar', { symbol: 'PSX:OGDC' }, 'What the read lacks'],
    ['cap-shariah', { symbol: 'PSX:MEBL' }, 'Shariah'],
    ['cap-fund-performance', { fund: 'sample-fund' }, 'YTD'],
    ['cap-fund-leaderboard', { category: 'equity' }, 'Sample Equity Fund 1'],
    ['cap-news', { symbol: 'PSX:LUCK' }, 'Lucky Cement sample headline'],
    ['cap-watchlist', { symbols: 'PSX:OGDC,PSX:HBL' }, 'HBL'],
    ['cap-seasonality', { symbol: 'PSX:OGDC' }, '2016'],
    ['cap-futures-board', {}, 'OGDC NOV'],
    ['cap-company-profile', { symbol: 'PSX:LUCK' }, 'Listed shares'],
    ['cap-economic-calendar', { currencies: 'PKR' }, 'SBP policy rate'],
    ['cap-macro', { code: 'PAK.CPI.YOY' }, 'Sample inflation'],
    ['cap-fx-heatmap', {}, 'USD'],
    ['cap-commodities', {}, 'Petrol'],
    ['cap-screener', { preset: 'breakouts' }, 'Breakouts'],
    ['cap-tax-calculator', { salary: '250000' }, 'Take-home'],
  ];
  for (const [tag, attrs, text] of cases) {
    it(tag, async () => {
      await import('@capitalist-charts/elements');
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      document.body.append(el);
      await vi.waitFor(() => expect(shadowText(el)).toContain(text), { timeout: 3000 });
    });
  }

  it('the catalog, the loader and the package exports list the same 35 widgets', async () => {
    const { CATALOG } = await import('@capitalist-charts/elements');
    const fs = await import('node:fs');
    const loader = fs.readFileSync('packages/elements/src/loader.ts', 'utf8');
    const registered = [...loader.matchAll(/'(cap-[a-z-]+)': \(\) => import/g)].map((m) => m[1]).sort();
    expect(CATALOG).toHaveLength(35);
    expect(registered).toEqual(CATALOG.map((w) => w.tag).sort());
    for (const w of CATALOG) expect(customElements.get(w.tag), w.tag).toBeDefined();
  });

  it('computes salary tax from slabs, with surcharge', async () => {
    const { salaryTax } = await import('../src/cap-tax-calculator.js');
    const t = { v: 1 as const, ty: 'x', src: 'x', slabs: [{ from: 0, to: 600_000, base: 0, rate: 0 }, { from: 600_000, to: null, base: 0, rate: 10 }], surcharge: { over: 1_000_000, rate: 10 } };
    expect(salaryTax(500_000, t)).toBe(0);
    expect(salaryTax(800_000, t)).toBe(20_000);
    expect(salaryTax(2_000_000, t)).toBe(154_000);
  });
});
