/**
 * Wire types for Capitalist Charts widget data.
 *
 * The hosted data service publishes these as static JSON files under `https://capitalist.pk/w/`:
 *
 *   /w/config.json                     WidgetConfig       (edge cache 60 s)
 *   /w/snap/<MARKET>/_status.json      MarketStatus       (edge cache 2 s)
 *   /w/snap/<MARKET>/_index.json       SymbolIndex        (edge cache 2 s)
 *   /w/snap/<MARKET>/<SYMBOL>.json     QuoteSnapshot      (edge cache 2 s; 404 until first quoted)
 *
 * Keys are short because thousands of widgets poll these files. Any data source that serves the same
 * shapes works with the widgets (see `DataAdapter` in @capitalist-charts/core).
 */

export const SNAPSHOT_VERSION = 1 as const;

/** One symbol's current price. Public "L0" data: what any visitor sees on a quote page. */
export interface QuoteSnapshot {
  v: typeof SNAPSHOT_VERSION;
  /** Symbol, e.g. `OGDC`. */
  s: string;
  /** Market, e.g. `PSX`. */
  m: string;
  /** Display name. */
  n: string;
  /** Kind: `equity`, `etf` or `index`. */
  k: string;
  /** Last price, or the level for an index. */
  p: number;
  /** Change and change percent against the previous close (null when unknown). */
  c: number | null;
  cp: number | null;
  /** Session volume (null when the source reports none). */
  vol: number | null;
  /** When the price was set at the exchange, epoch seconds. */
  t: number;
  /** Seconds the source lags the exchange; 0 means live. */
  d: number;
  /** The source stopped reporting this symbol; `p` is the last price seen. */
  st: boolean;
  /** Trading status when not active, e.g. `suspended`. */
  ts?: string;
}

/** Feed health and session state for one market. */
export interface MarketStatus {
  v: typeof SNAPSHOT_VERSION;
  m: string;
  /** When the publisher last wrote, epoch seconds. If this stops moving, data is stale. */
  pub: number;
  /** Inside the regular session by the clock (holidays show up as `feed: 'down'`). */
  open: boolean;
  feed: 'live' | 'partial' | 'down';
  symbols: number;
  live: number;
  /** Equities and ETFs up, down and unchanged on the session (absent from older publishers). */
  advancers?: number;
  decliners?: number;
  unchanged?: number;
}

export interface SymbolIndex {
  v: typeof SNAPSHOT_VERSION;
  m: string;
  items: Array<{ s: string; n: string; k: string }>;
}

/** Switches every loader reads. Operators change these without a release. */
export interface WidgetConfig {
  v: typeof SNAPSHOT_VERSION;
  /** Poll interval while the market is open and the page is visible. */
  pollMs: number;
  /** Degradation level, 1 (normal) to 5 (severe). */
  level: number;
  /** Widget tags switched off, e.g. `cap-market-map`. */
  disabled: string[];
  /** Host names whose embeds show a notice instead of data. */
  blockedDomains: string[];
  /** Fraction of eligible page loads that send the privacy-limited impression beacon. */
  beaconRate?: number;
}

/** Symbol pattern accepted in URLs. Anything else is never requested. */
export const SYMBOL_PATTERN = /^[A-Z0-9][A-Z0-9.-]{0,15}$/;
export const MARKET_PATTERN = /^[A-Z][A-Z-]{1,9}$/;

/** `PSX:OGDC` -> { market: 'PSX', symbol: 'OGDC' }; a bare symbol defaults to `PSX`. */
export function parseSymbolRef(ref: string, defaultMarket = 'PSX'): { market: string; symbol: string } | null {
  const raw = ref.trim().toUpperCase();
  if (!raw) return null;
  const [a, b] = raw.includes(':') ? raw.split(':', 2) : [defaultMarket, raw];
  const market = (a ?? '').replace(/\s+/g, '');
  const symbol = (b ?? '').replace(/\s+/g, '');
  if (!MARKET_PATTERN.test(market) || !SYMBOL_PATTERN.test(symbol)) return null;
  return { market, symbol };
}

/* ---------- Runtime validation at the network boundary ----------
 * Remote JSON is never trusted as typed: a malformed file must produce a controlled error, not a
 * widget that throws while rendering on someone else's page.
 */

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isNumOrNull = (x: unknown) => x === null || isNum(x);
const isStr = (x: unknown, max = 200): x is string => typeof x === 'string' && x.length <= max;

export function isQuoteSnapshot(x: unknown): x is QuoteSnapshot {
  return (
    isObj(x) && x.v === SNAPSHOT_VERSION && isStr(x.s, 16) && SYMBOL_PATTERN.test(x.s) && isStr(x.m, 10) && isStr(x.n) && isStr(x.k, 20) &&
    isNum(x.p) && isNumOrNull(x.c) && isNumOrNull(x.cp) && isNumOrNull(x.vol) && isNum(x.t) && isNum(x.d) && typeof x.st === 'boolean' &&
    (x.ts === undefined || isStr(x.ts, 40))
  );
}

export function isMarketStatus(x: unknown): x is MarketStatus {
  return (
    isObj(x) && x.v === SNAPSHOT_VERSION && isStr(x.m, 10) && isNum(x.pub) && typeof x.open === 'boolean' &&
    (x.feed === 'live' || x.feed === 'partial' || x.feed === 'down') && isNum(x.symbols) && isNum(x.live) &&
    [x.advancers, x.decliners, x.unchanged].every((n) => n === undefined || isNum(n))
  );
}

export function isSymbolIndex(x: unknown): x is SymbolIndex {
  return isObj(x) && x.v === SNAPSHOT_VERSION && isStr(x.m, 10) && Array.isArray(x.items) && x.items.every((i) => isObj(i) && isStr(i.s, 16) && isStr(i.n) && isStr(i.k, 20));
}

/** Coerces any value to a safe config: unknown or malformed fields fall back to defaults. */
export function normaliseConfig(x: unknown): WidgetConfig {
  const o = isObj(x) ? x : {};
  const strs = (a: unknown, re: RegExp) => (Array.isArray(a) ? a.filter((s): s is string => typeof s === 'string' && re.test(s)).slice(0, 200) : []);
  const config: WidgetConfig = {
    v: SNAPSHOT_VERSION,
    pollMs: isNum(o.pollMs) && o.pollMs >= 1000 && o.pollMs <= 120_000 ? o.pollMs : 2000,
    level: isNum(o.level) && Number.isInteger(o.level) && o.level >= 1 && o.level <= 5 ? o.level : 1,
    disabled: strs(o.disabled, /^cap-[a-z0-9-]{1,40}$/),
    blockedDomains: strs(o.blockedDomains, /^[a-z0-9.-]{1,253}$/),
  };
  if (isNum(o.beaconRate) && o.beaconRate >= 0 && o.beaconRate <= 1) config.beaconRate = o.beaconRate;
  return config;
}

/**
 * Degradation levels (set by the operator in config): how often widgets poll.
 * 1 normal, 2 load (x2.5), 3 shed analytics (x2.5, analytics widgets pause), 4 origin trouble (x5),
 * 5 severe (x30, about once a minute).
 */
export function pollIntervalFor(config: WidgetConfig): number {
  const factor = [1, 1, 2.5, 2.5, 5, 30][config.level] ?? 1;
  return Math.min(120_000, Math.round(config.pollMs * factor));
}
