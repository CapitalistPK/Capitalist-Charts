# @capitalist-charts/schema

Wire types, validators and path builders for Capitalist Charts data. Use this package directly when
you are writing a data adapter, validating snapshots, or serving a compatible static data tree.

```bash
npm install @capitalist-charts/schema@1.0.1
```

```ts
import { parseSymbolRef, isQuoteSnapshot } from '@capitalist-charts/schema';

const value: unknown = await fetch('https://capitalist.pk/w/snap/PSX/OGDC.json').then((response) => response.json());
const ref = parseSymbolRef('PSX:OGDC');
if (ref && isQuoteSnapshot(value)) console.log(ref.symbol, value.p);
```

The main entry exports the base, view and analytics types and guards. Use `@capitalist-charts/schema/base`,
`/views` or `/analytics` for focused imports. Useful exports include `QuoteSnapshot`, `MarketStatus`,
`WidgetConfig`, `Series`, `Flows`, `FundCard`, `Profile`, `Valuation`, `paths`, `analyticsPaths`,
`parseSymbolRef`, `normaliseConfig` and the `is*` validators.

It is framework-free TypeScript/JavaScript for Node and modern browsers. The package is Apache-2.0.
Read the [data guide](https://capitalist.pk/docs/widgets/guides/data-and-freshness/) and the
[source repository](https://github.com/CapitalistPK/Capitalist-Charts/tree/main/packages/schema).
