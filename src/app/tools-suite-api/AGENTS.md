# Agent Notes: Tools Suite API

This directory is the Angular adapter boundary for MEASUR-Tools-Suite. Read this file when changing `src/app/tools-suite-api/` or when a suite API/declaration change affects AMO-Tools-Desktop.

## Boundary Rules

- Keep raw `measur-tools-suite` and `ToolsSuiteModule` usage in this directory.
- Do not return suite-owned objects to feature/UI code. Return plain TypeScript objects, arrays, numbers, strings, and booleans.
- Add or update narrow wrapper methods in the relevant domain service rather than spreading suite calls across the app.
- If a suite change touches legacy direct usage outside this directory, prefer moving that usage behind this adapter when scope is small and safe.

## Key Files

- `tools-suite-api.service.ts`: initializes the Emscripten module, stores `ToolsSuiteModule`, handles `locateFile`, and seeds default suite-backed database data.
- `tools-suite-api.module.ts`: provides the domain wrapper services.
- `suite-api-helper.service.ts`: maps app enum values to suite enums, creates WASM vectors, and normalizes null/empty numeric inputs for suite constructors.
- `*-suite-api.service.ts`: domain adapters for pumps, fans, steam, process heating, process cooling, compressed air, wastewater, water, calculators, SVI, lighting, and default data.

## Wrapper Pattern

Most wrapper methods should:

1. Accept app-facing model objects or primitive arguments.
2. Convert UI enums and nullable values through `SuiteApiHelperService`.
3. Convert percentages, units, and vectors into the shape expected by the suite.
4. Instantiate suite classes from `this.toolsSuiteApiService.ToolsSuiteModule`.
5. Call the suite calculation method.
6. Copy returned fields into a plain app-facing object.
7. Call `.delete()` on suite instances, vectors, vector items, and returned suite objects when they expose it.
8. Return the plain TypeScript result.

Match the style of the closest existing domain service. Pump calculations belong in `pumps-suite-api.service.ts`, steam modeler work belongs in `steam-suite-api.service.ts`, and shared standalone opportunity calculators generally belong in `calculator-suite-api.service.ts` or `standalone-suite-api.service.ts`.

## Typing Rules

- Use suite declarations from `node_modules/measur-tools-suite/ts_def/`.
- Avoid `any` in this directory.
- Explicitly annotate local variables that hold suite classes, vectors, enum values, returned suite objects, and plain app-facing results. Prefer `let results: ResultType = ...` over relying on inference in wrapper methods.
- Import suite types from `measur-tools-suite/ts_def/ts_def_modules/...` near the wrapper that uses them.
- When a suite type name collides with an AMO UI/model type, alias the suite import with a `Suite` prefix, such as `SuiteBoiler`, `SuiteProcessCooling`, or `SuiteHeatExchangerOutput`.
- If a suite declaration is missing or incomplete, prefer a narrow local interface or structural type for only the field/method surface used here, then consider fixing the declaration in MEASUR-Tools-Suite.
- Do not use broad casts to silence migration errors. Confirm constructor arguments, enum return values, and output field names in the installed declarations first.

## Common Footguns

- WASM memory management is manual. Strong typing does not remove the need to call `.delete()`.
- Suite enum numeric values should not be assumed to match AMO enum numeric values. Use or add helper mappings.
- Null, `undefined`, and `''` are not safe constructor inputs unless the suite declaration and nearby wrapper behavior confirm it.
- UI models often store percentages as `0-100`, while suite constructors may expect fractions. Check nearby conversion code before changing a value.
- Suite output names may differ from older wrapper assumptions or AMO model names. Treat compile errors as API migration clues.
- Default data changes can affect existing IndexedDB state and user-defined material data.

## Updating for Suite Changes

1. Confirm the installed suite version and declaration shape.
2. Update dependency pins in both root `package.json` and `process-flow-diagram-component/package.json` when the suite version changes.
3. Update the relevant wrapper service and `SuiteApiHelperService` mappings.
4. Update app-facing models only when UI or saved data shape really changes.
5. Verify object cleanup for every created or returned suite object.
6. Validate typecheck/build and any affected runtime path.

## Useful Commands

- Find all wrapper suite calls: `rg "ToolsSuiteModule" src/app/tools-suite-api`
- Find direct suite usage outside this boundary: `rg "ToolsSuiteModule|measur-tools-suite" src/app process-flow-diagram-component/src`
- Find suite declarations: `rg "ClassOrMethodName" node_modules/measur-tools-suite/ts_def`
- Find untyped wrapper locals or `any`: `rg "^[^/]*(\bany\b|let\s+[A-Za-z0-9_]+\s*=|const\s+[A-Za-z0-9_]+\s*=|var\s+[A-Za-z0-9_]+\s)" src/app/tools-suite-api -n`
- Typecheck Angular app code: `npx tsc -p src/tsconfig.app.json --noEmit`
