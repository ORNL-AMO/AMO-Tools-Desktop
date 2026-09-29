# Agent Notes: Process Flow Diagram Component

This package is a separate React component package used by AMO-Tools-Desktop. It has its own `package.json`, test scripts, and webpack configuration, but it is built and consumed by the root app.

## Local Context

- Source: `process-flow-diagram-component/src/`
- Suite initialization hook: `process-flow-diagram-component/src/hooks/useMeasurToolsSuite.tsx`
- Package metadata: `process-flow-diagram-component/package.json`
- Root integration build configs: webpack configs under this package and root scripts in `package.json`

## Suite Dependency

Keep this package's `measur-tools-suite` dependency aligned with the root `package.json`. If a suite version changes, update both places and verify both the root app and this package.

The process-flow component may initialize the suite directly because it is a separate package boundary. Do not treat that as a pattern for Angular feature code under `src/app/`; Angular code should use `src/app/tools-suite-api/`.

## Working Guidance

- Prefer local React/package conventions when editing this package.
- Keep exported API behavior compatible with the root Angular app unless the root integration is updated at the same time.
- For suite typing changes, use the installed `measur-tools-suite` declarations and keep local casts narrow.
- Check root integration when changing bundle output, public exports, or suite initialization behavior.

## Useful Commands

Run these from `process-flow-diagram-component/`:

- Tests: `npm run test`
- Typecheck: `npm run test:typecheck`
- Lint: `npm run lint`
- Build: `npm run build`

For full app integration, run the appropriate root build or start command from the repository root.
