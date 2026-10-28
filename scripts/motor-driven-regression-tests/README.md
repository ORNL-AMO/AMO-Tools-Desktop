# Motor-driven beta regression checks

The Jasmine scenarios call real Desktop adapters, Psat conversion/rounding and motor-inventory calculation actions with synthetic data. The immutable old-package capture and every individually accepted field difference live beside the scenarios. Normal tests neither record nor accept snapshots.

```sh
npm test -- --watch=false --no-progress --include='src/app/tools-suite-api/motor-driven-regression-tests/*.spec.ts'
```

The test emits every raw difference as a base64 JSON `MOTOR_DRIVEN_DIFFERENCES` record, including values within tolerance. An unexplained/new change fails even when small. See [the integration evidence](../../docs/development/pump-result-desktop-integration.md) for exact versions, capture provenance and the complete difference ledger.

After the web build, prepare a standalone browser consumer of the actual Desktop adapters:

```sh
node scripts/motor-driven-regression-tests/runtime-smoke.mjs
```

The command checks that the built WASM bytes match the installed package and prepares the consumer under ignored `tmp/motor-driven-regression-tests/runtime-smoke/`. Serve that directory over localhost to check the browser lookup. The normal real-WASM Karma regression tests also exercise the web adapter. No application database/default data is initialized.

Electron-specific coverage is outside this calculation-adapter change; no Electron implementation or asset-path change is included.
