import { describe, expect, it, vi } from 'vitest';
import { mockAdapter, Poller, resources, type DataAdapter, type QuoteUpdate, type ResourceUpdate } from '@capitalist-charts/core';
import type { Movers, Series } from '@capitalist-charts/schema';
import type { MarketStatus, QuoteSnapshot } from '@capitalist-charts/schema';

function quote(s: string, p = 100): QuoteSnapshot {
  return { v: 1, s, m: 'PSX', n: s, k: 'equity', p, c: 0, cp: 0, vol: 0, t: 1, d: 0, st: false };
}
function fakeAdapter(over: Partial<DataAdapter> = {}) {
  const status: MarketStatus = { v: 1, m: 'PSX', pub: 1, open: true, feed: 'live', symbols: 1, live: 1 };
  const a = {
    quote: vi.fn(async (_m: string, s: string) => (s === 'NOPE' ? null : quote(s))),
    status: vi.fn(async () => status),
    index: vi.fn(async () => null),
    config: vi.fn(async () => ({ v: 1 as const, pollMs: 2000, level: 1, disabled: [], blockedDomains: [] })),
    load: vi.fn(async (_path: string): Promise<unknown> => null),
    ...over,
  };
  return a;
}
function manualTimers() {
  const timers: Array<{ fn: () => void; ms: number }> = [];
  return {
    timers,
    setTimer: (fn: () => void, ms: number) => {
      const t = { fn, ms };
      timers.push(t);
      return t;
    },
    clearTimer: (h: unknown) => {
      const i = timers.indexOf(h as (typeof timers)[number]);
      if (i >= 0) timers.splice(i, 1);
    },
  };
}

describe('Poller', () => {
  it('requests each symbol once per cycle, however many widgets show it', async () => {
    const adapter = fakeAdapter();
    const t = manualTimers();
    const p = new Poller(adapter, { ...t, isHidden: () => false });
    const seen: QuoteUpdate[] = [];
    p.subscribe('PSX', 'OGDC', (u) => seen.push(u));
    p.subscribe('PSX', 'OGDC', (u) => seen.push(u));
    p.subscribe('PSX', 'HBL', (u) => seen.push(u));
    await p.cycle();
    expect(adapter.quote).toHaveBeenCalledTimes(2);
    expect(adapter.status).toHaveBeenCalledTimes(1);
    expect(seen).toHaveLength(3);
  });

  it('reports unknown symbols and keeps the last good value after a failure', async () => {
    let fail = false;
    const adapter = fakeAdapter({
      quote: vi.fn(async (_m: string, s: string) => {
        if (fail) throw new Error('boom');
        return s === 'NOPE' ? null : quote(s, 182.4);
      }),
    });
    const p = new Poller(adapter, { ...manualTimers(), isHidden: () => false });
    const last: Record<string, QuoteUpdate> = {};
    p.subscribe('PSX', 'NOPE', (u) => (last.NOPE = u));
    p.subscribe('PSX', 'OGDC', (u) => (last.OGDC = u));
    await p.cycle();
    expect(last.NOPE).toMatchObject({ notFound: true, quote: null });
    fail = true;
    await p.cycle();
    expect(last.OGDC).toMatchObject({ failed: true, quote: { p: 182.4 } });
  });

  it('backs off with jitter after errors and recovers to the normal interval', async () => {
    let fail = true;
    const adapter = fakeAdapter({
      status: vi.fn(async () => {
        if (fail) throw new Error('down');
        return { v: 1 as const, m: 'PSX', pub: 1, open: true, feed: 'live' as const, symbols: 1, live: 1 };
      }),
    });
    const p = new Poller(adapter, { ...manualTimers(), isHidden: () => false, random: () => 1 });
    p.subscribe('PSX', 'OGDC', () => undefined);
    await p.cycle();
    expect(p.nextDelay()).toBe(4000);
    await p.cycle();
    expect(p.nextDelay()).toBe(8000);
    for (let i = 0; i < 8; i += 1) await p.cycle();
    expect(p.nextDelay()).toBe(60_000); // capped
    fail = false;
    await p.cycle();
    expect(p.nextDelay()).toBe(2000);
  });

  it('never retries faster than the poll interval, even with a low random draw', async () => {
    const adapter = fakeAdapter({ status: vi.fn(async () => Promise.reject(new Error('x'))) });
    const p = new Poller(adapter, { ...manualTimers(), isHidden: () => false, random: () => 0 });
    p.subscribe('PSX', 'OGDC', () => undefined);
    await p.cycle();
    expect(p.nextDelay()).toBe(2000);
  });

  it('polls slowly while the market is closed', async () => {
    const adapter = fakeAdapter({ status: vi.fn(async () => ({ v: 1 as const, m: 'PSX', pub: 1, open: false, feed: 'live' as const, symbols: 1, live: 1 })) });
    const p = new Poller(adapter, { ...manualTimers(), isHidden: () => false });
    p.subscribe('PSX', 'OGDC', () => undefined);
    await p.cycle();
    expect(p.nextDelay()).toBe(60_000);
  });

  it('does not poll a hidden page, and resumes when it becomes visible', async () => {
    const adapter = fakeAdapter();
    const t = manualTimers();
    let hidden = true;
    let onVisible: (() => void) | null = null;
    const p = new Poller(adapter, { ...t, isHidden: () => hidden, whenVisible: (fn) => ((onVisible = fn), () => (onVisible = null)) });
    p.subscribe('PSX', 'OGDC', () => undefined);
    await p.cycle();
    expect(adapter.quote).not.toHaveBeenCalled();
    hidden = false;
    onVisible!();
    const due = t.timers.find((x) => x.ms === 0);
    expect(due).toBeDefined();
  });

  it('applies the config interval within bounds and stops when the last widget leaves', async () => {
    const t = manualTimers();
    const p = new Poller(fakeAdapter(), { ...t, isHidden: () => false });
    p.setPollMs(10);
    const off = p.subscribe('PSX', 'OGDC', () => undefined);
    await p.cycle();
    expect(p.nextDelay()).toBe(1000);
    off();
    expect(p.subscriptionCount).toBe(0);
    expect(t.timers).toHaveLength(0);
  });
});

describe('Poller resubscribe race', () => {
  it('drops an in-flight answer when the key was unsubscribed and subscribed again', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const adapter = fakeAdapter({ quote: vi.fn(async (_m: string, s: string) => (await gate, quote(s, 1))) });
    const p = new Poller(adapter, { ...manualTimers(), isHidden: () => false });
    const first: QuoteUpdate[] = [];
    const second: QuoteUpdate[] = [];
    const off = p.subscribe('PSX', 'OGDC', (u) => first.push(u));
    const run = p.cycle();
    await vi.waitFor(() => expect(adapter.quote).toHaveBeenCalledTimes(1)); // the request is in flight
    off();
    p.subscribe('PSX', 'OGDC', (u) => second.push(u));
    release();
    await run;
    expect(first).toHaveLength(0);
    expect(second).toHaveLength(0); // the old run's answer is not delivered to the new subscriber
  });
});

describe('Poller unknown symbols', () => {
  it('re-checks a 404 symbol once a minute instead of every cycle', async () => {
    let now = 1_000_000;
    const adapter = fakeAdapter();
    const p = new Poller(adapter, { ...manualTimers(), isHidden: () => false, now: () => now });
    p.subscribe('PSX', 'NOPE', () => undefined);
    await p.cycle();
    await p.cycle();
    expect(adapter.quote).toHaveBeenCalledTimes(1);
    now += 60_001;
    await p.cycle();
    expect(adapter.quote).toHaveBeenCalledTimes(2);
  });

  it('serves resources once per cycle and refreshes slow ones on their own schedule', async () => {
    let clock = 0;
    const base = mockAdapter({ now: () => 1_700_000_000_000 });
    const adapter = fakeAdapter({ load: vi.fn((path: string) => base.load(path)) });
    const p = new Poller(adapter, { ...manualTimers(), isHidden: () => false, now: () => clock });
    const movers: Array<ResourceUpdate<Movers>> = [];
    const series: Array<ResourceUpdate<Series>> = [];
    p.subscribeResource(resources.movers('PSX'), (u) => movers.push(u));
    p.subscribeResource(resources.series('PSX', 'OGDC', '1Y'), (u) => series.push(u));
    p.subscribeResource(resources.series('PSX', 'OGDC', '1Y'), (u) => series.push(u));
    await p.cycle();
    expect(adapter.load).toHaveBeenCalledTimes(2);
    expect(movers[0]!.data!.gainers.length).toBeGreaterThan(0);
    expect(series).toHaveLength(2);
    expect(series[0]!.data!.b.length).toBeLessThanOrEqual(300);
    clock = 10_000;
    await p.cycle();
    // Movers are live; the 1Y series is not due for 30 minutes.
    expect(adapter.load).toHaveBeenCalledTimes(3);
    clock = 31 * 60_000;
    await p.cycle();
    expect(adapter.load).toHaveBeenCalledTimes(5);
  });

  it('treats a malformed resource as a failure and keeps the last good value', async () => {
    const good = await mockAdapter().load('snap/PSX/_movers.json');
    let body: unknown = good;
    const adapter = fakeAdapter({ load: vi.fn(async () => body) });
    const p = new Poller(adapter, { ...manualTimers(), isHidden: () => false });
    let last: ResourceUpdate<Movers> | null = null;
    p.subscribeResource(resources.movers('PSX'), (u) => (last = u));
    await p.cycle();
    body = { v: 1, m: 'PSX', gainers: 'nope' };
    await p.cycle();
    expect(last).toMatchObject({ failed: true, data: good });
  });

  it('refuses invalid names before any request', () => {
    expect(() => resources.series('PSX', '../x', '1D')).toThrow();
    expect(() => resources.fund('Bad Slug')).toThrow();
    expect(() => resources.flows('PSX', '2Y' as '1D')).toThrow();
  });
});

describe('Poller lifecycle', () => {
  it('cancels the request of a widget that goes away, and does not count it as a failure', async () => {
    let seenSignal: AbortSignal | undefined;
    let release: () => void = () => undefined;
    const adapter = fakeAdapter({
      quote: vi.fn((_m: string, s: string, signal?: AbortSignal) => {
        seenSignal = signal;
        return new Promise<QuoteSnapshot | null>((resolve, reject) => {
          signal?.addEventListener('abort', () => reject(new Error('aborted')));
          release = () => resolve(quote(s));
        });
      }),
    });
    const t = manualTimers();
    const p = new Poller(adapter, { ...t, isHidden: () => false });
    const unsubscribe = p.subscribe('PSX', 'OGDC', () => undefined);
    const running = p.cycle();
    await vi.waitFor(() => expect(seenSignal).toBeDefined());
    expect(seenSignal!.aborted).toBe(false);
    unsubscribe();
    expect(seenSignal?.aborted).toBe(true);
    release();
    await running;
    p.subscribe('PSX', 'HBL', () => undefined);
    // No backoff: the next delay is the normal interval, not a jittered retry.
    expect(p.nextDelay()).toBe(2000);
  });

  it("forgets a closed market's status once nobody watches it, so a later widget polls at full speed", async () => {
    const closed: MarketStatus = { v: 1, m: 'PSX', pub: 1, open: false, feed: 'live', symbols: 1, live: 1 };
    let statusDown = false;
    const adapter = fakeAdapter({ status: vi.fn(async () => { if (statusDown) throw new Error('status down'); return closed; }) });
    const t = manualTimers();
    const p = new Poller(adapter, { ...t, isHidden: () => false, closedPollMs: 60_000 });
    const off = p.subscribe('PSX', 'OGDC', () => undefined);
    await p.cycle();
    expect(p.nextDelay()).toBe(60_000);
    off();
    statusDown = true;
    p.subscribe('PSX', 'HBL', () => undefined);
    // The new widget's status is unknown (the request failed): it must not inherit the old "closed".
    expect(p.nextDelay()).toBe(2000);
  });
});
