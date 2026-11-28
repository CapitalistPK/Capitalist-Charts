# @capitalist-charts/ssr

Server-rendered fallback and embed helpers for Capitalist Charts. Use it in a server or framework
route when the page should contain a crawlable link before the browser loads the widget.

```bash
npm install @capitalist-charts/ssr@1.0.1
```

```ts
import { embedSnippet, fetchFallbackData } from '@capitalist-charts/ssr';

const quote = await fetchFallbackData('PSX:OGDC');
const html = embedSnippet('cap-quote', { symbol: 'PSX:OGDC' });
```

The package exports `embedSnippet`, `fallbackHtml` and `fetchFallbackData`, plus the typed
`EmbedOptions`, `EmbedAttributes` and `FetchFallbackOptions`. `embedSnippet` emits the primary
loader with a jsDelivr fallback. Pass an exact version and SRI value when pinning a loader.

It is framework-free and safe for server rendering in a runtime with `fetch`, with a custom fetch
function available through `fetchFallbackData` options. It is Apache-2.0.
Read the [SSR guide](https://capitalist.pk/docs/widgets/guides/nextjs-ssr/) and the
[source repository](https://github.com/CapitalistPK/Capitalist-Charts/tree/main/packages/ssr).
