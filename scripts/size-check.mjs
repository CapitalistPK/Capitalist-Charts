// Fails when a published CDN file grows past its gzip budget. Budgets are part of the public API:
// these files load on other people's pages.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const dir = new URL('../packages/elements/cdn/', import.meta.url).pathname;
const BUDGET = { loader: 3 * 1024, chunk: 15 * 1024, shared: 20 * 1024 };
let failed = false;
const rows = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith('.js'))) {
  const gz = gzipSync(readFileSync(join(dir, file)), { level: 9 }).length;
  const kind = file === 'loader.js' ? 'loader' : gz > BUDGET.chunk ? 'shared' : 'chunk';
  const limit = BUDGET[kind];
  const ok = gz <= limit;
  failed ||= !ok;
  rows.push(`${ok ? 'ok  ' : 'FAIL'} ${file.padEnd(32)} ${(gz / 1024).toFixed(2).padStart(6)} KB gz  (budget ${(limit / 1024).toFixed(0)} KB, ${kind})`);
}
console.log(rows.join('\n'));
if (failed) {
  console.error('Bundle size budget exceeded.');
  process.exit(1);
}
