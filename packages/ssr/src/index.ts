import { isQuoteSnapshot, parseSymbolRef, SYMBOL_PATTERN, type QuoteSnapshot } from '@capitalist-charts/schema';

const SITE = 'https://capitalist.pk';
const SAFE_TAG = /^[a-z][a-z0-9-]*$/;
// Lower-case names only (the widgets' own attributes, aria-*, data-*, id, class, style...). Event
// handlers and URL-bearing attributes are refused by name: escaping a value does not make
// `onclick` code or a `src` URL safe.
const SAFE_ATTRIBUTE = /^[a-z][a-z0-9-]{0,40}$/;
const REFUSED_ATTRIBUTE = /^(?:on.*|href|src|srcdoc|srcset|action|formaction|poster|cite|background|ping|is)$/;
/** `1` (latest of a major) or an exact `1.2.3`. */
const VERSION = /^\d{1,3}(?:\.\d{1,4}\.\d{1,4})?$/;
const EXACT_VERSION = /^\d{1,3}\.\d{1,4}\.\d{1,4}$/;
const INTEGRITY = /^sha(?:256|384|512)-[A-Za-z0-9+/]{40,88}={0,2}$/;

export type AttributeValue = string | number | boolean | null | undefined;
export type EmbedAttributes = Readonly<Record<string, AttributeValue>>;

export interface EmbedOptions {
  /** Subresource Integrity hash of `cdn/loader.js` for `version`. Needs an exact version. */
  integrity?: string;
  /** `1` for the latest 1.x, or an exact `1.2.0`. Anything else throws. */
  version?: string;
}

export interface FetchFallbackOptions {
  timeoutMs?: number;
  /** Dependency injection keeps server tests and non-global runtimes straightforward. */
  fetch?: typeof globalThis.fetch;
  signal?: AbortSignal;
}

const escapeHtml = (value: unknown): string => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function validTag(tag: string): string {
  return SAFE_TAG.test(tag) ? tag : 'cap-quote';
}

function serialiseAttributes(attrs: EmbedAttributes): string {
  return Object.entries(attrs)
    .filter(([name, value]) => SAFE_ATTRIBUTE.test(name) && !REFUSED_ATTRIBUTE.test(name) && value !== undefined && value !== null && value !== false)
    .map(([name, value]) => ` ${name}="${escapeHtml(value)}"`)
    .join('');
}

function quoteHref(market: string, symbol: string): string {
  return market === 'PSX'
    ? `${SITE}/psx/${symbol.toLowerCase()}`
    : `${SITE}/search?q=${encodeURIComponent(`${market}:${symbol}`)}`;
}

function symbolsFrom(attrs: EmbedAttributes): Array<{ market: string; symbol: string }> {
  const raw = [attrs.symbol, attrs.symbols]
    .filter((value): value is string => typeof value === 'string')
    .flatMap((value) => value.split(','));
  const seen = new Set<string>();
  return raw.flatMap((value) => {
    const parsed = parseSymbolRef(value);
    if (!parsed) return [];
    const key = `${parsed.market}:${parsed.symbol}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [parsed];
  });
}

function quoteText(data: QuoteSnapshot): string {
  const change = data.cp === null ? '' : ` (${data.cp >= 0 ? '+' : ''}${data.cp.toFixed(2)}%)`;
  return `${data.s} ${data.p.toFixed(2)}${change}`;
}

/** Returns crawlable, safe HTML to keep inside a widget's light DOM. */
export function fallbackHtml(tag: string, attrs: EmbedAttributes = {}, data?: QuoteSnapshot): string {
  const symbols = symbolsFrom(attrs);
  if (data && isQuoteSnapshot(data) && SYMBOL_PATTERN.test(data.s)) {
    const symbol = parseSymbolRef(`${data.m}:${data.s}`);
    if (symbol) return `<a href="${quoteHref(symbol.market, symbol.symbol)}">${escapeHtml(quoteText(data))}</a>`;
  }
  if (symbols.length) {
    return symbols.map(({ market, symbol }) => `<a href="${quoteHref(market, symbol)}">${escapeHtml(`${symbol} share price`)}</a>`).join(' ');
  }
  const label = validTag(tag) === 'cap-ticker-tape' ? 'Pakistan stock prices' : 'Capitalist Charts market data';
  return `<a href="${SITE}/psx">${label}</a>`;
}

/** Builds the pasteable hosted-loader snippet without importing DOM code. */
export function embedSnippet(tag: string, attrs: EmbedAttributes = {}, options: EmbedOptions = {}): string {
  const version = options.version ?? '1';
  if (!VERSION.test(version)) throw new TypeError(`embedSnippet: version must be a major ("1") or an exact version ("1.2.3"), got ${JSON.stringify(version)}`);
  if (options.integrity !== undefined) {
    if (!INTEGRITY.test(options.integrity)) throw new TypeError('embedSnippet: integrity must be a sha256/384/512 SRI hash');
    // A hash describes one exact file; a moving major would fail it on the next release.
    if (!EXACT_VERSION.test(version)) throw new TypeError('embedSnippet: integrity needs an exact version such as "1.2.3"');
  }
  const loader = `${SITE}/widgets/v${version}/loader.js`;
  const sri = options.integrity ? ` integrity="${options.integrity}" crossorigin="anonymous"` : '';
  // If capitalist.pk cannot serve the loader, load the identical npm build from jsDelivr: the same
  // version, and with the same integrity hash when one is given, so the fallback is held to the
  // same file. Every value here was checked against a strict pattern above.
  const fallback = `https://cdn.jsdelivr.net/npm/@capitalist-charts/elements@${version}/cdn/loader.js`;
  const fallbackSri = options.integrity ? `s.integrity='${options.integrity}';s.crossOrigin='anonymous';` : '';
  const onerror = ` onerror="${escapeHtml(`this.onerror=null;var s=document.createElement('script');s.type='module';${fallbackSri}s.src='${fallback}';document.head.append(s)`)}"`;
  const safeTag = validTag(tag);
  return `<script type="module" src="${loader}" async${sri}${onerror}></script>\n<${safeTag}${serialiseAttributes(attrs)}>${fallbackHtml(safeTag, attrs)}</${safeTag}>`;
}

/** Fetches one validated L0 quote for an SSR fallback; all failures become null. */
export async function fetchFallbackData(symbolRef: string, options: FetchFallbackOptions = {}): Promise<QuoteSnapshot | null> {
  const ref = parseSymbolRef(symbolRef);
  if (!ref) return null;
  const fetcher = options.fetch ?? globalThis.fetch;
  if (typeof fetcher !== 'function') return null;
  const timeoutMs = Number.isFinite(options.timeoutMs) && (options.timeoutMs ?? 0) > 0 ? options.timeoutMs! : 3000;
  // The timeout always applies; a caller's signal can only end the request sooner.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  if (options.signal?.aborted) controller.abort();
  else options.signal?.addEventListener('abort', onAbort, { once: true });
  try {
    const response = await fetcher(`${SITE}/w/snap/${ref.market}/${ref.symbol}.json`, { signal: controller.signal });
    if (!response.ok) return null;
    const value: unknown = await response.json();
    return isQuoteSnapshot(value) && value.m === ref.market && value.s === ref.symbol ? value : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}
