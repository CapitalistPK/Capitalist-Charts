import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { existsSync } from 'node:fs';
import { CATALOG } from '../../../packages/elements/src/catalog';

const widgets = [
  'cap-ticker-tag', 'cap-quote', 'cap-ticker-tape', 'cap-mini-chart', 'cap-symbol-overview', 'cap-advanced-chart',
  'cap-market-summary', 'cap-movers', 'cap-market-map', 'cap-fx-cross-rates', 'cap-fipi-lipi', 'cap-fund-card',
  'cap-corporate-calendar', 'cap-sector-performance', 'cap-index-contributors', 'cap-sector-money-map', 'cap-valuation',
  'cap-financials', 'cap-dividends', 'cap-insider-trades', 'cap-radar', 'cap-shariah', 'cap-fund-performance',
  'cap-fund-leaderboard', 'cap-news', 'cap-watchlist', 'cap-seasonality', 'cap-futures-board', 'cap-company-profile',
  'cap-economic-calendar', 'cap-macro', 'cap-fx-heatmap', 'cap-commodities', 'cap-screener', 'cap-tax-calculator',
];
const themes = ['light', 'dark'] as const;
const states = ['loading', 'ready', 'stale', 'error', 'empty', 'unknown-symbol', 'market-closed'] as const;
const shapes = ['inline', 'strip', 'card', 'panel', 'tall', 'full'] as const;
const supportedShapes = new Map(CATALOG.map((spec) => [spec.tag, spec.shapes]));
const layoutStates = ['ready', 'loading', 'error', 'empty', 'stale', 'market-closed', 'unknown-symbol'] as const;
const layoutWidths = [320, 560, 900] as const;

test.beforeEach(async ({ page }) => {
  await page.route('https://capitalist.pk/pro/charts/embed/advanced**', (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>chart fixture</title>' }));
});

function url(widget: string, theme: string, state: string, shape?: string, width?: number): string {
  const query = new URLSearchParams({ widget, theme, state });
  if (shape) query.set('shape', shape);
  if (width) query.set('width', String(width));
  return `/apps/e2e/coverage.html?${query}`;
}

async function assertNoSeriousA11y(page: import('@playwright/test').Page): Promise<void> {
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
}

for (const widget of widgets) {
  for (const theme of themes) {
    test(`${widget} ${theme} has no console errors, stable layout and accessible ready output`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(url(widget, theme, 'ready'));
      await page.locator(widget).evaluate((element) => new Promise<void>((resolve) => {
        if (element.shadowRoot?.textContent?.trim()) { resolve(); return; }
        element.addEventListener('cap:ready', () => resolve(), { once: true });
        setTimeout(resolve, 2500);
      }));
      await page.waitForTimeout(150);
      const cls = await page.evaluate(() => (window as Window & { __fixture?: Element }).__fixture && (window as Window & { __fixture?: Element }).__fixture!.getBoundingClientRect().height);
      expect(cls).toBeGreaterThan(0);
      await assertNoSeriousA11y(page);
      expect(errors).toEqual([]);
    });

    test(`${widget} ${theme} ready screenshot`, async ({ page }) => {
      const snapshot = test.info().snapshotPath(`${widget}-${theme}.png`);
      test.skip(!process.env.UPDATE_VISUAL_BASELINES && !existsSync(snapshot), 'Visual baselines are generated on the pinned Ubuntu runner.');
      await page.goto(url(widget, theme, 'ready'));
      await page.waitForTimeout(500);
      await expect(page.locator('#fixture')).toHaveScreenshot(`${widget}-${theme}.png`, { animations: 'disabled', caret: 'hide' });
    });
  }

  for (const shape of supportedShapes.get(widget) ?? shapes) {
    for (const state of layoutStates) {
      for (const width of layoutWidths) {
        test(`${widget} light ${shape} ${state} width ${width} layout`, async ({ page }) => {
          await page.setViewportSize({ width: width + 48, height: 1000 });
          await page.addInitScript(() => {
            type LayoutWindow = Window & { __fixture?: Element; __layoutHeights?: number[]; __layoutTops?: number[] };
            const w = window as LayoutWindow;
            w.__layoutHeights = [];
            w.__layoutTops = [];
            const sample = () => {
              const element = w.__fixture;
              const after = document.querySelector('#after-widget');
              if (element && after) {
                // An inline widget lives in a sentence: what the host feels is that line's height,
                // not the inline box, which is empty until the widget renders its text.
                const measured = element.parentElement?.tagName === 'P' ? element.parentElement : element;
                w.__layoutHeights!.push(measured.getBoundingClientRect().height);
                w.__layoutTops!.push(after.getBoundingClientRect().top);
              }
              requestAnimationFrame(sample);
            };
            requestAnimationFrame(sample);
          });
          await page.goto(url(widget, 'light', state, shape, width));
          await page.waitForTimeout(2500);
          const samples = await page.evaluate(() => {
            const w = window as Window & { __layoutHeights?: number[]; __layoutTops?: number[] };
            return { heights: w.__layoutHeights ?? [], tops: w.__layoutTops ?? [] };
          });
          expect(samples.heights.length, 'The rAF loop must observe the element from insertion.').toBeGreaterThan(10);
          expect(Math.max(...samples.heights) - Math.min(...samples.heights)).toBeLessThanOrEqual(1);
          expect(Math.max(...samples.tops) - Math.min(...samples.tops)).toBeLessThanOrEqual(1);
          // A box that never moves is only half the promise: if the reservation is too small the body
          // clips, and the reader silently loses rows. Ready content must fit the reserved box.
          if (state === 'ready') {
            const body = await page.evaluate(() => {
              const bd = (window as Window & { __fixture?: Element }).__fixture?.shadowRoot?.querySelector('.bd');
              return bd ? { shown: bd.clientHeight, content: bd.scrollHeight } : null;
            });
            if (body) expect(body.content, 'ready content is clipped by the reserved height').toBeLessThanOrEqual(body.shown + 1);
          }
        });
      }
    }
  }

  for (const theme of themes) {
    for (const state of states) {
      for (const shape of shapes) {
        test(`${widget} ${theme} ${shape} ${state} has no serious or critical accessibility issue`, async ({ page }) => {
          await page.goto(url(widget, theme, state, shape));
          if (state !== 'loading') await page.waitForTimeout(400);
          await assertNoSeriousA11y(page);
        });
      }
    }
  }
}
