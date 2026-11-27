import {
  isCalendar,
  isFlows,
  isFundCard,
  isFxRates,
  isIndexList,
  isMarketMap,
  isMovers,
  isSeries,
  paths,
  type Calendar,
  type FlowPeriod,
  type Flows,
  type FundCard,
  type FxRates,
  type IndexList,
  type MarketMap,
  type Movers,
  type Series,
  type SeriesRange,
} from '@capitalist-charts/schema/views';

/**
 * Anything a widget can subscribe to: a path under the data root, a runtime check for its shape,
 * and how often it can change.
 */
export interface Resource<T> {
  /** Relative path, e.g. `snap/PSX/_movers.json`. Built only from validated names. */
  path: string;
  guard: (x: unknown) => x is T;
  /** Market whose session decides fast or slow polling (live resources only). */
  market: string | null;
  /** Live (L0) resources follow the poll interval; others refresh every `refreshMs`. */
  live: boolean;
  refreshMs: number;
}

export const MIN = 60_000;

/**
 * A shape check that also requires the response to be about what was asked for. A misrouted
 * cache or a wrong upload can serve HBL's file at OGDC's path; the shape alone would pass and the
 * OGDC widget would show HBL's numbers. A mismatch is treated like any bad response.
 */
export function bound<T>(guard: (x: unknown) => x is T, want: Partial<Record<keyof T, unknown>>, extra?: (x: T) => boolean): (x: unknown) => x is T {
  return (x: unknown): x is T => guard(x) && Object.entries(want).every(([k, v]) => (x as Record<string, unknown>)[k] === v) && (!extra || extra(x));
}

export const live = <T>(path: string, guard: (x: unknown) => x is T, market: string): Resource<T> => ({ path, guard, market, live: true, refreshMs: 0 });
export const view = <T>(path: string, guard: (x: unknown) => x is T, refreshMs: number): Resource<T> => ({ path, guard, market: null, live: false, refreshMs });

/** Resource builders. Each throws on an invalid name before any request is made. */
export const resources = {
  list: (market: string, index: string): Resource<IndexList> => live(paths.list(market, index), bound(isIndexList, { m: market }), market),
  movers: (market: string): Resource<Movers> => live(paths.movers(market), bound(isMovers, { m: market }), market),
  /** The whole market (~50 KB): refreshed every 15 s rather than every poll. */
  map: (market: string): Resource<MarketMap> => view(paths.map(market), bound(isMarketMap, { m: market }), 15_000),
  series: (market: string, symbol: string, range: SeriesRange): Resource<Series> =>
    view(paths.series(market, symbol, range), bound(isSeries, { m: market, s: symbol, r: range }), range === '1D' ? MIN : range === '5D' ? 5 * MIN : 30 * MIN),
  fx: (base: string): Resource<FxRates> => view(paths.fx(base), bound(isFxRates, { base }), 5 * MIN),
  flows: (market: string, period: FlowPeriod): Resource<Flows> => view(paths.flows(market, period), bound(isFlows, { m: market, p: period }), 15 * MIN),
  fund: (slug: string): Resource<FundCard> => view(paths.fund(slug), bound(isFundCard, { slug }), 30 * MIN),
  calendar: (market: string, symbol?: string): Resource<Calendar> => view(paths.calendar(market, symbol), bound(isCalendar, { m: market }, (c) => symbol === undefined || c.items.every((i) => i.s === symbol)), 15 * MIN),
};
