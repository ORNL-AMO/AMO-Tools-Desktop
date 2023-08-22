# AMO-Tools-Desktop
### Downloads  ![Github Releases](https://img.shields.io/github/downloads/ORNL-AMO/AMO-Tools-Desktop/latest/total.svg?label=Current%20Release)  ![Github All Releases](https://img.shields.io/github/downloads/ORNL-AMO/AMO-Tools-Desktop/total.svg?label=All%20Time&colorB=afdffe)

## Dependencies
- Node.js LTS (https://nodejs.org/en/)

## Build for Development
- To remove node modules, dist, and related package-lock: `npm run clean` from the root project directory
- To install all required packages: `npm install`
- To build for electron development with hot-reload: `npm run build-watch`
    - To start the electron app: `npm run electron`

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

