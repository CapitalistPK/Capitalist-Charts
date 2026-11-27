---
title: Server rendering
---

# Server-rendered embeds

`@capitalist-charts/ssr` is framework-free and safe to call while rendering on a server. `embedSnippet(tag, attrs, { version, integrity })` returns the hosted loader, escaped attributes, and a crawlable link inside the widget tag.

```ts
import { embedSnippet, fetchFallbackData } from '@capitalist-charts/ssr';

const quote = await fetchFallbackData('PSX:OGDC');
const html = embedSnippet('cap-quote', { symbol: 'PSX:OGDC' }, { integrity: 'sha384-...' });
```

Use `fallbackHtml(tag, attrs, quote)` when a framework wants to place the fallback itself. Symbol references are validated with the schema's market and symbol rules, all generated HTML is escaped, and fetch failures return `null` rather than breaking page rendering. The helpers only create `https://capitalist.pk` links.
