import { describe, expect, it } from 'vitest';
import { direction, formatAge, formatChange, formatClock, formatCompact, formatNumber, formatPercent, toUrduDigits , formatFlow } from '@capitalist-charts/core';

describe('formatting', () => {
  it('formats prices with separators and fixed decimals', () => {
    expect(formatNumber(118402.3)).toBe('118,402.30');
    expect(formatNumber(NaN)).toBe('—');
  });
  it('signs changes with a real minus', () => {
    expect(formatChange(2.15)).toBe('+2.15');
    expect(formatChange(-0.4)).toBe('−0.40');
    expect(formatChange(0)).toBe('0.00');
    expect(formatChange(null)).toBe('—');
    expect(formatPercent(1.19)).toBe('+1.19%');
  });
  it('uses lakh and crore for Pakistani readers, K/M/B otherwise', () => {
    expect(formatCompact(12_500_000)).toBe('1.25 Cr');
    expect(formatCompact(450_000)).toBe('4.5 Lac');
    expect(formatCompact(612_400_000)).toBe('61.2 Cr');
    expect(formatCompact(12_500_000, 'international')).toBe('12.5M');
    expect(formatCompact(-2_300)).toBe('−2.3K');
    expect(formatCompact(null)).toBe('—');
  });
  it('converts to Urdu digits', () => {
    expect(toUrduDigits('182.40')).toBe('۱۸۲.۴۰');
  });
  it('says how old a timestamp is', () => {
    expect(formatAge(100, 101)).toBe('now');
    expect(formatAge(100, 130)).toBe('30 s');
    expect(formatAge(100, 100 + 180)).toBe('3 min');
    expect(formatAge(100, 100 + 7200)).toBe('2 h');
  });
  it('shows market clock time in Pakistan', () => {
    expect(formatClock(Date.parse('2026-11-26T09:32:00Z') / 1000)).toBe('14:32');
  });
  it('classifies direction', () => {
    expect([direction(1), direction(-1), direction(0), direction(null)]).toEqual(['up', 'down', 'flat', 'flat']);
  });
});

describe('formatFlow', () => {
  it('writes the unit a flow is in, not always dollars', () => {
    expect(formatFlow(-1_630_000, 'USD')).toBe('−$1.63M');
    expect(formatFlow(1_630_000, 'PKR')).toBe('+1.63M PKR');
  });
});
