# Process Flow Diagram Web Component

Currently supports water diagram flows

## Build Standalone for Development
- cd into `process-flow-diagram-component`
- `npm install`
- `npm run dev` or `npm run build-standalone`

## Build Production Package
- `npm run build-web-component`


## Developing
Ensure React components import Node, Edge types from xyflow or Typescript will automatically check against native DOM Node interface

### Terminology

Though naming and implementation was intended to be consistent, the following words are sometimes used interchangably:

- 'Diagram' vs. 'Flow' - Highest level component, state, types
- 'Node' vs 'Component' - Diagram entities, ex. water discharge, water system parts, intake sources, etc.
- 'Edge' vs 'Connection' - Diagram connections between nodes.

#### Known Issues and Gotchas
- When process-flow-diagram-component is rendered as a child/module, there have been occasional issues accessing DOM nodes and rendering MUI components that utilize backdrop/portal (Modal, Dialog, Popover). Accessing the 'shadowRoot' ref (AppWebComponent.tsx) in place of document or root node has been found to remedy these issues. 
- The IDE/Typescript language server will sometimes mistakenly import Redux/RTK exports from '/src/hooks/state'. Build will compile successfully but throw an ambiguous error on run. Use the relative file path instead