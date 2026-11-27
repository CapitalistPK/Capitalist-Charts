// Run from a package directory before publishing: every file its package.json exports must exist,
// so a package can never be published without its build.
import { existsSync, readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const targets = new Set([pkg.main, pkg.types].filter(Boolean));
const walk = (v) => (typeof v === 'string' ? targets.add(v) : v && typeof v === 'object' && Object.values(v).forEach(walk));
walk(pkg.exports);
const missing = [...targets].filter((f) => !existsSync(f));
if (missing.length) {
  console.error(`${pkg.name}: missing built files: ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`${pkg.name}: ${targets.size} exported files present`);
