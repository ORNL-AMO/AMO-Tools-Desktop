# Build and Runtime

## Runtime Targets

AMO-Tools-Desktop runs in two main environments:

- Web: Angular application served or built for browser deployment.
- Desktop: Angular application packaged in Electron with `main.js` and `preload.js`.

Runtime-sensitive changes should be checked in the target they affect. File paths, WebAssembly loading, backups, and Electron APIs often behave differently between browser and desktop.

## Root App Build

The root `package.json` scripts coordinate the Angular build and the process-flow component bundle. Important scripts include:

- `npm run start`: builds the process-flow component in watch mode and serves Angular.
- `npm run build`: builds the process-flow bundle and Angular app.
- `npm run build-prod-web`: production web build.
- `npm run build-prod-desktop`: production desktop-oriented build.
- `npm run electron`: starts Electron against the built/served app context expected by the current workflow.

Check `package.json` before relying on script behavior; these commands are part of the architecture but may evolve.

## Process-Flow Component Build

`process-flow-diagram-component/` is a separate React package. It has its own `package.json`, test scripts, and webpack configs. The root app builds it through webpack configuration under that package.

Keep dependency updates aligned between the root package and this package, especially `measur-tools-suite`.

## WebAssembly Loading

`measur-tools-suite` ships WebAssembly artifacts under `node_modules/measur-tools-suite/bin/`. `angular.json` copies those assets into the app build, and `ToolsSuiteApiService.initializeModule()` configures `locateFile`.

When suite packaging changes, check:

- `angular.json` asset configuration,
- suite `bin` artifact names,
- Electron and browser path resolution,
- process-flow suite initialization if it uses the same package version.

## Verification Choices

Choose verification based on the blast radius:

- Type-only Angular wrapper changes: `npx tsc -p src/tsconfig.app.json --noEmit`
- Root Angular/Electron bundle concerns: `npm run build`
- Angular behavior: `npm test`
- Process-flow changes: run package scripts inside `process-flow-diagram-component/`
- Electron-specific behavior: run or package Electron and verify desktop paths/features directly.

Do not assume a web build proves Electron behavior when the change touches file paths, preload/main process code, backups, or WASM asset resolution.
