---
title: Security and privacy
---

# Security and privacy

## Content Security Policy

A host page using the hosted service needs:

| Directive | Origins | Why |
|---|---|---|
| `script-src` | `https://capitalist.pk https://cdn.jsdelivr.net` | The loader and widget code (jsDelivr is the fallback copy of the same build) |
| `connect-src` | `https://capitalist.pk` | The data files under `/w/` |
| `frame-src` | `https://capitalist.pk` | Only for `<cap-advanced-chart>`, which embeds SmartCharts in an iframe |
| `style-src` | none extra | Styles live inside each widget's Shadow DOM (constructable stylesheets) |

The copy-paste snippet's fallback is an inline `onerror` attribute. A strict policy without
`'unsafe-hashes'` blocks it; drop the attribute in that case (or self-host the loader). For a
pinned version, add `integrity` and `crossorigin="anonymous"` (the SSR helper's `embedSnippet`
writes both).

Widgets never use `eval`, `innerHTML` with remote data, or `document.write`. Every remote value is
rendered as text by Lit, and every JSON file is checked against its shape before use: a malformed
or misrouted file is treated as a failed request (the last good data stays on screen).

## What the widgets send

- Requests carry no cookies (`credentials: 'omit'`), no keys and no query strings.
- URLs are built only from validated names (`PSX`, `OGDC`, fixed ranges), so a widget attribute
  cannot make a request to another path or host.
- Links to capitalist.pk carry `utm_source=widget`, the widget name and the host name, and open in
  a new tab. Hosts can cancel the `cap:link` event and route clicks themselves.

## Impression beacon

The hosted Capitalist adapter may send one beacon per widget tag per page load. The default sample
rate is 1 percent and the hosted `config.json` can set `beaconRate` from `0` to `1`; `0` disables
the beacon. A page can disable it with `<meta name="capitalist-charts" content="no-beacon">`.
The beacon is skipped when Global Privacy Control or Do Not Track is enabled, and it is never sent
for a bring-your-own-data adapter.

The request is a `POST` made with `navigator.sendBeacon` to `/w/beacon` and its `text/plain` body is
exactly JSON with these three fields:

```json
{"d":"<location.hostname>","w":"<tag>","v":"<version>"}
```

It contains only the host name, widget tag and package version. It contains no cookies, identifier,
URL or user data, and the body is capped at 256 bytes. Beacons are not stored one by one: each is
added to a daily count per host name and widget, and those counts are kept for 400 days. The beacon
endpoint keeps no request log, so the sender's IP address is not recorded.

## What the data service serves

Public market data only: current snapshots (what a visitor of a quote page sees) and bounded
summaries (at most 300 chart points or a few dozen rows, for fixed periods). There are no date
ranges or page numbers, so the widget feed is not a way to download history. The service receives
nothing from the host page beyond the ordinary request (IP, user agent, referrer).

## Reporting a vulnerability

See [SECURITY.md](https://github.com/CapitalistPK/Capitalist-Charts/blob/main/SECURITY.md).
