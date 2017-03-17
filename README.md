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

## Building for Windows
*electron-builder makes one installer that will install either x64 or ia32 as appropriate*  

On Windows:  

Prerequisites:  
  electron-builder v13.9.0+  
  electron-packager v8.5.2  

Run `npm run windows` to build the installer in x64 and ia32.   
Installer will be in ../output  
latest.yml will be in ../output  



On Linux:  

Prerequisites:  
  Wine v1.8+  
  Mono v4.2+  
  gcc-multilib - for building cross architecture  
  g++-multilib - for building cross architecture  
  electron-builder v15.5.1 *Must be this version to build cross-platform on Linux*  
  electron-packager v8.5.2  
  
Run `npm run windows` to build tehe installer in x64 and ia32.  
Installer will be in ../output  
latest.yml will be in ../output  

## Building for Linux

On Linux:  

Prerequisites:  
  icnutils  
  graphicsmagick  
  xz-utils  
  rpm  
  apt  
  electron-builder v13.9.0+  
  electron-packager v8.5.2  

Run `npm run linux` to build a tar.gz, .deb, and .rpm in x64 and ia32.  
Packages will be in ../output  



On Mac:  

Prerequisites:  
  gnu-tar  
  graphicsmagick  
  xz  
  rpm  
  electron-builder v13.9.0+  
  electron-packager v8.5.2  
  
Run `npm run linux` to build a tar.gz, .deb, and .rpm in x64 and ia32.  
Packages will be in ../output  


## Building for Mac
*Can only be done on Mac due to signing issues*  

Prerequisites:  
  electron-builder v13.9.0+  
  electron-packager v8.5.2  
  An Apple Developer account and correct code signing certificate  
  
Run `npm run mac` to build a .zip and .dmg in x64 and ia32.  
Packages will be in ../output/mac  
latest-mac.json will be in ../output/github  

*The code will be signed with a certificate from your keychain automatically as long as it is appropriate and valid*  
  
## Builing for all platforms at once
*Only Mac can build all platforms at once*  

Prerequisites as stated above  

Run `npm run build-all` to build for all platforms  
Packages will be in ../output  

## Auto Update

Prerequisites:  
  electron-updater v1.8.2  
  electron-log v1.3.0  
  electron-builder v13.9.0+  
  electron-packager v8.5.2  
  
Build the application as directed above. electron-builder will create the installer/executable AND a file named latest.yml or latest-mac.json (when building Mac packages).  
Go to the AMO-Tools-Desktop releases page in GitHub.  
Draft a new release. For the tag version, make sure to include a `v` before the version number (example: v0.0.1).  
Upload BOTH the installer/executable AND the latest.yml and latest-mac.json. (the autoUpdater looks for the latest.yml and latest-mac.json in the release. If they is not present, it will not work.)  
Publish the release.  
Once the older version of the application is started, it will check for an update, download it, and install it automatically.  
