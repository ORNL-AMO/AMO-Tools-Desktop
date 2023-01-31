# AMO-Tools-Desktop
### Downloads  ![Github Releases](https://img.shields.io/github/downloads/ORNL-AMO/AMO-Tools-Desktop/latest/total.svg?label=Current%20Release)  ![Github All Releases](https://img.shields.io/github/downloads/ORNL-AMO/AMO-Tools-Desktop/total.svg?label=All%20Time&colorB=afdffe)

## Dependencies
- Node.js (https://nodejs.org/en/)
- Python 2.7 \(3.x.x is not supported by node-gyp\)
- A C/C++ toolchain, such as [GCC](https://gcc.gnu.org/) on Linux, [Xcode](https://developer.apple.com/xcode/) on macOS, or [Visual Studio Build Tools](https://www.visualstudio.com/downloads/#build-tools-for-visual-studio-2017) on Windows
- Make (https://www.gnu.org/software/make/)
- See https://github.com/nodejs/node-gyp for a detailed guide on how to satisfy the node-gyp dependencies for your specific operating system.

## Build
- To remove all project-related node modules: `npm run clean` from the root project directory
- To install all required packages: `npm install`
- To build the angular project: `npm run build` \(or `npm run ng-high-memory` for a production build)
- To start the electron app: `npm run electron`

## Package
- To build a package:`npm install && npm run ng-high-memory` and then: `npm run dist`
- The packages will be placed in `../output`
- Example: `npm install && npm run ng-high-memory && npm run dist` will make a production-build installer for Windows

## For Developers
- To generate a new angular module: `npm run ng g module path/to/module`
- To generate a new angular component: `npm run ng g component path/to/component`
- For more information, see [the Angular docs](https://docs.angularjs.org/guide/component)
- For making small, frequent changes try using `npm run build-watch`. This type of build will watch for changes made to source files and only recompile what is necessary
- To retrieve download counts for each of MEASUR's releases: `npm run download-stats`
