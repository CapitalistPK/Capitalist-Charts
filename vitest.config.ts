import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const src = (pkg: string) => fileURLToPath(new URL(`./packages/${pkg}/src/index.ts`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@capitalist-charts/schema/base': fileURLToPath(new URL('./packages/schema/src/base.ts', import.meta.url)),
      '@capitalist-charts/schema/views': fileURLToPath(new URL('./packages/schema/src/views.ts', import.meta.url)),
      '@capitalist-charts/schema/analytics': fileURLToPath(new URL('./packages/schema/src/analytics.ts', import.meta.url)),
      '@capitalist-charts/schema': src('schema'),
      '@capitalist-charts/core/analytics': fileURLToPath(new URL('./packages/core/src/analytics.ts', import.meta.url)),
      '@capitalist-charts/core/render': fileURLToPath(new URL('./packages/core/src/render.ts', import.meta.url)),
      '@capitalist-charts/core': src('core'),
      '@capitalist-charts/elements/catalog': fileURLToPath(new URL('./packages/elements/src/catalog.ts', import.meta.url)),
      '@capitalist-charts/elements': src('elements'),
      '@capitalist-charts/react': src('react'),
      '@capitalist-charts/ssr': src('ssr'),
    },
  },
  test: {
    include: ['packages/*/test/**/*.test.ts'],
    environment: 'happy-dom',
    // Tests never touch the network: iframes (the advanced chart) are not loaded.
    environmentOptions: { happyDOM: { settings: { disableIframePageLoading: true, disableJavaScriptFileLoading: true, disableCSSFileLoading: true } } },
  },
});
