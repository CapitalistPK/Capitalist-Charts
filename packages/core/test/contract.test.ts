import { describe, expect, it } from 'vitest';
import { mockAdapter, resources, SAFE_PATH, type Resource } from '@capitalist-charts/core';
import { analytics } from '@capitalist-charts/core/analytics';

/** Every resource the widgets use, as the sample adapter serves it, must pass its own guard. */
const all: Array<[string, Resource<unknown>]> = [
  ['list', resources.list('PSX', 'KSE100')],
  ['movers', resources.movers('PSX')],
  ['map', resources.map('PSX')],
  ...(['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y'] as const).map((r) => [`series ${r}`, resources.series('PSX', 'OGDC', r)] as [string, Resource<unknown>]),
  ['fx', resources.fx('PKR')],
  ['flows', resources.flows('PSX', '1W')],
  ['fund', resources.fund('sample-fund')],
  ['calendar', resources.calendar('PSX')],
  ['calendar sym', resources.calendar('PSX', 'LUCK')],
  ['profile', analytics.profile('PSX', 'LUCK')],
  ['valuation', analytics.valuation('PSX', 'HBL')],
  ['financials annual', analytics.financials('PSX', 'OGDC', 'annual')],
  ['financials quarterly', analytics.financials('PSX', 'OGDC', 'quarterly')],
  ['dividends', analytics.dividends('PSX', 'FFC')],
  ['insiders', analytics.insiders('PSX', 'SYS')],
  ['radar', analytics.radar('PSX', 'OGDC')],
  ['seasonality', analytics.seasonality('PSX', 'OGDC')],
  ['news all', analytics.news('PSX')],
  ['news sym', analytics.news('PSX', 'LUCK')],
  ['leaders', analytics.leaders('equity', '1Y')],
  ['futures', analytics.futures('PSX')],
  ['econ', analytics.econ()],
  ['macro', analytics.macro('PK.CPI')],
  ['commodities', analytics.commodities()],
  ['screener', analytics.screener('PSX', 'unusual_volume')],
  ['tax', analytics.tax()],
];

describe('data contract', () => {
  const adapter = mockAdapter({ now: () => Date.UTC(2026, 10, 26, 8) });
  for (const [name, r] of all) {
    it(`${name}: path is allowed and sample data passes the guard`, async () => {
      expect(SAFE_PATH.test(r.path)).toBe(true);
      const body = await adapter.load(r.path);
      expect(body).not.toBeNull();
      expect(r.guard(body)).toBe(true);
    });
  }

  it('unknown symbols are null (404), never made up', async () => {
    expect(await adapter.load(analytics.profile('PSX', 'NOPE').path)).toBeNull();
    expect(await adapter.load(analytics.news('PSX', 'NOPE').path)).toBeNull();
  });
});

describe('a response must be about what was asked for', () => {
  const adapter = mockAdapter({ now: () => Date.UTC(2026, 10, 26, 8) });
  const load = (path: string) => adapter.load(path);

  it("rejects another symbol's, range's or market's file served at a path", async () => {
    const hbl1Y = await load(resources.series('PSX', 'HBL', '1Y').path);
    expect(resources.series('PSX', 'HBL', '1Y').guard(hbl1Y)).toBe(true);
    expect(resources.series('PSX', 'OGDC', '1Y').guard(hbl1Y)).toBe(false);
    expect(resources.series('PSX', 'HBL', '5Y').guard(hbl1Y)).toBe(false);
    const hblProfile = await load(analytics.profile('PSX', 'HBL').path);
    expect(analytics.profile('PSX', 'LUCK').guard(hblProfile)).toBe(false);
    const flows1W = await load(resources.flows('PSX', '1W').path);
    expect(resources.flows('PSX', '1M').guard(flows1W)).toBe(false);
  });

  it("rejects a market calendar served at one company's calendar path", async () => {
    const market = (await load(resources.calendar('PSX').path)) as { items: Array<{ s: string }> };
    expect(new Set(market.items.map((i) => i.s)).size).toBeGreaterThan(1);
    expect(resources.calendar('PSX', market.items[0]!.s).guard(market)).toBe(false);
  });
});

describe('macro decimals', () => {
  it('refuses a decimals value Intl cannot format, instead of crashing the widget', async () => {
    const adapter = mockAdapter({ now: () => Date.UTC(2026, 10, 26, 8) });
    const r = analytics.macro('PAK.CPI.YOY');
    const good = (await adapter.load(r.path)) as Record<string, unknown>;
    expect(r.guard(good)).toBe(true);
    for (const dec of [-1, 1e9, 1.5]) expect(r.guard({ ...good, dec })).toBe(false);
  });
});
