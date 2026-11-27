/**
 * Every widget's public surface in one place: tag, attributes, size, data tier. The loader, the
 * React wrappers, the SSR helper, the docs and the gallery are all generated from this list, so a
 * widget is added here once.
 *
 * Kept free of imports so it can be read by build scripts and Node without a DOM.
 */

export type Family = 'tickers' | 'charts' | 'market' | 'economy' | 'flows' | 'funds' | 'calendar' | 'company' | 'news' | 'tools';
export type Shape = 'inline' | 'strip' | 'card' | 'panel' | 'tall' | 'full';

export interface AttributeSpec {
  name: string;
  /** Example or default value. */
  value: string;
  /** Allowed values, when fixed. */
  options?: readonly string[];
  description: string;
}

export interface WidgetSpec {
  tag: string;
  /** PascalCase name for the React wrapper and the element class. */
  name: string;
  title: string;
  description: string;
  family: Family;
  shapes: readonly Shape[];
  /** Default size for previews and the builder, CSS lengths. */
  size: { width: string; height: string };
  /** `L0`: live snapshot; `L1`: cached summary; `frame`: SmartCharts iframe; `none`: no data. */
  data: 'L0' | 'L1' | 'frame' | 'none';
  attributes: readonly AttributeSpec[];
  /** Launch phase in the plan. */
  phase: 1 | 2 | 3;
}

const SYMBOL = (value = 'PSX:OGDC'): AttributeSpec => ({ name: 'symbol', value, description: 'Market and symbol, e.g. PSX:OGDC. A bare symbol means PSX.' });
export const RANGES = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y'] as const;
const RANGE: AttributeSpec = { name: 'range', value: '1D', options: RANGES, description: 'Initial chart range.' };

/** Attributes every widget accepts. */
export const COMMON_ATTRIBUTES: readonly AttributeSpec[] = [
  { name: 'theme', value: 'auto', options: ['auto', 'light', 'dark', 'transparent'], description: 'Colour scheme; auto follows the visitor.' },
  { name: 'palette', value: 'pk', options: ['pk', 'cvd'], description: 'Up/down colours: green/red, or blue/orange for colour-blind readers.' },
  { name: 'density', value: 'comfortable', options: ['comfortable', 'compact'], description: 'Spacing.' },
  { name: 'locale', value: 'en', options: ['en', 'ur'], description: 'Language. Urdu switches to right-to-left.' },
];

/** Events every widget fires (bubbling, composed). */
export const EVENTS = [
  { name: 'cap:ready', description: 'First data rendered.' },
  { name: 'cap:update', description: 'Data changed.' },
  { name: 'cap:error', description: 'Unknown symbol or failed request (the last good data stays on screen).' },
  { name: 'cap:link', description: 'Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }.' },
  { name: 'cap:select', description: 'A row, tile or range was chosen. detail depends on the widget.' },
] as const;

export const CATALOG: readonly WidgetSpec[] = [
  {
    tag: 'cap-ticker-tag', name: 'CapTickerTag', title: 'Ticker tag', family: 'tickers', shapes: ['inline'], size: { width: 'auto', height: '1.4em' }, data: 'L0', phase: 1,
    description: 'A live price inside a sentence. Hover or focus shows a small quote card.',
    attributes: [SYMBOL(), { name: 'show', value: 'price', options: ['price', 'change', 'both'], description: 'What follows the symbol.' }],
  },
  {
    tag: 'cap-quote', name: 'CapQuote', title: 'Quote card', family: 'tickers', shapes: ['card'], size: { width: '300px', height: '180px' }, data: 'L0', phase: 1,
    description: 'One symbol: live price, change, volume and market status.',
    attributes: [SYMBOL()],
  },
  {
    tag: 'cap-ticker-tape', name: 'CapTickerTape', title: 'Ticker tape', family: 'tickers', shapes: ['strip'], size: { width: '100%', height: '46px' }, data: 'L0', phase: 1,
    description: 'A scrolling strip of live prices, from a symbol list or a whole index. Pauses on hover and has a pause button.',
    attributes: [
      { name: 'symbols', value: 'PSX:KSE100,PSX:OGDC,PSX:HBL', description: 'Comma-separated symbols (up to 40).' },
      { name: 'index', value: '', description: 'Instead of symbols: every constituent of an index, e.g. KSE100.' },
      { name: 'speed', value: '40', description: 'Seconds per loop.' },
    ],
  },
  {
    tag: 'cap-mini-chart', name: 'CapMiniChart', title: 'Mini chart', family: 'charts', shapes: ['card'], size: { width: '360px', height: '220px' }, data: 'L1', phase: 1,
    description: 'Price, change and a small area or candle chart with range tabs.',
    attributes: [SYMBOL(), RANGE, { name: 'chart-type', value: 'area', options: ['area', 'line', 'candles', 'bars', 'heikin-ashi'], description: 'How prices are drawn.' }],
  },
  {
    tag: 'cap-symbol-overview', name: 'CapSymbolOverview', title: 'Symbol overview', family: 'charts', shapes: ['panel'], size: { width: '100%', height: '420px' }, data: 'L1', phase: 1,
    description: 'A larger chart for one or more symbols with volume, an OHLC legend on hover and range tabs.',
    attributes: [
      { name: 'symbols', value: 'PSX:OGDC,PSX:PPL', description: 'Up to 4 symbols; the first is drawn as candles or area, others as compare lines.' },
      { ...RANGE, value: '1Y' },
      { name: 'chart-type', value: 'candles', options: ['area', 'line', 'candles', 'bars', 'heikin-ashi'], description: 'How the first symbol is drawn.' },
      { name: 'volume', value: 'true', options: ['true', 'false'], description: 'Show volume bars.' },
    ],
  },
  {
    tag: 'cap-advanced-chart', name: 'CapAdvancedChart', title: 'Advanced chart', family: 'charts', shapes: ['panel', 'full'], size: { width: '100%', height: '560px' }, data: 'frame', phase: 1,
    description: 'The full SmartCharts engine: 26 chart types, 86 indicators, 85 drawing tools, 19 intervals, compare, replay.',
    attributes: [
      SYMBOL(),
      { name: 'interval', value: '1D', description: 'Bar interval, from 1m to 12M.' },
      { name: 'chart-type', value: 'candles', description: 'Any SmartCharts chart type, e.g. candles, heikin-ashi, renko.' },
      { name: 'studies', value: '', description: 'Comma-separated indicators, e.g. RSI,MACD,EMA:50.' },
      { name: 'compare', value: '', description: 'Comma-separated symbols to compare.' },
      { name: 'hide-top-toolbar', value: 'false', options: ['true', 'false'], description: 'Hide the top toolbar.' },
      { name: 'hide-side-toolbar', value: 'false', options: ['true', 'false'], description: 'Hide the drawing tools.' },
      { name: 'allow-symbol-change', value: 'true', options: ['true', 'false'], description: 'Let visitors search other symbols.' },
      { name: 'events', value: 'true', options: ['true', 'false'], description: 'Dividend, bonus, right and split marks.' },
    ],
  },
  {
    tag: 'cap-market-summary', name: 'CapMarketSummary', title: 'Market summary', family: 'market', shapes: ['card', 'panel'], size: { width: '420px', height: '300px' }, data: 'L0', phase: 1,
    description: 'Main indices, market breadth (advancers vs decliners) and session status.',
    attributes: [{ name: 'indices', value: 'PSX:KSE100,PSX:KSE30,PSX:KMI30,PSX:ALLSHR', description: 'Indices to list (up to 8).' }],
  },
  {
    tag: 'cap-movers', name: 'CapMovers', title: 'Top movers', family: 'market', shapes: ['card', 'tall'], size: { width: '360px', height: '420px' }, data: 'L0', phase: 1,
    description: 'Top gainers, losers and most active shares, live.',
    attributes: [
      { name: 'market', value: 'PSX', description: 'Market.' },
      { name: 'tab', value: 'gainers', options: ['gainers', 'losers', 'active'], description: 'Initial tab.' },
      { name: 'rows', value: '10', description: 'Rows shown (up to 10).' },
    ],
  },
  {
    tag: 'cap-market-map', name: 'CapMarketMap', title: 'Market map', family: 'market', shapes: ['panel', 'full'], size: { width: '100%', height: '480px' }, data: 'L0', phase: 1,
    description: 'Every PSX company as a tile sized by market cap and coloured by today\'s move, grouped by sector.',
    attributes: [{ name: 'market', value: 'PSX', description: 'Market.' }, { name: 'sector', value: '', description: 'Show one sector only.' }],
  },
  {
    tag: 'cap-fx-cross-rates', name: 'CapFxCrossRates', title: 'FX cross rates', family: 'economy', shapes: ['panel'], size: { width: '100%', height: '320px' }, data: 'L1', phase: 1,
    description: 'A cross-rate table for the rupee and major currencies.',
    attributes: [{ name: 'currencies', value: 'PKR,USD,EUR,GBP,SAR,AED,CNY', description: 'Currencies in the table (up to 8).' }],
  },
  {
    tag: 'cap-fipi-lipi', name: 'CapFipiLipi', title: 'Foreign vs local flows', family: 'flows', shapes: ['card', 'panel'], size: { width: '560px', height: '360px' }, data: 'L1', phase: 1,
    description: 'Net buying and selling by foreign and local investor types, with the sectors foreigners bought and sold.',
    attributes: [{ name: 'period', value: '1D', options: ['1D', '1W', '1M'], description: 'Initial period.' }],
  },
  {
    tag: 'cap-fund-card', name: 'CapFundCard', title: 'Fund card', family: 'funds', shapes: ['card'], size: { width: '360px', height: '340px' }, data: 'L1', phase: 1,
    description: 'One mutual fund: NAV, returns by period, a one-year NAV chart and its rank in the category.',
    attributes: [{ name: 'fund', value: 'meezan-islamic-fund', description: 'The fund\'s capitalist.pk slug.' }],
  },
  {
    tag: 'cap-corporate-calendar', name: 'CapCorporateCalendar', title: 'Corporate calendar', family: 'calendar', shapes: ['tall', 'panel'], size: { width: '340px', height: '560px' }, data: 'L1', phase: 1,
    description: 'Upcoming dividends, bonuses, rights, splits, results and AGMs, filterable by type.',
    attributes: [
      { name: 'symbol', value: '', description: 'One company only (optional).' },
      { name: 'types', value: 'D,B,R,S,E,A', description: 'Event types shown.' },
    ],
  },
  {
    tag: 'cap-sector-performance', name: 'CapSectorPerformance', title: "Sector performance", family: 'market', shapes: ['card', 'panel'], size: { width: '420px', height: '420px' }, data: 'L0', phase: 2,
    description: "Every sector's move today, weighted by market cap, with how many shares rose and fell.",
    attributes: [{ name: "market", value: "PSX", description: "Market." }, { name: "rows", value: "12", description: "Sectors shown." }],
  },
  {
    tag: 'cap-index-contributors', name: 'CapIndexContributors', title: "Index contributors", family: 'market', shapes: ['card'], size: { width: '420px', height: '340px' }, data: 'L0', phase: 2,
    description: "The members lifting and dragging an index today, in approximate index points.",
    attributes: [{ name: "index", value: "PSX:KSE100", description: "Index, e.g. PSX:KSE100." }, { name: "rows", value: "6", description: "Rows per side." }],
  },
  {
    tag: 'cap-sector-money-map', name: 'CapSectorMoneyMap', title: "Sector money map", family: 'flows', shapes: ['panel'], size: { width: '480px', height: '420px' }, data: 'L1', phase: 2,
    description: "Where foreign money went by sector over a day, a week and a month.",
    attributes: [],
  },
  {
    tag: 'cap-valuation', name: 'CapValuation', title: "Valuation vs peers", family: 'company', shapes: ['card'], size: { width: '360px', height: '420px' }, data: 'L1', phase: 2,
    description: "P/E, P/B, EV/EBITDA, yield, ROE and margin against the sector median, with peers.",
    attributes: [{ name: "symbol", value: "PSX:LUCK", description: "Market and symbol." }],
  },
  {
    tag: 'cap-financials', name: 'CapFinancials', title: "Financials", family: 'company', shapes: ['panel'], size: { width: '420px', height: '420px' }, data: 'L1', phase: 2,
    description: "Revenue, profit and EPS by fiscal period, annual or quarterly.",
    attributes: [{ name: "symbol", value: "PSX:OGDC", description: "Market and symbol." }, { name: "period", value: "annual", options: ["annual", "quarterly"], description: "Initial period." }],
  },
  {
    tag: 'cap-dividends', name: 'CapDividends', title: "Dividends", family: 'company', shapes: ['card'], size: { width: '340px', height: '380px' }, data: 'L1', phase: 2,
    description: "Dividend yield, the next announced entitlement and the payout history.",
    attributes: [{ name: "symbol", value: "PSX:FFC", description: "Market and symbol." }],
  },
  {
    tag: 'cap-insider-trades', name: 'CapInsiderTrades', title: "Insider trades", family: 'company', shapes: ['card', 'panel'], size: { width: '380px', height: '400px' }, data: 'L1', phase: 2,
    description: "Directors' and officers' disclosed trades, with net buying over 90 days and a year.",
    attributes: [{ name: "symbol", value: "PSX:SYS", description: "Market and symbol." }],
  },
  {
    tag: 'cap-radar', name: 'CapRadar', title: "Capitalist Radar", family: 'company', shapes: ['card'], size: { width: '340px', height: '420px' }, data: 'L1', phase: 2,
    description: "The Radar read for a stock, with every driver and what the read lacks.",
    attributes: [{ name: "symbol", value: "PSX:OGDC", description: "Market and symbol." }],
  },
  {
    tag: 'cap-shariah', name: 'CapShariah', title: "Shariah status", family: 'company', shapes: ['inline', 'card'], size: { width: '260px', height: '120px' }, data: 'L1', phase: 2,
    description: "Whether a share is Shariah compliant, who classified it and since when.",
    attributes: [{ name: "symbol", value: "PSX:MEBL", description: "Market and symbol." }, { name: "shape", value: "card", options: ["card", "inline"], description: "A card, or a badge for running text." }],
  },
  {
    tag: 'cap-fund-performance', name: 'CapFundPerformance', title: "Fund performance", family: 'funds', shapes: ['panel'], size: { width: '420px', height: '380px' }, data: 'L1', phase: 2,
    description: "A fund's returns by period and its NAV over a year.",
    attributes: [{ name: "fund", value: "meezan-islamic-fund", description: "The fund's capitalist.pk slug." }],
  },
  {
    tag: 'cap-fund-leaderboard', name: 'CapFundLeaderboard', title: "Fund leaderboard", family: 'funds', shapes: ['tall'], size: { width: '340px', height: '520px' }, data: 'L1', phase: 2,
    description: "The best funds in a category by annualised return.",
    attributes: [{ name: "category", value: "equity", description: "Fund category slug, e.g. equity, money-market." }, { name: "period", value: "1Y", options: ["1Y", "3Y", "5Y"], description: "Return period." }, { name: "rows", value: "10", description: "Rows shown." }],
  },
  {
    tag: 'cap-news', name: 'CapNews', title: "News", family: 'news', shapes: ['tall', 'panel'], size: { width: '340px', height: '520px' }, data: 'L1', phase: 2,
    description: "The latest market or company stories with Capitalist's summary.",
    attributes: [{ name: "symbol", value: "", description: "One company (optional)." }, { name: "rows", value: "6", description: "Stories shown." }, { name: "summaries", value: "true", options: ["true", "false"], description: "Show summaries." }],
  },
  {
    tag: 'cap-watchlist', name: 'CapWatchlist', title: "Watchlist", family: 'tickers', shapes: ['panel'], size: { width: '480px', height: '360px' }, data: 'L0', phase: 3,
    description: "A live, sortable table of up to 30 symbols.",
    attributes: [{ name: "symbols", value: "PSX:KSE100,PSX:OGDC,PSX:HBL,PSX:LUCK", description: "Comma-separated symbols." }, { name: "sort", value: "", description: "Column: symbol, price, change or vol; prefix - for descending." }],
  },
  {
    tag: 'cap-seasonality', name: 'CapSeasonality', title: "Seasonality", family: 'charts', shapes: ['panel'], size: { width: '420px', height: '300px' }, data: 'L1', phase: 3,
    description: "Average return in each calendar month over up to ten years.",
    attributes: [{ name: "symbol", value: "PSX:KSE100", description: "Market and symbol." }],
  },
  {
    tag: 'cap-futures-board', name: 'CapFuturesBoard', title: "Futures board", family: 'flows', shapes: ['panel'], size: { width: '480px', height: '480px' }, data: 'L1', phase: 3,
    description: "Single-stock futures with price, change, volume and front-month basis.",
    attributes: [{ name: "market", value: "PSX", description: "Market." }, { name: "rows", value: "15", description: "Contracts shown." }],
  },
  {
    tag: 'cap-company-profile', name: 'CapCompanyProfile', title: "Company profile", family: 'company', shapes: ['card'], size: { width: '340px', height: '400px' }, data: 'L1', phase: 3,
    description: "What the company does, its sector, shares, free float and Shariah status.",
    attributes: [{ name: "symbol", value: "PSX:LUCK", description: "Market and symbol." }],
  },
  {
    tag: 'cap-economic-calendar', name: 'CapEconomicCalendar', title: "Economic calendar", family: 'calendar', shapes: ['tall', 'panel'], size: { width: '480px', height: '480px' }, data: 'L1', phase: 3,
    description: "Upcoming economic releases with forecast, previous and actual.",
    attributes: [{ name: "currencies", value: "", description: "Currencies shown, e.g. PKR,USD (empty = all)." }, { name: "impact", value: "low", options: ["low", "medium", "high"], description: "Lowest impact shown." }],
  },
  {
    tag: 'cap-macro', name: 'CapMacro', title: "Macro indicator", family: 'economy', shapes: ['card', 'panel'], size: { width: '380px', height: '300px' }, data: 'L1', phase: 3,
    description: "One economic indicator with its history and forecast fan.",
    attributes: [{ name: "code", value: "PAK.CPI.YOY", description: "Indicator code from capitalist.pk/economy." }],
  },
  {
    tag: 'cap-fx-heatmap', name: 'CapFxHeatmap', title: "Rupee heatmap", family: 'economy', shapes: ['panel'], size: { width: '420px', height: '260px' }, data: 'L1', phase: 3,
    description: "The rupee against major currencies today, coloured by the move.",
    attributes: [],
  },
  {
    tag: 'cap-commodities', name: 'CapCommodities', title: "Commodities", family: 'economy', shapes: ['card'], size: { width: '340px', height: '420px' }, data: 'L1', phase: 3,
    description: "Gold, oil, cotton and other market prices with Pakistan's fuel prices.",
    attributes: [],
  },
  {
    tag: 'cap-screener', name: 'CapScreener', title: "Screener", family: 'tools', shapes: ['full', 'panel'], size: { width: '560px', height: '480px' }, data: 'L1', phase: 3,
    description: "The top names for preset screens: momentum, breakouts, unusual volume and more.",
    attributes: [{ name: "preset", value: "momentum", options: ["momentum", "breakouts", "unusual_volume", "relative_strength", "near_52_week", "reversals"], description: "Initial screen." }, { name: "presets", value: "momentum,breakouts,unusual_volume,relative_strength", description: "Screens offered as tabs." }],
  },
  {
    tag: 'cap-tax-calculator', name: 'CapTaxCalculator', title: "Salary tax calculator", family: 'tools', shapes: ['panel', 'card'], size: { width: '340px', height: '320px' }, data: 'L1', phase: 3,
    description: "Monthly tax and take-home pay from the current Finance Act slabs.",
    attributes: [{ name: "salary", value: "150000", description: "Initial monthly salary in PKR." }],
  },
];

export const TAGS = CATALOG.map((w) => w.tag);

export function specFor(tag: string): WidgetSpec | undefined {
  return CATALOG.find((w) => w.tag === tag);
}
