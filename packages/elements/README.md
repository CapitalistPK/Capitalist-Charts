# @capitalist-charts/elements

Lit web components for live Capitalist Charts market widgets. Use this package for plain HTML,
static sites and any framework that can load browser custom elements.

## CDN

```html
<script type="module" src="https://capitalist.pk/widgets/v1/loader.js" async
  onerror="this.onerror=null;var s=document.createElement('script');s.type='module';s.src='https://cdn.jsdelivr.net/npm/@capitalist-charts/elements@1/cdn/loader.js';document.head.append(s)"></script>

<cap-quote symbol="PSX:OGDC">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-quote>
```

## npm

```bash
npm install @capitalist-charts/elements@1.0.1
```

```js
import '@capitalist-charts/elements';
```

The published catalog has 35 elements: `cap-ticker-tag`, `cap-quote`, `cap-ticker-tape`,
`cap-mini-chart`, `cap-symbol-overview`, `cap-advanced-chart`, `cap-market-summary`, `cap-movers`,
`cap-market-map`, `cap-fx-cross-rates`, `cap-fipi-lipi`, `cap-fund-card`, `cap-corporate-calendar`,
`cap-sector-performance`, `cap-index-contributors`, `cap-sector-money-map`, `cap-valuation`,
`cap-financials`, `cap-dividends`, `cap-insider-trades`, `cap-radar`, `cap-shariah`,
`cap-fund-performance`, `cap-fund-leaderboard`, `cap-news`, `cap-watchlist`, `cap-seasonality`,
`cap-futures-board`, `cap-company-profile`, `cap-economic-calendar`, `cap-macro`, `cap-fx-heatmap`,
`cap-commodities`, `cap-screener` and `cap-tax-calculator`.

Every element accepts `theme`, `palette`, `density` and `locale`. The catalog exports `CATALOG`,
`TAGS`, `COMMON_ATTRIBUTES`, `EVENTS` and `specFor`; runtime configuration exports
`configureCapitalistCharts`. Widgets emit `cap:ready`, `cap:update`, `cap:error`, `cap:link` and
`cap:select`.

The package uses browser custom elements, Shadow DOM and ES modules. It works with plain HTML and
frameworks that support custom elements. It is Apache-2.0.
Read the [widget catalog](https://capitalist.pk/docs/widgets/), [installation guide](https://capitalist.pk/docs/widgets/guides/installation/)
and [source repository](https://github.com/CapitalistPK/Capitalist-Charts/tree/main/packages/elements).
