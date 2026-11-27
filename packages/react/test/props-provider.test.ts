import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { mockAdapter } from '@capitalist-charts/core';
import { configureCapitalistCharts, getRuntime } from '@capitalist-charts/elements';
import { CapQuote, CapitalistChartsProvider } from '@capitalist-charts/react';

beforeAll(() => configureCapitalistCharts({ adapter: mockAdapter() }));

afterEach(() => {
  document.body.innerHTML = '';
});

describe('React wrapper props', () => {
  it('passes ordinary HTML props through to the element', async () => {
    const host = document.body.appendChild(document.createElement('div'));
    const root = createRoot(host);
    const click = vi.fn();
    root.render(React.createElement(CapQuote, { symbol: 'PSX:OGDC', title: 'Price', role: 'region', tabIndex: 0, hidden: true, className: 'q', onClick: click }));
    await vi.waitFor(() => expect(host.querySelector('cap-quote')).not.toBeNull());
    const el = host.querySelector('cap-quote') as HTMLElement;
    expect(el.getAttribute('title')).toBe('Price');
    expect(el.getAttribute('role')).toBe('region');
    expect(el.tabIndex).toBe(0);
    expect(el.hidden).toBe(true);
    expect(el.className).toBe('q');
    // Defined elements get widget props as properties (React 19), undefined ones as attributes.
    expect((el as unknown as { symbol?: string }).symbol ?? el.getAttribute('symbol')).toBe('PSX:OGDC');
    el.click();
    expect(click).toHaveBeenCalledOnce();
    root.unmount();
  });
});

describe('CapitalistChartsProvider', () => {
  it('configures again when its adapter changes, so widgets follow the new data source', async () => {
    const host = document.body.appendChild(document.createElement('div'));
    const root = createRoot(host);
    const first = mockAdapter();
    const second = mockAdapter();
    root.render(React.createElement(CapitalistChartsProvider, { adapter: first }));
    await vi.waitFor(() => expect(getRuntime().adapter).toBe(first));
    root.render(React.createElement(CapitalistChartsProvider, { adapter: second }));
    await vi.waitFor(() => expect(getRuntime().adapter).toBe(second));
    root.unmount();
  });
});
