# About MEASUR
<!-- Badges -->
[![Build Status](https://github.com/ORNL-AMO/AMO-Tools-Desktop/actions/workflows/main.yml/badge.svg)](https://github.com/ORNL-AMO/AMO-Tools-Desktop/actions)
[![Latest Release](https://img.shields.io/github/v/release/ORNL-AMO/AMO-Tools-Desktop)](https://github.com/ORNL-AMO/AMO-Tools-Desktop/releases)
[![Issues](https://img.shields.io/github/issues/ORNL-AMO/AMO-Tools-Desktop)](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/ORNL-AMO/AMO-Tools-Desktop)](https://github.com/ORNL-AMO/MEASUR/pulls)
[![Contributors](https://img.shields.io/github/contributors/ORNL-AMO/AMO-Tools-Desktop)](https://github.com/ORNL-AMO/AMO-Tools-Desktop/graphs/contributors)
[![Last Commit](https://img.shields.io/github/last-commit/ORNL-AMO/AMO-Tools-Desktop)](https://github.com/ORNL-AMO/AMO-Tools-Desktop/commits/main)


**MEASUR (Manufacturing Energy Assessment Software for Utility Reduction)** is part of the **Oak Ridge National Laboratory (ORNL) Industrial Resources** suite. MEASUR empowers manufacturers to boost energy efficiency at both the plant and system levels. The application guides users step-by-step to identify opportunities, monitor progress, and drive continuous improvement. It also supports energy management system implementation and helps facilities prepare for ISO 50001 and Superior Energy Performance certification. MEASUR is a modern refactoring of legacy Department of Energy (DOE) tools, developed by ORNL to bring advanced energy analysis to today’s industrial environments.

MEASUR, like it's sister applications [VERIFI](https://github.com/ORNL-AMO/VERIFI) and [JUSTIFI](https://github.com/ORNL-AMO/JUSTIFI), is developed as a web application but is also packaged and distributed as an installable desktop application.
 
The latest web version of the application can be found at [https://measur.ornl.gov](https://measur.ornl.gov)

Installable versions of the application can be found under the [releases](https://github.com/ORNL-AMO/MEASUR/releases) section of this repository.

Alternatively, downloads and additional information about ORNL's suite of tools can be found at [ORNL's Industrial Resources](https://industrialresources.ornl.gov/) site.

### 📋 Project Board

Track our progress and planned work on the [MEASUR GitHub Project Board](https://github.com/orgs/ORNL-AMO/projects/9/views/10).

## MEASUR Modules 

The application has a variety of modules outlined below. 

### System & Equipment Assessment Modules
Evaluating financial and energy impacts of modifications to different energy consuming systems:

| Module                | Status              | Description                                      |
|-----------------------|---------------------|--------------------------------------------------|
| Pump                  | ✅ Available        | Assess pump system efficiency and savings        |
| Compressed Air        | ✅ Available        | Analyze compressed air systems                   |
| Process Heating       | ✅ Available        | Evaluate process heating improvements            |
| Fan                   | ✅ Available        | Assess fan system performance                    |
| Steam                 | ✅ Available        | Steam system analysis                            |
| Treasure Hunt         | ✅ Available        | Identify energy-saving opportunities             |
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
| Fans                    | ⏳ Planned          | Fan inventory management (planned)                |
| Process Cooling         | ⏳ Planned          | Process cooling inventory (planned)               |
| Hot and Cold Flows      | ⏳ Planned          | Hot/cold flow inventory (planned)                 |
| Maintenance Logs        | ⏳ Planned          | Equipment maintenance logging (planned)           |

### Additional Modules
Enhance your analysis and visualization with these supporting tools:

| Module           | Status   | Description                                      |
|------------------|----------|--------------------------------------------------|
| Data Explorer    | ✅ Available | Visualize, filter, and analyze facility data      |
| Water Diagram    | 🟡 Beta     | Interactive water system mapping and visualization |



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

### 4. Reset All Project Build Artifacts and Dependencies

This script removes `/dist`, `package-lock.json`, and `node_modules` for both `/AMO-Tools-Desktop` and `/AMO-Tools-Desktop/process-flow-diagram-component`:

```sh
npm run reset
```

---

## ℹ️ More Information

### Bundled Dependencies

#### **Process Flow Diagram Component**
MEASUR depends on this native web component built in React (using ReactFlow). The process-flow-diagram-component webpack build runs concurrently with the main project, and the component is copied into the Angular `/dist` output and referenced in the Angular project's `index.html`.

#### **Process Flow Library**
Both MEASUR and the Process Flow Diagram Component depend on `/process-flow-lib` as a shared library of types, calculations, and utility methods.



# License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.