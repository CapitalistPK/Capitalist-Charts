import http from 'k6/http';
import { Counter } from 'k6/metrics';
import { sleep } from 'k6';

const base = (__ENV.WIDGETS_BASE_URL || 'https://staging.example.invalid').replace(/\/+$/, '');
const originMisses = new Counter('origin_facing_cache_misses');
const symbols = ['OGDC', 'HBL', 'PPL', 'LUCK'];
// Every Cloudflare cache status that means the request went on to our server, not only MISS:
// an expired or revalidated entry, a bypass, or a response with no cache status at all.
const ORIGIN_STATUSES = new Set(['MISS', 'EXPIRED', 'REVALIDATED', 'BYPASS', 'DYNAMIC', 'NONE']);

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 1000 },
    { duration: '1m', target: 0 },
  ],
  thresholds: { http_req_failed: ['rate<0.01'] },
};

function get(path) {
  const response = http.get(`${base}/w/${path}`, { tags: { path } });
  if (ORIGIN_STATUSES.has(String(response.headers['cf-cache-status'] || 'NONE').toUpperCase())) originMisses.add(1);
  return response;
}

export default function viewer() {
  // A viewer that is hidden makes no requests; this scenario represents visible viewers only.
  get('config.json');
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  get(`snap/PSX/${symbol}.json`);
  get(`v/series/PSX/${symbol}/1Y.json`);
  sleep(2 + Math.random());
}

export function handleSummary(data) {
  const count = data.metrics.origin_facing_cache_misses?.values?.count || 0;
  const duration = data.state?.testRunDurationMs ? data.state.testRunDurationMs / 1000 : 0;
  const rate = duration > 0 ? count / duration : 0;
  return { stdout: `Origin-facing request rate (cf-cache-status other than HIT, STALE or UPDATING): ${rate.toFixed(3)} req/s (${count} misses)\n` };
}
