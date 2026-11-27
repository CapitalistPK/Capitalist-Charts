/**
 * The Capitalist Charts icon set: 24 px grid, 1.5 px stroke, round caps. Inner SVG markup only;
 * render inside `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">`. These strings are
 * constants of this package, never built from data, so rendering them as markup is safe.
 */
export const ICONS = {
  'arrow-up': '<path d="M12 19V5M6 11l6-6 6 6"/>',
  'arrow-down': '<path d="M12 5v14M6 13l6 6 6-6"/>',
  flat: '<path d="M5 12h14"/>',
  'tri-up': '<path d="M12 6l7 11H5z" fill="currentColor" stroke="none"/>',
  'tri-down': '<path d="M12 18l7-11H5z" fill="currentColor" stroke="none"/>',
  'market-open': '<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="8"/>',
  'market-closed': '<circle cx="12" cy="12" r="8"/><path d="M8 12h8"/>',
  halted: '<circle cx="12" cy="12" r="8"/><path d="M10 9v6M14 9v6"/>',
  stale: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  pause: '<path d="M9 6v12M15 6v12"/>',
  play: '<path d="M8 5l11 7-11 7z"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  shariah: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  candles: '<path d="M7 3v4M7 15v6M17 5v3M17 16v3"/><rect x="5" y="7" width="4" height="8" rx="0.5"/><rect x="15" y="8" width="4" height="8" rx="0.5"/>',
} as const;

export type IconName = keyof typeof ICONS;
