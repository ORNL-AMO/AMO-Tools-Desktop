import type { Dispatch } from '@reduxjs/toolkit';
import { Edge, Node } from '@xyflow/react';
import { calculateFlowPropagation, ComponentManageDataTabs, CustomEdgeData, ProcessFlowPart, WaterProcessComponentType } from 'process-flow-lib';
import { diagramSlice, type DiagramState } from './diagramReducer';
import { uiSlice } from './uiSlice';

/**
 * Thunks for cross-slice derived state or state-dependent calculation input - cases where a reducer
 * needs to read current store state (not just its action payload) before dispatching, e.g. deriving
 * uiSlice state from diagramSlice state, or feeding current edges into a calculation. Not for
 * dispatching multiple actions together, which needs no thunk.
 *
 * Kept in this separate file because these thunks need actions from both diagramSlice and uiSlice;
 * uiSlice.ts already imports from diagramReducer.ts, so putting them in diagramReducer.ts would
 * create a diagramReducer.ts <-> uiSlice.ts cycle.
 */

/**
 * Backs the "Set all flow values to the end of path" button (DischargeFlowForm.tsx). Reads current
 * edges from the store, runs the pure DFS split (calculateFlowPropagation, process-flow-lib), then
 * dispatches the result as a plain action.
 */
export const propagateFlowFromNode = (nodeId: string, edge: Edge<CustomEdgeData>) =>
  (dispatch: Dispatch, getState: () => { diagram: DiagramState }) => {
    const edges = getState().diagram.edges as Edge<CustomEdgeData>[];
    const flowUpdates = calculateFlowPropagation(nodeId, edge, edges);
    dispatch(diagramSlice.actions.edgesChangeFromPropagation({
      flowUpdates,
      startingNodeId: nodeId,
      initialEdgeId: edge.id,
    }));
  };

/**
 * `id` is also called with edge ids (see Diagram.tsx onEdgeClick). Edges aren't in `nodes`, so `node`
 * is undefined and `tabs` lookup fails - the `if (tabs)` guard leaves `manageDataTabs` at whatever it
 * was from the last node selection rather than clearing it.
 */
const selectComponentAndTabs = (id: string, dispatch: Dispatch, getState: () => { diagram: DiagramState }) => {
  dispatch(diagramSlice.actions.selectedIdChange(id));
  const node = getState().diagram.nodes.find((n: Node<ProcessFlowPart>) => n.id === id) as Node<ProcessFlowPart> | undefined;
  const tabs = ComponentManageDataTabs[node?.data.processComponentType as WaterProcessComponentType];
  if (tabs) {
    dispatch(uiSlice.actions.setManageDataTabs(tabs));
  }
};

/** Select a node/edge (updates `manageDataTabs`) without forcing the data drawer open. */
export const selectComponent = (id: string) => (dispatch: Dispatch, getState: () => { diagram: DiagramState }) => {
  selectComponentAndTabs(id, dispatch, getState);
};

/** Select a node/edge and force the data drawer open - the click-to-inspect entry point. */
export const openDrawerWithSelected = (id: string) => (dispatch: Dispatch, getState: () => { diagram: DiagramState }) => {
  selectComponentAndTabs(id, dispatch, getState);
  dispatch(uiSlice.actions.openDataDrawer());
};
