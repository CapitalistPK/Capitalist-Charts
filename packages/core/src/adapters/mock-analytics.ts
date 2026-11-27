import type { Commodities, Dividends, EconCalendar, Financials, FundLeaders, Futures, Insiders, Macro, News, Profile, Radar, Screen, Seasonality, TaxSlabs, Valuation } from '@capitalist-charts/schema/analytics';

/** What the analytics sample data needs from the main mock. */
export interface MockContext {
  now: number;
  symbols: Array<{ symbol: string; name: string; price: number; kind?: string; sector?: string; shares?: number }>;
  rand: (seed: string) => () => number;
}

const DAY = 86_400;
const r2 = (n: number) => Math.round(n * 100) / 100;
const iso = (sec: number) => new Date(sec * 1000).toISOString().slice(0, 10);

/** Sample analytics for one path, or undefined when the path is not an analytics resource. */
export function mockAnalytics(path: string, ctx: MockContext): unknown {
  const t = Math.floor(ctx.now / 1000);
  const eq = ctx.symbols.filter((s) => (s.kind ?? 'equity') !== 'index');
  const find = (s: string) => ctx.symbols.find((x) => x.symbol === s && (x.kind ?? 'equity') !== 'index');
  let m: RegExpMatchArray | null;

  if ((m = path.match(/^v\/(profile|valuation|dividends|insiders|radar|seasonality)\/PSX\/([A-Z0-9.-]+)\.json$/))) {
    const s = find(m[2]!);
    if (!s) return null;
    const rnd = ctx.rand(path);
    const head = { v: 1 as const, s: s.symbol, m: 'PSX' };
    const mc = (s.shares ?? 1000) * 1e6 * s.price;
    switch (m[1]) {
      case 'profile':
        return {
          ...head, n: s.name, sec: s.sector ?? null, ind: s.sector ?? null,
          desc: `${s.name} is a sample company used in Capitalist Charts documentation. Its figures are generated, not real.`,
          sh: (s.shares ?? 1000) * 1e6, ff: (s.shares ?? 1000) * 1e6 * 0.35, ffp: 35, mc, fv: 10, fye: 'June',
          shariah: { ok: rnd() > 0.4, src: 'KMI-30 recomposition', eff: iso(t - 60 * DAY) },
        } satisfies Profile;
      case 'valuation': {
        const ratios = () => ({ pe: r2(4 + rnd() * 12), pb: r2(0.6 + rnd() * 2.5), dy: r2(rnd() * 12), ev: r2(3 + rnd() * 6), roe: r2(8 + rnd() * 25), nm: r2(5 + rnd() * 25) });
        const peers = eq.filter((p) => p.sector === s.sector).slice(0, 10).map((p) => ({ s: p.symbol, n: p.name, mc: (p.shares ?? 1000) * 1e6 * p.price, ...ratios() }));
        return { ...head, sec: s.sector ?? null, as: iso(t - DAY), r: ratios(), med: ratios(), peers } satisfies Valuation;
      }
      case 'dividends':
        return {
          ...head, y: r2(3 + rnd() * 8), next: { d: iso(t + 12 * DAY), x: `${Math.round(20 + rnd() * 60)}% (interim)` },
          rows: Array.from({ length: 8 }, (_, i) => {
            const dp = Math.round(20 + rnd() * 80);
            return { d: iso(t - (i * 182 + 40) * DAY), dp, dps: r2(dp / 10), bonus: i === 3 ? 10 : null, right: null, p: `FY${2026 - Math.floor(i / 2)}` };
          }),
        } satisfies Dividends;
      case 'insiders': {
        const rows = Array.from({ length: 6 }, (_, i) => ({
          d: iso(t - (i * 23 + 5) * DAY), who: ['Director A', 'Chief Executive', 'Director B', 'CFO'][i % 4]!, role: ['Director', 'CEO', 'Director', 'CFO'][i % 4]!,
          side: (rnd() > 0.35 ? 'buy' : 'sell') as 'buy' | 'sell', q: Math.round(5000 + rnd() * 90_000), px: r2(s.price * (0.9 + rnd() * 0.15)),
        }));
        const net = (days: number) => rows.filter((r) => r.d >= iso(t - days * DAY)).reduce((a, r) => a + (r.side === 'buy' ? r.q : -r.q), 0);
        return { ...head, net90: net(90), net365: net(365), rows } satisfies Insiders;
      }
      case 'radar':
        return {
          ...head, as: iso(t), d: ['Attractive', 'Watch', 'Risk elevated'][Math.floor(rnd() * 3)]!, hz: '3 months', cf: r2(0.4 + rnd() * 0.4),
          lo: r2(s.price * 0.88), hi: r2(s.price * 1.14),
          drv: ['Momentum', 'Valuation', 'Earnings trend', 'Foreign flows', 'Volatility', 'Dividend'].map((l) => {
            const sc = r2((rnd() - 0.5) * 3);
            return { l, sc, dir: (sc > 0.05 ? 'up' : sc < -0.05 ? 'down' : 'flat') as 'up' | 'down' | 'flat' };
          }),
          warn: ['Stock-level foreign flow is inferred from sector data.', 'Sample data: not a real reading.'],
        } satisfies Radar;
      case 'seasonality':
        return {
          ...head, from: 2016, to: 2025,
          rows: Array.from({ length: 12 }, (_, i) => ({ mo: i + 1, avg: r2((rnd() - 0.45) * 8), up: r2(0.3 + rnd() * 0.5), n: 10 })),
        } satisfies Seasonality;
    }
  }
  if ((m = path.match(/^v\/financials\/PSX\/([A-Z0-9.-]+)\/(annual|quarterly)\.json$/))) {
    const s = find(m[1]!);
    if (!s) return null;
    const rnd = ctx.rand(path);
    const annual = m[2] === 'annual';
    let rv = (s.shares ?? 1000) * 1e6 * s.price * (annual ? 0.9 : 0.24);
    const rows = Array.from({ length: annual ? 6 : 8 }, (_, i) => {
      const pr = rv * (0.08 + rnd() * 0.12);
      const row = { p: annual ? `FY${2026 - i}` : `Q${4 - (i % 4)} ${2026 - Math.floor(i / 4)}`, end: null, rv: Math.round(rv), pr: Math.round(pr), eps: r2(pr / ((s.shares ?? 1000) * 1e6)) };
      rv /= 1 + (rnd() * 0.18 - 0.03);
      return row;
    });
    return { v: 1, s: s.symbol, m: 'PSX', per: annual ? 'annual' : 'quarterly', basis: 'consolidated', cur: 'PKR', rows } satisfies Financials;
  }
  if ((m = path.match(/^v\/news\/PSX\/(_all|[A-Z0-9.-]+)\.json$/))) {
    const one = m[1] === '_all' ? null : find(m[1]!);
    if (m[1] !== '_all' && !one) return null;
    const rnd = ctx.rand(path);
    const pool = one ? [one] : eq;
    return {
      v: 1, m: 'PSX', s: m[1]!,
      rows: Array.from({ length: 8 }, (_, i) => {
        const s = pool[i % pool.length]!;
        return {
          slug: `sample-story-${s.symbol.toLowerCase()}-${i + 1}`, t: `${s.name} sample headline ${i + 1}`,
          sum: i % 3 === 2 ? null : `A short sample summary about ${s.name}. Real summaries are written by Capitalist from several outlets.`,
          out: ['Business Recorder', 'Dawn', 'The News'][i % 3]!, d: t - Math.round((i + rnd()) * 3 * 3600), syms: [s.symbol],
        };
      }),
    } satisfies News;
  }
  if ((m = path.match(/^v\/leaders\/([a-z0-9-]+)\/(1Y|3Y|5Y)\.json$/))) {
    const rnd = ctx.rand(path);
    const label = m[1]!.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
    const rows = Array.from({ length: 10 }, (_, i) => ({
      slug: `sample-${m![1]}-fund-${i + 1}`, n: `Sample ${label} Fund ${i + 1}`, amc: ['Sample AMC', 'Example Investments', 'Demo Capital'][i % 3]!,
      r: r2(40 - i * 3 - rnd() * 2), aum: Math.round((2 + rnd() * 40) * 1e9), sh: i % 2 === 0,
    }));
    return { v: 1, cat: m[1]!, label, p: m[2] as FundLeaders['p'], rows } satisfies FundLeaders;
  }
  if (path === 'v/futures/PSX.json') {
    const rnd = ctx.rand(path);
    return {
      v: 1, m: 'PSX',
      rows: eq.slice(0, 12).flatMap((s) => ['NOV', 'DEC'].map((mo, j) => ({ u: s.symbol, k: `${s.symbol} ${mo}`, p: r2(s.price * (1.004 + j * 0.01)), cp: r2((rnd() - 0.5) * 3), vol: Math.round(rnd() * 2e6), bs: j === 0 ? r2(0.2 + rnd()) : null }))),
    } satisfies Futures;
  }
  if (path === 'v/econ/upcoming.json') {
    const items: Array<[string, string, string]> = [['PKR', 'SBP policy rate decision', 'high'], ['PKR', 'CPI inflation (YoY)', 'high'], ['USD', 'Non-farm payrolls', 'high'], ['USD', 'FOMC statement', 'high'], ['CNY', 'Trade balance', 'medium'], ['EUR', 'ECB rate decision', 'high'], ['PKR', 'Current account balance', 'medium']];
    return { v: 1, rows: items.map(([c, title, i], k) => ({ d: iso(t + (k * 3 + 1) * DAY), at: null, c, t: title, i, f: k % 2 ? '4.2%' : null, prev: '4.0%', a: null })) } satisfies EconCalendar;
  }
  if ((m = path.match(/^v\/macro\/([A-Z0-9._-]+)\.json$/))) {
    const rnd = ctx.rand(path);
    let v = 8;
    const pts: Array<[string, number]> = [];
    for (let i = 119; i >= 0; i -= 1) {
      v = Math.max(1, v + (rnd() - 0.5) * 1.6);
      const d = new Date(Date.UTC(new Date(ctx.now).getUTCFullYear(), new Date(ctx.now).getUTCMonth() - i - 1, 1));
      pts.push([d.toISOString().slice(0, 10), r2(v)]);
    }
    const last = pts[pts.length - 1]!;
    const fc = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(`${last[0]}T00:00:00Z`);
      d.setUTCMonth(d.getUTCMonth() + i + 1);
      return { d: d.toISOString().slice(0, 10), v: r2(last[1] + i * 0.1), lo: r2(last[1] - 0.5 - i * 0.4), hi: r2(last[1] + 0.6 + i * 0.5) };
    });
    return { v: 1, c: m[1]!, n: 'Sample inflation (YoY)', u: 'percent', f: 'M', dec: 1, good: 'down', pts, fc, src: 'Sample data' } satisfies Macro;
  }
  if (path === 'v/commodities.json') {
    const rnd = ctx.rand(path);
    const rows: Array<[string, string, number, string, string]> = [['GC=F', 'Gold', 4120, 'troy ounce', 'USD'], ['SI=F', 'Silver', 51.2, 'troy ounce', 'USD'], ['BZ=F', 'Brent crude', 64.3, 'barrel', 'USD'], ['CL=F', 'WTI crude', 60.1, 'barrel', 'USD'], ['NG=F', 'Natural gas', 4.4, 'MMBtu', 'USD'], ['HG=F', 'Copper', 5.1, 'pound', 'USD'], ['CT=F', 'Cotton', 64.8, 'cents/pound', 'USD']];
    return {
      v: 1, t: t - 1800, rows: rows.map(([s, n, p, u, cur]) => ({ s, n, p, u, cur, cp: r2((rnd() - 0.5) * 3) })),
      fuel: [{ k: 'MS', n: 'Petrol', p: 263.45, d: iso(t - 10 * DAY) }, { k: 'HSD', n: 'High-speed diesel', p: 275.41, d: iso(t - 10 * DAY) }],
    } satisfies Commodities;
  }
  if ((m = path.match(/^v\/screener\/PSX\/([a-z_0-9]+)\.json$/))) {
    const rnd = ctx.rand(path);
    return {
      v: 1, m: 'PSX', p: m[1] as Screen['p'],
      rows: eq.slice(0, 12).map((s, i) => ({ s: s.symbol, n: s.name, sec: s.sector ?? null, px: s.price, cp: r2((rnd() - 0.3) * 6), vol: Math.round(rnd() * 5e6), mc: (s.shares ?? 1000) * 1e6 * s.price, pe: r2(4 + rnd() * 14), r1m: r2((rnd() - 0.3) * 20), sc: 95 - i * 5 })),
    } satisfies Screen;
  }
  if (path === 'v/tax/salaried.json') {
    // Shape example only. The hosted service serves the slabs of the current Finance Act.
    return {
      v: 1, ty: 'sample', src: 'Sample slabs for documentation; not the law.',
      slabs: [
        { from: 0, to: 600_000, base: 0, rate: 0 },
        { from: 600_000, to: 1_200_000, base: 0, rate: 1 },
        { from: 1_200_000, to: 2_200_000, base: 6_000, rate: 11 },
        { from: 2_200_000, to: 3_200_000, base: 116_000, rate: 23 },
        { from: 3_200_000, to: 4_100_000, base: 346_000, rate: 30 },
        { from: 4_100_000, to: null, base: 616_000, rate: 35 },
      ],
      surcharge: { over: 10_000_000, rate: 9 },
    } satisfies TaxSlabs;
  }
  return undefined;
}
