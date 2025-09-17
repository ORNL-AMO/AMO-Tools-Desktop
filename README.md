# MEASUR
### Downloads  ![Github Releases](https://img.shields.io/github/downloads/ORNL-AMO/AMO-Tools-Desktop/latest/total.svg?label=Current%20Release)  ![Github All Releases](https://img.shields.io/github/downloads/ORNL-AMO/AMO-Tools-Desktop/total.svg?label=All%20Time&colorB=afdffe)

MEASUR (Manufacturing Energy Assessment Software for Utility Reduction) helps manufacturers increase industrial energy efficiency at the plant-level and in specific systems. Learn step-by-step ways to identify opportunities, monitor progress, and improve efficiency in any facility. Some tools help facilities implement an energy management system and prepare to become ISO 50001 and Superior Energy Performance certified. Based on older Department of Energy (DOE) tools, the Advanced Manufacturing Office (AMO) has undertaken this effort to refactor the legacy tools into a modern environment.
The suite includes 7 energy system assessment modules, a Data Exploration Module, extensive help text, comprehensive reports, data visualization, and 80 calculators!

## Dependencies
- Node.js LTS (https://nodejs.org/en/)

## Bundled Dependencies
The repo includes two dependencies which are not part of the core Angular project.

#### Process Flow Diagram Component 
MEASUR depends on this native web component built in React to leverage the ReactFlow library. The process-flow-diagram-component webpack build runs concurrently from commands executed for the main project. The component is copied into the Angular project /dist output and referenced in the Angular project index.html.

#### Process Flow Library
Both MEASUR and the Process Flow Diagram Component depend on `/process-flow-lib` as a shared library of types, calculations, and utility methods.

## Install All Repo Node Dependencies
`npm run install-packages`

#### Alternative Method
Change directory to `/process-flow-diagram-component`
- Install process-flow-diagram-component dependencies: `npm install`
Change directory to `/AMO-Tools-Desktop`
- Install Angular project dependencies: `npm install`

## Build for Development
- Serve the web build: `npm run start`
- Build for electron development with hot-reload: `npm run build-watch`
    - To start the electron app: `npm run electron`

## Build for Production
- Build the desktop installer:
    - `npm run build-prod-desktop` 
    - `npm run dist`
    - The package will be placed in `output`
- Build the web dist:
    - `npm run build-prod-web` 

## Reset All Project Build Artifacts and Dependencies
`npm run reset`


