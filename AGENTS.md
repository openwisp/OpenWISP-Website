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

## Contributing Guidelines

- Before editing, inspect the relevant implementation, tests, documentation, and configuration. Follow existing repository patterns and do not invent behavior or requirements.
- Keep each contribution focused and change only the lines necessary for its goal. Do not include unrelated refactors, formatting churn, or generated and dependency-file changes unless explicitly required.
- Run `openwisp-qa-format` after each change when available.
- Run the relevant targeted tests, builds, and documented QA checks, including `./run-qa-checks` when provided. Do not claim a change is complete when verification fails; report the failure or blocker.
- When requirements, intended behavior, or an unexpected failure are unclear, stop and seek clarification instead of making speculative changes.
- When starting work on a new issue, create a new branch from `master`. Use `issues/<issue-number>-<short-title>` for issue work; otherwise, use a short, descriptive branch name.
- Commit messages must be descriptive and use past tense. Past tense is a writing guideline that agents and contributors must follow; it is not checked automatically. For issue work, use an allowed prefix and a capitalized, past-tense subject ending with `#<issue-number>`, for example `[fix] Fixed perennial "modified" state #213`. Repeat the issue reference in the body with `Fixes`, `Closes`, `Resolves`, or `Related to` as appropriate. Use `openwisp-commit --check` to validate the structural commit convention and `cz -n cz_openwisp info` to view the allowed prefixes and message structure.
- Add an explanatory commit body only for substantial changes, new features, or non-obvious bug fixes. The releaser automatically publishes the subject of `[feature]`, `[change]`, `[change!]`, `[deps]`, and `[fix]` commits, including scoped variants, in the changelog. Write those subjects in clear, user-friendly language suitable for release notes.
- Send new commits in response to review feedback instead of amending existing commits.

## Development Notes

- Treat `css/theme.scss` as the source stylesheet for website CSS changes.
- Do not edit generated CSS under `theme/static/css/` or generated output under `output/` as source changes.
- After changing `css/theme.scss`, rebuild CSS with `npm run build:css` or run the full website build with `make html`.
- Keep generated and dependency directories out of source fixes unless explicitly requested.
- Update content, templates, configuration, and documentation together when website behavior, navigation, setup, or published information changes.
- Prefer short, precise names that rely on their nearest meaningful scope. Do not repeat a feature, domain object, or namespace already named by the containing module, class, or function. For example, prefer `EstimatedLocation.refresh()` over `EstimatedLocation.refreshEstimatedLocation()`. Repeat that context only when the name is used outside that scope or is needed to distinguish genuinely different concepts. When a concise name cannot express a necessary distinction, use a concise docstring to describe it rather than encoding it in an excessively long name.
- Before adding a comment or docstring, ask whether it conveys information a reader cannot reasonably infer from clear code, names, and surrounding scope. Add a concise comment when it explains a non-obvious reason, constraint, compatibility or security requirement, side effect, or unavoidable complexity. In opaque syntax or domain-specific code, especially shell scripts, a comment may also explain what the code does. Do not add comments that merely restate adjacent code one-to-one.

## Testing and QA

- For content-only or Pelican logic changes that do not affect frontend assets, run `make html SKIP_YARN=1` while iterating.
- Run `make html` when CSS, JavaScript, frontend dependencies, or generated frontend assets need rebuilding.

## Security Notes

- Preserve safe browser-facing behavior in templates and content: escape untrusted values, review embeds and generated assets, validate redirects, and use safe external links.
- Do not expose configuration secrets or credentials in content, templates, generated assets, or repository configuration.

## Troubleshooting

- If documentation and CI commands differ, use CI for verification and report the exact documentation path, CI workflow path, and differing commands. Do not change the documentation until the user explicitly chooses one of these actions: update the named documentation file in the current change because the divergence was caused by that change, or leave it unchanged for a separate follow-up. Never decide that scope distinction independently.
