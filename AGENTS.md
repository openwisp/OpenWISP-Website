# AGENTS.md

## Project Notes

- Treat `css/theme.scss` as the source stylesheet for website CSS changes.
- Do not edit generated CSS under `theme/static/css/` or `output/` as source changes.
- After changing `css/theme.scss`, rebuild CSS with `npm run build:css` or the full website build.
- Keep generated and dependency directories out of source fixes unless explicitly requested.
