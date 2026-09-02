import type { Dispatch } from '@reduxjs/toolkit';
import { Edge, Node } from '@xyflow/react';
import { calculateFlowPropagation, ComponentManageDataTabs, CustomEdgeData, ProcessFlowPart, WaterProcessComponentType } from 'process-flow-lib';
import { diagramSlice, type DiagramState } from './diagramReducer';
import { uiSlice } from './uiSlice';

/**
 * Thunks that read current store state before dispatching a plain action. Kept separate from
 * diagramReducer.ts/flowCalculationReducers.ts/uiSlice.ts so those slice files can be imported here
 * without a circular import.
 */

/**
 * "Set all flow values to end of path" - reads current edges from the store, runs the pure DFS
 * split (calculateFlowPropagation, process-flow-lib), then dispatches the result as a plain action.
 * A plain thunk, not createAsyncThunk, since this is synchronous, in-store-state work, not an async
 * operation - matches RTK's own guidance on when each is appropriate.
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
 * A thunk because `manageDataTabs` (ui slice) is derived from the selected node's
 * `processComponentType` (diagram slice) - a plain reducer can't read across slices. Both actions
 * dispatch synchronously so selection and tabs update in the same render.
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
