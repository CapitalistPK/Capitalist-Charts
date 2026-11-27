/** Number and time formatting for market data. Pure; no Intl state is kept between calls. */

export type NumberStyle = 'south-asian' | 'international';

const URDU_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Fixed decimals with thousands separators: 118402.3 -> "118,402.30". */
export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Price with the decimals PSX quotes use: 2, or 0 for index levels when asked. */
export function formatPrice(value: number, decimals = 2): string {
  return formatNumber(value, decimals);
}

/** Signed change: +2.15, −0.40 (a real minus sign), 0.00. */
export function formatChange(value: number | null, decimals = 2): string {
  if (value === null || !Number.isFinite(value)) return '—';
  const text = formatNumber(Math.abs(value), decimals);
  return value > 0 ? `+${text}` : value < 0 ? `−${text}` : text;
}

export function formatPercent(value: number | null, decimals = 2): string {
  return value === null ? '—' : `${formatChange(value, decimals)}%`;
}

/**
 * Compact volume or value. South Asian style uses lakh (1e5) and crore (1e7), as Pakistani
 * readers expect: 12,500,000 -> "1.25 Cr". International style: "12.5M".
 */
export function formatCompact(value: number | null, style: NumberStyle = 'south-asian'): string {
  if (value === null || !Number.isFinite(value)) return '—';
  const a = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (style === 'south-asian') {
    if (a >= 1e7) return `${sign}${trim(a / 1e7)} Cr`;
    if (a >= 1e5) return `${sign}${trim(a / 1e5)} Lac`;
    if (a >= 1e3) return `${sign}${trim(a / 1e3)}K`;
    return `${sign}${trim(a)}`;
  }
  if (a >= 1e9) return `${sign}${trim(a / 1e9)}B`;
  if (a >= 1e6) return `${sign}${trim(a / 1e6)}M`;
  if (a >= 1e3) return `${sign}${trim(a / 1e3)}K`;
  return `${sign}${trim(a)}`;
}

function trim(n: number): string {
  return n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1).replace(/\.0$/, '') : n.toFixed(2).replace(/\.?0+$/, '');
}

/** Western digits to Urdu (Extended Arabic-Indic) digits, for `digits="urdu"`. */
export function toUrduDigits(text: string): string {
  return text.replace(/[0-9]/g, (d) => URDU_DIGITS[Number(d)] ?? d);
}

/** Age of a timestamp in plain words: "now", "8 s", "3 min", "2 h", "4 d". */
export function formatAge(epochSec: number, nowSec: number): string {
  const s = Math.max(0, Math.round(nowSec - epochSec));
  if (s < 3) return 'now';
  if (s < 60) return `${s} s`;
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  return `${Math.floor(s / 86400)} d`;
}

/** Clock time in the market's zone: "14:32". */
export function formatClock(epochSec: number, timeZone = 'Asia/Karachi'): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(epochSec * 1000));
}

export function direction(change: number | null): 'up' | 'down' | 'flat' {
  if (change === null || change === 0 || !Number.isFinite(change)) return 'flat';
  return change > 0 ? 'up' : 'down';
}

/** A signed money flow in its own unit: `+$1.2M` for dollars, `+1.2M PKR` otherwise. */
export function formatFlow(n: number, unit: string): string {
  return `${n < 0 ? '−' : '+'}${unit === 'USD' ? '$' : ''}${formatCompact(Math.abs(n), 'international')}${unit === 'USD' ? '' : ` ${unit}`}`;
}
