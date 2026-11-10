# Motor-driven regression tests

The Jasmine scenarios call real Desktop adapters, Psat conversion/rounding and motor-inventory calculation actions with synthetic data. The immutable old-package capture and every individually accepted field difference live beside the scenarios. Normal tests neither record nor accept snapshots.

```sh
npm test -- --watch=false --no-progress --include='src/app/tools-suite-api/motor-driven-regression-tests/*.spec.ts'
```

The test emits every raw difference as a base64 JSON `MOTOR_DRIVEN_DIFFERENCES` record, including values within tolerance. An unexplained/new change fails even when small. See [the archived integration evidence](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/8957#issuecomment-6778693146) for versions, capture provenance and the complete difference ledger.
