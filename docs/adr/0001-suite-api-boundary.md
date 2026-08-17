# ADR 0001: Keep MEASUR-Tools-Suite Calls Behind Suite API Services

## Status

Accepted.

## Context

AMO-Tools-Desktop uses `measur-tools-suite` as its calculation backend. The suite is a WebAssembly module generated from C++ and exposes Emscripten classes, vectors, enums, and output objects. Direct suite usage from UI code makes upgrades harder because suite constructor signatures, enum values, memory-management rules, and output fields can change independently of Angular feature code.

The app already has a suite adapter layer under `src/app/tools-suite-api/`.

## Decision

New Angular code must call MEASUR-Tools-Suite through services under `src/app/tools-suite-api/`. Angular components, feature services, reducers, and shared UI utilities should not directly import `measur-tools-suite`, instantiate `ToolsSuiteModule` classes, or call raw suite calculation methods.

Known legacy exceptions can be addressed opportunistically. Do not copy them into new code.

## Consequences

Benefits:

- Suite upgrades are localized to adapter services.
- UI models can remain stable even when suite declarations change.
- Unit, enum, nullable-input, and percentage conversions are auditable.
- Emscripten object cleanup is concentrated near object creation.
- Tests and typechecks can target a known boundary.

Costs:

- New calculations require wrapper methods even when the suite API already has a direct method.
- Some wrapper code is intentionally explicit and repetitive.
- Type declarations may need suite-side fixes before AMO-side adapters can be cleanly typed.

## Related Documentation

- `AGENTS.md`
- `ARCHITECTURE.md`
- `docs/architecture/measur-tools-suite-integration.md`
- `src/app/tools-suite-api/AGENTS.md`
