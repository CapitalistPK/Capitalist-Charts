import { describe, expect, it, vi } from 'vitest';
import { embedSnippet, fallbackHtml, fetchFallbackData } from '@capitalist-charts/ssr';

const snapshot = { v: 1 as const, s: 'OGDC', m: 'PSX', n: 'Oil & Gas Development', k: 'equity', p: 182.4, c: 2.14, cp: 1.19, vol: 1, t: 1, d: 0, st: false };

describe('@capitalist-charts/ssr', () => {
  it('escapes attributes and never accepts an unsafe fallback URL', () => {
    const html = embedSnippet('cap-quote', { symbol: 'PSX:OGDC', title: '" onmouseover="alert(1) </script>' });
    expect(html).toContain('&quot; onmouseover=&quot;alert(1)');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('&lt;/script&gt;');
    expect(html).toContain('<a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>');
  });

  it('drops invalid symbols and formats validated quote data', () => {
    expect(fallbackHtml('cap-quote', { symbol: 'javascript:alert(1)' })).not.toContain('alert');
    expect(fallbackHtml('cap-quote', { symbol: 'PSX:OGDC' }, snapshot)).toContain('OGDC 182.40 (+1.19%)');
  });

  it('supports pinned loaders and SRI', () => {
    const html = embedSnippet('cap-quote', { symbol: 'PSX:OGDC' }, { version: '1.2.0', integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC' });
    expect(html).toContain('https://capitalist.pk/widgets/v1.2.0/loader.js');
    expect(html).toContain('integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC" crossorigin="anonymous"');
    // The jsDelivr fallback is held to the same hash.
    expect(html).toContain("s.integrity=&#39;sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC&#39;;s.crossOrigin=&#39;anonymous&#39;");
  });

  it('fetches only validated quote JSON and turns failures into null', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify(snapshot), { status: 200 }));
    await expect(fetchFallbackData('PSX:OGDC', { fetch: fetcher })).resolves.toEqual(snapshot);
    expect(fetcher).toHaveBeenCalledWith('https://capitalist.pk/w/snap/PSX/OGDC.json', expect.anything());
    await expect(fetchFallbackData('PSX:../x', { fetch: fetcher })).resolves.toBeNull();
    await expect(fetchFallbackData('PSX:OGDC', { fetch: vi.fn(async () => new Response('no', { status: 503 })) })).resolves.toBeNull();
  });
});

describe('CDN fallback in the snippet', () => {
  it('falls back to the same major on jsDelivr, or the exact version when pinned with SRI', async () => {
    const { embedSnippet } = await import('@capitalist-charts/ssr');
    expect(embedSnippet('cap-quote', { symbol: 'PSX:OGDC' })).toContain('cdn.jsdelivr.net/npm/@capitalist-charts/elements@1/cdn/loader.js');
    const pinned = embedSnippet('cap-quote', { symbol: 'PSX:OGDC' }, { version: '0.2.0', integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC' });
    expect(pinned).toContain('https://capitalist.pk/widgets/v0.2.0/loader.js');
    expect(pinned).toContain('@capitalist-charts/elements@0.2.0/cdn/loader.js');
    expect(pinned).not.toMatch(/onerror="[^"]*"[^>]*"[^>]*onerror/);
  });
});

describe('snippet hardening', () => {
  it('drops event handlers and URL attributes whatever their case', () => {
    const html = embedSnippet('cap-quote', { symbol: 'PSX:OGDC', onclick: 'alert(1)', OnMouseOver: 'alert(2)', onerror: 'x', srcdoc: '<b>', is: 'x', theme: 'dark' });
    const element = html.slice(html.indexOf('<cap-quote'));
    expect(element).not.toMatch(/\son[a-z]*=/i);
    expect(element).not.toContain('srcdoc');
    expect(element).toContain(' theme="dark"');
  });

  it('refuses a version or integrity that is not a strict pattern, so nothing reaches the inline handler', () => {
    expect(() => embedSnippet('cap-quote', {}, { version: "1';alert(1);//", integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC' })).toThrow(TypeError);
    expect(() => embedSnippet('cap-quote', {}, { version: "1';alert(1);//" })).toThrow(TypeError);
    expect(() => embedSnippet('cap-quote', {}, { version: '1.2.0', integrity: "sha384-x';alert(1)//" })).toThrow(TypeError);
    expect(() => embedSnippet('cap-quote', {}, { version: '1', integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC' })).toThrow(/exact version/);
  });

  it('keeps its timeout when the caller passes a signal', async () => {
    vi.useFakeTimers();
    try {
      const hang = vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('aborted')))));
      const pending = fetchFallbackData('PSX:OGDC', { fetch: hang as never, timeoutMs: 50, signal: new AbortController().signal });
      await vi.advanceTimersByTimeAsync(60);
      await expect(pending).resolves.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
