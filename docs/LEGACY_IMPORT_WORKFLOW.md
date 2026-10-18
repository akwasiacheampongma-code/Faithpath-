# Retired one-shot import workflow

The former `.github/workflows/import-faithpath.yml` is retired on the Phase7
maintenance branch. It was a manual, repository-wide ZIP import with
`contents: write`, deletion of root files and `git push`. It is inappropriate
for ongoing maintenance. Its exact historical text remains in Git at
`7d24aea30bec5b0b8d43e199f3cadfc6305c1e3e:.github/workflows/import-faithpath.yml`.

The replacement `quality.yml` has read-only contents access, no retained Git
credential and no publish, repository write, merge or deployment step. Editorial
imports continue to require their separate reviewed content process. No change
to another branch's workflow or existing deployment is authorized here.
