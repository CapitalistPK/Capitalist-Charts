import { isMarketStatus, isQuoteSnapshot, isSymbolIndex, MARKET_PATTERN, normaliseConfig, SYMBOL_PATTERN } from '@capitalist-charts/schema/base';
import { AdapterDataError, AdapterHttpError, DEFAULT_CONFIG, SAFE_PATH, type DataAdapter } from '../adapter.js';

export const CAPITALIST_DATA_BASE = 'https://capitalist.pk/w';

export interface CapitalistAdapterOptions {
  /** Base URL of the `/w` tree. Defaults to the hosted service. */
  base?: string;
  fetch?: typeof fetch;
}

/**
 * Reads the hosted Capitalist data service: static JSON files on a CDN. No cookies, no keys.
 * Only validated market and symbol names are ever put in a URL, and never a query string (the
 * service refuses them, which keeps every request a cache hit).
 */
export function capitalistAdapter(options: CapitalistAdapterOptions = {}): DataAdapter {
  const base = (options.base ?? CAPITALIST_DATA_BASE).replace(/\/+$/, '');
  const doFetch = options.fetch ?? ((input: RequestInfo | URL, init?: RequestInit) => globalThis.fetch(input, init));

  async function get(path: string, signal?: AbortSignal): Promise<unknown> {
    const url = `${base}/${path}`;
    const res = await doFetch(url, { credentials: 'omit', mode: 'cors', referrerPolicy: 'strict-origin-when-cross-origin', ...(signal ? { signal } : {}) });
    if (res.status === 404) return null;
    if (!res.ok) throw new AdapterHttpError(res.status, url);
    try {
      return await res.json();
    } catch {
      throw new AdapterDataError(url);
    }
  }
  function valid<T>(value: unknown, guard: (x: unknown) => x is T, what: string): T | null {
    if (value === null) return null;
    if (!guard(value)) throw new AdapterDataError(what);
    return value;
  }
  function checked(market: string, symbol?: string): void {
    if (!MARKET_PATTERN.test(market)) throw new Error(`Invalid market: ${market}`);
    if (symbol !== undefined && !SYMBOL_PATTERN.test(symbol)) throw new Error(`Invalid symbol: ${symbol}`);
  }

  return {
    async quote(market, symbol, signal) {
      checked(market, symbol);
      const q = valid(await get(`snap/${market}/${symbol}.json`, signal), isQuoteSnapshot, `${market}:${symbol}`);
      // A file for another symbol (misrouted cache, wrong upload) is a data error, not a price.
      if (q && (q.s !== symbol || q.m !== market)) throw new AdapterDataError(`${market}:${symbol}`);
      return q;
    },
    async status(market, signal) {
      checked(market);
      const s = valid(await get(`snap/${market}/_status.json`, signal), isMarketStatus, `${market} status`);
      if (s && s.m !== market) throw new AdapterDataError(`${market} status`);
      return s;
    },
    async index(market, signal) {
      checked(market);
      const i = valid(await get(`snap/${market}/_index.json`, signal), isSymbolIndex, `${market} index`);
      if (i && i.m !== market) throw new AdapterDataError(`${market} index`);
      return i;
    },
    async load(path, signal) {
      // `..` cannot match SAFE_PATH, so a path can never leave the data root.
      if (!SAFE_PATH.test(path) || path.includes('..')) throw new Error(`Invalid path: ${path}`);
      return get(path, signal);
    },
    async config(signal) {
      const raw = await get('config.json', signal);
      return raw === null ? DEFAULT_CONFIG : normaliseConfig(raw);
    },
  };
}
