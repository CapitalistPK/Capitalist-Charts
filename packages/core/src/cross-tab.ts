import { isMarketStatus, isQuoteSnapshot, normaliseConfig, type MarketStatus, type QuoteSnapshot, type WidgetConfig } from '@capitalist-charts/schema/base';
import type { DataAdapter } from './adapter.js';

const VERSION = 1;
const HEARTBEAT_MS = 1500;
const LEADER_TIMEOUT_MS = 4500;
const REQUEST_TIMEOUT_MS = 5000;
const CACHE_MS = 1200;
const CHANNEL_NAME = 'capitalist-charts:data:v1';

type WireKind = 'quote' | 'status' | 'index' | 'load' | 'config';
type WireMessage = {
  v: 1;
  t: 'hello' | 'beat' | 'claim' | 'release' | 'request' | 'response';
  id: string;
  at: number;
  key?: string;
  kind?: WireKind;
  requestId?: string;
  to?: string;
  ok?: boolean;
  value?: unknown;
  error?: string;
};

export interface BroadcastChannelLike {
  onmessage: ((event: { data: unknown }) => void) | null;
  postMessage(message: unknown): void;
  close(): void;
}

export interface CrossTabOptions {
  channelFactory?: () => BroadcastChannelLike | null;
  now?: () => number;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (handle: unknown) => void;
  isVisible?: () => boolean;
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown, max: number) => typeof value === 'string' && value.length > 0 && value.length <= max;

/** Validates the envelope before any tab-originated value reaches an adapter or widget. */
export function isCrossTabMessage(value: unknown): value is WireMessage {
  if (!isObject(value) || value.v !== VERSION || !isText(value.id, 80) || typeof value.at !== 'number' || !Number.isFinite(value.at)) return false;
  if (!['hello', 'beat', 'claim', 'release', 'request', 'response'].includes(value.t as string)) return false;
  if (value.key !== undefined && !isText(value.key, 300)) return false;
  if (value.kind !== undefined && !['quote', 'status', 'index', 'load', 'config'].includes(value.kind as string)) return false;
  if (value.requestId !== undefined && !isText(value.requestId, 100)) return false;
  if (value.to !== undefined && !isText(value.to, 80)) return false;
  if (value.error !== undefined && !isText(value.error, 240)) return false;
  if (value.t === 'request' && (!value.key || !value.kind || !value.requestId)) return false;
  if (value.t === 'response' && (!value.key || !value.kind || !value.requestId || typeof value.ok !== 'boolean')) return false;
  return true;
}

function isWireValue(value: unknown, depth = 0): boolean {
  if (depth > 8) return false;
  if (value === null || typeof value === 'boolean') return true;
  if (typeof value === 'string') return value.length <= 200_000;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.length <= 5000 && value.every((item) => isWireValue(item, depth + 1));
  return isObject(value) && Object.keys(value).length <= 200 && Object.entries(value).every(([key, item]) => key.length <= 100 && isWireValue(item, depth + 1));
}

function validValue(kind: WireKind, value: unknown): boolean {
  if (!isWireValue(value)) return false;
  if (kind === 'quote') return value === null || isQuoteSnapshot(value);
  if (kind === 'status') return value === null || isMarketStatus(value);
  if (kind === 'config') {
    const config = normaliseConfig(value);
    return isObject(value) && value.v === 1 && config.v === 1;
  }
  return true;
}

function id(): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  return random.slice(0, 64);
}

interface Pending {
  key: string;
  kind: WireKind;
  run: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: unknown;
}

interface Cached {
  at: number;
  ok: boolean;
  value?: unknown;
  error?: string;
}

/** One visible tab executes adapter calls while peers consume the same validated results. */
export class CrossTabCoordinator {
  readonly available: boolean;
  private readonly channel: BroadcastChannelLike | null;
  private readonly now: () => number;
  private readonly setTimer: (fn: () => void, ms: number) => unknown;
  private readonly clearTimer: (handle: unknown) => void;
  private readonly isVisible: () => boolean;
  private readonly tabId = id();
  private readonly seen = new Map<string, number>();
  private readonly pending = new Map<string, Pending>();
  private readonly cache = new Map<string, Cached>();
  private heartbeat: unknown = null;
  private visibleListener: (() => void) | null = null;
  private started = false;
  private leader = false;
  private leaderId: string | null = null;
  private execute: ((kind: WireKind, key: string) => Promise<unknown>) | null = null;

  constructor(options: CrossTabOptions = {}) {
    this.channel = options.channelFactory ? options.channelFactory() : typeof BroadcastChannel === 'function' ? (new BroadcastChannel(CHANNEL_NAME) as unknown as BroadcastChannelLike) : null;
    this.available = this.channel !== null;
    this.now = options.now ?? (() => Date.now());
    this.setTimer = options.setTimer ?? ((fn, ms) => setTimeout(fn, ms));
    this.clearTimer = options.clearTimer ?? ((handle) => clearTimeout(handle as ReturnType<typeof setTimeout>));
    this.isVisible = options.isVisible ?? (() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  }

  get isLeader(): boolean {
    return this.available && this.leader;
  }

  setExecutor(execute: (kind: WireKind, key: string) => Promise<unknown>): void {
    this.execute = execute;
  }

  start(): void {
    if (!this.available || this.started) return;
    this.started = true;
    this.channel!.onmessage = (event) => this.receive(event.data);
    if (typeof document !== 'undefined') {
      this.visibleListener = () => this.visibilityChanged();
      document.addEventListener('visibilitychange', this.visibleListener);
    }
    this.send({ t: 'hello' });
    // A running leader needs one turn to answer a new tab before that tab claims the channel.
    this.heartbeat = this.setTimer(() => this.tick(), 50);
  }

  close(): void {
    if (!this.available || !this.started) return;
    const wasLeader = this.leader;
    this.leader = false;
    this.leaderId = null;
    if (wasLeader) this.send({ t: 'release' });
    if (this.heartbeat !== null) this.clearTimer(this.heartbeat);
    this.visibleListener && document.removeEventListener('visibilitychange', this.visibleListener);
    this.visibleListener = null;
    for (const pending of this.pending.values()) {
      this.clearTimer(pending.timer);
      pending.reject(new Error('Cross-tab channel closed'));
    }
    this.pending.clear();
    this.channel!.onmessage = null;
    this.channel!.close();
    this.started = false;
  }

  visibilityChanged(): void {
    if (!this.available || !this.started) return;
    if (!this.isVisible()) {
      if (this.leader) this.send({ t: 'release' });
      this.leader = false;
      if (this.leaderId === this.tabId) this.leaderId = null;
      return;
    }
    this.tick();
  }

  async request<T>(kind: WireKind, key: string, run: () => Promise<T>): Promise<T> {
    if (!this.available) return run();
    this.start();
    // With no live leader to answer (a lone tab, or before the first heartbeat), asking the channel
    // would only wait out the request timeout, so the first paint of every widget would stall.
    if (this.leader || !this.hasLiveLeader()) return this.local(kind, key, run);
    const requestId = id();
    const result = new Promise<unknown>((resolve, reject) => {
      const timer = this.setTimer(() => {
        const pending = this.pending.get(requestId);
        if (!pending) return;
        this.pending.delete(requestId);
        // A broken or suspended channel should not make a widget wait forever. The next
        // poller cycle can retry, while this request falls back to its own adapter call.
        void run().then(resolve, reject);
      }, REQUEST_TIMEOUT_MS);
      this.pending.set(requestId, { key, kind, run, resolve, reject, timer });
    });
    this.send({ t: 'request', key, kind, requestId });
    return result.then((value) => {
      if (!validValue(kind, value)) throw new Error('Invalid cross-tab response');
      return value as T;
    });
  }

  private async local<T>(kind: WireKind, key: string, run: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(`${kind}:${key}`);
    if (cached && this.now() - cached.at <= CACHE_MS) {
      if (cached.ok) return cached.value as T;
      throw new Error(cached.error ?? 'Shared adapter request failed');
    }
    try {
      const value = await run();
      if (!validValue(kind, value)) throw new Error('Invalid local adapter response');
      this.cache.set(`${kind}:${key}`, { at: this.now(), ok: true, value });
      return value;
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 240) : 'Adapter request failed';
      this.cache.set(`${kind}:${key}`, { at: this.now(), ok: false, error: message });
      throw error;
    }
  }

  private hasLiveLeader(): boolean {
    return this.leaderId !== null && this.leaderId !== this.tabId && this.now() - (this.seen.get(this.leaderId) ?? 0) <= LEADER_TIMEOUT_MS;
  }

  /** Requests sent to a leader that has gone will never be answered; run them here instead. */
  private runPendingLocally(): void {
    for (const [requestId, pending] of this.pending) {
      this.pending.delete(requestId);
      this.clearTimer(pending.timer);
      void pending.run().then(pending.resolve, pending.reject);
    }
  }

  private send(message: Omit<WireMessage, 'v' | 'id' | 'at'>): void {
    this.channel?.postMessage({ ...message, v: VERSION, id: this.tabId, at: this.now() });
  }

  private receive(value: unknown): void {
    if (!isCrossTabMessage(value) || value.id === this.tabId) return;
    this.seen.set(value.id, value.at);
    if (value.t === 'hello') {
      if (this.leader) this.send({ t: 'beat' });
      return;
    }
    if (value.t === 'beat' || value.t === 'claim') {
      if (value.t === 'claim' && this.leader && value.id !== this.tabId && this.seen.has(value.id) && this.now() - (this.seen.get(value.id) ?? 0) <= LEADER_TIMEOUT_MS) {
        this.send({ t: 'beat' });
        return;
      }
      if (value.t === 'claim' && (!this.leaderId || value.id < this.leaderId) && this.isVisible()) {
        this.leaderId = value.id;
        this.leader = false;
      } else if (!this.leaderId || value.id < this.leaderId) {
        this.leaderId = value.id;
        this.leader = false;
      }
      if (this.leader && value.id < this.tabId) {
        this.leader = false;
        this.leaderId = value.id;
      }
      return;
    }
    if (value.t === 'release') {
      if (this.leaderId !== value.id) return;
      this.leaderId = null;
      this.leader = false;
      this.runPendingLocally();
      this.tick();
      return;
    }
    if (value.t === 'request') {
      if (!this.leader || !value.kind || !value.key || !value.requestId || !this.execute) return;
      void this.remote(value.kind, value.key, value.requestId, value.id);
      return;
    }
    if (value.t === 'response' && value.to === this.tabId && value.requestId) {
      const pending = this.pending.get(value.requestId);
      if (!pending || pending.key !== value.key || pending.kind !== value.kind) return;
      this.pending.delete(value.requestId);
      this.clearTimer(pending.timer);
      if (value.ok && validValue(pending.kind, value.value)) pending.resolve(value.value);
      else pending.reject(new Error(value.error ?? 'Invalid cross-tab response'));
    }
  }

  private async remote(kind: WireKind, key: string, requestId: string, to: string): Promise<void> {
    try {
      const value = await this.local(kind, key, () => this.execute!(kind, key));
      this.send({ t: 'response', to, key, kind, requestId, ok: true, value });
    } catch (error) {
      this.send({ t: 'response', to, key, kind, requestId, ok: false, error: error instanceof Error ? error.message.slice(0, 240) : 'Adapter request failed' });
    }
  }

  private tick(): void {
    if (!this.available || !this.started) return;
    const now = this.now();
    if (!this.isVisible()) {
      this.leader = false;
    } else if (this.leaderId && this.leaderId !== this.tabId && now - (this.seen.get(this.leaderId) ?? 0) > LEADER_TIMEOUT_MS) {
      this.leaderId = null;
      this.leader = false;
    }
    if (this.isVisible() && (!this.leaderId || this.leaderId === this.tabId)) {
      if (!this.leader) {
        this.leader = true;
        this.leaderId = this.tabId;
        this.send({ t: 'claim' });
      } else {
        this.send({ t: 'beat' });
      }
      this.seen.set(this.tabId, now);
    }
    this.heartbeat = this.setTimer(() => this.tick(), HEARTBEAT_MS);
  }
}

function splitKey(key: string): string[] {
  return key.split('|');
}

/** Wraps the hosted adapter; a caller-supplied adapter remains private to its page. */
export function sharedAdapter(source: DataAdapter): DataAdapter & { dispose(): void } {
  const coordinator = new CrossTabCoordinator();
  coordinator.setExecutor(async (kind, key) => {
    const parts = splitKey(key);
    if (kind === 'quote' && parts.length === 3) return source.quote(parts[1]!, parts[2]!);
    if (kind === 'status' && parts.length === 2) return source.status(parts[1]!);
    if (kind === 'index' && parts.length === 2) return source.index(parts[1]!);
    if (kind === 'load' && parts.length === 2) return source.load(parts[1]!);
    if (kind === 'config' && parts.length === 1) return source.config();
    throw new Error('Invalid shared adapter request');
  });
  coordinator.start();
  const call = <T>(kind: WireKind, key: string, run: () => Promise<T>) => coordinator.request(kind, key, run);
  return {
    quote: (market, symbol, signal) => call('quote', `q|${market}|${symbol}`, () => source.quote(market, symbol, signal)),
    status: (market, signal) => call('status', `s|${market}`, () => source.status(market, signal)),
    index: (market, signal) => call('index', `i|${market}`, () => source.index(market, signal)),
    load: (path, signal) => call('load', `l|${path}`, () => source.load(path, signal)),
    config: (signal) => call('config', 'c', () => source.config(signal)),
    dispose: () => coordinator.close(),
  };
}

export type { MarketStatus, QuoteSnapshot, WidgetConfig };
