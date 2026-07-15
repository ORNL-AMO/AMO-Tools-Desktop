# AMO-Tools-Desktop Architecture

This document is the stable architecture entry point for AMO-Tools-Desktop. It explains the major boundaries and where to find deeper context. Agent-specific workflow rules live in `AGENTS.md` files.

## System Overview

AMO-Tools-Desktop is an Angular application that runs as a web app and as an Electron desktop app. The core user experience is organized around MEASUR assessments, calculators, inventories, settings, and reports.

The application does not own the core engineering calculation engine. Calculation truth lives in `measur-tools-suite`, a C++ library compiled to WebAssembly and distributed through npm. AMO-Tools-Desktop adapts UI-facing TypeScript models into suite inputs, calls the suite, and maps suite outputs back into app-facing result models.

## Major Boundaries

- Angular app: `src/app/`
  - Feature modules, components, services, shared models, IndexedDB services, and suite adapter services.
- Suite adapter boundary: `src/app/tools-suite-api/`
  - The intended Angular boundary for all `measur-tools-suite` calls.
- Persistence boundary: `src/app/indexedDb/`
  - IndexedDB-backed services for assessments, calculators, settings, directories, inventories, and suite-backed material data.
- Electron boundary: `main.js`, `preload.js`, and `src/app/electron/`
  - Desktop shell behavior, preload bridge, desktop paths, backups, and Electron-specific runtime concerns.
- Process-flow package: `process-flow-diagram-component/`
  - A separate React package built into the app, with its own package metadata and direct suite initialization hook.
- Build/runtime configuration: `angular.json`, root `package.json`, `process-flow-diagram-component/package.json`, and webpack configs.
  - Controls Angular builds, Electron builds, process-flow bundling, and WebAssembly asset copying.

## Calculation Flow

Most calculations follow this path:

1. UI components collect or edit AMO-facing model data.
2. Feature services prepare app-facing inputs and call a domain method in `src/app/tools-suite-api/`.
3. The wrapper service maps app models, units, enums, nullable values, and vectors into suite inputs.
4. `measur-tools-suite` runs the calculation through the WebAssembly module.
5. The wrapper copies primitive output values into plain TypeScript result objects.
6. Suite-owned objects and vectors are deleted.
7. Feature code displays, saves, exports, or reports the app-facing result.

## Deeper Architecture Docs

- `docs/architecture/measur-tools-suite-integration.md`: suite loading, adapter services, declarations, memory management, and default suite data.
- `docs/architecture/data-persistence.md`: IndexedDB services, settings, default data, backups, and saved assessment considerations.
- `docs/architecture/build-and-runtime.md`: build scripts, process-flow bundling, Electron/web runtime differences, and WASM asset loading.
- `docs/adr/0001-suite-api-boundary.md`: why new Angular code should use `src/app/tools-suite-api/` rather than raw suite imports.

## Change Guidance

For small feature changes, read the nearest feature code and preserve existing conventions. For suite-facing work, read `src/app/tools-suite-api/AGENTS.md` and the suite integration architecture doc before changing wrappers.

For broad changes, update architecture docs when the system shape changes, and add an ADR when a decision changes future implementation choices.
