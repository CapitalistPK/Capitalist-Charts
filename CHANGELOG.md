# Changelog

All notable changes to the published packages are recorded here. The project follows
[Semantic Versioning](https://semver.org); all packages in this repository share one version.

## 1.0.1 - 2026-11-28

- Added npm READMEs for schema, core, SSR, elements and React, with examples based on the 1.0.0
  published declarations and catalog.
- Updated the repository and documentation site for the public 1.0.0 release, including the
  hosted loader and jsDelivr paths.
- Documented the GitHub trusted-publishing release process and package provenance.

## 1.0.0

First public release of the five npm packages under Apache-2.0.

- 35 web components (`cap-*`): tickers, quotes, charts, market overviews, flows, funds, company
  analytics, calendars, economy and tools, each in one or more shapes (inline, strip, card, panel,
  tall, full).
- `@capitalist-charts/core`: data adapters (hosted service, mock, bring-your-own), a shared poller
  that pauses when hidden, cross-tab sharing of one data stream, formatters and an icon set.
- `@capitalist-charts/react` wrappers and `@capitalist-charts/ssr` fallback HTML helpers.
- A small loader that imports each widget only near the viewport and reserves every widget's size
  before its code arrives, so host pages do not shift.
- Light, dark, auto and transparent themes, `--cap-*` tokens, `::part()` on every region, Urdu
  locale and right-to-left layout.
- Browser tests for the widget states, interactions and accessibility behaviour.
