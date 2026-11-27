import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { CapMiniChart, CapQuote, CapitalistChartsProvider } from '@capitalist-charts/react';

// Define the elements before any render. Otherwise whether a tag is upgraded before or after React
// sets its attributes depends on how fast the dynamic import resolves, and happy-dom (unlike browsers)
// does not replay attributes set before the upgrade, so a slow CI runner read the default theme.
// The browser suite covers upgrade order for real; these tests are about React props to attributes.
beforeAll(async () => {
  await import('@capitalist-charts/elements');
  await customElements.whenDefined('cap-mini-chart');
});

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
    // React 19 hands a defined custom element its props as properties and an undefined one as
    // attributes; either way the widget must end up with these values.
    const el = host.querySelector('cap-mini-chart') as HTMLElement & { symbol: string; chartType: string; theme: string };
    expect(el.symbol).toBe('PSX:OGDC');
    expect(el.chartType).toBe('line');
    expect(el.theme).toBe('dark');
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
