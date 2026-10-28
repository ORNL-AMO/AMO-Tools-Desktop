# Motor-driven beta regression checks

The Jasmine scenarios call real Desktop adapters, Psat conversion/rounding and motor-inventory calculation actions with synthetic data. The immutable old-package capture and every individually accepted field difference live beside the scenarios. Normal tests neither record nor accept snapshots.

```sh
npm test -- --watch=false --no-progress --include='src/app/tools-suite-api/motor-driven-regression-tests/*.spec.ts'
```

The test emits every raw difference as a base64 JSON `MOTOR_DRIVEN_DIFFERENCES` record, including values within tolerance. An unexplained/new change fails even when small. See [the integration evidence](../../docs/development/pump-result-desktop-integration.md) for exact versions, capture provenance and the complete difference ledger.

After a web or desktop build, verify the installed artifact in an isolated Electron renderer:

```sh
node scripts/motor-driven-regression-tests/runtime-smoke.mjs --electron
```

The check uses the real preload and `ToolsSuiteApiService`, `file:` WASM lookup, a temporary user profile, and representative pump/motor calculations. It verifies that the built WASM bytes match the installed package. Set `ELECTRON_BIN` only to select an already-installed Electron binary. The temporary renderer reports through the preload's existing allowed `ready` channel. No application database/default data is initialized.

Without `--electron`, the command prepares the same consumer under ignored `tmp/motor-driven-regression-tests/runtime-smoke/`. Serve that directory over localhost to verify browser lookup. The normal real-WASM Karma regression tests also exercise the web adapter.
