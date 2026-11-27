# Capitalist Charts status

This directory is the configuration seed for a separate public Upptime repository.

1. Create a public repository named `Capitalist-Charts-Status` under the `CapitalistPK` organisation.
2. Use the [Upptime](https://github.com/upptime/upptime) template to create the repository.
3. Copy `.upptimerc.yml` from this directory into the new repository's root.
4. Check that `owner` and `repo` in the copied file still name that repository.
5. Copy `.github/workflows/uptime.yml` and `.github/workflows/site.yml` from this directory into the
   new repository and enable Actions and Pages.

The checks run every five minutes and cover the hosted loader, one quote snapshot, one bounded view,
the public config, and the widget gallery. Upptime's generated status site and issue workflow live in
the separate repository, not in this source tree.
