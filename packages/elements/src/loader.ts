/**
 * The CDN entry point: `<script type="module" src=".../loader.js">`.
 *
 * Small on purpose. It finds `cap-*` tags on the page (now and as they are added) and imports a
 * widget's code only when one of its elements comes near the viewport. Pages without widgets, or
 * with widgets far below the fold, download almost nothing.
 */
import { pendingReservationCss } from './reserve.js';

const REGISTRY: Record<string, () => Promise<unknown>> = {
  'cap-quote': () => import('./cap-quote.js'),
  'cap-ticker-tape': () => import('./cap-ticker-tape.js'),
  'cap-ticker-tag': () => import('./cap-ticker-tag.js'),
  'cap-mini-chart': () => import('./cap-mini-chart.js'),
  'cap-symbol-overview': () => import('./cap-symbol-overview.js'),
  'cap-advanced-chart': () => import('./cap-advanced-chart.js'),
  'cap-market-summary': () => import('./cap-market-summary.js'),
  'cap-movers': () => import('./cap-movers.js'),
  'cap-market-map': () => import('./cap-market-map.js'),
  'cap-fx-cross-rates': () => import('./cap-fx-cross-rates.js'),
  'cap-fipi-lipi': () => import('./cap-fipi-lipi.js'),
  'cap-fund-card': () => import('./cap-fund-card.js'),
  'cap-corporate-calendar': () => import('./cap-corporate-calendar.js'),
  'cap-sector-performance': () => import('./cap-sector-performance.js'),
  'cap-index-contributors': () => import('./cap-index-contributors.js'),
  'cap-sector-money-map': () => import('./cap-sector-money-map.js'),
  'cap-valuation': () => import('./cap-valuation.js'),
  'cap-financials': () => import('./cap-financials.js'),
  'cap-dividends': () => import('./cap-dividends.js'),
  'cap-insider-trades': () => import('./cap-insider-trades.js'),
  'cap-radar': () => import('./cap-radar.js'),
  'cap-shariah': () => import('./cap-shariah.js'),
  'cap-fund-performance': () => import('./cap-fund-performance.js'),
  'cap-fund-leaderboard': () => import('./cap-fund-leaderboard.js'),
  'cap-news': () => import('./cap-news.js'),
  'cap-watchlist': () => import('./cap-watchlist.js'),
  'cap-seasonality': () => import('./cap-seasonality.js'),
  'cap-futures-board': () => import('./cap-futures-board.js'),
  'cap-company-profile': () => import('./cap-company-profile.js'),
  'cap-economic-calendar': () => import('./cap-economic-calendar.js'),
  'cap-macro': () => import('./cap-macro.js'),
  'cap-fx-heatmap': () => import('./cap-fx-heatmap.js'),
  'cap-commodities': () => import('./cap-commodities.js'),
  'cap-screener': () => import('./cap-screener.js'),
  'cap-tax-calculator': () => import('./cap-tax-calculator.js'),
};

// Reserve each widget's box before its code arrives, so the host page does not jump when it
// upgrades. A constructed sheet rather than a <style> tag: strict CSP `style-src` blocks inline
// <style> but does not apply to CSSOM.
(() => {
  const css = pendingReservationCss();
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  } catch {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.append(style);
  }
})();

const requested = new Set<string>();

function want(tag: string): void {
  if (requested.has(tag) || customElements.get(tag)) return;
  requested.add(tag);
  REGISTRY[tag]!().catch(() => requested.delete(tag));
}

const io =
  typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            want(e.target.localName);
            io!.unobserve(e.target);
          }
        },
        { rootMargin: '300px' },
      )
    : null;

function watch(el: Element): void {
  if (io) io.observe(el);
  else want(el.localName);
}

function scan(root: ParentNode): void {
  for (const tag of Object.keys(REGISTRY)) root.querySelectorAll(tag).forEach(watch);
}

scan(document);
new MutationObserver((mutations) => {
  for (const m of mutations)
    m.addedNodes.forEach((n) => {
      if (!(n instanceof Element)) return;
      if (REGISTRY[n.localName]) watch(n);
      scan(n);
    });
}).observe(document.documentElement, { childList: true, subtree: true });
