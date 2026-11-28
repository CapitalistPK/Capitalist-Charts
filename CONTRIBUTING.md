# Contributing

Thanks for helping. A few things keep this project dependable for the sites that embed it.

1. **Open an issue first** for anything bigger than a small fix, so we can agree on the shape.
2. **Developer Certificate of Origin.** Sign off every commit (`git commit -s`), certifying you wrote
   the change or have the right to submit it under Apache-2.0 (https://developercertificate.org).
3. **Run the checks** before opening a pull request: `pnpm check`
   (typecheck, tests, build and bundle-size budgets).
4. **Budgets are part of the API.** The loader must stay under 3 KB gzipped and each widget chunk
   under 15 KB; CI fails above that.
5. **No new runtime dependencies** without discussion. Every dependency ships to thousands of
   other people's pages.
6. **Accessibility is required**: keyboard reachable, visible focus, labelled controls, a pause
   control for anything that moves, and no information shown by colour alone.
7. **Security**: never render data as HTML, never add a network destination other than the
   configured data source, never set cookies.

Visual screenshot baselines are generated only by the manual `workflow_dispatch` CI job on `ubuntu-latest`; run that job with `UPDATE_VISUAL_BASELINES` enabled and download its uploaded PNG artifact rather than generating local baselines with different fonts.

## Releases

See [RELEASING.md](RELEASING.md) for the version, changelog and tag process. Releases are made from
`main` by pushing a `vX.Y.Z` tag. The release workflow uses npm trusted publishing with the
`release` environment and provenance; no npm token is stored in the repository. It skips a package
when that version is already on npm.
