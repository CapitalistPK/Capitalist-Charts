import type { MarketStatus, QuoteSnapshot } from '@capitalist-charts/schema/base';
import { AdapterDataError, type DataAdapter } from './adapter.js';
import type { Resource } from './resources.js';
import { shouldPollFast } from './market.js';

export interface QuoteUpdate {
  market: string;
  symbol: string;
  quote: QuoteSnapshot | null;
  status: MarketStatus | null;
  /** The source does not know this symbol (HTTP 404). */
  notFound: boolean;
  /** The last request for this symbol failed; `quote` is the last good value, if any. */
  failed: boolean;
}

export type QuoteListener = (update: QuoteUpdate) => void;

/** What a resource subscriber receives on every refresh. */
export interface ResourceUpdate<T> {
  data: T | null;
  /** Session state of the resource's market (live resources only). */
  status: MarketStatus | null;
  notFound: boolean;
  /** The last request failed; `data` is the last good value, if any. */
  failed: boolean;
}

export type ResourceListener<T> = (update: ResourceUpdate<T>) => void;

export interface PollerOptions {
  /** Poll interval while a market is open. The loader config can change it at runtime. */
  pollMs?: number;
  /** Poll interval while every subscribed market is closed. */
  closedPollMs?: number;
  /** Ceiling for the error backoff. */
  maxBackoffMs?: number;
  /** Parallel quote requests per cycle. */
  concurrency?: number;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (handle: unknown) => void;
  random?: () => number;
  now?: () => number;
  /** True while the page is hidden; polling waits for `whenVisible` then. */
  isHidden?: () => boolean;
  /** Calls `fn` once the page is visible again; returns an unsubscribe. */
  whenVisible?: (fn: () => void) => () => void;
}

/** An unknown symbol (HTTP 404) is asked about again after this long, not on every cycle. */
export const NOT_FOUND_RECHECK_MS = 60_000;
/** A failed slow resource is retried after this long at most. */
const VIEW_RETRY_MS = 30_000;

interface Entry {
  market: string | null;
  live: boolean;
  refreshMs: number;
  fetch: (signal: AbortSignal) => Promise<unknown>;
  listeners: Set<(u: ResourceUpdate<unknown>) => void>;
  latest: ResourceUpdate<unknown> | null;
  /** Aborted when the last widget unsubscribes, so its request does not run on. */
  ctl: AbortController;
  /** Earliest time the next request may go out (unknown symbols and slow resources). */
  dueAt: number;
}

/**
 * One poller per page, shared by every widget on it.
 *
 * - Each resource (a symbol's quote, a list, a chart series...) is requested once per cycle however
 *   many widgets show it.
 * - Live resources follow the poll interval; slower ones (charts, flows, funds) refresh on their own
 *   schedule inside the same loop.
 * - Hidden tabs do not poll; polling resumes as soon as the tab is visible.
 * - When every subscribed market is closed it polls slowly (prices cannot move).
 * - On errors it backs off exponentially with full jitter, so thousands of pages do not retry in
 *   step after an outage; the last good value stays on screen meanwhile.
 */
export class Poller {
  private readonly entries = new Map<string, Entry>();
  private readonly statuses = new Map<string, MarketStatus | null>();
  private timer: unknown = null;
  private timerDue = 0;
  private cycling = false;
  private failures = 0;
  private unwatchVisible: (() => void) | null = null;
  private pollMs: number;
  private readonly o: Required<PollerOptions>;

  constructor(private readonly adapter: DataAdapter, options: PollerOptions = {}) {
    const doc = typeof document !== 'undefined' ? document : undefined;
    this.o = {
      pollMs: 2000,
      closedPollMs: 60_000,
      maxBackoffMs: 60_000,
      concurrency: 6,
      setTimer: (fn, ms) => setTimeout(fn, ms),
      clearTimer: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
      random: Math.random,
      now: () => Date.now(),
      isHidden: () => doc?.visibilityState === 'hidden',
      whenVisible: (fn) => {
        if (!doc) return () => undefined;
        const handler = () => {
          if (doc.visibilityState !== 'hidden') fn();
        };
        doc.addEventListener('visibilitychange', handler);
        return () => doc.removeEventListener('visibilitychange', handler);
      },
      ...options,
    };
    this.pollMs = this.o.pollMs;
  }

  /** Applies the loader config's interval (bounded to 1-120 s). */
  setPollMs(ms: number): void {
    if (Number.isFinite(ms)) this.pollMs = Math.min(120_000, Math.max(1_000, ms));
  }

  get subscriptionCount(): number {
    return this.entries.size;
  }

  /** Live quote for one symbol. */
  subscribe(market: string, symbol: string, listener: QuoteListener): () => void {
    return this.add(
      `q:${market}:${symbol}`,
      { market, live: true, refreshMs: 0, fetch: (signal) => this.adapter.quote(market, symbol, signal) },
      (u) => listener({ market, symbol, quote: u.data as QuoteSnapshot | null, status: u.status, notFound: u.notFound, failed: u.failed }),
    );
  }

  /** Any resource (see `resources`): lists, movers, chart series, flows, funds, calendars. */
  subscribeResource<T>(resource: Resource<T>, listener: ResourceListener<T>): () => void {
    return this.add(
      `r:${resource.path}`,
      {
        market: resource.market,
        live: resource.live,
        refreshMs: resource.refreshMs,
        fetch: async (signal) => {
          const raw = await this.adapter.load(resource.path, signal);
          if (raw === null || raw === undefined) return null;
          if (!resource.guard(raw)) throw new AdapterDataError(resource.path);
          return raw;
        },
      },
      listener as (u: ResourceUpdate<unknown>) => void,
    );
  }

  private add(key: string, spec: Pick<Entry, 'market' | 'live' | 'refreshMs' | 'fetch'>, listener: (u: ResourceUpdate<unknown>) => void): () => void {
    let entry = this.entries.get(key);
    if (!entry) {
      entry = { ...spec, listeners: new Set(), latest: null, ctl: new AbortController(), dueAt: 0 };
      this.entries.set(key, entry);
    }
    entry.listeners.add(listener);
    if (entry.latest) listener(entry.latest);
    // A new resource is fetched promptly rather than at the next scheduled cycle.
    else this.reschedule(0);
    return () => {
      const e = this.entries.get(key);
      if (!e || !e.listeners.delete(listener) || e.listeners.size > 0) return;
      this.entries.delete(key);
      e.ctl.abort();
      // A market nobody watches any more must not keep deciding the poll speed.
      if (e.market && ![...this.entries.values()].some((x) => x.live && x.market === e.market)) this.statuses.delete(e.market);
      if (this.entries.size === 0) this.stop();
    };
  }

  stop(): void {
    if (this.timer !== null) this.o.clearTimer(this.timer);
    this.timer = null;
    this.unwatchVisible?.();
    this.unwatchVisible = null;
  }

  /** One full cycle now (tests call this directly). */
  async cycle(): Promise<void> {
    if (this.cycling || this.entries.size === 0) return;
    if (this.o.isHidden()) {
      this.unwatchVisible ??= this.o.whenVisible(() => {
        this.unwatchVisible?.();
        this.unwatchVisible = null;
        this.reschedule(0);
      });
      return;
    }
    this.cycling = true;
    let errors = 0;
    try {
      const now = this.o.now();
      const due = [...this.entries].filter(([, e]) => e.dueAt <= now);
      const markets = [...new Set(due.filter(([, e]) => e.live && e.market).map(([, e]) => e.market!))];
      await Promise.all(
        markets.map(async (m) => {
          try {
            this.statuses.set(m, await this.adapter.status(m));
          } catch {
            errors += 1;
          }
        }),
      );
      let next = 0;
      const worker = async () => {
        while (next < due.length) {
          const [key, entry] = due[next++]!;
          const status = entry.market && entry.live ? (this.statuses.get(entry.market) ?? null) : null;
          let update: ResourceUpdate<unknown>;
          try {
            const data = await entry.fetch(entry.ctl.signal);
            update = { data, status, notFound: data === null, failed: false };
          } catch {
            if (entry.ctl.signal.aborted) continue;
            errors += 1;
            update = { data: entry.latest?.data ?? null, status, notFound: false, failed: true };
          }
          // Unsubscribed while in flight, or unsubscribed and subscribed again (a new entry): drop the old answer.
          if (this.entries.get(key) !== entry) continue;
          entry.latest = update;
          const at = this.o.now();
          if (update.notFound) entry.dueAt = at + NOT_FOUND_RECHECK_MS;
          else if (!entry.live) entry.dueAt = at + (update.failed ? Math.min(VIEW_RETRY_MS, entry.refreshMs) : Math.max(entry.refreshMs, this.pollMs));
          else entry.dueAt = 0;
          for (const l of entry.listeners) {
            try {
              l(update);
            } catch {
              // A broken widget must not stop the others from updating.
            }
          }
        }
      };
      await Promise.all(Array.from({ length: Math.min(this.o.concurrency, due.length) }, worker));
    } finally {
      this.cycling = false;
    }
    this.failures = errors > 0 ? this.failures + 1 : 0;
    this.reschedule(this.nextDelay());
  }

  /** Delay before the next cycle: normal, slow while closed, jittered backoff after errors, or the next slow resource. */
  nextDelay(): number {
    if (this.failures > 0) {
      const cap = Math.min(this.o.maxBackoffMs, this.pollMs * 2 ** Math.min(this.failures, 10));
      return Math.max(this.pollMs, Math.round(cap * this.o.random()));
    }
    const entries = [...this.entries.values()];
    const now = this.o.now();
    let delay = Infinity;
    if (entries.some((e) => e.live && e.dueAt <= now)) {
      const watched = new Set(entries.filter((e) => e.live && e.market).map((e) => e.market!));
      const known = [...watched].filter((m) => this.statuses.has(m));
      // Fast while any watched market may be open, or while a watched market's status is unknown.
      const fast = known.length < watched.size || known.some((m) => shouldPollFast(this.statuses.get(m) ?? null));
      delay = fast ? this.pollMs : this.o.closedPollMs;
    }
    for (const e of entries) if (!(e.live && e.dueAt <= now)) delay = Math.min(delay, Math.max(this.pollMs, e.dueAt - now));
    return Number.isFinite(delay) ? delay : this.pollMs;
  }

  private reschedule(ms: number): void {
    if (this.entries.size === 0) return;
    const at = this.o.now() + ms;
    if (this.timer !== null) {
      if (at >= this.timerDue) return; // an earlier cycle is already due
      this.o.clearTimer(this.timer);
    }
    this.timerDue = at;
    this.timer = this.o.setTimer(() => {
      this.timer = null;
      void this.cycle();
    }, ms);
  }
}
