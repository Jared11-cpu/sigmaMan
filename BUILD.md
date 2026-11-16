# Release 20261116-1755

This release synchronizes the project source from D:\running, captured on 2026-11-16 (China time).

HTML, CSS and JavaScript are served directly; no build step is required. This release publishes readable source rather than the minified assets from the previous release. HTML asset version parameters use 20261116-1755. Social sharing metadata and the index-based 404 fallback are retained.

GitHub Pages hosts the static frontend only. Node/SQLite server source is included for separate deployment; databases, uploads, .env, node_modules, backups and local verification artifacts are excluded. Browser records are stored locally when no compatible server is available.

JavaScript syntax checks passed for all published JavaScript files before upload. Server integration tests were not run for this publishing task.
