import { afterEach, describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { CapMiniChart, CapQuote, CapitalistChartsProvider } from '@capitalist-charts/react';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('@capitalist-charts/react', () => {
  it('renders a catalog tag, attributes, and light-DOM children', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    root.render(React.createElement(CapMiniChart, { symbol: 'PSX:OGDC', chartType: 'line', theme: 'dark' }, React.createElement('a', { href: 'https://capitalist.pk/psx/ogdc' }, 'OGDC')));
    await vi.waitFor(() => expect(host.querySelector('cap-mini-chart')).not.toBeNull());
    const el = host.querySelector('cap-mini-chart')!;
    expect(el.getAttribute('symbol')).toBe('PSX:OGDC');
    expect(el.getAttribute('chart-type')).toBe('line');
    expect(el.getAttribute('theme')).toBe('dark');
    expect(el.querySelector('a')?.textContent).toBe('OGDC');
  });

  it('wires and unwires custom events and forwards the ref', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const select = vi.fn();
    const ref = React.createRef<HTMLElement>();
    root.render(React.createElement(CapQuote, { ref, onCapSelect: select }));
    await vi.waitFor(() => expect(ref.current).not.toBeNull());
    ref.current!.dispatchEvent(new CustomEvent('cap:select'));
    expect(select).toHaveBeenCalledOnce();
    const element = ref.current!;
    root.unmount();
    element.dispatchEvent(new CustomEvent('cap:select'));
    expect(select).toHaveBeenCalledOnce();
  });

  it('renders on the server without touching customElements', () => {
    const original = globalThis.customElements;
    Object.defineProperty(globalThis, 'customElements', { configurable: true, value: undefined });
    try {
      expect(renderToString(React.createElement(CapitalistChartsProvider, { dataBase: 'https://example.test/w' }, React.createElement(CapQuote, { symbol: 'PSX:HBL' })))).toContain('cap-quote');
    } finally {
      Object.defineProperty(globalThis, 'customElements', { configurable: true, value: original });
    }
  });
});
