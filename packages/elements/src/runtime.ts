import { capitalistAdapter, DEFAULT_CONFIG, Poller, type DataAdapter } from '@capitalist-charts/core';
import { pollIntervalFor, type WidgetConfig } from '@capitalist-charts/schema/base';

export interface CapitalistChartsOptions {
  /** A custom data source (see DataAdapter). Defaults to the hosted Capitalist service. */
  adapter?: DataAdapter;
  /** Base URL of a self-hosted `/w` tree, if not using a custom adapter. */
  dataBase?: string;
}

declare global {
  interface Window {
    /** Set before the loader runs to point widgets at another data source. */
    CapitalistCharts?: CapitalistChartsOptions;
  }
}

/** Open pages re-read the operator config this often, so kill switches reach them without a reload. */
export const CONFIG_REFRESH_MS = 5 * 60_000;

export interface Runtime {
  adapter: DataAdapter;
  poller: Poller;
  /** Resolves with the first config load. */
  ready: Promise<WidgetConfig>;
  current(): WidgetConfig;
  /** Called on every config load; returns an unsubscribe. */
  onConfig(fn: (config: WidgetConfig) => void): () => void;
  impression(tag: string): void;
  dispose(): void;
}

let runtime: Runtime | null = null;

function create(options: CapitalistChartsOptions): Runtime {
  const source = options.adapter ?? capitalistAdapter(options.dataBase ? { base: options.dataBase } : {});
  let active = source;
  let closeShared: (() => void) | undefined;
  let adapter: DataAdapter = source;
  // Cross-tab coordination is only useful to hosted pages, so keep it out of the first shared
  // chunk until a hosted widget actually creates a runtime.
  if (!options.adapter) {
    void import('@capitalist-charts/core').then(({ sharedAdapter }) => {
      const shared = sharedAdapter(source);
      active = shared;
      closeShared = shared.dispose;
    });
    adapter = {
      quote: (market, symbol, signal) => active.quote(market, symbol, signal),
      status: (market, signal) => active.status(market, signal),
      index: (market, signal) => active.index(market, signal),
      load: (path, signal) => active.load(path, signal),
      config: (signal) => active.config(signal),
    };
  }
  const poller = new Poller(adapter);
  const listeners = new Set<(c: WidgetConfig) => void>();
  let current = DEFAULT_CONFIG;
  const load = () =>
    adapter
      .config()
      .catch(() => current)
      .then((c) => {
        current = c;
        poller.setPollMs(pollIntervalFor(c));
        for (const fn of listeners) fn(c);
        return c;
      });
  const ready = load();
  const timer = typeof setInterval === 'function' ? setInterval(() => void load(), CONFIG_REFRESH_MS) : null;
  return {
    adapter,
    poller,
    ready,
    current: () => current,
    onConfig(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    impression(tag) {
      if (options.adapter) return;
      const send = (config: WidgetConfig) => sendImpression(options.dataBase, config, tag);
      void ready.then(send);
    },
    dispose() {
      if (timer !== null) clearInterval(timer);
      poller.stop();
      closeShared?.();
      listeners.clear();
    },
  };
}

const beaconed = new Set<string>();
const VERSION = '1.0.0';

function sendImpression(dataBase: string | undefined, config: WidgetConfig, tag: string): void {
  if (beaconed.has(tag)) return;
  beaconed.add(tag);
  if (typeof navigator === 'undefined' || typeof document === 'undefined' || !navigator.sendBeacon) return;
  if ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true || navigator.doNotTrack === '1' || (typeof window !== 'undefined' && (window as Window & { doNotTrack?: string }).doNotTrack === '1')) return;
  if (document.querySelector('meta[name="capitalist-charts"][content="no-beacon"]')) return;
  const rate = config.beaconRate ?? 0.01;
  if (!Number.isFinite(rate) || rate <= 0 || Math.random() >= rate) return;
  const body = JSON.stringify({ d: location.hostname, w: tag, v: VERSION });
  if (new TextEncoder().encode(body).length > 256) return;
  const base = (dataBase ?? 'https://capitalist.pk/w').replace(/\/+$/, '');
  navigator.sendBeacon(`${base}/beacon`, new Blob([body], { type: 'text/plain' }));
}

const replacedHooks = new Set<() => void>();

/** Called whenever `configureCapitalistCharts` replaces the runtime; returns an unsubscribe. */
export function onRuntimeReplaced(fn: () => void): () => void {
  replacedHooks.add(fn);
  return () => replacedHooks.delete(fn);
}

/**
 * Points every widget on the page at a data source. Safe at any time: widgets already on the
 * page move to the new source (frameworks often configure after their children have mounted).
 */
export function configureCapitalistCharts(options: CapitalistChartsOptions): void {
  runtime?.dispose();
  runtime = create(options);
  for (const fn of [...replacedHooks]) {
    try {
      fn();
    } catch {
      // One broken widget must not keep the others on the old source.
    }
  }
}

export function getRuntime(): Runtime {
  runtime ??= create((typeof window !== 'undefined' && window.CapitalistCharts) || {});
  return runtime;
}

/** True when `hostname` is a blocked domain or one of its subdomains. */
export function hostBlocked(config: WidgetConfig, hostname: string): boolean {
  const host = hostname.toLowerCase();
  return config.blockedDomains.some((d) => host === d || host.endsWith(`.${d}`));
}

/** Registers a custom element once, and only where custom elements exist (not during SSR in Node). */
export function define(tag: string, ctor: CustomElementConstructor): void {
  if (typeof customElements !== 'undefined' && !customElements.get(tag)) customElements.define(tag, ctor);
}
