---
title: Widgets
---

# Widgets

The widget catalog is generated from the built elements package so examples and attributes stay aligned with the public component list.

Hosts can override a reserved widget height with their own CSS `height` when their layout needs a different box.

## Ticker tag — `<cap-ticker-tag>`

A live price inside a sentence. Hover or focus shows a small quote card.

```html
<cap-ticker-tag symbol="PSX:OGDC" show="price" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-ticker-tag>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbol` | `PSX:OGDC` | Market and symbol, e.g. PSX:OGDC. A bare symbol means PSX. |
| `show` | `price`, `change`, `both` | What follows the symbol. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Quote card — `<cap-quote>`

One symbol: live price, change, volume and market status.

```html
<cap-quote symbol="PSX:OGDC" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-quote>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbol` | `PSX:OGDC` | Market and symbol, e.g. PSX:OGDC. A bare symbol means PSX. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Ticker tape — `<cap-ticker-tape>`

A scrolling strip of live prices, from a symbol list or a whole index. Pauses on hover and has a pause button.

```html
<cap-ticker-tape symbols="PSX:KSE100,PSX:OGDC,PSX:HBL" index="" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-ticker-tape>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbols` | `PSX:KSE100,PSX:OGDC,PSX:HBL` | Comma-separated symbols (up to 40). |
| `index` | `—` | Instead of symbols: every constituent of an index, e.g. KSE100. |
| `speed` | `40` | Seconds per loop. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Mini chart — `<cap-mini-chart>`

Price, change and a small area or candle chart with range tabs.

```html
<cap-mini-chart symbol="PSX:OGDC" range="1D" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-mini-chart>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbol` | `PSX:OGDC` | Market and symbol, e.g. PSX:OGDC. A bare symbol means PSX. |
| `range` | `1D`, `5D`, `1M`, `3M`, `6M`, `YTD`, `1Y`, `5Y` | Initial chart range. |
| `chart-type` | `area`, `line`, `candles`, `bars`, `heikin-ashi` | How prices are drawn. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Symbol overview — `<cap-symbol-overview>`

A larger chart for one or more symbols with volume, an OHLC legend on hover and range tabs.

```html
<cap-symbol-overview symbols="PSX:OGDC,PSX:PPL" range="1Y" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-symbol-overview>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbols` | `PSX:OGDC,PSX:PPL` | Up to 4 symbols; the first is drawn as candles or area, others as compare lines. |
| `range` | `1D`, `5D`, `1M`, `3M`, `6M`, `YTD`, `1Y`, `5Y` | Initial chart range. |
| `chart-type` | `area`, `line`, `candles`, `bars`, `heikin-ashi` | How the first symbol is drawn. |
| `volume` | `true`, `false` | Show volume bars. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Advanced chart — `<cap-advanced-chart>`

The full SmartCharts engine: 26 chart types, 86 indicators, 85 drawing tools, 19 intervals, compare, replay.

```html
<cap-advanced-chart symbol="PSX:OGDC" interval="1D" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-advanced-chart>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbol` | `PSX:OGDC` | Market and symbol, e.g. PSX:OGDC. A bare symbol means PSX. |
| `interval` | `1D` | Bar interval, from 1m to 12M. |
| `chart-type` | `candles` | Any SmartCharts chart type, e.g. candles, heikin-ashi, renko. |
| `studies` | `—` | Comma-separated indicators, e.g. RSI,MACD,EMA:50. |
| `compare` | `—` | Comma-separated symbols to compare. |
| `hide-top-toolbar` | `true`, `false` | Hide the top toolbar. |
| `hide-side-toolbar` | `true`, `false` | Hide the drawing tools. |
| `allow-symbol-change` | `true`, `false` | Let visitors search other symbols. |
| `events` | `true`, `false` | Dividend, bonus, right and split marks. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Market summary — `<cap-market-summary>`

Main indices, market breadth (advancers vs decliners) and session status.

```html
<cap-market-summary indices="PSX:KSE100,PSX:KSE30,PSX:KMI30,PSX:ALLSHR" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-market-summary>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `indices` | `PSX:KSE100,PSX:KSE30,PSX:KMI30,PSX:ALLSHR` | Indices to list (up to 8). |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Top movers — `<cap-movers>`

Top gainers, losers and most active shares, live.

```html
<cap-movers market="PSX" tab="gainers" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-movers>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `market` | `PSX` | Market. |
| `tab` | `gainers`, `losers`, `active` | Initial tab. |
| `rows` | `10` | Rows shown (up to 10). |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Market map — `<cap-market-map>`

Every PSX company as a tile sized by market cap and coloured by today's move, grouped by sector.

```html
<cap-market-map market="PSX" sector="" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-market-map>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `market` | `PSX` | Market. |
| `sector` | `—` | Show one sector only. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## FX cross rates — `<cap-fx-cross-rates>`

A cross-rate table for the rupee and major currencies.

```html
<cap-fx-cross-rates currencies="PKR,USD,EUR,GBP,SAR,AED,CNY" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-fx-cross-rates>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `currencies` | `PKR,USD,EUR,GBP,SAR,AED,CNY` | Currencies in the table (up to 8). |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Foreign vs local flows — `<cap-fipi-lipi>`

Net buying and selling by foreign and local investor types, with the sectors foreigners bought and sold.

```html
<cap-fipi-lipi period="1D" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-fipi-lipi>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `period` | `1D`, `1W`, `1M` | Initial period. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Fund card — `<cap-fund-card>`

One mutual fund: NAV, returns by period, a one-year NAV chart and its rank in the category.

```html
<cap-fund-card fund="meezan-islamic-fund" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-fund-card>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `fund` | `meezan-islamic-fund` | The fund's capitalist.pk slug. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Corporate calendar — `<cap-corporate-calendar>`

Upcoming dividends, bonuses, rights, splits, results and AGMs, filterable by type.

```html
<cap-corporate-calendar symbol="" types="D,B,R,S,E,A" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-corporate-calendar>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbol` | `—` | One company only (optional). |
| `types` | `D,B,R,S,E,A` | Event types shown. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Sector performance — `<cap-sector-performance>`

Every sector's move today, weighted by market cap, with how many shares rose and fell.

```html
<cap-sector-performance market="PSX" rows="12" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-sector-performance>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `market` | `PSX` | Market. |
| `rows` | `12` | Sectors shown. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Index contributors — `<cap-index-contributors>`

The members lifting and dragging an index today, in approximate index points.

```html
<cap-index-contributors index="PSX:KSE100" rows="6" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-index-contributors>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `index` | `PSX:KSE100` | Index, e.g. PSX:KSE100. |
| `rows` | `6` | Rows per side. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Sector money map — `<cap-sector-money-map>`

Where foreign money went by sector over a day, a week and a month.

```html
<cap-sector-money-map theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-sector-money-map>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Valuation vs peers — `<cap-valuation>`

P/E, P/B, EV/EBITDA, yield, ROE and margin against the sector median, with peers.

```html
<cap-valuation symbol="PSX:LUCK" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-valuation>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbol` | `PSX:LUCK` | Market and symbol. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Financials — `<cap-financials>`

Revenue, profit and EPS by fiscal period, annual or quarterly.

```html
<cap-financials symbol="PSX:OGDC" period="annual" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-financials>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbol` | `PSX:OGDC` | Market and symbol. |
| `period` | `annual`, `quarterly` | Initial period. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Dividends — `<cap-dividends>`

Dividend yield, the next announced entitlement and the payout history.

```html
<cap-dividends symbol="PSX:FFC" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-dividends>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbol` | `PSX:FFC` | Market and symbol. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Insider trades — `<cap-insider-trades>`

Directors' and officers' disclosed trades, with net buying over 90 days and a year.

```html
<cap-insider-trades symbol="PSX:SYS" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-insider-trades>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbol` | `PSX:SYS` | Market and symbol. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Capitalist Radar — `<cap-radar>`

The Radar read for a stock, with every driver and what the read lacks.

```html
<cap-radar symbol="PSX:OGDC" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-radar>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbol` | `PSX:OGDC` | Market and symbol. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Shariah status — `<cap-shariah>`

Whether a share is Shariah compliant, who classified it and since when.

```html
<cap-shariah symbol="PSX:MEBL" shape="card" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-shariah>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbol` | `PSX:MEBL` | Market and symbol. |
| `shape` | `card`, `inline` | A card, or a badge for running text. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Fund performance — `<cap-fund-performance>`

A fund's returns by period and its NAV over a year.

```html
<cap-fund-performance fund="meezan-islamic-fund" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-fund-performance>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `fund` | `meezan-islamic-fund` | The fund's capitalist.pk slug. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Fund leaderboard — `<cap-fund-leaderboard>`

The best funds in a category by annualised return.

```html
<cap-fund-leaderboard category="equity" period="1Y" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-fund-leaderboard>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `category` | `equity` | Fund category slug, e.g. equity, money-market. |
| `period` | `1Y`, `3Y`, `5Y` | Return period. |
| `rows` | `10` | Rows shown. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## News — `<cap-news>`

The latest market or company stories with Capitalist's summary.

```html
<cap-news symbol="" rows="6" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-news>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbol` | `—` | One company (optional). |
| `rows` | `6` | Stories shown. |
| `summaries` | `true`, `false` | Show summaries. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Watchlist — `<cap-watchlist>`

A live, sortable table of up to 30 symbols.

```html
<cap-watchlist symbols="PSX:KSE100,PSX:OGDC,PSX:HBL,PSX:LUCK" sort="" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-watchlist>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbols` | `PSX:KSE100,PSX:OGDC,PSX:HBL,PSX:LUCK` | Comma-separated symbols. |
| `sort` | `—` | Column: symbol, price, change or vol; prefix - for descending. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Seasonality — `<cap-seasonality>`

Average return in each calendar month over up to ten years.

```html
<cap-seasonality symbol="PSX:KSE100" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-seasonality>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbol` | `PSX:KSE100` | Market and symbol. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Futures board — `<cap-futures-board>`

Single-stock futures with price, change, volume and front-month basis.

```html
<cap-futures-board market="PSX" rows="15" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-futures-board>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `market` | `PSX` | Market. |
| `rows` | `15` | Contracts shown. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Company profile — `<cap-company-profile>`

What the company does, its sector, shares, free float and Shariah status.

```html
<cap-company-profile symbol="PSX:LUCK" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-company-profile>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `symbol` | `PSX:LUCK` | Market and symbol. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Economic calendar — `<cap-economic-calendar>`

Upcoming economic releases with forecast, previous and actual.

```html
<cap-economic-calendar currencies="" impact="low" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-economic-calendar>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `currencies` | `—` | Currencies shown, e.g. PKR,USD (empty = all). |
| `impact` | `low`, `medium`, `high` | Lowest impact shown. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Macro indicator — `<cap-macro>`

One economic indicator with its history and forecast fan.

```html
<cap-macro code="PAK.CPI.YOY" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-macro>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `code` | `PAK.CPI.YOY` | Indicator code from capitalist.pk/economy. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Rupee heatmap — `<cap-fx-heatmap>`

The rupee against major currencies today, coloured by the move.

```html
<cap-fx-heatmap theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-fx-heatmap>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Commodities — `<cap-commodities>`

Gold, oil, cotton and other market prices with Pakistan's fuel prices.

```html
<cap-commodities theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-commodities>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Screener — `<cap-screener>`

The top names for preset screens: momentum, breakouts, unusual volume and more.

```html
<cap-screener preset="momentum" presets="momentum,breakouts,unusual_volume,relative_strength" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-screener>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `preset` | `momentum`, `breakouts`, `unusual_volume`, `relative_strength`, `near_52_week`, `reversals` | Initial screen. |
| `presets` | `momentum,breakouts,unusual_volume,relative_strength` | Screens offered as tabs. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |

## Salary tax calculator — `<cap-tax-calculator>`

Monthly tax and take-home pay from the current Finance Act slabs.

```html
<cap-tax-calculator salary="150000" theme="auto">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-tax-calculator>
```

| Attribute | Values / default | Description |
|---|---|---|
| `theme` | `auto`, `light`, `dark`, `transparent` | Colour scheme; auto follows the visitor. |
| `palette` | `pk`, `cvd` | Up/down colours: green/red, or blue/orange for colour-blind readers. |
| `density` | `comfortable`, `compact` | Spacing. |
| `locale` | `en`, `ur` | Language. Urdu switches to right-to-left. |
| `salary` | `150000` | Initial monthly salary in PKR. |

| Event | Description |
|---|---|
| `cap:ready` | First data rendered. |
| `cap:update` | Data changed. |
| `cap:error` | Unknown symbol or failed request (the last good data stays on screen). |
| `cap:link` | Cancellable; fired before a capitalist.pk page opens. detail: { href, widget, symbol? }. |
| `cap:select` | A row, tile or range was chosen. detail depends on the widget. |
