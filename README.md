# About MEASUR
<!-- Badges -->
[![Build Status](https://github.com/ORNL-AMO/AMO-Tools-Desktop/actions/workflows/main.yml/badge.svg)](https://github.com/ORNL-AMO/AMO-Tools-Desktop/actions)
[![Latest Release](https://img.shields.io/github/v/release/ORNL-AMO/AMO-Tools-Desktop)](https://github.com/ORNL-AMO/AMO-Tools-Desktop/releases)
[![Issues](https://img.shields.io/github/issues/ORNL-AMO/AMO-Tools-Desktop)](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/ORNL-AMO/AMO-Tools-Desktop)](https://github.com/ORNL-AMO/MEASUR/pulls)
[![Contributors](https://img.shields.io/github/contributors/ORNL-AMO/AMO-Tools-Desktop)](https://github.com/ORNL-AMO/AMO-Tools-Desktop/graphs/contributors)
[![Last Commit](https://img.shields.io/github/last-commit/ORNL-AMO/AMO-Tools-Desktop)](https://github.com/ORNL-AMO/AMO-Tools-Desktop/commits/main)


**MEASUR (Manufacturing Energy Assessment Software for Utility Reduction)** is part of the **Oak Ridge National Laboratory (ORNL) Industrial Resources** suite. MEASUR empowers manufacturers to boost energy efficiency at both the plant and system levels. The application guides users step-by-step to identify opportunities, monitor progress, and drive continuous improvement. It also supports energy management system implementation and helps facilities prepare for ISO 50001 and Superior Energy Performance certification. MEASUR is a modern refactoring of legacy Department of Energy (DOE) tools, developed by ORNL to bring advanced energy analysis to today’s industrial environments.

MEASUR, like it's sibling applications [VERIFI](https://github.com/ORNL-AMO/VERIFI) and [JUSTIFI](https://github.com/ORNL-AMO/JUSTIFI), is developed as a web application but is also packaged and distributed as an installable desktop application.
 
The latest web version of the application can be found at [https://measur.ornl.gov](https://measur.ornl.gov)

Installable versions of the application can be found under the [releases](https://github.com/ORNL-AMO/MEASUR/releases) section of this repository.

Alternatively, downloads and additional information about ORNL's suite of tools can be found at [ORNL's Industrial Resources](https://industrialresources.ornl.gov/) site.

### 📋 Project Board

Track our progress and planned work on the [MEASUR GitHub Project Board](https://github.com/orgs/ORNL-AMO/projects/9/views/10).

### MEASUR Tools Suite

MEASUR calculations are powered by the [MEASUR-Tools-Suite](https://github.com/ORNL-AMO/MEASUR-Tools-Suite). A C++ library with a WebAssembly compilation target.

## MEASUR Modules 

The application has a variety of modules outlined below. 

### System & Equipment Assessment Modules
Evaluating financial and energy impacts of modifications to different energy consuming systems:

| Module                | Status              | Description                                      |
|-----------------------|---------------------|--------------------------------------------------|
| Pump                  | ✅ Available        | Assess pump system efficiency and savings        |
| Compressed Air        | ✅ Available        | Analyze compressed air systems                   |
| Process Heating       | ✅ Available        | Evaluate process heating improvements            |
| Fan                   | ✅ Available        | Assess fan system efficiency and savings         |
| Steam                 | ✅ Available        | Steam system analysis                            |
| Treasure Hunt         | ✅ Available        | Identify low-cost/no-cost energy-saving opportunities             |
| Wastewater            | ✅ Available        | Wastewater system assessment                     |
| Water                 | 🟡 Beta             | Water system analysis                            |
| Process Cooling       | 🛠️ In Development  | Process cooling system assessment                |

### Equipment Inventories Modules
Track facility equipment and populate assessment modules via equipment inventories:

| Inventory Module         | Status               | Description                                      |
|-------------------------|----------------------|--------------------------------------------------|
| Motor                   | ✅ Available         | Track and manage motor inventory                  |
| Pump                    | ✅ Available         | Track and manage pump inventory                   |
| Compressed Air          | ✅ Available         | Track and manage compressed air equipment         |
| Fans                    | ⏳ Planned          | Fan inventory management               |
| Process Cooling         | ⏳ Planned          | Process cooling inventory               |
| Hot and Cold Flows      | ⏳ Planned          | Hot/cold flow inventory                |
| Maintenance Logs        | ⏳ Planned          | Equipment maintenance logging          |

### Additional Modules
Enhance your analysis and visualization with these supporting tools:

| Module           | Status   | Description                                      |
|------------------|----------|--------------------------------------------------|
| Data Explorer    | ✅ Available | Visualize, categorize, and analyze logger data      |
| Water Diagram    | 🟡 Beta     | Interactive water system mapping and visualization |


### 🧮 Standalone Calculators

MEASUR includes a comprehensive suite of over 80 standalone equipment calculators for energy analysis, system optimization, and cost savings.  
See the full categorized list with descriptions and links in [docs/calculator_list.md](docs/calculator_list.md).


## For Developers

### 🛠️ Dependencies
- [Node.js LTS](https://nodejs.org/en/)  
  _The MEASUR team recommends managing Node versions using [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm)._
  _The recommended Node.js version is specified in the project's `package.json` under the `engines` field._

---

## 🚀 Install and Run the Project

### 1. Install Node Dependencies for All Modules

> **Note:** Both `/AMO-Tools-Desktop` and `/AMO-Tools-Desktop/process-flow-diagram-component` must have their dependencies installed for a successful build.

**Quick Install (recommended):**
```sh
npm run install-packages
```

**Manual Install:**
```sh
# Install process-flow-diagram-component dependencies
cd /AMO-Tools-Desktop/process-flow-diagram-component
npm install

# Install Angular project dependencies
cd /AMO-Tools-Desktop
npm install
```

---

### 2. Build for Development

> **Note:** It is recommended to develop using the web build (`npm run start`) unless you are specifically working on Electron-only features. This provides faster reloads and a smoother development experience.

- **Serve the web build:**
  ```sh
  npm run start
  ```

  > Some dev-server warnings may appear on startup — see [Known Issues](#known-issues).

- **Build for Electron development with hot-reload:**
  ```sh
  npm run build-watch
  ```
  - To start the Electron app:  
    ```sh
    npm run electron
    ```

---

### 3. Build for Production

- **Build the desktop installer:**
  ```sh
  npm run build-prod-desktop
  npm run dist
  ```
  _The package will be placed in the `output` directory._

- **Build the web distribution:**
  ```sh
  npm run build-prod-web
  ```

---



## ℹ️ Workflow Specifics

### Reset All Project Build Artifacts and Dependencies

This script removes `/dist`, `package-lock.json`, and `node_modules` for both `/AMO-Tools-Desktop` and `/AMO-Tools-Desktop/process-flow-diagram-component`:

```sh
npm run reset
```
---
### Upgrade MEASUR-Tools-Suite

MEASUR-Tools-Suite available versions are published to the npm registry [measur-tools-suite npm](https://www.npmjs.com/package/measur-tools-suite?activeTab=versions)

> **IMPORTANT:** Both `/AMO-Tools-Desktop` and `/AMO-Tools-Desktop/process-flow-diagram-component` MEASUR-Tools-Suite versions must match to avoid API version conflicts

To upgrade the MEASUR-Tools-Suite dependency:
- **Specify Version:**  
modify the package.json file in both `/AMO-Tools-Desktop` and `/AMO-Tools-Desktop/process-flow-diagram-component` with the desired version.
- **Reset, Install, and Run:**  
Follow steps above to *Reset All Project Build Artifacts and Dependencies*, then follow steps for *Install and Run the Project*


---

## ℹ️ More Information

### Bundled Dependencies

#### **Process Flow Diagram Component**
MEASUR depends on this native web component built in React (using ReactFlow). The process-flow-diagram-component webpack build runs concurrently with the main project, and the component is copied into the Angular `/dist` output and referenced in the Angular project's `index.html`.

#### **Process Flow Library**
Both MEASUR and the Process Flow Diagram Component depend on `/process-flow-lib` as a shared library of types, calculations, and utility methods.

---

### Known Issues

#### Dev-server warnings on `npm run start`

The following warnings appear at startup when running `npm run start` and can be safely ignored:

- **Terminal:** `[vite] (client) Pre-transform error: Failed to load url /assets/process-flow-diagram-component.js. Does the file exist?`
- **Browser console:** `Unable to add filesystem: <illegal path>`

**Cause:** Angular 17+ replaced the legacy webpack-based dev server with a Vite-based one. Vite crawls `index.html` at startup and eagerly tries to resolve all `<script type="module">` entries before Angular's asset middleware is ready to serve them. The `process-flow-diagram-component.js` bundle — built separately by webpack and served as a static asset — is not part of Vite's module graph, so Vite cannot pre-transform it.

These warnings are dev-server artifacts only. App functionality, hot-reload, and all production builds (`build-prod-web`, `build-prod-desktop`) are unaffected. A proper fix is being investigated.

#### Electron development not supported on WSL

Running or building the Electron app from within WSL is not supported. WSL presents itself as Linux to Electron, but lacks the display server required to launch a native window. Attempting to run `npm run electron` or `npm run build-prod-desktop` from a WSL terminal will fail.

**Workaround:** Run Electron-related scripts from a native Windows terminal (PowerShell or CMD) where the project is accessible via the `\\wsl$\` UNC path, or develop using the web build (`npm run start`) which has no such limitation.

See the [Electron Forge guide on developing with WSL](https://www.electronforge.io/guides/developing-with-wsl) for further details.

---

# License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.