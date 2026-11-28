---
title: Capitalist Charts
---

# Capitalist Charts

Capitalist Charts is an Apache-2.0 open-source collection of embeddable, live market widgets. It starts with the Pakistan Stock Exchange and uses ordinary `<cap-*>` web components, so a publisher can paste a small HTML snippet into a page.

## Quick start

```html
<script type="module" src="https://capitalist.pk/widgets/v1/loader.js" async
  onerror="this.onerror=null;var s=document.createElement('script');s.type='module';s.src='https://cdn.jsdelivr.net/npm/@capitalist-charts/elements@1/cdn/loader.js';document.head.append(s)"></script>

<cap-quote symbol="PSX:OGDC">
  <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
</cap-quote>
```

The fallback link remains readable to crawlers and visitors without JavaScript. The hosted service is free to use, with no sign-in or API key needed to copy the code. The data service is separate from this Apache-2.0 source repository; see [data](data.md) and [security](security.md).

## Why use it?

- Live PSX prices with a visible market state and freshness.
- Open source, embeddable, and small enough to add to an existing page.
- Crawlable light-DOM fallback content for search engines and no-JS readers.
- Bring-your-own-data adapters or a self-hosted static `/w` tree.
- Two CDNs for the loader: `capitalist.pk` first, then the identical npm build on jsDelivr if the first cannot be reached.

## An honest comparison with TradingView widgets

TradingView remains the stronger choice for broad global market coverage and a larger widget ecosystem. Capitalist Charts is focused on a narrower job: simple live embeds with PSX coverage, no sign-in to copy code, an open-source implementation, and a crawlable fallback. It does not claim to match TradingView's overall charting feature set or global market coverage. Capitalist Charts also aims to make freshness and the underlying static data shapes explicit.

See the [widget catalog](widgets.md), [React wrappers](react.md), and [SSR helpers](ssr.md) for integration details.
