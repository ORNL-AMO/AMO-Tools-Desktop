# AMOToolsDesktop

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.26.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Electron

After running `npm run build`, run `npm run electron` and an electron app will be served up.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Deploying to GitHub Pages

Run `ng github-pages:deploy` to deploy to GitHub Pages.

## Further help

To get more help on the `angular-cli` use `ng help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Building an installer for Windows (on Windows)

Open Cygwin and nagivate to the AMO-Tools-Desktop root directory.
Run the following command: ./node_modules/.bin/build -w --x64 (or --ia32 depending on the architecture you want to build for).
The installer will be located in ../AMO-Tools-Desktop/output/win.

## Building a tarball for Linux (on Linux)

Navigate to the AMO-Tools-Desktop root directory.
Run the following command: ./node_modules/.bin/build -l --x64 (or --ia32 depending on the architecture you want to build for).
The tarball will be located in ../output/
