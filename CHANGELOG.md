# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!--
Template
## [{project-version}] - {YYYY-MM-DD}

### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security
-->

## [Unreleased] - 2026-11-15

### Changed
- `README.md` layout
  - Features and two example screenshots combined in one table: the features span the full width, with the screenshots side by side below (`{example-N-title}` and `{example-N-image}` placeholders, images in `docs/`).
  - Dependencies and Usage placed side by side in a two-column table, keeping their list formatting; the separate Example section was removed, and Repository structure became a level 3 heading.

## [1.0.0] - 2026-11-15

### Added
- Project setup
  - Linux (GNOME) installation steps for a project-local `denoenv-{deno-version}` environment (Deno binary, `DENO_DIR` cache and `lefthook`), without install scripts.
  - Copy-paste installation commands (Bash one-liners) with `deno` and `lefthook` version variables and automatic SHA-256 validation against the release checksums.
  - `deno.jsonc` with tasks (`typecheck`, `transpile`, `build`, `pack`, `install`, `devkit`, `logs`) and an import map with the `@girs/gjs` and `@girs/gnome-shell` type definitions and the TypeScript compiler, installed into `node_modules/`.
  - `deno.lock` with the pinned dependency versions.
  - Deno, TypeScript and GNOME Shell extension `.gitignore`, covering Node.js compatibility, coverage, packed extensions and compiled schemas and translations.
  - `LICENSE` (GPL-3.0), compatible with the extensions.gnome.org licensing rules.
- TypeScript to JavaScript
  - `tsconfig.json` for `tsc` 6.0 run through Deno, transpiling `src/` into readable ES modules in `dist/`, with the `gi://` and `resource://` imports kept as they are.
  - `src/ambient.d.ts` with the GJS and GNOME Shell type definitions.
  - Example extension in `src/extension.ts` (top bar icon, settings signal, complete cleanup in `disable()`) and preferences window in `src/prefs.ts` (libadwaita switch bound to a GSettings key).
- Code quality (local CI)
  - `lefthook.yml` with a `check` bundle of `deno fmt`, `deno lint`, `deno check` (lint plugin) and the `tsc` type check (extension), run manually with `lefthook run check` and without git hooks.
  - Strict TypeScript compiler options, lint rules (including `camelcase` and explicit return types) and formatter settings.
  - `deno lint` plugin `lint/gnome.ts` with GNOME Shell rules: `gnome/process-imports` (no GTK libraries in the GNOME Shell process and no GNOME Shell libraries in the preferences process), `gnome/disable-sync` (no async `disable()`) and `gnome/no-legacy-imports` (no pre-GNOME 45 `imports` object).
- Packaging (local CD)
  - GNOME Shell extension recipe in `Extension/Recipe`: `metadata.json`, `stylesheet.css` and a GSettings schema in `schemas/`, copied into `dist/` by `deno task build`.
  - Packing and installing with `gnome-extensions`, testing in a nested GNOME Shell (`mutter-devkit`) and following the GNOME Shell log.
- Documentation
  - `README.md` with Metadata, Features, Setup (Dependencies, Installation, Usage, Repository structure), Example and a commented-out Troubleshooting section.
  - `Extension/README.md` guide: extension anatomy, `metadata.json` fields, the GNOME Shell and preferences processes, lifecycle rules, TypeScript to JavaScript, settings, translations, renaming the example extension, building, testing, debugging and publishing on extensions.gnome.org.
  - `CHANGELOG.md` and its template `.github/CHANGELOG_TEMPLATE/CHANGELOG.md`, based on Keep a Changelog.
  - `TO-DO.md`.
- GitHub repository templates
  - Default pull request template `.github/pull_request_template.md` and `.github/PULL_REQUEST_TEMPLATE/Default.md`.
  - `.github/CODEOWNERS`, its template `.github/CODEOWNERS_TEMPLATE/CODEOWNERS` and the GitHub sample `.github/CODEOWNERS_TEMPLATE/CODEOWNERS_SCHEMA`.
- Template conventions
  - Standardised kebab-case placeholder names (`{project-*}`, `{author-*}`, `{dependency-N-*}`, `{deno-*}`, `{extension-*}`, `{shell-version}`) across all template files; the example extension `template@example.com` builds and installs without changes.
  - Based on 'A-TypeScript-Template' (ATT), with the AppImage packaging replaced by GNOME Shell extension packaging.
  - Compatibility with 'a-skills'.
