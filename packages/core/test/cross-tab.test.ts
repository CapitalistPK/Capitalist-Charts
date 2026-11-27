import { afterEach, describe, expect, it, vi } from 'vitest';
import { CrossTabCoordinator, isCrossTabMessage, type BroadcastChannelLike } from '@capitalist-charts/core';

class Bus {
  readonly channels = new Set<FakeChannel>();
  make(): BroadcastChannelLike {
    const channel = new FakeChannel(this);
    this.channels.add(channel);
    return channel;
  }
  send(sender: FakeChannel, message: unknown): void {
    for (const channel of this.channels) if (channel !== sender && channel.onmessage) channel.onmessage({ data: message });
  }
}

class FakeChannel implements BroadcastChannelLike {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  constructor(private readonly bus: Bus) {}
  postMessage(message: unknown): void { this.bus.send(this, message); }
  close(): void { this.bus.channels.delete(this); }
}

afterEach(() => vi.useRealTimers());

describe('cross-tab coordination', () => {
  it('elects one visible leader and shares a request result', async () => {
    vi.useFakeTimers();
    const bus = new Bus();
    const a = new CrossTabCoordinator({ channelFactory: () => bus.make() });
    const b = new CrossTabCoordinator({ channelFactory: () => bus.make() });
    a.start();
    b.start();
    vi.advanceTimersByTime(60);
    expect([a.isLeader, b.isLeader].filter(Boolean)).toHaveLength(1);
    const leader = a.isLeader ? a : b;
    const follower = a.isLeader ? b : a;
    leader.setExecutor(async () => ({ v: 1, s: 'OGDC', m: 'PSX', n: 'OGDC', k: 'equity', p: 1, c: 0, cp: 0, vol: 1, t: 1, d: 0, st: false }));
    const value = await follower.request('quote', 'q|PSX|OGDC', async () => { throw new Error('the follower must not poll'); });
    expect(value).toMatchObject({ s: 'OGDC', p: 1 });
  });

  it('hands leadership to a visible peer after the leader closes', () => {
    vi.useFakeTimers();
    const bus = new Bus();
    const a = new CrossTabCoordinator({ channelFactory: () => bus.make() });
    const b = new CrossTabCoordinator({ channelFactory: () => bus.make() });
    a.start();
    b.start();
    vi.advanceTimersByTime(60);
    const leader = a.isLeader ? a : b;
    const follower = a.isLeader ? b : a;
    leader.close();
    vi.advanceTimersByTime(60);
    expect(follower.isLeader).toBe(true);
  });

  it('rejects a response that fails the requested wire schema', async () => {
    vi.useFakeTimers();
    const bus = new Bus();
    const leader = new CrossTabCoordinator({ channelFactory: () => bus.make() });
    const follower = new CrossTabCoordinator({ channelFactory: () => bus.make() });
    leader.start();
    follower.start();
    vi.advanceTimersByTime(60);
    const elected = leader.isLeader ? leader : follower;
    const peer = leader.isLeader ? follower : leader;
    elected.setExecutor(async () => ({ bad: true }));
    await expect(peer.request('quote', 'q|PSX|OGDC', async () => { throw new Error('fallback'); })).rejects.toThrow(/Invalid/);
  });

  it('answers a lone tab at once instead of waiting for a leader that does not exist', async () => {
    vi.useFakeTimers();
    const lone = new CrossTabCoordinator({ channelFactory: () => new Bus().make() });
    const settled = vi.fn();
    void lone.request('status', 's|PSX', async () => null).then(settled);
    await vi.advanceTimersByTimeAsync(10);
    expect(settled).toHaveBeenCalledWith(null);
  });

  it('runs a waiting request itself when the leader leaves before answering', async () => {
    vi.useFakeTimers();
    const bus = new Bus();
    const a = new CrossTabCoordinator({ channelFactory: () => bus.make() });
    const b = new CrossTabCoordinator({ channelFactory: () => bus.make() });
    a.start();
    b.start();
    vi.advanceTimersByTime(60);
    const leader = a.isLeader ? a : b;
    const follower = a.isLeader ? b : a;
    leader.setExecutor(() => new Promise(() => undefined));
    const settled = vi.fn();
    void follower.request('status', 's|PSX', async () => null).then(settled);
    await vi.advanceTimersByTimeAsync(10);
    expect(settled).not.toHaveBeenCalled();
    leader.close();
    await vi.advanceTimersByTimeAsync(10);
    expect(settled).toHaveBeenCalledWith(null);
  });

  it('rejects malformed envelopes before inspecting their payload', () => {
    expect(isCrossTabMessage({ v: 1, t: 'response', id: 'x', at: 1, kind: 'quote', key: 'q', requestId: 'r', ok: true, value: { bad: true } })).toBe(true);
    expect(isCrossTabMessage({ v: 1, t: 'response', id: 'x', at: 'now', kind: 'quote', key: 'q', requestId: 'r', ok: true })).toBe(false);
    expect(isCrossTabMessage({ v: 1, t: 'request', id: 'x', at: 1, kind: 'quote', key: 'q', requestId: '' })).toBe(false);
  });
});
