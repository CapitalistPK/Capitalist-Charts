---
title: Data
---

# Data tree and adapters

The hosted data root is `https://capitalist.pk/w/`. Files are bounded JSON resources with fixed paths, so a site can cache them or self-host the same tree.

## L0 snapshots

L0 is the live, small snapshot tier:

- `config.json` — widget kill switches, polling interval, degradation level, and blocked domains.
- `snap/<MARKET>/_status.json` — feed and session health.
- `snap/<MARKET>/_index.json` — the symbol index.
- `snap/<MARKET>/<SYMBOL>.json` — one `QuoteSnapshot`, with `v`, `s`, `m`, `n`, `k`, `p`, `c`, `cp`, `vol`, `t`, `d`, `st`, and optional `ts`.
- `snap/<MARKET>/list/<INDEX>.json`, `_movers.json`, and `_map.json` — bounded market views.

## L1 views

L1 is cached, ready-to-draw data, refreshed between one minute and a day depending on the kind:

| Path | Shape | Used by |
|---|---|---|
| `v/series/<M>/<S>/<1D\|5D\|1M\|3M\|6M\|YTD\|1Y\|5Y>.json` | `Series` (at most 300 bars `[time, open, high, low, close, volume]`) | mini chart, symbol overview |
| `v/fx/PKR.json` | `FxRates` | FX cross rates, rupee heatmap |
| `v/flows/<M>/<1D\|1W\|1M>.json` | `Flows` | foreign vs local flows, sector money map |
| `v/fund/<slug>.json` | `FundCard` | fund card, fund performance |
| `v/calendar/<M>/upcoming.json`, `v/calendar/<M>/sym/<S>.json` | `Calendar` | corporate calendar |
| `v/profile/<M>/<S>.json` | `Profile` | company profile, Shariah status |
| `v/valuation/<M>/<S>.json` | `Valuation` | valuation vs peers |
| `v/financials/<M>/<S>/<annual\|quarterly>.json` | `Financials` | financials |
| `v/dividends/<M>/<S>.json` | `Dividends` | dividends |
| `v/insiders/<M>/<S>.json` | `Insiders` | insider trades |
| `v/radar/<M>/<S>.json` | `Radar` | Capitalist Radar |
| `v/seasonality/<M>/<S>.json` | `Seasonality` | seasonality |
| `v/news/<M>/<_all\|S>.json` | `News` | news |
| `v/leaders/<category>/<1Y\|3Y\|5Y>.json` | `FundLeaders` | fund leaderboard |
| `v/futures/<M>.json` | `Futures` | futures board |
| `v/econ/upcoming.json` | `EconCalendar` | economic calendar |
| `v/macro/<CODE>.json` | `Macro` | macro indicator |
| `v/commodities.json` | `Commodities` | commodities |
| `v/screener/<M>/<preset>.json` | `Screen` | screener |
| `v/tax/salaried.json` | `TaxSlabs` | salary tax calculator |

Types and runtime checks live in the public [`@capitalist-charts/schema`](https://www.npmjs.com/package/@capitalist-charts/schema)
package (`/base`, `/views`, `/analytics`).
Index contributors, sector performance and the watchlist need no extra files: they are computed
from the L0 lists, the market map and the quotes.

## Bring your own data

Implement `DataAdapter` from the public [`@capitalist-charts/core`](https://www.npmjs.com/package/@capitalist-charts/core)
package:

```ts
interface DataAdapter {
  quote(market: string, symbol: string, signal?: AbortSignal): Promise<QuoteSnapshot | null>;
  status(market: string, signal?: AbortSignal): Promise<MarketStatus | null>;
  index(market: string, signal?: AbortSignal): Promise<SymbolIndex | null>;
  config(signal?: AbortSignal): Promise<WidgetConfig>;
  load(path: string, signal?: AbortSignal): Promise<unknown>;
}
```

Or publish the same static `/w` paths and configure `dataBase`. The schema validators run at the network boundary, so malformed remote JSON is rejected instead of becoming widget state.
