# Agent Orientation: AMO-Tools-Desktop

Start here for repo-wide context. If you are working in a subdirectory that has its own `AGENTS.md`, read that file as well; local files carry the detailed guidance for that part of the tree.

## Project Context

AMO-Tools-Desktop is the MEASUR application: an Angular web app packaged for both web and Electron desktop runtimes. Its calculation backend is `measur-tools-suite`, a C++ library compiled to WebAssembly and distributed through npm.

The AMO-Tools-Desktop and MEASUR-Tools-Suite projects are maintained by the same team. Suite changes often require adapter, model, dependency, or verification updates in this repository.

## Documentation Map

- `ARCHITECTURE.md`: stable, human-facing overview of the application structure and major runtime boundaries.
- `docs/architecture/measur-tools-suite-integration.md`: how the WebAssembly suite is loaded and adapted.
- `docs/architecture/data-persistence.md`: IndexedDB, default data, backups, and saved assessment data.
- `docs/architecture/build-and-runtime.md`: Angular, Electron, process-flow component, and WASM build/runtime concerns.
- `docs/adr/0001-suite-api-boundary.md`: decision record for keeping suite calls behind `src/app/tools-suite-api/`.
- `src/app/tools-suite-api/AGENTS.md`: detailed guidance for suite wrapper services, typings, Emscripten object cleanup, and suite migration work.
- `process-flow-diagram-component/AGENTS.md`: guidance for the React process-flow package.

## Repo-Wide Rules

- Keep calculation calls behind the intended adapter boundary in `src/app/tools-suite-api/`. Do not add new direct `measur-tools-suite` or `ToolsSuiteModule` usage in Angular components, feature services, reducers, or UI code.
- Keep the root `package.json` and `process-flow-diagram-component/package.json` `measur-tools-suite` versions aligned.
- Use the installed suite declarations in `node_modules/measur-tools-suite/ts_def/` when updating suite-facing code.
- Preserve existing units, percentage conventions, and saved data shapes unless the requested change intentionally updates them.
- Treat default database data carefully. Reseeding or changing default records can affect existing IndexedDB state and user-defined materials.
- Keep changes scoped to the affected feature, adapter, or package. If a suite change alters calculation meaning, trace it from input form to wrapper, result display, reports/exports, and saved assessment data.

## Useful Search Patterns

- Find suite wrappers: `rg "ToolsSuiteModule" src/app/tools-suite-api`
- Find direct suite usage outside the Angular wrapper boundary: `rg "ToolsSuiteModule|measur-tools-suite" src/app process-flow-diagram-component/src`
- Find suite dependency pins: `rg "\"measur-tools-suite\"" package.json process-flow-diagram-component/package.json`
- Find suite declarations: `rg "ClassOrMethodName" node_modules/measur-tools-suite/ts_def`

## Verification

Use the narrowest verification that covers the change:

- Suite wrapper typecheck: `npx tsc -p src/tsconfig.app.json --noEmit`
- Root app build: `npm run build`
- Root app tests: `npm test`
- Process-flow component tests: run from `process-flow-diagram-component/` with `npm run test`
- Process-flow component typecheck: run from `process-flow-diagram-component/` with `npm run test:typecheck`

For runtime checks, `npm run start` builds the process-flow component and serves the Angular app. Use Electron-specific testing when a change touches `ElectronService`, desktop packaging, file paths, preload/main process behavior, backups, or WASM `locateFile` behavior.
