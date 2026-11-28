# @capitalist-charts/core

Framework-free runtime pieces for Capitalist Charts: data adapters, polling, resource definitions,
formatters, icons and chart geometry. Use it directly when building a renderer or a custom widget;
most publishers should start with `@capitalist-charts/elements` or `@capitalist-charts/react`.

```bash
npm install @capitalist-charts/core@1.0.1
```

```ts
import { capitalistAdapter, Poller, formatPrice } from '@capitalist-charts/core';

const poller = new Poller(capitalistAdapter());
console.log(formatPrice(118402.3));
poller.stop();
```

The main entry exports `DataAdapter`, `capitalistAdapter`, `mockAdapter`, `sharedAdapter`, `Poller`,
`resources`, `formatNumber`, `formatPrice`, `formatChange`, `formatPercent`, `formatCompact`,
`formatAge`, `formatClock`, `ICONS` and `quoteState`. `@capitalist-charts/core/render` contains
geometry helpers; `/analytics` contains analytics resource factories.

It is framework-free TypeScript/JavaScript for Node and modern browsers. The package is Apache-2.0.
Read the [data guide](https://capitalist.pk/docs/widgets/guides/data-and-freshness/) and the
[source repository](https://github.com/CapitalistPK/Capitalist-Charts/tree/main/packages/core).
