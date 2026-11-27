import {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { CATALOG, COMMON_ATTRIBUTES, type WidgetSpec } from '@capitalist-charts/elements/catalog';
import type { CapitalistChartsOptions } from '@capitalist-charts/elements';

export type Theme = 'auto' | 'light' | 'dark' | 'transparent';
export type Palette = 'pk' | 'cvd';
export type Density = 'comfortable' | 'compact';
export type Locale = 'en' | 'ur';

export interface CapitalistWidgetEvents {
  onCapReady?: (event: CustomEvent) => void;
  onCapUpdate?: (event: CustomEvent) => void;
  onCapError?: (event: CustomEvent) => void;
  onCapLink?: (event: CustomEvent) => void;
  onCapSelect?: (event: CustomEvent) => void;
}

/** Catalog attributes stay strings at the DOM boundary; fixed options get useful editor unions. */
export interface CatalogAttributeProps {
  symbol?: string;
  symbols?: string;
  index?: string;
  show?: 'price' | 'change' | 'both';
  speed?: string;
  range?: '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y';
  chartType?: 'area' | 'line' | 'candles' | 'bars' | 'heikin-ashi';
  volume?: 'true' | 'false';
  interval?: string;
  studies?: string;
  compare?: string;
  hideTopToolbar?: 'true' | 'false';
  hideSideToolbar?: 'true' | 'false';
  allowSymbolChange?: 'true' | 'false';
  events?: 'true' | 'false';
  indices?: string;
  market?: string;
  tab?: 'gainers' | 'losers' | 'active';
  rows?: string;
  sector?: string;
  currencies?: string;
  /** `1D`/`1W`/`1M` (flows), `annual`/`quarterly` (financials), `1Y`/`3Y`/`5Y` (fund leaderboard). */
  period?: string;
  fund?: string;
  types?: string;
  category?: string;
  code?: string;
  salary?: string | number;
  shape?: 'card' | 'inline';
  preset?: string;
  presets?: string;
  summaries?: 'true' | 'false';
  impact?: 'low' | 'medium' | 'high';
  sort?: string;
}

export type CapitalistWidgetProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & CapitalistWidgetEvents & CatalogAttributeProps & {
  children?: ReactNode;
  theme?: Theme;
  palette?: Palette;
  density?: Density;
  locale?: Locale;
};

export interface CapitalistChartsProviderProps extends CapitalistChartsOptions {
  children?: ReactNode;
}

const EVENT_PROPS = {
  onCapReady: 'cap:ready',
  onCapUpdate: 'cap:update',
  onCapError: 'cap:error',
  onCapLink: 'cap:link',
  onCapSelect: 'cap:select',
} as const;

const camel = (name: string): string => name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
const attrNames = (spec: WidgetSpec): Array<{ prop: string; attr: string }> =>
  [...COMMON_ATTRIBUTES, ...spec.attributes].map((attribute) => ({ prop: camel(attribute.name), attr: attribute.name }));

function setForwardedRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function useElementRegistration(): void {
  useEffect(() => {
    // Dynamic import is deliberately inside an effect: importing this package must remain SSR-safe.
    void import('@capitalist-charts/elements').catch(() => undefined);
  }, []);
}

function createWidget(spec: WidgetSpec) {
  const attributes = attrNames(spec);
  const widgetProps = new Set(attributes.map((a) => a.prop));
  const component = forwardRef<HTMLElement, CapitalistWidgetProps>((props, forwardedRef) => {
    useElementRegistration();
    const [element, setElement] = useState<HTMLElement | null>(null);
    const handlers = useRef(props);
    handlers.current = props;
    const assignElement = useCallback((node: HTMLElement | null) => {
      setElement(node);
      setForwardedRef(forwardedRef, node);
    }, [forwardedRef]);

    useEffect(() => {
      if (!element) return undefined;
      const active = Object.entries(EVENT_PROPS).map(([prop, eventName]) => {
        const listener = (event: Event) => {
          const handler = (handlers.current as Record<string, unknown>)[prop] as ((event: CustomEvent) => void) | undefined;
          handler?.(event as CustomEvent);
        };
        element.addEventListener(eventName, listener);
        return [eventName, listener] as const;
      });
      return () => active.forEach(([eventName, listener]) => element.removeEventListener(eventName, listener));
    }, [element]);

    const { children } = props;
    const values = props as Record<string, unknown>;
    // Ordinary HTML props (title, role, hidden, tabIndex, onClick...) pass through as they would on a
    // div; widget props become their kebab-case attributes; cap:* event props are wired above.
    const elementProps: Record<string, unknown> = { ref: assignElement };
    for (const [key, value] of Object.entries(values)) {
      if (key === 'children' || key in EVENT_PROPS || widgetProps.has(key) || value === undefined) continue;
      elementProps[key] = value;
    }
    for (const { prop, attr } of attributes) {
      const value = values[prop];
      if (value !== undefined && value !== null) elementProps[attr] = String(value);
    }
    return createElement(spec.tag, elementProps, children as ReactNode);
  });
  component.displayName = spec.name;
  return component;
}

const components = Object.fromEntries(CATALOG.map((spec) => [spec.name, createWidget(spec)])) as Record<string, ReturnType<typeof createWidget>>;

export const CapTickerTag = components.CapTickerTag!;
export const CapQuote = components.CapQuote!;
export const CapTickerTape = components.CapTickerTape!;
export const CapMiniChart = components.CapMiniChart!;
export const CapSymbolOverview = components.CapSymbolOverview!;
export const CapAdvancedChart = components.CapAdvancedChart!;
export const CapMarketSummary = components.CapMarketSummary!;
export const CapMovers = components.CapMovers!;
export const CapMarketMap = components.CapMarketMap!;
export const CapFxCrossRates = components.CapFxCrossRates!;
export const CapFipiLipi = components.CapFipiLipi!;
export const CapFundCard = components.CapFundCard!;
export const CapCorporateCalendar = components.CapCorporateCalendar!;
export const CapSectorPerformance = components.CapSectorPerformance!;
export const CapIndexContributors = components.CapIndexContributors!;
export const CapSectorMoneyMap = components.CapSectorMoneyMap!;
export const CapValuation = components.CapValuation!;
export const CapFinancials = components.CapFinancials!;
export const CapDividends = components.CapDividends!;
export const CapInsiderTrades = components.CapInsiderTrades!;
export const CapRadar = components.CapRadar!;
export const CapShariah = components.CapShariah!;
export const CapFundPerformance = components.CapFundPerformance!;
export const CapFundLeaderboard = components.CapFundLeaderboard!;
export const CapNews = components.CapNews!;
export const CapWatchlist = components.CapWatchlist!;
export const CapSeasonality = components.CapSeasonality!;
export const CapFuturesBoard = components.CapFuturesBoard!;
export const CapCompanyProfile = components.CapCompanyProfile!;
export const CapEconomicCalendar = components.CapEconomicCalendar!;
export const CapMacro = components.CapMacro!;
export const CapFxHeatmap = components.CapFxHeatmap!;
export const CapCommodities = components.CapCommodities!;
export const CapScreener = components.CapScreener!;
export const CapTaxCalculator = components.CapTaxCalculator!;

export function CapitalistChartsProvider({ adapter, dataBase, children }: CapitalistChartsProviderProps) {
  useEffect(() => {
    // Runs again when the adapter or data root changes; connected widgets rebind to the new
    // runtime. `current` stops a slow import from an earlier render configuring after a newer one.
    let current = true;
    void import('@capitalist-charts/elements')
      .then(({ configureCapitalistCharts }) => {
        if (current) configureCapitalistCharts({ adapter, dataBase });
      })
      .catch(() => undefined);
    return () => {
      current = false;
    };
  }, [adapter, dataBase]);
  return children ?? null;
}

