import { configureStore, createListenerMiddleware, createSelector, isAnyOf } from '@reduxjs/toolkit'
import diagramReducer, { addNode, diagramSlice, DiagramActionType, recomputeNodeErrors, RECOMPUTES_DIAGRAM_ERRORS, saveDiagramState } from './diagramReducer'
import { Edge, getConnectedEdges, Node } from '@xyflow/react';
import { getEdgeSourceAndTarget, getNodeSourceEdges, getNodeTargetEdges, getNodeTotalFlow } from './FlowUtils';
import { createGraphIndex, CustomEdgeData, DiagramCalculatedData, getWaterUsingSystem, NodeFlowData, ProcessFlowPart, WaterDiagram, WaterProcessComponent } from 'process-flow-lib';

/**
 * Builds the `isAnyOf` matcher for the "recompute diagram errors" listener below,
 * from the `true` entries in `RECOMPUTES_DIAGRAM_ERRORS` — so the matcher can never
 * drift out of sync with that map.
 *
 * This has to be a function called lazily on first use, not a plain module-level
 * constant. `store.ts` and `diagramReducer.ts` import from each other indirectly
 * (through component files each also imports), forming a circular import. If this
 * matcher were built at module-load time, `diagramSlice.actions` could still be
 * `undefined` depending on which module finishes loading first. Calling this function
 * later, after everything has finished loading, sidesteps that ordering problem.
 */
let structuralDiagramActionMatcherCache: ReturnType<typeof isAnyOf> | undefined;
export function getStructuralDiagramActionMatcher() {
  if (!structuralDiagramActionMatcherCache) {
    const structuralActions = Object.entries(RECOMPUTES_DIAGRAM_ERRORS)
      .filter(([, isStructural]) => isStructural)
      .map(([actionName]) => diagramSlice.actions[actionName as DiagramActionType]);
    structuralDiagramActionMatcherCache = isAnyOf(...structuralActions);
  }
  return structuralDiagramActionMatcherCache;
}

export function configureAppStore(waterDiagram: WaterDiagram) {
  const store = configureStore({
    reducer: { diagram: diagramReducer },
    preloadedState: {
      // diagram: getResetData(),
      diagram: {
        name: waterDiagram.flowDiagramData.name,
        nodes: [],
        edges: [],
        composedNodeData: [],
        settings: {},
        diagramOptions: {},
        isDataDrawerOpen: false,
        selectedDataId: undefined,
        focusedEdgeId: undefined,
        calculatedData: {nodes: {}},
        diagramFlowErrors: {},
        recentEdgeColors: [],
        recentNodeColors: [],
        diagramParentDimensions: {
          height: undefined,
          headerHeight: undefined,
          footerHeight: undefined
        },
        isDialogOpen: false,
        assessmentId: undefined,
        validationWindowLocation: 'diagram',
        isModalOpen: false,
        diagramAlert: {
          open: false,
        },
        diagramNotes: waterDiagram.flowDiagramData.diagramNotes
      }
    },
    middleware: (getDefaultMiddleware) => {
      // todo this listener prototyped, not wired up
      const listenerMiddleware = createListenerMiddleware();
      listenerMiddleware.startListening({
        matcher: isAnyOf(addNode),
        effect: async (_, { dispatch }) => {
          dispatch(saveDiagramState());
        },
      });

      listenerMiddleware.startListening({
        matcher: getStructuralDiagramActionMatcher(),
        effect: async (_, listenerApi) => {
          listenerApi.cancelActiveListeners();
          await listenerApi.delay(150);
          listenerApi.dispatch(recomputeNodeErrors());
        },
      });

      return getDefaultMiddleware().prepend(listenerMiddleware.middleware);
    },
  });

  return store;
}

// // todo 7364 - migrate save event to thunk
// // which reducer/events should dispatch?
// const listenerMiddleware = createListenerMiddleware();
// listenerMiddleware.startListening({
//   matcher: isAnyOf(addNode),
//   effect: async (_, { dispatch }) => {
//     console.log('Node added - call savediagramstate');
//     // todo wrap w lodash debounce and/or batching 
//     dispatch(saveDiagramState());
//   },
// });


export type AppStore = ReturnType<typeof configureAppStore>
// Infer the type of `store`
export type RootState = ReturnType<AppStore['getState']>
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore['dispatch']

// * memoize selectors only if deriving results (returning new references, i.e. .map())
// * may also use globalized selectors
export const selectEdges = (state: RootState) => state.diagram.edges as Edge<CustomEdgeData>[];
export const selectNodes = (state: RootState) => state.diagram.nodes;
export const selectDiagramFlowErrors = (state: RootState) => state.diagram.diagramFlowErrors;
export const selectisDataDrawerOpen = (state: RootState) => state.diagram.isDataDrawerOpen;
export const selectIsModalOpen = (state: RootState) => state.diagram.isModalOpen;
export const selectHasAssessment = (state: RootState) => state.diagram.assessmentId !== undefined;
export const selectCurrentNode = (state: RootState) => state.diagram.nodes.find((node: Node<ProcessFlowPart>) => node.id === state.diagram.selectedDataId) as Node<ProcessFlowPart>;
export const selectCalculatedData = (state: RootState) => state.diagram.calculatedData;
export const selectNodeValidation = (state: RootState) => {
  return state.diagram.diagramFlowErrors[state.diagram.selectedDataId]
};

export const selectNodeCalculatedFlowData = (state: RootState, nodeId: string): NodeFlowData => {
  return state.diagram.calculatedData.nodes[nodeId];
};

export const selectNodeId = (state: RootState, nodeId?: string) => {
  return nodeId ? nodeId : state.diagram.selectedDataId;
}

export const selectCurrentDataId = (state: RootState, selectedId?: string) => {
  return state.diagram.selectedDataId;
} 

// * MEMOIZED SELECTORS
// export const selectNodesMemo = createSelector(
//   [selectNodes],
//   (nodes) => [...nodes]
// );


export const selectedDataColor = createSelector(selectNodes, selectEdges, selectCurrentDataId,
  (nodes: Node<ProcessFlowPart>[], edges: Edge<CustomEdgeData>[], selectedDataId: string) => {
    const node: Node<ProcessFlowPart> = nodes.find((n: Node<ProcessFlowPart>) => n.id === selectedDataId) as Node<ProcessFlowPart>;
    const edge = edges.find((e: Edge<CustomEdgeData>) => e.id === selectedDataId);
    if (node) {
      return node.style?.backgroundColor;
    } else if (edge) {
      return edge.style?.stroke;
    } else {
      return undefined;
    }
  });

export const selectGraphIndex = createSelector(
  [selectNodes, selectEdges],
  (nodes, edges) => createGraphIndex(nodes, edges)
);

export const selectNodeSourceEdges = createSelector([selectEdges, selectNodeId], (edges: Edge[], nodeId?: string) => {
  return getNodeSourceEdges(edges, nodeId);
});

export const selectNodeTargetEdges = createSelector([selectEdges, selectNodeId], (edges: Edge[], nodeId?: string) => {
  return getNodeTargetEdges(edges, nodeId);
});

export const selectCalculatedNodeData = createSelector([selectCalculatedData, selectNodeId], (data: DiagramCalculatedData, nodeId?: string): NodeFlowData => {
  return data.nodes[nodeId];
});

export const selectTotalSourceFlow = createSelector([selectCalculatedNodeData, selectNodes, selectNodeId], (calculatedNode: NodeFlowData, nodes: Node<ProcessFlowPart>[], nodeId?: string) => {
  const nodeTotalFlow = getNodeTotalFlow('totalSourceFlow', calculatedNode, nodes, nodeId);
  return nodeTotalFlow;
});

export const selectTotalDischargeFlow = createSelector([selectCalculatedNodeData, selectNodes, selectNodeId], (calculatedNode: NodeFlowData, nodes: Node<ProcessFlowPart>[], nodeId?: string) => {
  let nodeTotalFlow = getNodeTotalFlow('totalDischargeFlow', calculatedNode, nodes, nodeId);
  return nodeTotalFlow;
});

export const selectDiagramNotes = createSelector(
  (state: RootState) => state.diagram.diagramNotes,
  (diagramNotes) => diagramNotes
);

export const selectIntakeSourceNodes = createSelector(
  [selectNodes],
  (nodes: Node<ProcessFlowPart>[]) => {
    return nodes
    .filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'water-intake')
  }
);

export const selectDischargeOutletNodes = createSelector(
  [selectNodes],
  (nodes: Node<ProcessFlowPart>[]) => {
    return nodes
    .filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'water-discharge')
  }
);

export const selectNodesAsWaterUsingSystems = createSelector(
  [selectNodes],
  (nodes: Node<ProcessFlowPart>[]) => {
    return nodes
      .filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'water-using-system')
      .map((node: Node<ProcessFlowPart>) => {
        const processFlowPart: WaterProcessComponent = node.data as WaterProcessComponent;
        return getWaterUsingSystem(processFlowPart);
      });
  }
);

export const selectWaterTreatmentNodes = createSelector(
  [selectNodes],
  (nodes: Node<ProcessFlowPart>[]) => {
    return nodes
      .filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'water-treatment')
  }
);

export const selectWasteTreatmentNodes = createSelector(
  [selectNodes],
  (nodes: Node<ProcessFlowPart>[]) => {
    return nodes
      .filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'waste-water-treatment')
  }
);


// todo use FlowUtils helper instead when possible, this may be more expensive than passing in state to utils
export const selectNodeFlowTotals = (state: RootState, node: Node<ProcessFlowPart>) => {
  const connectedEdges = getConnectedEdges([node], state.diagram.edges);
  let totalCalculatedSourceFlow = 0;
  let totalCalculatedDischargeFlow = 0;
  connectedEdges.map((edge: Edge<CustomEdgeData>) => {
    const { source, target } = getEdgeSourceAndTarget(edge, state.diagram.nodes);
    if (node.id === target.diagramNodeId) {
      totalCalculatedSourceFlow += edge.data.flowValue;
    } else if (node.id === source.diagramNodeId) {
      totalCalculatedDischargeFlow += edge.data.flowValue;
    }
  });

  return { totalCalculatedSourceFlow, totalCalculatedDischargeFlow };
}