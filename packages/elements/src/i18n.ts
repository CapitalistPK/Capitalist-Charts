export type Locale = 'en' | 'ur';

const en = {
  live: 'Live', delayed: 'Delayed', closed: 'Closed', stale: 'Not updating', halted: 'Suspended', unavailable: 'Unavailable', loading: 'Loading',
  data: 'Data by Capitalist', updated: 'Updated', notFound: 'Symbol not found', search: 'Search Capitalist', pause: 'Pause ticker', play: 'Play ticker',
  vol: 'Vol', blocked: 'Market data is not available on this site.', off: 'This widget is switched off.',
  open: 'Open', high: 'High', low: 'Low', close: 'Close', range: 'Range', chartType: 'Chart type',
  gainers: 'Gainers', losers: 'Losers', active: 'Most active', movers: 'Top movers', change: 'Change', price: 'Price', symbol: 'Symbol',
  marketSummary: 'Market summary', advancers: 'Advancing', decliners: 'Declining', unchanged: 'Unchanged', breadth: 'Market breadth',
  marketMap: 'Market map', allSectors: 'All sectors', mcap: 'Market cap',
  fx: 'Currency cross rates', fxNote: 'Units of the row currency per one unit of the column currency',
  flows: 'Foreign vs local flows', foreign: 'Foreign', local: 'Local', netBuy: 'Net buy', netSell: 'Net sell', sectors: 'Sectors (foreign)', unitMillionUsd: 'USD million',
  fund: 'Fund', nav: 'NAV', rank: 'Rank', of: 'of', aum: 'Fund size', shariah: 'Shariah', category: 'Category', returns: 'Returns',
  calendar: 'Corporate calendar', upcoming: 'Upcoming', noEvents: 'No events in the next 30 days.', all: 'All',
  evD: 'Dividend', evB: 'Bonus', evR: 'Right', evS: 'Split', evE: 'Results', evA: 'AGM',
  chart: 'Chart', noData: 'No data for this range.', openChart: 'Open full chart', loadingChart: 'Loading chart',
} as const;

/** Keys of the analytics widgets' strings live in i18n-extra.ts (loaded only with those widgets). */
export type StringKey = keyof typeof en | keyof typeof import('./i18n-extra.js').EXTRA_EN;



const STRINGS: Partial<Record<Locale, Partial<Record<StringKey, string>>>> = { en: { ...en } };

/** Strings for `locale`; English until a lazily loaded locale arrives. */
export function t(locale: string, key: StringKey): string {
  return STRINGS[locale as Locale]?.[key] ?? STRINGS.en![key] ?? key;
}

/** Adds strings for a locale (widget modules call this for their own text). */
export function registerStrings(locale: Locale, strings: Partial<Record<StringKey, string>>): void {
  STRINGS[locale] = { ...STRINGS[locale], ...strings };
}

let urdu: Promise<void> | null = null;

/** Loads a locale's strings on first use, so English-only pages never download them. */
export function loadLocale(locale: string): Promise<void> | null {
  if (locale !== 'ur' || STRINGS.ur) return null;
  urdu ??= import('./i18n-ur.js').then((m) => {
    registerStrings('ur', m.UR);
  });
  return urdu;
}
