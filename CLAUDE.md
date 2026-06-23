# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenMRS ESM Patient Grid App (`@icrc/esm-patient-grid-app`) - a single-package microfrontend module for the OpenMRS 3.x ecosystem that provides a patient grid feature. Built by ICRC. Uses Yarn 4 (not a monorepo).

## Commands

```bash
yarn                          # Install dependencies
yarn start                    # Dev server via openmrs develop
yarn build                    # Production webpack build
yarn verify                   # Run lint + test + typecheck concurrently
yarn lint                     # ESLint with --fix and --max-warnings=0
yarn test                     # Jest with SWC transformer
yarn test -- path/to/file     # Run a single test file
yarn test -- --coverage       # Run with coverage
yarn typescript               # TypeScript type checking (tsc, noEmit)
yarn prettier                 # Format all src files
yarn extract-translations     # Extract i18n keys from TSX files
```

## Architecture

This is an OpenMRS ESM (Single-SPA) microfrontend that integrates via `@openmrs/esm-framework` v10.x.

**Entry point:** `src/index.ts` - exports `startupApp()` (registers config schema and breadcrumbs), `root` (main routed component), and `patientGridsLink` (app menu extension). Components are lazy-loaded via `getAsyncLifecycle()`.

**Routes** (defined in `src/routes.ts` and `src/routes.json`):
- `/patient-grids` - Overview page listing grids (my/shared/system tabs)
- `/patient-grids/:id` - Grid detail view with data table

**Key source directories:**
- `src/api/` - REST API layer using `openmrsFetch()` and SWR hooks. Main endpoint: `/ws/rest/v1/patientgrid/patientgrid`
- `src/grid-utils/` - Grid logic: column config, filtering, download/export (xlsx), undo/redo, React Table integration
- `src/patient-grids-overview/` - Grid listing page with multi-step creation wizard (`usePatientGridWizard`)
- `src/patient-grid-details/` - Grid detail page with inline editing, historic encounters, column toggling
- `src/crosscutting-features/` - Shared modals (edit/delete grid)
- `src/components/` - Reusable layout components (PageHeader, SidePanel)

**Data fetching:** SWR-based hooks (e.g., `useGetAllPatientGrids`, `useGetPatientGrid`) with custom mutation hooks wrapping `openmrsFetch`.

**UI framework:** IBM Carbon React (`@carbon/react`) with SCSS modules. Table rendering uses `@tanstack/react-table`.

**Configuration:** `src/config-schema.ts` defines the module config (age range UUID, patient column types, form-specific hidden columns) registered via `defineConfigSchema()`.

## Testing

Jest 30 with `@swc/jest` transformer in jsdom environment. Config in `jest.config.json`. Key mappings:
- `@openmrs/esm-framework` maps to its built-in mock
- CSS/SCSS mapped to `identity-obj-proxy`
- `lodash-es` remapped to `lodash` (CJS)

Setup file: `src/setup-tests.ts` (imports `@testing-library/jest-dom`).

## Code Style

- Prettier: 120 char width, single quotes, trailing commas, semicolons, LF line endings
- ESLint: extends `ts-react-important-stuff` + `prettier` + `@typescript-eslint/recommended`, max 0 warnings
- Pre-commit hook (Husky): runs `pretty-quick --staged`

## i18n

Translations in `translations/` (en, fr, es, ar). Use `useTranslation()` from `react-i18next`. Extract keys with `yarn extract-translations`. Translation management via Transifex (`.tx/` config).

## CI/CD

- Every push to `main` publishes a pre-release to npm (`<version>-pre.<run_number>`)
- Official releases via manual GitHub Actions workflow (`release.yml`), which publishes, creates a GitHub release, bumps to next minor, and opens a PR for the version change
