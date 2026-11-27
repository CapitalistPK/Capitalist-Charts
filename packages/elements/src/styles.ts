import { css } from 'lit';

/**
 * Design tokens. Every colour is a `--cap-*` custom property a host page can override on the
 * element or any parent. Defaults follow capitalist.pk's palette. Fonts inherit from the host.
 */
export const tokens = css`
  :host {
    --_bg: var(--cap-bg, #ffffff);
    --_surface: var(--cap-surface, #f5f3f4);
    --_text: var(--cap-text, #1b1c1d);
    --_muted: var(--cap-text-muted, #434653);
    --_faint: var(--cap-faint, #6b6f7c);
    --_border: var(--cap-border, #e3e2e3);
    --_accent: var(--cap-accent, #094cb2);
    --_up: var(--cap-up, #166534);
    --_down: var(--cap-down, #ba1a1a);
    --_flat: var(--cap-flat, #6b6f7c);
    --_warn: var(--cap-warn, #b45309);
    --_radius: var(--cap-radius, 10px);
    --_pad: 14px;
    --_gap: 10px;
    display: block;
    box-sizing: border-box;
    color: var(--_text);
    font-family: var(--cap-font, inherit);
    font-variant-numeric: tabular-nums;
    contain: content;
    color-scheme: light;
  }
  :host { height: var(--_reserved-height, auto); }
  :host([data-cap-inline]) { height: auto; min-height: 0; }
  :host([hidden]) { display: none; }
  :host([theme='dark']) {
    --_bg: var(--cap-bg, #141414); --_surface: var(--cap-surface, #242424); --_text: var(--cap-text, #ececee);
    --_muted: var(--cap-text-muted, #b9bcc8); --_faint: var(--cap-faint, #8e919c); --_border: var(--cap-border, #333333);
    --_accent: var(--cap-accent, #b1c5ff); --_up: var(--cap-up, #4edea3); --_down: var(--cap-down, #ffb4ab); --_warn: var(--cap-warn, #fbbf24);
    color-scheme: dark;
  }
  @media (prefers-color-scheme: dark) {
    :host([theme='auto']) {
      --_bg: var(--cap-bg, #141414); --_surface: var(--cap-surface, #242424); --_text: var(--cap-text, #ececee);
      --_muted: var(--cap-text-muted, #b9bcc8); --_faint: var(--cap-faint, #8e919c); --_border: var(--cap-border, #333333);
      --_accent: var(--cap-accent, #b1c5ff); --_up: var(--cap-up, #4edea3); --_down: var(--cap-down, #ffb4ab); --_warn: var(--cap-warn, #fbbf24);
      color-scheme: dark;
    }
  }
  :host([theme='transparent']) { --_bg: transparent; --_surface: color-mix(in srgb, currentColor 7%, transparent); --_text: inherit; }
  :host([palette='cvd']) { --_up: var(--cap-up, #1f6feb); --_down: var(--cap-down, #d9730d); }
  :host([density='compact']) { --_pad: 9px; --_gap: 6px; }
  :host(:dir(rtl)), :host([locale='ur']) { font-family: var(--cap-font-ur, 'Noto Naskh Arabic', var(--cap-font, inherit)); }
`;

export const base = css`
  .card { background: var(--_bg); border: 1px solid var(--_border); border-radius: var(--_radius); box-sizing: border-box; display: flex; flex-direction: column; height: 100%; min-width: 0; overflow: hidden; }
  .hd { display: flex; align-items: center; gap: 8px; padding: var(--_pad) var(--_pad) 0; min-width: 0; }
  .bd { flex: 1 1 auto; min-height: 0; overflow: hidden; padding: var(--_gap) var(--_pad); display: flex; flex-direction: column; gap: var(--_gap); min-width: 0; }
  .ft { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 0 var(--_pad) calc(var(--_pad) - 4px); font-size: 0.69rem; color: var(--_faint); }
  .title { font-weight: 600; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
  .sub { color: var(--_muted); font-size: 0.75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .up { color: var(--_up); } .down { color: var(--_down); } .flat { color: var(--_flat); }
  .chg { display: inline-flex; align-items: center; gap: 2px; white-space: nowrap; }
  /* Numbers are isolated as left-to-right so Urdu (RTL) text never moves a minus sign or unit. */
  .num, .chg, .px { unicode-bidi: isolate; direction: ltr; }
  a.attr { color: var(--_faint); text-decoration: none; display: inline-flex; align-items: center; gap: 3px; }
  a.attr:hover, a.attr:focus-visible { color: var(--_accent); text-decoration: underline; }
  :focus-visible { outline: 2px solid var(--_accent); outline-offset: 2px; border-radius: 4px; }
  .ico { width: 1em; height: 1em; flex: none; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; vertical-align: -0.125em; }
  .status { margin-inline-start: auto; display: inline-flex; align-items: center; gap: 5px; font-size: 0.7rem; color: var(--_muted); white-space: nowrap; border: 1px solid var(--_border); border-radius: 99px; padding: 1px 8px; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--_up); }
  .status[data-state='closed'] .dot { background: var(--_flat); }
  .status[data-state='stale'] .dot, .status[data-state='delayed'] .dot, .status[data-state='unavailable'] .dot { background: var(--_warn); }
  .status[data-state='halted'] .dot { background: var(--_down); }
  .status[data-state='loading'] .dot { background: var(--_border); }
  .logo { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-size: 0.6rem; font-weight: 700; color: #fff; flex: none; }
  .skel { background: var(--_surface); border-radius: 5px; animation: pulse 1.4s ease-in-out infinite; }
  .skel-body { display: flex; flex-direction: column; gap: 5px; overflow: hidden; }
  .skel-row { display: grid; grid-template-columns: 24px minmax(0, 1fr) 46px; align-items: center; gap: 8px; min-height: 28px; }
  @keyframes pulse { 50% { opacity: 0.55; } }
  .flash-up { animation: fu 600ms ease-out; } .flash-down { animation: fd 600ms ease-out; }
  @keyframes fu { from { background: color-mix(in srgb, var(--_up) 28%, transparent); } to { background: transparent; } }
  @keyframes fd { from { background: color-mix(in srgb, var(--_down) 28%, transparent); } to { background: transparent; } }
  .notice { padding: var(--_pad); font-size: 0.8rem; color: var(--_muted); }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  @media (prefers-reduced-motion: reduce) { .skel, .flash-up, .flash-down { animation: none; } }
`;

