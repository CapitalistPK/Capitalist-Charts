import type { MarketStatus, QuoteSnapshot } from '@capitalist-charts/schema/base';

/** What a widget should say about a price. Every widget shows one of these, never nothing. */
export type QuoteState = 'loading' | 'live' | 'delayed' | 'closed' | 'stale' | 'halted' | 'unknown-symbol' | 'unavailable';

/** The publisher writes the status every second; this long without a write means it stopped. */
export const PUBLISHER_SILENT_SEC = 30;

export function quoteState(quote: QuoteSnapshot | null | undefined, status: MarketStatus | null | undefined, nowSec: number, opts: { notFound?: boolean; failed?: boolean } = {}): QuoteState {
  if (opts.notFound) return 'unknown-symbol';
  if (!quote) return opts.failed ? 'unavailable' : 'loading';
  if (quote.ts === 'suspended' || quote.ts === 'halted') return 'halted';
  if (!status || nowSec - status.pub > PUBLISHER_SILENT_SEC) return 'stale';
  if (!status.open) return 'closed';
  if (quote.st) return 'stale';
  if (quote.d > 0) return 'delayed';
  return 'live';
}

/** Market states during which prices may move, so polling should run at full speed. */
export function shouldPollFast(status: MarketStatus | null | undefined): boolean {
  return !status || status.open;
}
