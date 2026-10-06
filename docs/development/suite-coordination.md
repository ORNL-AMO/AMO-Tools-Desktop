# MEASUR-Tools-Suite Coordination

Use this workflow only when Desktop work changes or depends on a Suite API, calculation behavior, Suite-backed default data, declarations, dependency version, or WASM packaging, or when the work coordinates linked Suite/Desktop issues, pull requests, or releases.

This local workflow is authoritative for Desktop work and can be followed without accessing the Suite repository.

## Coordination Record

- Use the Desktop issue as the authoritative product and coordination record.
- Link the Suite issue, Suite pull request, and Desktop pull request.
- Classify the change as additive API, breaking API, behavioral, default data, declaration-only, or packaging.
- Record explicit approval for breaking or behavioral changes.
- Record the exact Suite beta and final package versions tested.
- Keep detailed issue history in the Desktop issue rather than duplicating it in repository handoffs.

Use `.github/ISSUE_TEMPLATE/suite-integration.md` to open coordinated work and complete the MEASUR-Tools-Suite section of `.github/pull_request_template.md` for the Desktop pull request.

## Runtime Contract

Record the old and new contract before changing Desktop consumers:

- exported class, method, enum, or data shape,
- Embind binding kind,
- constructor and method signatures,
- units, percentage conventions, nullability, and defaults,
- vector and returned-object ownership and cleanup,
- compatibility or migration decision.

Use the installed declarations in `node_modules/measur-tools-suite/ts_def/` as the contract available to Desktop. If runtime behavior and declarations disagree, document the discrepancy and coordinate the Suite fix.

## Desktop Impact

Trace the change through every affected surface:

- wrappers and helpers in `src/app/tools-suite-api/`,
- enum, unit, percentage, nullable, and vector conversions,
- input forms, app-facing models, and saved assessment data,
- result displays, reports, and exports,
- Suite-backed default database initialization and reset behavior,
- the process-flow package,
- web and Electron WASM loading and packaging.

Keep Suite calls behind `src/app/tools-suite-api/`. Do not expose Suite-owned objects to Angular feature or UI code.

## Package Validation

1. Test the exact Suite beta version produced by the ready Suite pull request.
2. Keep the root and process-flow `measur-tools-suite` dependency pins aligned unless an intentional compatibility bridge is documented.
3. Run the narrowest typecheck, unit, integration, and assessment-regression coverage that exercises the changed contract or calculation behavior.
4. Verify web and Electron loading when WASM filenames, paths, packaging, or `locateFile` behavior changes.
5. Replace the beta with the approved final version and record that version in the Desktop issue and pull request.

## Data Safety

Do not include customer data, sensitive assessment inputs, credentials, or private operational details in public GitHub work or regression fixtures.

## Optional Suite-Side Reference

Maintainers actively coordinating the Suite issue, Suite pull request, or release may also consult the [Suite-to-Desktop change workflow](https://github.com/ORNL-AMO/MEASUR-Tools-Suite/blob/develop/docs/development/suite-desktop-change-workflow.md) for Suite-side details. Do not access this external reference for ordinary Desktop work.
