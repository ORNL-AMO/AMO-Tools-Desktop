# Process Flow Diagram Web Component

Currently supports water diagram flows

## Build Standalone for Development
- cd into `process-flow-diagram-component`
- `npm install`
- `npm run dev` or `npm run build-standalone`

## Build Production Package
- `npm run build-web-component`

## Terminology

Though naming and implementation was intended to be consistent, the following words are sometimes used interchangably:

- 'Diagram' vs. 'Flow' - Highest level component, state, types
- 'Node' vs 'Component' - Diagram entities, ex. water discharge, water system parts, intake sources, etc.
- 'Edge' vs 'Connection' - Diagram connections between nodes.
