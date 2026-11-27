import { describe, expect, it, vi } from 'vitest';
import { capitalistAdapter, mockAdapter, AdapterHttpError } from '@capitalist-charts/core';
import { parseSymbolRef } from '@capitalist-charts/schema';

function res(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

describe('capitalist adapter', () => {
  it('requests exact file paths with no cookies and no query string', async () => {
    const quote = { v: 1, s: 'OGDC', m: 'PSX', n: 'OGDC', k: 'equity', p: 1, c: 0, cp: 0, vol: 1, t: 1, d: 0, st: false };
    const status = { v: 1, m: 'PSX', pub: 1, open: true, feed: 'live', symbols: 1, live: 1 };
    const fetch = vi.fn(async (url: RequestInfo | URL, _init?: RequestInit) => res(200, String(url).includes('_status') ? status : String(url).includes('config') ? {} : quote));
    const a = capitalistAdapter({ base: 'https://example.test/w/', fetch });
    await a.quote('PSX', 'OGDC');
    await a.status('PSX');
    await a.config();
    expect(fetch.mock.calls.map((c) => c[0])).toEqual(['https://example.test/w/snap/PSX/OGDC.json', 'https://example.test/w/snap/PSX/_status.json', 'https://example.test/w/config.json']);
    expect(fetch.mock.calls[0]![1]).toMatchObject({ credentials: 'omit', mode: 'cors' });
  });
  it('turns 404 into null and other failures into errors', async () => {
    const a = capitalistAdapter({ fetch: vi.fn(async () => res(404)) });
    expect(await a.quote('PSX', 'NOPE')).toBeNull();
    const b = capitalistAdapter({ fetch: vi.fn(async () => res(503)) });
    await expect(b.quote('PSX', 'OGDC')).rejects.toBeInstanceOf(AdapterHttpError);
  });
  it('never puts an unvalidated name in a URL', async () => {
    const fetch = vi.fn(async () => res(200));
    const a = capitalistAdapter({ fetch });
    for (const bad of ['../../etc', 'ogdc', 'A?x=1', 'A/B']) await expect(a.quote('PSX', bad)).rejects.toThrow(/Invalid symbol/);
    await expect(a.status('psx/..')).rejects.toThrow(/Invalid market/);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('falls back to default config when the file is missing', async () => {
    const a = capitalistAdapter({ fetch: vi.fn(async () => res(404)) });
    expect(await a.config()).toMatchObject({ pollMs: 2000, level: 1 });
  });
});

describe('symbol references', () => {
  it('parses MARKET:SYMBOL and defaults to PSX', () => {
    expect(parseSymbolRef('PSX:OGDC')).toEqual({ market: 'PSX', symbol: 'OGDC' });
    expect(parseSymbolRef(' ogdc ')).toEqual({ market: 'PSX', symbol: 'OGDC' });
    expect(parseSymbolRef('PSX:../x')).toBeNull();
    expect(parseSymbolRef('')).toBeNull();
  });
});

describe('mock adapter', () => {
  it('ticks deterministically inside the ±10% daily band', async () => {
    const a = mockAdapter({ seed: 7, now: () => 1_000_000 });
    const b = mockAdapter({ seed: 7, now: () => 1_000_000 });
    for (let i = 0; i < 500; i += 1) {
      const qa = (await a.quote('PSX', 'OGDC'))!;
      const qb = (await b.quote('PSX', 'OGDC'))!;
      expect(qa.p).toBe(qb.p);
      expect(Math.abs(qa.cp!)).toBeLessThanOrEqual(10);
    }
    expect(await a.quote('PSX', 'NOPE')).toBeNull();
  });
});

describe('validation at the network boundary', () => {
  const good = { v: 1, s: 'OGDC', m: 'PSX', n: 'OGDC', k: 'equity', p: 1, c: 0, cp: 0, vol: 1, t: 1, d: 0, st: false };
  it('rejects malformed or misrouted quotes as data errors', async () => {
    const { AdapterDataError } = await import('@capitalist-charts/core');
    const bad = capitalistAdapter({ fetch: vi.fn(async () => res(200, { ...good, p: '182' })) });
    await expect(bad.quote('PSX', 'OGDC')).rejects.toBeInstanceOf(AdapterDataError);
    const other = capitalistAdapter({ fetch: vi.fn(async () => res(200, { ...good, s: 'HBL' })) });
    await expect(other.quote('PSX', 'OGDC')).rejects.toBeInstanceOf(AdapterDataError);
    const notJson = capitalistAdapter({ fetch: vi.fn(async () => new Response('<html>', { status: 200 })) });
    await expect(notJson.quote('PSX', 'OGDC')).rejects.toBeInstanceOf(AdapterDataError);
    const ok = capitalistAdapter({ fetch: vi.fn(async () => res(200, good)) });
    expect(await ok.quote('PSX', 'OGDC')).toEqual(good);
  });
  it('normalises a malformed config instead of breaking widgets', async () => {
    const a = capitalistAdapter({ fetch: vi.fn(async () => res(200, { pollMs: 'fast', level: 9, disabled: 'all', blockedDomains: ['ok.example', 5] })) });
    expect(await a.config()).toEqual({ v: 1, pollMs: 2000, level: 1, disabled: [], blockedDomains: ['ok.example'] });
  });
});

describe('degradation levels', () => {
  it('slows polling as the operator raises the level', async () => {
    const { pollIntervalFor } = await import('@capitalist-charts/schema');
    const base = { v: 1 as const, pollMs: 2000, disabled: [], blockedDomains: [] };
    expect([1, 2, 3, 4, 5].map((level) => pollIntervalFor({ ...base, level }))).toEqual([2000, 5000, 5000, 10000, 60000]);
  });
});
