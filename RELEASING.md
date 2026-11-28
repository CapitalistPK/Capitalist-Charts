# Releasing Capitalist Charts

All five packages share one version: `schema`, `core`, `ssr`, `elements` and `react`.

1. On `main`, bump every `packages/*/package.json` to the same `X.Y.Z` version. Keep internal
   dependencies on `workspace:*` so pnpm resolves them to the release version when publishing.
2. Add a dated entry to `CHANGELOG.md` and update documentation or generated files that contain the
   package version.
3. Run `pnpm check` and review the generated package files.
4. Push the `vX.Y.Z` tag from `main`.

The tag starts `.github/workflows/release.yml`. It checks that every package version matches the tag,
then publishes public packages through npm trusted publishing from GitHub. The workflow uses the
`release` environment and requests provenance. It skips a package version that is already on npm, so
retrying a tag does not republish an existing version. No npm token is stored anywhere in the
repository.

The first public 1.0.0 packages were published manually. Future releases should use this workflow;
1.0.1 is the next release containing the package READMEs and documentation updates.
