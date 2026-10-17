import type { UnknownAction } from '@reduxjs/toolkit';
import { diagramInitialized, diagramReady, edgesChange, nodesChange, type DiagramState } from './diagramReducer';

export const DIAGRAM_SAVE_DEBOUNCE_MS = 100;

// * fields that end up in the emitted FlowDiagramData
const PERSISTED_KEYS: (keyof DiagramState)[] = [
  'name', 'meta', 'nodes', 'edges', 'settings', 'diagramOptions', 'calculatedData',
  'diagramFlowErrors', 'recentNodeColors', 'recentEdgeColors', 'diagramNotes',
];

/**
 * Pointer-frequency or view-only changes: selection, measured size, and node position while still dragging
 * (the drag-end change has dragging: false and is persisted).
 */
const isTransientChange = (action: UnknownAction): boolean => {
  if (nodesChange.match(action)) {
    return action.payload.every((change) => change.type === 'select' || change.type === 'dimensions'
      || (change.type === 'position' && change.dragging === true));
  }
  if (edgesChange.match(action)) {
    return action.payload.every((change) => change.type === 'select');
  }
  return false;
};

/**
 * Whether an action left something worth saving. Hydration and the ready flag are excluded so opening a
 * diagram never rewrites it, except when the load upgraded an older diagram (upgradeDiagram appends to
 * meta.upgrades on every load until the upgraded copy is saved).
 */
export const isPersistableChange = (action: UnknownAction, currentState: unknown, previousState: unknown, loadedVersion: string): boolean => {
  const current = (currentState as { diagram: DiagramState }).diagram;
  const previous = (previousState as { diagram: DiagramState }).diagram;
  // * diagramReady repeats the upgrade check because the save thunk skips emits until it fires
  if (diagramInitialized.match(action) || diagramReady.match(action)) {
    return current.meta.version !== loadedVersion;
  }
  if (isTransientChange(action)) {
    return false;
  }
  return PERSISTED_KEYS.some((key) => current[key] !== previous[key]);
};
