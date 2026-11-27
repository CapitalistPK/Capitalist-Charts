// Assembles the GitHub Pages extras next to the Jekyll docs:
//   site/v<major>/ and site/v<version>/  the CDN build (third copy after capitalist.pk and jsDelivr)
//   site/playground/                     every widget on sample data
// Run after `pnpm build`.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const out = new URL('site/', root);
const { version } = JSON.parse(await readFile(new URL('packages/elements/package.json', root), 'utf8'));
const major = version.split('.')[0];

await rm(out, { recursive: true, force: true });
for (const dir of [`v${major}`, `v${version}`]) await cp(new URL('packages/elements/cdn/', root), new URL(`${dir}/`, out), { recursive: true });

const pg = new URL('playground/', out);
await mkdir(pg, { recursive: true });
for (const pkg of ['schema', 'core']) await cp(new URL(`packages/${pkg}/dist/`, root), new URL(`pkg/${pkg}/`, pg), { recursive: true });
await cp(new URL('packages/elements/cdn/', root), new URL('pkg/elements/', pg), { recursive: true });
const html = (await readFile(new URL('apps/playground/index.html', root), 'utf8')).replaceAll('../../packages/elements/cdn/', './pkg/elements/').replaceAll('../../packages/', './pkg/').replaceAll('/dist/', '/');
await writeFile(new URL('index.html', pg), html);
console.log(`site/: v${major}, v${version}, playground`);
