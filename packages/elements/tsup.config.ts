import { defineConfig } from 'tsup';

export default defineConfig([
  // npm: ES modules, Lit and our packages left as imports for the consumer's bundler.
  {
    entry: { index: 'src/index.ts', loader: 'src/loader.ts', catalog: 'src/catalog.ts' },
    format: ['esm'],
    dts: { entry: { index: 'src/index.ts', catalog: 'src/catalog.ts' } },
    target: 'es2022',
    splitting: true,
    clean: true,
    outDir: 'dist',
    external: ['lit', /^lit\//, '@capitalist-charts/core', '@capitalist-charts/schema'],
  },
  // CDN: one tiny loader plus lazily imported, minified chunks with everything bundled.
  {
    entry: { loader: 'src/loader.ts' },
    format: ['esm'],
    target: 'es2022',
    splitting: true,
    minify: true,
    clean: true,
    outDir: 'cdn',
    noExternal: [/.*/],
    treeshake: true,
  },
]);
