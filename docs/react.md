---
title: React
---

# React

Install `@capitalist-charts/react` alongside React 18 or 19. It exports one component for every catalog widget (`CapQuote`, `CapTickerTape`, and so on) plus `CapitalistChartsProvider`.

```tsx
import { CapQuote, CapitalistChartsProvider } from '@capitalist-charts/react';

export function Quote() {
  return (
    <CapitalistChartsProvider dataBase="https://capitalist.pk/w">
      <CapQuote symbol="PSX:OGDC" theme="auto">
        <a href="https://capitalist.pk/psx/ogdc">OGDC share price</a>
      </CapQuote>
    </CapitalistChartsProvider>
  );
}
```

Component imports do not import or register custom elements during server rendering. Registration and provider configuration happen in client effects. Attribute props use camelCase (`chartType` becomes `chart-type`); common attributes are `theme`, `palette`, `density`, and `locale`. Use `onCapReady`, `onCapUpdate`, `onCapError`, `onCapLink`, and `onCapSelect` for events. Refs point to the underlying custom element.
