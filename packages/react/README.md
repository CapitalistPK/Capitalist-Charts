# @capitalist-charts/react

Typed React wrappers around the Capitalist Charts custom elements. Use it in React 18 or 19 when
you want component imports, camelCase catalog props and typed event handlers.

```bash
npm install @capitalist-charts/react@1.0.1 react
```

```tsx
import { CapQuote, CapitalistChartsProvider } from '@capitalist-charts/react';

export function Quote() {
  return (
    <CapitalistChartsProvider dataBase="https://capitalist.pk/w">
      <CapQuote symbol="PSX:OGDC" theme="auto" />
    </CapitalistChartsProvider>
  );
}
```

The package exports one component for every elements catalog tag, including `CapQuote`,
`CapTickerTape`, `CapMiniChart`, `CapAdvancedChart`, `CapMarketSummary`, `CapCompanyProfile`,
`CapScreener` and `CapTaxCalculator`, plus `CapitalistChartsProvider`. Common props are `theme`,
`palette`, `density` and `locale`; catalog attributes become camelCase. Event props are
`onCapReady`, `onCapUpdate`, `onCapError`, `onCapLink` and `onCapSelect`. Refs point to the
underlying custom element.

Imports are SSR-safe: custom-element registration and provider configuration happen in client
effects. Use `@capitalist-charts/ssr` when you also need server-generated fallback HTML.

The package requires React >=18, uses modern browser custom elements, and is Apache-2.0.
Read the [React guide](https://capitalist.pk/docs/widgets/guides/react/) and the
[source repository](https://github.com/CapitalistPK/Capitalist-Charts/tree/main/packages/react).
