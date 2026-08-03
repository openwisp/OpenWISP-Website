# AGENTS.md

## Project Overview

`OpenWISP-Website` is the source repository for the OpenWISP static website, built with Pelican and a custom frontend theme.

Core website inputs are organized as follows:

- `content/` contains pages, blog posts, and other published content.
- `theme/` contains Pelican templates and theme resources.
- `css/` and `js/` contain frontend source files.
- `pelicanconf.py`, `publishconf.py`, `Makefile`, and `package.json` define website builds and configuration.

## Source of Truth

- Use `README.rst` and `Makefile` for local setup, build, and serving commands.
- Use `requirements.txt`, `package.json`, `yarn.lock`, and `.github/workflows/ci.yml` for CI-tested dependencies and build behavior.
- Use the relevant content, template, and configuration files to determine website behavior.

If instructions conflict, repository configuration and CI workflows win first, documentation next, and this file is supplemental.

## Development Notes

- Treat `css/theme.scss` as the source stylesheet for website CSS changes.
- Do not edit generated CSS under `theme/static/css/` or generated output under `output/` as source changes.
- After changing `css/theme.scss`, rebuild CSS with `npm run build:css` or run the full website build with `make html`.
- Keep generated and dependency directories out of source fixes unless explicitly requested.
- Update content, templates, configuration, and documentation together when website behavior, navigation, setup, or published information changes.

## Testing and QA

- For website behavior changes, use `make html` and `./run-qa-checks`.

## Security Notes

- Preserve safe browser-facing behavior in templates and content: escape untrusted values, review embeds and generated assets, validate redirects, and use safe external links.
- Do not expose configuration secrets or credentials in content, templates, generated assets, or repository configuration.

## Troubleshooting

- If a build or QA check fails, check `README.rst` and the `Makefile` first, then compare the command and dependencies with `.github/workflows/ci.yml`.

## Contributing Guidelines

- Before editing, inspect the relevant implementation, tests, documentation, and configuration. Follow existing repository patterns and do not invent behavior or requirements.
- Keep each contribution focused and change only the lines necessary for its goal. Do not include unrelated refactors, formatting churn, or generated and dependency-file changes unless explicitly required.
- Add or update focused tests for every behavior change. In repositories without a dedicated automated test suite, use the documented build and QA workflow as the equivalent behavior verification. For bug fixes, first reproduce the failure with a regression test when the repository's test setup allows it.
- Run the relevant targeted tests, builds, and documented QA checks, including `./run-qa-checks` when provided. Do not claim a change is complete when verification fails; report the failure or blocker.
- When requirements, intended behavior, or an unexpected failure are unclear, stop and seek clarification instead of making speculative changes.
- When starting work on a new issue, create a new branch from `master`. Use `issues/<issue-number>-<short-title>` for issue work; otherwise, use a short, descriptive branch name.
- Commit messages must be descriptive and use past tense. Past tense is a writing guideline that agents and contributors must follow; it is not checked automatically. For issue work, use an allowed prefix and a capitalized, past-tense subject ending with `#<issue-number>`, for example `[fix] Fixed perennial "modified" state #213`. Repeat the issue reference in the body with `Fixes`, `Closes`, `Resolves`, or `Related to` as appropriate. Use `openwisp-commit --check` to validate the structural commit convention and `cz -n cz_openwisp info` to view the allowed prefixes and message structure. If the repository's declared QA dependency predates these commands, install the development version with `pip install --upgrade "openwisp-utils[qa] @ https://github.com/openwisp/openwisp-utils/archive/refs/heads/master.tar.gz"` in the development environment.
- Add an explanatory commit body only for substantial changes, new features, or non-obvious bug fixes. The releaser automatically publishes the subject of `[feature]`, `[change]`, `[change!]`, `[deps]`, and `[fix]` commits, including scoped variants, in the changelog. Write those subjects in clear, user-friendly language suitable for release notes.
- Send new commits in response to review feedback instead of amending existing commits.
