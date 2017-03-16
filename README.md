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

Prerequisites:
  electron-builder v13.9.0+
  electron-packager v8.5.2

Open a Bash terminal (Cygwin, GitBash, etc.) and nagivate to the AMO-Tools-Desktop project directory.
Run the following command: ./node_modules/.bin/build -w (defaults to 64bit. Use the --ia32 flag to build 32bit ).
The installer will be located in ../output

## Building an installer for Windows (on Linux)

Prerequisites:
  Wine v1.8+
  Mono v4.2+
  electron-builder v15.5.1 *Must be this version to build cross-platform*
  electron-packager v8.5.2
  
Open a terminal and navigate to the AMO-Tools-Desktop project directory.
Run the following command: ./node_modules/.bin/build -w (defaults to 64bit. Use the --ia32 flag to build 32bit).
The installer will be located in ../output

## Building a tarball for Linux (on Linux)

Prerequisites:
  icnutils
  graphicsmagick
  xz-utils
  electron-builder v13.9.0+
  electron-packager v8.5.2

Open a terminal and navigate to the AMO-Tools-Desktop project directory.
Run the following command: ./node_modules/.bin/build -l (defaults to 64bit. Use the --ia32 flag to build 32bit).
The tarball will be located in ../output/

## Auto Update

Prerequisites:
  electron-updater v1.8.2
  electron-log v1.3.0
  electron-builder v13.9.0+
  electron-packager v8.5.2
  
Build the application as directed above. electron-builder will create the installer/executable AND a file named latest.yml.
Go to the AMO-Tools-Desktop releases page in GitHub.
Draft a new release. For the tag version, make sure to include a v before the version number (example: v0.0.1).
Upload BOTH the installer/executable AND the latest.yml. (the autoUpdater looks for the latest.yml in the release. If it is not present, it will not work.)
As of now, you must rename the executable/installer in the GitHub release to include dashes instead of periods.
Example:
AMO-Tools-Suite.Setup.0.0.1.exe must be changed to AMO-Tools-Suite-Setup-0.0.1.exe
GitHub changes the file name when it is uploaded.

Publish the release.
Once the older version of the application is started, it will check for an update, download it, and install it automatically.


