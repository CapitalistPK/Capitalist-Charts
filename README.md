# Capitalist Charts

[![CI](https://github.com/CapitalistPK/Capitalist-Charts/actions/workflows/ci.yml/badge.svg)](https://github.com/CapitalistPK/Capitalist-Charts/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Web components](https://img.shields.io/badge/web%20components-Lit-324fff.svg)](https://lit.dev)
[![TypeScript](https://img.shields.io/badge/types-TypeScript-3178c6.svg)](https://www.typescriptlang.org)

Open-source, live market widgets for any website: tickers, quotes, charts and analytics, starting
with the Pakistan Stock Exchange.

```html
<script type="module" src="https://capitalist.pk/widgets/v1/loader.js" async
  onerror="this.onerror=null;var s=document.createElement('script');s.type='module';s.src='https://cdn.jsdelivr.net/npm/@capitalist-charts/elements@1/cdn/loader.js';document.head.append(s)"></script>

<cap-ticker-tape symbols="PSX:KSE100,PSX:OGDC,PSX:HBL,PSX:LUCK">
  <a href="https://capitalist.pk/psx">Pakistan stock prices</a>
</cap-ticker-tape>

<cap-quote symbol="PSX:OGDC" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-quote>
```

- **Live, free, no sign-up.** Copy the snippet; there is no key to request.
- **Light.** A small loader and about 19 KB of shared code; each widget (1-2 KB) loads only when it nears the viewport.
- **Two CDNs.** If capitalist.pk cannot serve the loader, the snippet loads the identical build from jsDelivr.
- **Readable by search engines.** Whatever you put inside the tag stays in your page as plain HTML.
- **Yours to style.** Open Shadow DOM, `--cap-*` CSS variables and `::part()` on every region.
- **Honest about freshness.** Every widget shows the market state and how old the price is.
- **Accessible.** Keyboard and screen-reader friendly; anything that moves can be paused.
- **Bring your own data.** Implement `DataAdapter` (or serve the same JSON files) and the widgets
  work with any source.

## Widgets

<!-- widgets:start -->
35 widgets. Full attributes and examples: [docs/widgets.md](docs/widgets.md).

| Widget | Family | What it shows |
|---|---|---|
| `<cap-ticker-tag>` | Tickers | A live price inside a sentence. Hover or focus shows a small quote card. |
| `<cap-quote>` | Tickers | One symbol: live price, change, volume and market status. |
| `<cap-ticker-tape>` | Tickers | A scrolling strip of live prices, from a symbol list or a whole index. Pauses on hover and has a pause button. |
| `<cap-mini-chart>` | Charts | Price, change and a small area or candle chart with range tabs. |
| `<cap-symbol-overview>` | Charts | A larger chart for one or more symbols with volume, an OHLC legend on hover and range tabs. |
| `<cap-advanced-chart>` | Charts | The full SmartCharts engine: 26 chart types, 86 indicators, 85 drawing tools, 19 intervals, compare, replay. |
| `<cap-market-summary>` | Market | Main indices, market breadth (advancers vs decliners) and session status. |
| `<cap-movers>` | Market | Top gainers, losers and most active shares, live. |
| `<cap-market-map>` | Market | Every PSX company as a tile sized by market cap and coloured by today's move, grouped by sector. |
| `<cap-fx-cross-rates>` | Economy | A cross-rate table for the rupee and major currencies. |
| `<cap-fipi-lipi>` | Flows | Net buying and selling by foreign and local investor types, with the sectors foreigners bought and sold. |
| `<cap-fund-card>` | Funds | One mutual fund: NAV, returns by period, a one-year NAV chart and its rank in the category. |
| `<cap-corporate-calendar>` | Calendars | Upcoming dividends, bonuses, rights, splits, results and AGMs, filterable by type. |
| `<cap-sector-performance>` | Market | Every sector's move today, weighted by market cap, with how many shares rose and fell. |
| `<cap-index-contributors>` | Market | The members lifting and dragging an index today, in approximate index points. |
| `<cap-sector-money-map>` | Flows | Where foreign money went by sector over a day, a week and a month. |
| `<cap-valuation>` | Company | P/E, P/B, EV/EBITDA, yield, ROE and margin against the sector median, with peers. |
| `<cap-financials>` | Company | Revenue, profit and EPS by fiscal period, annual or quarterly. |
| `<cap-dividends>` | Company | Dividend yield, the next announced entitlement and the payout history. |
| `<cap-insider-trades>` | Company | Directors' and officers' disclosed trades, with net buying over 90 days and a year. |
| `<cap-radar>` | Company | The Radar read for a stock, with every driver and what the read lacks. |
| `<cap-shariah>` | Company | Whether a share is Shariah compliant, who classified it and since when. |
| `<cap-fund-performance>` | Funds | A fund's returns by period and its NAV over a year. |
| `<cap-fund-leaderboard>` | Funds | The best funds in a category by annualised return. |
| `<cap-news>` | News | The latest market or company stories with Capitalist's summary. |
| `<cap-watchlist>` | Tickers | A live, sortable table of up to 30 symbols. |
| `<cap-seasonality>` | Charts | Average return in each calendar month over up to ten years. |
| `<cap-futures-board>` | Flows | Single-stock futures with price, change, volume and front-month basis. |
| `<cap-company-profile>` | Company | What the company does, its sector, shares, free float and Shariah status. |
| `<cap-economic-calendar>` | Calendars | Upcoming economic releases with forecast, previous and actual. |
| `<cap-macro>` | Economy | One economic indicator with its history and forecast fan. |
| `<cap-fx-heatmap>` | Economy | The rupee against major currencies today, coloured by the move. |
| `<cap-commodities>` | Economy | Gold, oil, cotton and other market prices with Pakistan's fuel prices. |
| `<cap-screener>` | Tools | The top names for preset screens: momentum, breakouts, unusual volume and more. |
| `<cap-tax-calculator>` | Tools | Monthly tax and take-home pay from the current Finance Act slabs. |
<!-- widgets:end -->

## Attributes common to every widget

| Attribute | Values | Default |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | `auto` |
| `palette` | `pk` (green/red), `cvd` (colour-blind safe blue/orange) | `pk` |
| `density` | `comfortable`, `compact` | `comfortable` |
| `locale` | `en`, `ur` (right-to-left) | `en` |

## Events

| Event | When | `detail` |
|---|---|---|
| `cap:ready` | First data arrived | `{ key, notFound, failed }` |
| `cap:update` | Data changed | `{ key, notFound, failed }` |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen) | `{ key, notFound, failed }` |
| `cap:link` | Before opening a capitalist.pk page; call `preventDefault()` to handle it yourself | `{ href, widget, symbol }` |
| `cap:select` | A tab, range, row or filter was chosen | depends on the widget |

## Using npm

```bash
npm install @capitalist-charts/elements      # web components
npm install @capitalist-charts/react         # React wrappers (React 18 and 19)
npm install @capitalist-charts/ssr           # crawlable fallback HTML for server-rendered pages
```

The packages are published on npm under the `@capitalist-charts` scope. See the
[elements](https://www.npmjs.com/package/@capitalist-charts/elements),
[React](https://www.npmjs.com/package/@capitalist-charts/react),
[SSR](https://www.npmjs.com/package/@capitalist-charts/ssr),
[core](https://www.npmjs.com/package/@capitalist-charts/core) and
[schema](https://www.npmjs.com/package/@capitalist-charts/schema) package pages for their APIs.

```js
import '@capitalist-charts/elements';
```

To use another data source:

```js
import { configureCapitalistCharts } from '@capitalist-charts/elements';
configureCapitalistCharts({ dataBase: 'https://data.example.com/w' }); // or { adapter }
```

## WordPress

The plugin in [`wordpress/capitalist-charts`](wordpress/capitalist-charts) adds a shortcode:

```
[capitalist widget="ticker-tape" symbols="PSX:KSE100,PSX:OGDC,PSX:HBL"]
[capitalist widget="mini-chart" symbol="PSX:LUCK" range="1Y" theme="dark"]
```

Only the catalog's widgets and attributes pass through, every value is escaped, and the loader
is added once per page.

## Data

The widgets default to the hosted Capitalist data service, which is free to use with the
"Data by Capitalist" link left in place. The data is not part of this repository and is not
covered by the Apache licence; see NOTICE.

## Privacy

The hosted adapter samples one impression per widget tag per page load at 1 percent by default.
The hosted `config.json` can set `beaconRate` to a value from `0` to `1`, where `0` disables it.
The optional `<meta name="capitalist-charts" content="no-beacon">` switch, Global Privacy Control
and Do Not Track also disable it. When enabled, the `text/plain` body sent to `/w/beacon` is exactly
`{"d":"<location.hostname>","w":"<tag>","v":"<version>"}` and is at most 256 bytes. It has no
cookies, identifiers, URLs or user data. Bring-your-own-data adapters never send this beacon.
See [the full privacy details](docs/security.md).

## Development

```bash
pnpm install
pnpm check            # typecheck, tests, build, bundle-size budgets
```

Open `apps/playground/index.html` through any static server from the repository root to try the
widgets on sample data.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first; every commit needs
a `Signed-off-by` line (Developer Certificate of Origin). Please follow the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md), not in a public issue.

## Licence

Copyright 2026 Capitalist. Licensed under the [Apache License, Version 2.0](LICENSE); see also
[NOTICE](NOTICE).

The names "Capitalist" and "Capitalist Charts" and the logo are trademarks and are not covered by the
licence; see [TRADEMARKS.md](TRADEMARKS.md). Market data from the hosted Capitalist service is provided
under the [Capitalist data terms](https://capitalist.pk/terms), not under this licence.
