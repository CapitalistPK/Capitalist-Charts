/**
 * The outer height each widget keeps in every state (loading, data, messages), calibrated to the
 * catalogue's default data at the narrowest supported width. Rows may use less of the box, never
 * more. One table, read by both the base element (once upgraded) and the loader (before the
 * widget's code arrives), so the box is the same size from the first frame.
 */
export const RESERVED_HEIGHTS: Record<string, number> = {
  'cap-ticker-tag': 20,
  'cap-quote': 184,
  'cap-ticker-tape': 46,
  'cap-mini-chart': 250,
  'cap-symbol-overview': 420,
  'cap-advanced-chart': 560,
  'cap-market-summary': 330,
  'cap-movers': 520,
  'cap-market-map': 480,
  'cap-fx-cross-rates': 320,
  'cap-fipi-lipi': 560,
  'cap-fund-card': 340,
  'cap-corporate-calendar': 560,
  'cap-sector-performance': 420,
  'cap-index-contributors': 440,
  'cap-sector-money-map': 420,
  'cap-valuation': 420,
  'cap-financials': 420,
  'cap-dividends': 540,
  'cap-insider-trades': 430,
  'cap-radar': 420,
  'cap-shariah': 130,
  'cap-fund-performance': 380,
  'cap-fund-leaderboard': 560,
  'cap-news': 560,
  'cap-watchlist': 360,
  'cap-seasonality': 300,
  'cap-futures-board': 520,
  'cap-company-profile': 400,
  'cap-economic-calendar': 480,
  'cap-macro': 300,
  'cap-fx-heatmap': 390,
  'cap-commodities': 560,
  'cap-screener': 500,
  'cap-tax-calculator': 320,
};

/** Inline widgets sit in a line of text and take its height, so they reserve nothing. */
export function isInlineWidget(tag: string, shape: string | null): boolean {
  return tag === 'cap-ticker-tag' || (tag === 'cap-shariah' && shape === 'inline');
}

/**
 * Rules for widgets whose code has not loaded yet. `:where()` gives them zero specificity, so a
 * host's own `height` on the tag still wins, before and after the upgrade alike.
 */
export function pendingReservationCss(): string {
  const blocks = Object.entries(RESERVED_HEIGHTS)
    .filter(([tag]) => tag !== 'cap-ticker-tag')
    .map(([tag, h]) => `:where(${tag}:not(:defined)${tag === 'cap-shariah' ? ":not([shape='inline'])" : ''}){display:block;height:${h}px;overflow:hidden}`)
    .join('');
  const inline = ":where(cap-ticker-tag:not(:defined)){display:inline-block;min-width:32ch;vertical-align:baseline;font-size:inherit;line-height:inherit;font-variant-numeric:tabular-nums}:where(cap-shariah:not(:defined)[shape='inline']){display:inline-block;min-width:22ch;vertical-align:baseline;font-size:inherit;line-height:inherit;font-variant-numeric:tabular-nums}";
  return blocks + inline;
}
