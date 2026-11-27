import { describe, expect, it } from 'vitest';
import { areaPath, candles, heikinAshi, linear, niceTicks, treemap } from '@capitalist-charts/core/render';
import type { Bar } from '@capitalist-charts/schema';

describe('render geometry', () => {
  it('scales, and survives a flat series', () => {
    const y = linear(10, 20, 100, 0);
    expect(y(10)).toBe(100);
    expect(y(20)).toBe(0);
    const flat = linear(5, 5, 100, 0);
    expect(Number.isFinite(flat(5))).toBe(true);
    expect(flat(5)).toBe(50);
  });

  it('closes an area path at the baseline', () => {
    expect(areaPath([[0, 5], [10, 2]], 20)).toBe('M0 5L10 2L10 20L0 20Z');
    expect(areaPath([], 20)).toBe('');
  });

  it('builds Heikin-Ashi bars that contain their open and close', () => {
    const bars: Bar[] = [[1, 10, 12, 9, 11, 1], [2, 11, 13, 10, 12, 1], [3, 12, 12, 8, 9, null]];
    for (const [, o, h, l, c] of heikinAshi(bars)) {
      expect(h).toBeGreaterThanOrEqual(Math.max(o, c));
      expect(l).toBeLessThanOrEqual(Math.min(o, c));
    }
  });

  it('marks candle direction and keeps a visible body for doji bars', () => {
    const y = linear(0, 100, 100, 0);
    const [up, doji] = candles([[1, 10, 30, 5, 20, 1], [2, 50, 60, 40, 50, 1]], { x: 0, y: 0, w: 100, h: 100 }, y);
    expect(up!.up).toBe(true);
    expect(doji!.bottom - doji!.top).toBeGreaterThanOrEqual(1);
  });

  it('picks round ticks', () => {
    expect(niceTicks(0, 100, 4)).toEqual([0, 25, 50, 75, 100]);
    expect(niceTicks(181.2, 186.9, 3)).toEqual([182, 184, 186]);
  });

  it('tiles a treemap that fills the box exactly', () => {
    const items = [6, 6, 4, 3, 2, 2, 1, 0, -3];
    const rects = treemap(items, (v) => v, { x: 0, y: 0, w: 600, h: 400 });
    expect(rects).toHaveLength(7);
    const area = rects.reduce((s, r) => s + r.w * r.h, 0);
    expect(area).toBeCloseTo(600 * 400, 3);
    for (const r of rects) {
      expect(r.x).toBeGreaterThanOrEqual(-1e-9);
      expect(r.y + r.h).toBeLessThanOrEqual(400 + 1e-6);
      expect(r.x + r.w).toBeLessThanOrEqual(600 + 1e-6);
    }
  });
});
