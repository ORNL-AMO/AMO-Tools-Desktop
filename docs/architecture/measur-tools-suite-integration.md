# MEASUR-Tools-Suite Integration

## Role of the Suite

`measur-tools-suite` is the calculation backend for AMO-Tools-Desktop. It is a C++ library compiled to WebAssembly and distributed through npm. AMO-Tools-Desktop should treat the suite as calculation truth and keep application code focused on UI, persistence, unit/model adaptation, reporting, and runtime packaging.

## Package Locations

- Root app dependency: `package.json`
- Process-flow component dependency: `process-flow-diagram-component/package.json`
- Installed declarations: `node_modules/measur-tools-suite/ts_def/`
- WebAssembly assets: `node_modules/measur-tools-suite/bin/`

Keep the root and process-flow dependency versions aligned unless there is an intentional compatibility bridge.

## Angular Suite Boundary

Angular suite usage belongs in `src/app/tools-suite-api/`.

Key files:

- `tools-suite-api.service.ts`: initializes the Emscripten module, stores `ToolsSuiteModule`, handles `locateFile`, and seeds suite-backed default database data.
- `tools-suite-api.module.ts`: provides the wrapper services.
- `suite-api-helper.service.ts`: maps AMO enum values to suite enums, creates vectors, and normalizes nullable constructor inputs.
- `*-suite-api.service.ts`: domain wrappers for pumps, fans, steam, process heating, process cooling, compressed air, wastewater, water, calculators, SVI, lighting, and default data.

New Angular feature code should call these wrappers instead of importing `measur-tools-suite` directly.

## Module Loading and WASM Assets

`ToolsSuiteApiService.initializeModule()` calls the suite `createModule` function and configures `locateFile` so the runtime can find the suite WebAssembly artifact. `angular.json` copies the suite `bin` directory into application assets.

When suite packaging changes, verify both web and Electron runtimes:

- the emitted WASM file name and path,
- the `angular.json` asset copy,
- `locateFile` behavior,
- Electron path handling.

## Wrapper Pattern

Most wrapper methods:

1. Accept app-facing models or primitives.
2. Convert AMO enums, units, nullable values, percentages, and vectors into suite inputs.
3. Instantiate suite classes from `this.toolsSuiteApiService.ToolsSuiteModule`.
4. Call the suite method.
5. Copy returned values into plain TypeScript objects.
6. Delete suite-owned instances, vectors, nested vector items, and returned suite objects.
7. Return app-facing results.

Do not return suite-owned objects to Angular UI code.

## Typings and Declarations

Use declarations from `node_modules/measur-tools-suite/ts_def/` to confirm constructor signatures, enum values, vector types, and output fields. If declarations are missing or incomplete, keep any AMO-side workaround narrow and consider fixing the declaration in MEASUR-Tools-Suite.

Wrapper-specific typing conventions are documented in `src/app/tools-suite-api/AGENTS.md`.

## Default Suite Data

Some default material/database data comes from the suite and is inserted into IndexedDB during app initialization. `ToolsSuiteApiService.initializeDefaultDbData()` checks `Settings.suiteDbItemsInitialized` before inserting those records.

Changing suite-backed default data can affect existing users and reset flows. Review `src/app/indexedDb/`, `src/app/suiteDb/`, settings defaults, and reset-data behavior before changing initialization semantics.
