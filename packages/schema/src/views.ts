/**
 * Market-wide snapshots ("L0", rewritten every second) and view models ("L1", ready-to-draw
 * summaries cached for a minute to an hour).
 *
 *   L0  /w/snap/<M>/list/<INDEX>.json      IndexList      constituents of an index, by weight
 *   L0  /w/snap/<M>/_movers.json            Movers         top gainers, losers, most active
 *   L0  /w/snap/<M>/_map.json               MarketMap      every equity by sector with market cap
 *   L1  /w/v/series/<M>/<S>/<RANGE>.json    Series         at most 300 bars for one fixed range
 *   L1  /w/v/fx/<BASE>.json                 FxRates        currency rates against one base
 *   L1  /w/v/flows/<M>/<PERIOD>.json        Flows          foreign and local investor net flows
 *   L1  /w/v/fund/<SLUG>.json               FundCard       one mutual fund: NAV, returns, rank
 *   L1  /w/v/calendar/<M>/upcoming.json     Calendar       corporate events in the next 30 days
 *   L1  /w/v/calendar/<M>/sym/<S>.json      Calendar       one company's recent and next events
 *
 * Every L1 file is bounded (at most 300 points, a few dozen rows) and every URL is a fixed path:
 * there are no date ranges or page numbers, so the widget feed is never a way to pull history.
 */
import { MARKET_PATTERN, SNAPSHOT_VERSION, SYMBOL_PATTERN } from './base.js';

/** A quote inside a list file: the per-symbol fields without `v` and `m`. */
export interface CompactQuote {
  s: string;
  n: string;
  k: string;
  p: number;
  c: number | null;
  cp: number | null;
  vol: number | null;
  t: number;
  d: number;
  st: boolean;
  ts?: string;
  /** Weight in the index, percent (index lists only, when known). */
  w?: number;
}

export interface IndexList {
  v: typeof SNAPSHOT_VERSION;
  m: string;
  name: string;
  items: CompactQuote[];
}

export interface Movers {
  v: typeof SNAPSHOT_VERSION;
  m: string;
  gainers: CompactQuote[];
  losers: CompactQuote[];
  active: CompactQuote[];
}

export interface MarketMapItem {
  s: string;
  n: string;
  /** Market cap at the current price, in the market's currency. */
  mc: number;
  p: number;
  cp: number | null;
  st: boolean;
}

export interface MarketMap {
  v: typeof SNAPSHOT_VERSION;
  m: string;
  sectors: Array<{ n: string; items: MarketMapItem[] }>;
}

/* ---------- L1 view models ---------- */

export const SERIES_RANGES = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y'] as const;
export type SeriesRange = (typeof SERIES_RANGES)[number];

/** Bar: [time (epoch s), open, high, low, close, volume or null]. */
export type Bar = [number, number, number, number, number, number | null];

export interface Series {
  v: typeof SNAPSHOT_VERSION;
  s: string;
  m: string;
  r: SeriesRange;
  /** Bar interval, e.g. `5m`, `1h`, `1d`, `1w`. */
  i: string;
  /** Previous session close (for the 1D baseline), when known. */
  pc: number | null;
  b: Bar[];
}

export interface FxRates {
  v: typeof SNAPSHOT_VERSION;
  /** Rates are quoted as units of `base` per one unit of each currency (e.g. PKR per USD). */
  base: string;
  /** When the rates were set, epoch seconds. */
  t: number;
  rates: Array<{ c: string; n: string; r: number; cp: number | null }>;
}

export const FLOW_PERIODS = ['1D', '1W', '1M'] as const;
export type FlowPeriod = (typeof FLOW_PERIODS)[number];

export interface Flows {
  v: typeof SNAPSHOT_VERSION;
  m: string;
  p: FlowPeriod;
  /** First and last trading day covered, `YYYY-MM-DD`. */
  from: string;
  to: string;
  /** Currency of `net`, e.g. `USD`. */
  unit: string;
  /**
   * Net buying (+) or selling (−) by investor type. `k` is stable, `n` is the display label, `g`
   * says whether the type is foreign or local (foreign nets mirror local ones day by day, so the two
   * groups are shown side by side, never summed).
   */
  types: Array<{ k: string; n: string; g: 'foreign' | 'local'; net: number }>;
  /** Net foreign flow by sector, largest absolute first (at most 20). */
  sectors: Array<{ n: string; net: number }>;
}

export const FUND_RETURN_PERIODS = ['1M', '3M', '6M', 'YTD', '1Y', '3Y'] as const;

export interface FundCard {
  v: typeof SNAPSHOT_VERSION;
  slug: string;
  n: string;
  /** Asset management company. */
  amc: string;
  /** Category, e.g. `Equity`, `Money Market`. */
  cat: string;
  shariah: boolean;
  nav: number;
  /** NAV date, `YYYY-MM-DD`. */
  navDate: string;
  /** Returns in percent by period; null when the fund is too young or the figure is unknown. */
  r: Partial<Record<(typeof FUND_RETURN_PERIODS)[number], number | null>>;
  /** NAV over the last year: [epoch s, NAV], at most 300 points. */
  spark: Array<[number, number]>;
  /** Rank by 1-year return within the category (1 = best). */
  rank: { pos: number; of: number } | null;
  /** Assets under management in PKR, when known. */
  aum: number | null;
}

/** Corporate event kinds: Dividend, Bonus, Right, Split, rEsults, Agm/meeting. */
export const EVENT_TYPES = ['D', 'B', 'R', 'S', 'E', 'A'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface Calendar {
  v: typeof SNAPSHOT_VERSION;
  m: string;
  /** Event date `YYYY-MM-DD`, type, symbol, company name, and a short detail like `Rs 8.00` or `10%`. */
  items: Array<{ d: string; e: EventType; s: string; n: string; x: string }>;
}

/* ---------- Paths ---------- */

export const FUND_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/;
export const CURRENCY_PATTERN = /^[A-Z]{3}$/;

const need = (ok: boolean, what: string) => {
  if (!ok) throw new Error(`Invalid ${what}`);
};

/** Builds the relative path of every resource. Throws on anything that is not a valid name. */
export const paths = {
  quote: (m: string, s: string) => (need(MARKET_PATTERN.test(m) && SYMBOL_PATTERN.test(s), 'symbol'), `snap/${m}/${s}.json`),
  status: (m: string) => (need(MARKET_PATTERN.test(m), 'market'), `snap/${m}/_status.json`),
  index: (m: string) => (need(MARKET_PATTERN.test(m), 'market'), `snap/${m}/_index.json`),
  list: (m: string, index: string) => (need(MARKET_PATTERN.test(m) && SYMBOL_PATTERN.test(index), 'index'), `snap/${m}/list/${index}.json`),
  movers: (m: string) => (need(MARKET_PATTERN.test(m), 'market'), `snap/${m}/_movers.json`),
  map: (m: string) => (need(MARKET_PATTERN.test(m), 'market'), `snap/${m}/_map.json`),
  series: (m: string, s: string, r: SeriesRange) =>
    (need(MARKET_PATTERN.test(m) && SYMBOL_PATTERN.test(s) && (SERIES_RANGES as readonly string[]).includes(r), 'series'), `v/series/${m}/${s}/${r}.json`),
  fx: (base: string) => (need(CURRENCY_PATTERN.test(base), 'currency'), `v/fx/${base}.json`),
  flows: (m: string, p: FlowPeriod) => (need(MARKET_PATTERN.test(m) && (FLOW_PERIODS as readonly string[]).includes(p), 'flow period'), `v/flows/${m}/${p}.json`),
  fund: (slug: string) => (need(FUND_SLUG_PATTERN.test(slug), 'fund'), `v/fund/${slug}.json`),
  calendar: (m: string, s?: string) =>
    s === undefined
      ? (need(MARKET_PATTERN.test(m), 'market'), `v/calendar/${m}/upcoming.json`)
      : (need(MARKET_PATTERN.test(m) && SYMBOL_PATTERN.test(s), 'symbol'), `v/calendar/${m}/sym/${s}.json`),
};

/* ---------- Guards ---------- */

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isNumOrNull = (x: unknown) => x === null || isNum(x);
const isStr = (x: unknown, max = 200): x is string => typeof x === 'string' && x.length <= max;
const isDate = (x: unknown): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x);
const arr = (x: unknown, max: number, item: (i: unknown) => boolean) => Array.isArray(x) && x.length <= max && x.every(item);
const head = (x: Record<string, unknown>) => x.v === SNAPSHOT_VERSION;

export function isCompactQuote(x: unknown): x is CompactQuote {
  return (
    isObj(x) && isStr(x.s, 16) && SYMBOL_PATTERN.test(x.s) && isStr(x.n) && isStr(x.k, 20) && isNum(x.p) && isNumOrNull(x.c) && isNumOrNull(x.cp) &&
    isNumOrNull(x.vol) && isNum(x.t) && isNum(x.d) && typeof x.st === 'boolean' && (x.ts === undefined || isStr(x.ts, 40)) && (x.w === undefined || isNum(x.w))
  );
}

export function isIndexList(x: unknown): x is IndexList {
  return isObj(x) && head(x) && isStr(x.m, 10) && isStr(x.name, 16) && arr(x.items, 600, isCompactQuote);
}

export function isMovers(x: unknown): x is Movers {
  return isObj(x) && head(x) && isStr(x.m, 10) && arr(x.gainers, 50, isCompactQuote) && arr(x.losers, 50, isCompactQuote) && arr(x.active, 50, isCompactQuote);
}

const isMapItem = (x: unknown) => isObj(x) && typeof x.s === 'string' && SYMBOL_PATTERN.test(x.s) && isStr(x.n) && isNum(x.mc) && isNum(x.p) && isNumOrNull(x.cp) && typeof x.st === 'boolean';
export function isMarketMap(x: unknown): x is MarketMap {
  return isObj(x) && head(x) && isStr(x.m, 10) && arr(x.sectors, 60, (s) => isObj(s) && isStr(s.n, 80) && arr(s.items, 1000, isMapItem));
}

const isBar = (b: unknown) => Array.isArray(b) && b.length === 6 && b.slice(0, 5).every(isNum) && isNumOrNull(b[5]);
export function isSeries(x: unknown): x is Series {
  return (
    isObj(x) && head(x) && isStr(x.s, 16) && isStr(x.m, 10) && (SERIES_RANGES as readonly unknown[]).includes(x.r) && isStr(x.i, 8) && isNumOrNull(x.pc) &&
    arr(x.b, 300, isBar)
  );
}

export function isFxRates(x: unknown): x is FxRates {
  return isObj(x) && head(x) && isStr(x.base, 3) && isNum(x.t) && arr(x.rates, 60, (r) => isObj(r) && isStr(r.c, 3) && isStr(r.n, 60) && isNum(r.r) && r.r > 0 && isNumOrNull(r.cp));
}

export function isFlows(x: unknown): x is Flows {
  return (
    isObj(x) && head(x) && isStr(x.m, 10) && (FLOW_PERIODS as readonly unknown[]).includes(x.p) && isDate(x.from) && isDate(x.to) && isStr(x.unit, 3) &&
    arr(x.types, 20, (t) => isObj(t) && isStr(t.k, 40) && isStr(t.n, 60) && (t.g === 'foreign' || t.g === 'local') && isNum(t.net)) && arr(x.sectors, 20, (s) => isObj(s) && isStr(s.n, 80) && isNum(s.net))
  );
}

export function isFundCard(x: unknown): x is FundCard {
  if (!isObj(x) || !head(x)) return false;
  const r = x.r;
  const rank = x.rank;
  return (
    isStr(x.slug, 80) && isStr(x.n) && isStr(x.amc) && isStr(x.cat, 80) && typeof x.shariah === 'boolean' && isNum(x.nav) && isDate(x.navDate) &&
    isObj(r) && Object.entries(r).every(([k, v]) => (FUND_RETURN_PERIODS as readonly string[]).includes(k) && isNumOrNull(v)) &&
    arr(x.spark, 300, (p) => Array.isArray(p) && p.length === 2 && isNum(p[0]) && isNum(p[1])) &&
    (rank === null || (isObj(rank) && isNum(rank.pos) && isNum(rank.of))) && isNumOrNull(x.aum)
  );
}

export function isCalendar(x: unknown): x is Calendar {
  return (
    isObj(x) && head(x) && isStr(x.m, 10) &&
    arr(x.items, 60, (i) => isObj(i) && isDate(i.d) && (EVENT_TYPES as readonly unknown[]).includes(i.e) && isStr(i.s, 16) && isStr(i.n) && isStr(i.x, 80))
  );
}
