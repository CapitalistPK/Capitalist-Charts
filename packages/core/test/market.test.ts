import { describe, expect, it } from 'vitest';
import { quoteState, shouldPollFast } from '@capitalist-charts/core';
import type { MarketStatus, QuoteSnapshot } from '@capitalist-charts/schema';

const NOW = 1_795_660_000;
const quote: QuoteSnapshot = { v: 1, s: 'OGDC', m: 'PSX', n: 'OGDC', k: 'equity', p: 182.4, c: 2.15, cp: 1.19, vol: 1, t: NOW - 5, d: 0, st: false };
const status: MarketStatus = { v: 1, m: 'PSX', pub: NOW - 1, open: true, feed: 'live', symbols: 1, live: 1 };

describe('quote state', () => {
  it('covers every state a widget can show', () => {
    expect(quoteState(undefined, undefined, NOW)).toBe('loading');
    expect(quoteState(undefined, undefined, NOW, { failed: true })).toBe('unavailable');
    expect(quoteState(undefined, status, NOW, { notFound: true })).toBe('unknown-symbol');
    expect(quoteState(quote, status, NOW)).toBe('live');
    expect(quoteState({ ...quote, d: 60 }, status, NOW)).toBe('delayed');
    expect(quoteState({ ...quote, st: true }, status, NOW)).toBe('stale');
    expect(quoteState(quote, { ...status, open: false }, NOW)).toBe('closed');
    expect(quoteState(quote, { ...status, pub: NOW - 31 }, NOW)).toBe('stale'); // publisher stopped
    expect(quoteState({ ...quote, ts: 'suspended' }, status, NOW)).toBe('halted');
  });
  it('polls fast only while a market can move', () => {
    expect(shouldPollFast(status)).toBe(true);
    expect(shouldPollFast({ ...status, open: false })).toBe(false);
    expect(shouldPollFast(null)).toBe(true);
  });
});
