# AMO-Tools-Desktop
### Downloads  ![Github Releases](https://img.shields.io/github/downloads/ORNL-AMO/AMO-Tools-Desktop/latest/total.svg?label=Current%20Release)  ![Github All Releases](https://img.shields.io/github/downloads/ORNL-AMO/AMO-Tools-Desktop/total.svg?label=All%20Time&colorB=afdffe)

## Dependencies
- Node.js LTS (https://nodejs.org/en/)
    - Due to legacy dependencies required by MEASUR and the dependent AMO-Tool-Suite, **MEASUR's targeted Node version must be used**. This version can be found in package.json "engines".

## Build for Development
- To remove node modules, dist, and related package-lock: `npm run clean` from the root project directory.
- To install all required packages: `npm install`
- To build for electron development with hot-reload: `npm run build-watch`
    - To start the electron app: `npm run electron`

    #### Build with Process Flow Diagram microfrontend
    This project includes a "microfrontend" web component which wraps React/ReactFlow so MEASUR can leverage it's diagramming library.
    - All build scripts execute a pre-angular webpack build for the microfrontend, copying the web component script into the project /dist output. The microfrontend build is NOT updated for build-watch.
    - Develop web server with MFE:
        - `npm run start-concurrent-watch`
    - Develop electron build with MFE:
        - `npm run build-concurrent-watch`
    - Standalone build or re-build of the MFE:
        - `npm run build-mfe`
        - If rebuilding, manually copy process-flow-diagram-component/dist files from mfe into AMO-Tools-Desktop/dist

## Build Production Package
- Clean and install:
    - `npm run clean`
    - `npm install`
- To build desktop package:
    - `npm run build-prod-desktop` 
    - `npm run dist`
    - The package will be placed in `../output`
- To build web dist:
    - `npm run build-prod-web` 

