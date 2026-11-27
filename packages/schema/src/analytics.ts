/**
 * Analytics view models ("L1") for the company, fund, news, economy and tools widgets. Same rules
 * as views.ts: fixed paths, bounded rows, no date ranges or paging.
 *
 *   /w/v/profile/<M>/<S>.json              Profile        company profile and Shariah status
 *   /w/v/valuation/<M>/<S>.json            Valuation      ratios against the sector median and peers
 *   /w/v/financials/<M>/<S>/<annual|quarterly>.json  Financials  revenue, profit, EPS by fiscal period
 *   /w/v/dividends/<M>/<S>.json            Dividends      payout history, yield, next ex-date
 *   /w/v/insiders/<M>/<S>.json             Insiders       recent director and officer trades
 *   /w/v/radar/<M>/<S>.json                Radar          the Capitalist Radar read with its drivers
 *   /w/v/seasonality/<M>/<S>.json          Seasonality    average return per calendar month
 *   /w/v/news/<M>/<_all|S>.json            News           latest stories with Capitalist's summary
 *   /w/v/leaders/<CATEGORY>/<1Y|3Y|5Y>.json FundLeaders   best funds in a category
 *   /w/v/futures/<M>.json                  Futures        futures board with basis
 *   /w/v/econ/upcoming.json                EconCalendar   upcoming economic releases
 *   /w/v/macro/<CODE>.json                 Macro          one indicator: history and forecast
 *   /w/v/commodities.json                  Commodities    market commodities and Pakistan fuel prices
 *   /w/v/screener/<M>/<PRESET>.json        Screen         a preset screen's top rows
 *   /w/v/tax/salaried.json                 TaxSlabs       the current salaried income-tax slabs
 */
import { MARKET_PATTERN, SNAPSHOT_VERSION, SYMBOL_PATTERN } from './base.js';

type V = typeof SNAPSHOT_VERSION;
type N = number | null;

export interface Profile {
  v: V;
  s: string;
  m: string;
  n: string;
  /** Sector, industry and business description (description at most 1,200 characters). */
  sec: string | null;
  ind: string | null;
  desc: string | null;
  /** Listed shares, free-float shares and percent, market cap (PKR), face value, fiscal year end (e.g. `June`). */
  sh: N;
  ff: N;
  ffp: N;
  mc: N;
  fv: N;
  fye: string | null;
  /** Shariah status: compliant flag, who classified it and since when (`YYYY-MM-DD`). */
  shariah: { ok: boolean; src: string | null; eff: string | null } | null;
}

export interface Ratios {
  pe: N;
  pb: N;
  dy: N;
  ev: N;
  roe: N;
  nm: N;
}

export interface Valuation {
  v: V;
  s: string;
  m: string;
  sec: string | null;
  /** Date the ratios were computed, `YYYY-MM-DD`. */
  as: string;
  r: Ratios;
  /** Sector-cohort medians (the company included). */
  med: Ratios;
  /** Sector peers by market cap, at most 10. */
  peers: Array<{ s: string; n: string; mc: N } & Ratios>;
}

export interface Financials {
  v: V;
  s: string;
  m: string;
  per: 'annual' | 'quarterly';
  /** `consolidated` or `unconsolidated`. */
  basis: string;
  /** Figures are in this currency, not scaled (e.g. 12_300_000_000 for Rs 12.3 bn). */
  cur: string;
  /** Fiscal period labels as published: a June-year company's `Q1 2026` is Jul-Sep 2025. */
  rows: Array<{ p: string; end: string | null; rv: N; pr: N; eps: N }>;
}

export interface Dividends {
  v: V;
  s: string;
  m: string;
  /** Trailing dividend yield, percent. */
  y: N;
  /** Next announced entitlement, if any. */
  next: { d: string; x: string } | null;
  /** Payouts, newest first, at most 20. `dp` is percent of face value, `dps` rupees per share. */
  rows: Array<{ d: string; dp: N; dps: N; bonus: N; right: N; p: string | null }>;
}

export interface Insiders {
  v: V;
  s: string;
  m: string;
  /** Net shares bought (+) or sold (−) by insiders over 90 and 365 days. */
  net90: N;
  net365: N;
  /** Newest first, at most 20. `side` is `buy` or `sell`; `q` shares; `px` rupees. */
  rows: Array<{ d: string; who: string; role: string | null; side: 'buy' | 'sell' | 'other'; q: N; px: N }>;
}

export interface Radar {
  v: V;
  s: string;
  m: string;
  as: string;
  /** The read (e.g. `Attractive`, `Watch`, `Risk elevated`), horizon text, confidence 0-1. */
  d: string;
  hz: string | null;
  cf: N;
  /** Expected range over the horizon, in price. */
  lo: N;
  hi: N;
  /**
   * Each layer's net push on the read: signed and unbounded (most fall within ±2), so it is drawn
   * against the largest one rather than a fixed scale. At most 8.
   */
  drv: Array<{ l: string; sc: N; dir: 'up' | 'down' | 'flat' }>;
  /** What is missing or inferred (shown, never hidden). At most 6. */
  warn: string[];
}

export interface Seasonality {
  v: V;
  s: string;
  m: string;
  /** Twelve rows, January first: average return %, share of positive years (0-1), years counted. */
  rows: Array<{ mo: number; avg: N; up: N; n: number }>;
  /** First and last year included. */
  from: number;
  to: number;
}

export interface News {
  v: V;
  m: string;
  /** Symbol, or `_all` for market-wide. */
  s: string;
  /** Newest first, at most 20. `slug` builds the capitalist.pk story link; `sum` is Capitalist's summary when ready. */
  rows: Array<{ slug: string; t: string; sum: string | null; out: string | null; d: number; syms: string[] }>;
}

export const LEADER_PERIODS = ['1Y', '3Y', '5Y'] as const;
export type LeaderPeriod = (typeof LEADER_PERIODS)[number];

export interface FundLeaders {
  v: V;
  /** Category slug and label, e.g. `equity` / `Equity`. */
  cat: string;
  label: string;
  p: LeaderPeriod;
  /** Best first, at most 20. Returns are annualised percent. */
  rows: Array<{ slug: string; n: string; amc: string | null; r: number; aum: N; sh: boolean }>;
}

export interface Futures {
  v: V;
  m: string;
  /** At most 40 contracts, most traded first. `bs` = basis vs spot, percent (front contract only). */
  rows: Array<{ u: string; k: string; p: N; cp: N; vol: N; bs: N }>;
}

export interface EconCalendar {
  v: V;
  /** Upcoming releases, soonest first, at most 40. `i` impact: low, medium, high. */
  rows: Array<{ d: string; at: number | null; c: string; t: string; i: string | null; f: string | null; prev: string | null; a: string | null }>;
}

export interface Macro {
  v: V;
  c: string;
  n: string;
  /** Unit text (e.g. `percent`), frequency (`M`, `Q`, `A`), decimals, which direction is good. */
  u: string;
  f: string;
  dec: number;
  good: 'up' | 'down' | null;
  /** At most 300 points: [period start `YYYY-MM-DD`, value]. */
  pts: Array<[string, number]>;
  /** Forecast fan, at most 12 points. */
  fc: Array<{ d: string; v: number; lo: N; hi: N }>;
  src: string | null;
}

export interface Commodities {
  v: V;
  t: number;
  /** At most 30 market commodities. */
  rows: Array<{ s: string; n: string; p: number; u: string | null; cur: string; cp: N }>;
  /** Pakistan retail fuel prices, PKR per litre, and the date they took effect. */
  fuel: Array<{ k: string; n: string; p: number; d: string }>;
}

export const SCREEN_PRESETS = ['momentum', 'breakouts', 'unusual_volume', 'relative_strength', 'near_52_week', 'reversals'] as const;
export type ScreenPreset = (typeof SCREEN_PRESETS)[number];

export interface Screen {
  v: V;
  m: string;
  p: ScreenPreset;
  /** At most 20 rows, best match first. */
  rows: Array<{ s: string; n: string; sec: string | null; px: N; cp: N; vol: N; mc: N; pe: N; r1m: N; sc: N }>;
}

export interface TaxSlabs {
  v: V;
  /** Tax year label, e.g. `2027` (Pakistan names a tax year by the year it ends in). */
  ty: string;
  /** Annual taxable income bands: tax = base + rate% × (income − from). `to` null = no upper bound. */
  slabs: Array<{ from: number; to: number | null; base: number; rate: number }>;
  /** Surcharge on the computed tax above an income threshold, if any. */
  surcharge: { over: number; rate: number } | null;
  /** Where the slabs come from (Finance Act reference). */
  src: string;
}

/* ---------- Paths ---------- */

export const CATEGORY_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/;
export const MACRO_CODE_PATTERN = /^[A-Z0-9][A-Z0-9._-]{0,39}$/;

const need = (ok: boolean, what: string) => {
  if (!ok) throw new Error(`Invalid ${what}`);
};
const sym = (m: string, s: string, kind: string) => (need(MARKET_PATTERN.test(m) && SYMBOL_PATTERN.test(s), 'symbol'), `v/${kind}/${m}/${s}.json`);

export const analyticsPaths = {
  profile: (m: string, s: string) => sym(m, s, 'profile'),
  valuation: (m: string, s: string) => sym(m, s, 'valuation'),
  financials: (m: string, s: string, per: 'annual' | 'quarterly') =>
    (need(MARKET_PATTERN.test(m) && SYMBOL_PATTERN.test(s) && (per === 'annual' || per === 'quarterly'), 'financials'), `v/financials/${m}/${s}/${per}.json`),
  dividends: (m: string, s: string) => sym(m, s, 'dividends'),
  insiders: (m: string, s: string) => sym(m, s, 'insiders'),
  radar: (m: string, s: string) => sym(m, s, 'radar'),
  seasonality: (m: string, s: string) => sym(m, s, 'seasonality'),
  news: (m: string, s?: string) => (s === undefined ? (need(MARKET_PATTERN.test(m), 'market'), `v/news/${m}/_all.json`) : sym(m, s, 'news')),
  leaders: (cat: string, p: LeaderPeriod) => (need(CATEGORY_PATTERN.test(cat) && (LEADER_PERIODS as readonly string[]).includes(p), 'category'), `v/leaders/${cat}/${p}.json`),
  futures: (m: string) => (need(MARKET_PATTERN.test(m), 'market'), `v/futures/${m}.json`),
  econ: () => 'v/econ/upcoming.json',
  macro: (code: string) => (need(MACRO_CODE_PATTERN.test(code), 'indicator'), `v/macro/${code}.json`),
  commodities: () => 'v/commodities.json',
  screener: (m: string, p: ScreenPreset) => (need(MARKET_PATTERN.test(m) && (SCREEN_PRESETS as readonly string[]).includes(p), 'screen'), `v/screener/${m}/${p}.json`),
  tax: () => 'v/tax/salaried.json',
};

/* ---------- Guards ---------- */

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const nn = (x: unknown) => x === null || isNum(x);
const str = (x: unknown, max = 200): x is string => typeof x === 'string' && x.length <= max;
const sn = (x: unknown, max = 200) => x === null || str(x, max);
const date = (x: unknown): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x);
const arr = (x: unknown, max: number, item: (i: unknown) => boolean) => Array.isArray(x) && x.length <= max && x.every(item);
const head = (x: Record<string, unknown>) => x.v === SNAPSHOT_VERSION;
const symHead = (x: Record<string, unknown>) => head(x) && str(x.s, 16) && SYMBOL_PATTERN.test(x.s) && str(x.m, 10);
const ratios = (x: unknown) => isObj(x) && ['pe', 'pb', 'dy', 'ev', 'roe', 'nm'].every((k) => nn(x[k]));

export function isProfile(x: unknown): x is Profile {
  if (!isObj(x) || !symHead(x)) return false;
  const sh = x.shariah;
  return (
    str(x.n) && sn(x.sec, 100) && sn(x.ind, 100) && sn(x.desc, 1200) && ['sh', 'ff', 'ffp', 'mc', 'fv'].every((k) => nn(x[k])) && sn(x.fye, 20) &&
    (sh === null || (isObj(sh) && typeof sh.ok === 'boolean' && sn(sh.src, 60) && (sh.eff === null || date(sh.eff))))
  );
}

export function isValuation(x: unknown): x is Valuation {
  return isObj(x) && symHead(x) && sn(x.sec, 100) && date(x.as) && ratios(x.r) && ratios(x.med) && arr(x.peers, 10, (p) => ratios(p) && isObj(p) && str(p.s, 16) && str(p.n) && nn(p.mc));
}

export function isFinancials(x: unknown): x is Financials {
  return (
    isObj(x) && symHead(x) && (x.per === 'annual' || x.per === 'quarterly') && str(x.basis, 20) && str(x.cur, 3) &&
    arr(x.rows, 12, (r) => isObj(r) && str(r.p, 30) && (r.end === null || date(r.end)) && nn(r.rv) && nn(r.pr) && nn(r.eps))
  );
}

export function isDividends(x: unknown): x is Dividends {
  const next = isObj(x) ? x.next : undefined;
  return (
    isObj(x) && symHead(x) && nn(x.y) && (next === null || (isObj(next) && date(next.d) && str(next.x, 80))) &&
    arr(x.rows, 20, (r) => isObj(r) && date(r.d) && nn(r.dp) && nn(r.dps) && nn(r.bonus) && nn(r.right) && sn(r.p, 30))
  );
}

export function isInsiders(x: unknown): x is Insiders {
  return (
    isObj(x) && symHead(x) && nn(x.net90) && nn(x.net365) &&
    arr(x.rows, 20, (r) => isObj(r) && date(r.d) && str(r.who) && sn(r.role, 120) && (r.side === 'buy' || r.side === 'sell' || r.side === 'other') && nn(r.q) && nn(r.px))
  );
}

export function isRadar(x: unknown): x is Radar {
  return (
    isObj(x) && symHead(x) && date(x.as) && str(x.d, 40) && sn(x.hz, 60) && nn(x.cf) && nn(x.lo) && nn(x.hi) &&
    arr(x.drv, 8, (d) => isObj(d) && str(d.l, 60) && nn(d.sc) && (d.dir === 'up' || d.dir === 'down' || d.dir === 'flat')) && arr(x.warn, 6, (w) => str(w, 160))
  );
}

export function isSeasonality(x: unknown): x is Seasonality {
  return (
    isObj(x) && symHead(x) && isNum(x.from) && isNum(x.to) &&
    arr(x.rows, 12, (r) => isObj(r) && isNum(r.mo) && r.mo >= 1 && r.mo <= 12 && nn(r.avg) && nn(r.up) && isNum(r.n))
  );
}

export function isNews(x: unknown): x is News {
  return (
    isObj(x) && head(x) && str(x.m, 10) && str(x.s, 16) &&
    arr(x.rows, 20, (r) => isObj(r) && str(r.slug, 160) && /^[a-z0-9][a-z0-9-]*$/.test(r.slug as string) && str(r.t, 300) && sn(r.sum, 1200) && sn(r.out, 80) && isNum(r.d) && arr(r.syms, 10, (s) => str(s, 16) && SYMBOL_PATTERN.test(s as string)))
  );
}

export function isFundLeaders(x: unknown): x is FundLeaders {
  return (
    isObj(x) && head(x) && str(x.cat, 40) && str(x.label, 80) && (LEADER_PERIODS as readonly unknown[]).includes(x.p) &&
    arr(x.rows, 20, (r) => isObj(r) && str(r.slug, 80) && str(r.n) && sn(r.amc, 120) && isNum(r.r) && nn(r.aum) && typeof r.sh === 'boolean')
  );
}

export function isFutures(x: unknown): x is Futures {
  return isObj(x) && head(x) && str(x.m, 10) && arr(x.rows, 40, (r) => isObj(r) && str(r.u, 16) && str(r.k, 40) && nn(r.p) && nn(r.cp) && nn(r.vol) && nn(r.bs));
}

export function isEconCalendar(x: unknown): x is EconCalendar {
  return (
    isObj(x) && head(x) &&
    arr(x.rows, 40, (r) => isObj(r) && date(r.d) && nn(r.at) && str(r.c, 8) && str(r.t, 160) && sn(r.i, 10) && sn(r.f, 30) && sn(r.prev, 30) && sn(r.a, 30))
  );
}

export function isMacro(x: unknown): x is Macro {
  return (
    isObj(x) && head(x) && str(x.c, 40) && str(x.n) && str(x.u, 40) && str(x.f, 4) && Number.isInteger(x.dec) && (x.dec as number) >= 0 && (x.dec as number) <= 6 && (x.good === 'up' || x.good === 'down' || x.good === null) &&
    arr(x.pts, 300, (p) => Array.isArray(p) && p.length === 2 && date(p[0]) && isNum(p[1])) &&
    arr(x.fc, 12, (f) => isObj(f) && date(f.d) && isNum(f.v) && nn(f.lo) && nn(f.hi)) && sn(x.src, 120)
  );
}

export function isCommodities(x: unknown): x is Commodities {
  return (
    isObj(x) && head(x) && isNum(x.t) &&
    arr(x.rows, 30, (r) => isObj(r) && str(r.s, 20) && str(r.n, 80) && isNum(r.p) && sn(r.u, 30) && str(r.cur, 3) && nn(r.cp)) &&
    arr(x.fuel, 10, (f) => isObj(f) && str(f.k, 20) && str(f.n, 60) && isNum(f.p) && date(f.d))
  );
}

export function isScreen(x: unknown): x is Screen {
  return (
    isObj(x) && head(x) && str(x.m, 10) && (SCREEN_PRESETS as readonly unknown[]).includes(x.p) &&
    arr(x.rows, 20, (r) => isObj(r) && str(r.s, 16) && str(r.n) && sn(r.sec, 100) && ['px', 'cp', 'vol', 'mc', 'pe', 'r1m', 'sc'].every((k) => nn(r[k])))
  );
}

export function isTaxSlabs(x: unknown): x is TaxSlabs {
  const sc = isObj(x) ? x.surcharge : undefined;
  return (
    isObj(x) && head(x) && str(x.ty, 10) && str(x.src, 200) &&
    arr(x.slabs, 20, (s) => isObj(s) && isNum(s.from) && (s.to === null || isNum(s.to)) && isNum(s.base) && isNum(s.rate)) &&
    (sc === null || (isObj(sc) && isNum(sc.over) && isNum(sc.rate)))
  );
}
