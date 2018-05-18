[![Waffle.io - Columns and their card count](https://badge.waffle.io/ORNL-AMO/AMO-Tools-Desktop.svg?columns=all)](http://waffle.io/ORNL-AMO/AMO-Tools-Desktop)

# AMO-Tools-Desktop

## Dependencies
- Node.js (https://nodejs.org/en/)
- Python 2.7 \(3.x.x is not supported by node-gyp\)
- A C/C++ toolchain, such as [GCC](https://gcc.gnu.org/) on Linux, [Xcode](https://developer.apple.com/xcode/) on macOS, or [Visual Studio Build Tools](http://landinghub.visualstudio.com/visual-cpp-build-tools) on Windows
- Make (https://www.gnu.org/software/make/)
- See https://github.com/nodejs/node-gyp for more information on how to satisfy the node-gyp dependencies for your specific operating system

## Build
- To install all required packages: `npm install` from the root project directory
- To build the angular project: `npm run build` \(or `npm run build-prod` for a production build)
- To start the electron app: `npm run electron`

## Package
- To do a clean install of the npm packages: `npm run clean`
- To build a package:`npm install && npm run build` and then: `npm run OS` where `OS` is either `mac`, `linux` or `windows`
- The packages will be placed in `../output`
- Example: `npm install && npm run build-prod && npm run windows` will make a production-build installer for Windows

## For Developers
- To generate a new angular module: `npm run ng g module path/to/module`
- To generate a new angular component: `npm run ng g component path/to/component`
- For more information, see [the angular docs](https://docs.angularjs.org/guide/component)
- For making small, frequent changes try using `npm run build-watch`. This type of build will watch for changes made to source files and only recompile what is necessary
