# Security policy

Please report vulnerabilities privately through GitHub's **Report a vulnerability** button on this
repository (Security tab), not in a public issue. We aim to acknowledge reports within three working
days and to ship a fix or mitigation for confirmed high-severity issues within fourteen days.

In scope: the packages in this repository and the CDN builds we publish from them. Out of scope:
denial-of-service by volume, findings that need a compromised host page, and reports generated only
by automated scanners without a demonstrated impact.

## What the widgets do on your page

- They make `GET` requests to the data source you configure (by default `https://capitalist.pk/w/`),
  with `credentials: 'omit'`: no cookies are sent or set.
- They render inside Shadow DOM, escape all text, never use `eval` or `innerHTML` with data, and
  only render icon markup that ships as constants in this package.
- They load no third-party scripts, trackers or fonts.

A suitable Content-Security-Policy for a host page using the hosted service:

```
script-src 'self' https://capitalist.pk https://cdn.jsdelivr.net;
connect-src 'self' https://capitalist.pk;
```

Pin an exact version and add Subresource Integrity when you load a fixed build:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@capitalist-charts/elements@1.0.0/cdn/loader.js"
        integrity="sha384-8TxYb+ibLLJewrsR1mDDhQ1SkEdv/jpqP7bdUShXj8AtpuDp6KPth+45obqHxltz"
        crossorigin="anonymous"></script>
```

The hash above is for the published `@capitalist-charts/elements@1.0.0` CDN loader. Recompute it
for every exact version.
