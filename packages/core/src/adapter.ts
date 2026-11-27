import type { MarketStatus, QuoteSnapshot, SymbolIndex, WidgetConfig } from '@capitalist-charts/schema/base';

/**
 * Where widgets get data. The hosted Capitalist service is one implementation; bring your own by
 * serving the same shapes (static files work) or implementing this interface.
 */
export interface DataAdapter {
  /** The current quote, or null when the source does not know the symbol. Throws on other failures. */
  quote(market: string, symbol: string, signal?: AbortSignal): Promise<QuoteSnapshot | null>;
  status(market: string, signal?: AbortSignal): Promise<MarketStatus | null>;
  index(market: string, signal?: AbortSignal): Promise<SymbolIndex | null>;
  config(signal?: AbortSignal): Promise<WidgetConfig>;
  /**
   * Raw JSON at a relative path under the data root (see `paths` in the schema), or null when the
   * source has nothing there (404). Callers validate the shape. Throws on other failures.
   */
  load(path: string, signal?: AbortSignal): Promise<unknown>;
}

export const DEFAULT_CONFIG: WidgetConfig = { v: 1, pollMs: 2000, level: 1, disabled: [], blockedDomains: [] };

/** The source answered, but not with data of the expected shape. */
export class AdapterDataError extends Error {
  constructor(what: string) {
    super(`Malformed data from the source: ${what}`);
  }
}

export class AdapterHttpError extends Error {
  constructor(readonly status: number, url: string) {
    super(`Request failed (${status}): ${url}`);
  }
}

/** Relative paths an adapter may be asked to load: only the shapes `paths` in the schema builds. */
export const SAFE_PATH =
  /^(?:config|snap\/[A-Z][A-Z-]{1,9}\/(?:_[a-z]+|list\/[A-Z0-9][A-Z0-9.-]{0,15}|[A-Z0-9][A-Z0-9.-]{0,15})|v\/[a-z]+(?:\/[A-Za-z0-9_][A-Za-z0-9._-]{0,79}){0,4})\.json$/;
