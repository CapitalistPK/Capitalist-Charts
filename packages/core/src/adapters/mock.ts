import { type MarketStatus, type QuoteSnapshot, type SymbolIndex, type WidgetConfig } from '@capitalist-charts/schema/base';
import { SERIES_RANGES, type Bar, type Calendar, type CompactQuote, type Flows, type FundCard, type FxRates, type IndexList, type MarketMap, type Movers, type Series, type SeriesRange } from '@capitalist-charts/schema/views';
import { DEFAULT_CONFIG, SAFE_PATH, type DataAdapter } from '../adapter.js';
import { mockAnalytics } from './mock-analytics.js';

export interface MockSymbol {
  symbol: string;
  name: string;
  price: number;
  kind?: string;
  sector?: string;
  /** Shares outstanding, millions (for market cap). */
  shares?: number;
}

/** PSX names with round example prices. Clearly sample data, for docs and local development. */
export const MOCK_PSX: MockSymbol[] = [
  { symbol: 'KSE100', name: 'KSE-100', price: 118_000, kind: 'index' },
  { symbol: 'KMI30', name: 'KMI-30', price: 172_000, kind: 'index' },
  { symbol: 'OGDC', name: 'Oil & Gas Development', price: 180, sector: 'Oil & Gas Exploration', shares: 4301 },
  { symbol: 'PPL', name: 'Pakistan Petroleum', price: 150, sector: 'Oil & Gas Exploration', shares: 2721 },
  { symbol: 'MARI', name: 'Mari Energies', price: 640, sector: 'Oil & Gas Exploration', shares: 1200 },
  { symbol: 'HBL', name: 'Habib Bank', price: 140, sector: 'Commercial Banks', shares: 1467 },
  { symbol: 'MEBL', name: 'Meezan Bank', price: 270, sector: 'Commercial Banks', shares: 1790 },
  { symbol: 'UBL', name: 'United Bank', price: 330, sector: 'Commercial Banks', shares: 2505 },
  { symbol: 'MCB', name: 'MCB Bank', price: 280, sector: 'Commercial Banks', shares: 1185 },
  { symbol: 'LUCK', name: 'Lucky Cement', price: 1_040, sector: 'Cement', shares: 293 },
  { symbol: 'DGKC', name: 'D.G. Khan Cement', price: 115, sector: 'Cement', shares: 438 },
  { symbol: 'ENGRO', name: 'Engro Holdings', price: 345, sector: 'Fertilizer', shares: 1203 },
  { symbol: 'FFC', name: 'Fauji Fertilizer', price: 385, sector: 'Fertilizer', shares: 1423 },
  { symbol: 'EFERT', name: 'Engro Fertilizers', price: 205, sector: 'Fertilizer', shares: 1335 },
  { symbol: 'SYS', name: 'Systems', price: 160, sector: 'Technology', shares: 1471 },
  { symbol: 'TRG', name: 'TRG Pakistan', price: 70, sector: 'Technology', shares: 545 },
  { symbol: 'HUBC', name: 'Hub Power', price: 150, sector: 'Power Generation', shares: 1297 },
  { symbol: 'PSO', name: 'Pakistan State Oil', price: 420, sector: 'Oil & Gas Marketing', shares: 469 },
];

const DAY = 86_400;

function seeded(seed: number): () => number {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
const r2 = (n: number) => Math.round(n * 100) / 100;
const iso = (sec: number) => new Date(sec * 1000).toISOString().slice(0, 10);
const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

const RANGE_SPEC: Record<SeriesRange, { i: string; step: number; n: number }> = {
  '1D': { i: '5m', step: 300, n: 75 },
  '5D': { i: '30m', step: 1800, n: 65 },
  '1M': { i: '1h', step: 3600, n: 140 },
  '3M': { i: '1d', step: DAY, n: 63 },
  '6M': { i: '1d', step: DAY, n: 125 },
  YTD: { i: '1d', step: DAY, n: 230 },
  '1Y': { i: '1d', step: DAY, n: 250 },
  '5Y': { i: '1w', step: 7 * DAY, n: 260 },
};

/**
 * Sample data for every widget. Prices follow a deterministic random walk that never leaves PSX's
 * ±10% daily band, and every call to `quote` advances the symbol one step, so a polling widget
 * visibly ticks. Charts, flows, funds and calendars are generated the same way.
 */
export function mockAdapter(options: { symbols?: MockSymbol[]; seed?: number; now?: () => number; open?: boolean } = {}): DataAdapter {
  const symbols = options.symbols ?? MOCK_PSX;
  const rand = seeded(options.seed ?? 2026);
  const now = options.now ?? (() => Date.now());
  const state = new Map(symbols.map((s) => [s.symbol, { ...s, prev: s.price, last: s.price, vol: 0 }]));

  function step(symbol: string): QuoteSnapshot | null {
    const s = state.get(symbol);
    if (!s) return null;
    const next = s.last * (1 + (rand() - 0.5) * 0.004);
    s.last = Math.min(s.prev * 1.1, Math.max(s.prev * 0.9, next));
    s.vol += Math.round(rand() * 50_000);
    const change = s.last - s.prev;
    return {
      v: 1,
      s: s.symbol,
      m: 'PSX',
      n: s.name,
      k: s.kind ?? 'equity',
      p: r2(s.last),
      c: r2(change),
      cp: r2((change / s.prev) * 100),
      vol: s.vol,
      t: Math.floor(now() / 1000),
      d: 0,
      st: false,
    };
  }
  const compact = (q: QuoteSnapshot): CompactQuote => {
    const { v: _v, m: _m, ...rest } = q;
    return rest;
  };
  const equities = () => symbols.filter((s) => (s.kind ?? 'equity') !== 'index').map((s) => step(s.symbol)!);

  function series(symbol: string, range: SeriesRange): Series | null {
    const s = state.get(symbol);
    if (!s) return null;
    const spec = RANGE_SPEC[range];
    const rnd = seeded(hash(symbol + range));
    const end = Math.floor(now() / 1000 / spec.step) * spec.step;
    const vol = range === '5Y' ? 0.05 : range === '1D' ? 0.002 : 0.015;
    const closes: number[] = [];
    let p = s.last;
    for (let i = 0; i < spec.n; i += 1) {
      closes.unshift(p);
      p = p / (1 + (rnd() - 0.48) * vol);
    }
    const b: Bar[] = closes.map((c, i) => {
      const o = i === 0 ? c * (1 + (rnd() - 0.5) * vol * 0.5) : closes[i - 1]!;
      const hi = Math.max(o, c) * (1 + rnd() * vol * 0.4);
      const lo = Math.min(o, c) * (1 - rnd() * vol * 0.4);
      return [end - (spec.n - 1 - i) * spec.step, r2(o), r2(hi), r2(lo), r2(c), Math.round(rnd() * 2_000_000)];
    });
    return { v: 1, s: symbol, m: 'PSX', r: range, i: spec.i, pc: range === '1D' ? r2(s.prev) : null, b };
  }

  function route(path: string): unknown {
    const t = Math.floor(now() / 1000);
    let m: RegExpMatchArray | null;
    if ((m = path.match(/^snap\/PSX\/list\/([A-Z0-9.-]+)\.json$/))) {
      if (!state.has(m[1]!) || state.get(m[1]!)!.kind !== 'index') return null;
      const items = equities().map((q, i, all) => ({ ...compact(q), w: r2(100 / all.length + (all.length / 2 - i) * 0.3) }));
      return { v: 1, m: 'PSX', name: m[1]!, items } satisfies IndexList;
    }
    if (path === 'snap/PSX/_movers.json') {
      const qs = equities().map(compact);
      const by = (f: (q: CompactQuote) => number) => [...qs].sort((a, b) => f(b) - f(a)).slice(0, 10);
      return { v: 1, m: 'PSX', gainers: by((q) => q.cp ?? 0), losers: by((q) => -(q.cp ?? 0)), active: by((q) => q.vol ?? 0) } satisfies Movers;
    }
    if (path === 'snap/PSX/_map.json') {
      const groups = new Map<string, MarketMap['sectors'][number]>();
      for (const q of equities()) {
        const meta = state.get(q.s)!;
        if (!meta.sector || !meta.shares) continue;
        const g = groups.get(meta.sector) ?? { n: meta.sector, items: [] };
        g.items.push({ s: q.s, n: q.n, mc: Math.round(q.p * meta.shares * 1e6), p: q.p, cp: q.cp, st: false });
        groups.set(meta.sector, g);
      }
      const total = (g: MarketMap['sectors'][number]) => g.items.reduce((a, i) => a + i.mc, 0);
      const sectors = [...groups.values()].map((g) => ({ ...g, items: g.items.sort((a, b) => b.mc - a.mc) })).sort((a, b) => total(b) - total(a));
      return { v: 1, m: 'PSX', sectors } satisfies MarketMap;
    }
    if ((m = path.match(/^v\/series\/PSX\/([A-Z0-9.-]+)\/([A-Z0-9]+)\.json$/))) {
      const range = m[2] as SeriesRange;
      return (SERIES_RANGES as readonly string[]).includes(range) ? series(m[1]!, range) : null;
    }
    if (path === 'v/fx/PKR.json') {
      const rates: Array<[string, string, number]> = [
        ['USD', 'US Dollar', 280.6], ['EUR', 'Euro', 302.4], ['GBP', 'British Pound', 356.2], ['SAR', 'Saudi Riyal', 74.8],
        ['AED', 'UAE Dirham', 76.4], ['CNY', 'Chinese Yuan', 38.9], ['JPY', 'Japanese Yen', 1.86], ['CAD', 'Canadian Dollar', 201.3],
      ];
      return { v: 1, base: 'PKR', t: t - 600, rates: rates.map(([c, n, r]) => ({ c, n, r, cp: r2((rand() - 0.5) * 0.6) })) } satisfies FxRates;
    }
    if ((m = path.match(/^v\/flows\/PSX\/(1D|1W|1M)\.json$/))) {
      const k = m[1] === '1D' ? 1 : m[1] === '1W' ? 4 : 15;
      const rnd = seeded(hash(path));
      const v = (base: number) => r2((rnd() - 0.5) * base * k);
      const types = [
        ['foreign_individual', 'Foreign individuals', v(0.4)], ['foreign_corporate', 'Foreign corporates', v(3)], ['overseas_pakistani', 'Overseas Pakistanis', v(0.8)],
        ['individuals', 'Individuals', v(2)], ['companies', 'Companies', v(1)], ['banks', 'Banks / DFIs', v(1.5)], ['mutual_funds', 'Mutual funds', v(2.5)],
        ['insurance', 'Insurance', v(1)], ['brokers', 'Brokers proprietary', v(0.6)], ['other', 'Other organizations', v(0.5)],
      ] as const;
      const sectors = ['Commercial Banks', 'Oil & Gas Exploration', 'Cement', 'Fertilizer', 'Technology', 'Power Generation'].map((n) => ({ n, net: v(1.2) }));
      sectors.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
      const g = (key: string): 'foreign' | 'local' => (key.startsWith('foreign') || key.startsWith('overseas') ? 'foreign' : 'local');
      return { v: 1, m: 'PSX', p: m[1] as Flows['p'], from: iso(t - (k - 1) * DAY), to: iso(t), unit: 'USD', types: types.map(([key, n, net]) => ({ k: key, n, g: g(key), net: net * 1e6 })), sectors: sectors.map((s) => ({ ...s, net: s.net * 1e6 })) } satisfies Flows;
    }
    if ((m = path.match(/^v\/fund\/([a-z0-9-]+)\.json$/))) {
      const rnd = seeded(hash(m[1]!));
      let nav = 100;
      const spark: Array<[number, number]> = [];
      for (let i = 250; i >= 0; i -= 1) {
        nav *= 1 + (rnd() - 0.46) * 0.012;
        spark.push([t - i * DAY, r2(nav)]);
      }
      const ret = (days: number) => r2((nav / spark[Math.max(0, spark.length - 1 - days)]![1] - 1) * 100);
      return {
        v: 1, slug: m[1]!, n: 'Sample Islamic Equity Fund', amc: 'Sample Asset Management', cat: 'Shariah Compliant Equity', shariah: true,
        nav: r2(nav), navDate: iso(t), r: { '1M': ret(21), '3M': ret(63), '6M': ret(125), YTD: ret(200), '1Y': ret(250), '3Y': null },
        spark, rank: { pos: 3, of: 41 }, aum: 12_400_000_000,
      } satisfies FundCard;
    }
    if ((m = path.match(/^v\/calendar\/PSX\/(?:upcoming|sym\/([A-Z0-9.-]+))\.json$/))) {
      const kinds = [['D', 'Rs 8.00'], ['B', '10%'], ['E', 'Q1 results'], ['A', 'AGM'], ['R', '25% at Rs 10'], ['D', 'Rs 3.50']] as const;
      const list = m[1] ? symbols.filter((s) => s.symbol === m![1]) : symbols.filter((s) => (s.kind ?? 'equity') !== 'index');
      if (!list.length) return null;
      const items = Array.from({ length: m[1] ? 6 : 14 }, (_, i) => {
        const s = list[i % list.length]!;
        const [e, x] = kinds[(i + hash(s.symbol)) % kinds.length]!;
        return { d: iso(t + (m![1] ? i * 40 - 120 : i * 2 + 1) * DAY), e, s: s.symbol, n: s.name, x };
      });
      return { v: 1, m: 'PSX', items } satisfies Calendar;
    }
    return null;
  }

  return {
    async quote(market, symbol) {
      return market === 'PSX' ? step(symbol) : null;
    },
    async status(market): Promise<MarketStatus | null> {
      if (market !== 'PSX') return null;
      const qs = equities();
      return {
        v: 1, m: 'PSX', pub: Math.floor(now() / 1000), open: options.open ?? true, feed: 'live', symbols: symbols.length, live: symbols.length,
        advancers: qs.filter((q) => (q.c ?? 0) > 0).length, decliners: qs.filter((q) => (q.c ?? 0) < 0).length, unchanged: qs.filter((q) => q.c === 0).length,
      };
    },
    async index(market): Promise<SymbolIndex | null> {
      if (market !== 'PSX') return null;
      return { v: 1, m: 'PSX', items: symbols.map((s) => ({ s: s.symbol, n: s.name, k: s.kind ?? 'equity' })) };
    },
    async config(): Promise<WidgetConfig> {
      return DEFAULT_CONFIG;
    },
    async load(path) {
      if (!SAFE_PATH.test(path)) throw new Error(`Invalid path: ${path}`);
      if (path === 'config.json') return DEFAULT_CONFIG;
      const analytics = mockAnalytics(path, { now: now(), symbols, rand: (key) => seeded(hash(key)) });
      return analytics === undefined ? route(path) : analytics;
    },
  };
}
