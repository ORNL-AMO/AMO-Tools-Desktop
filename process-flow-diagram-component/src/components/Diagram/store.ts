import { configureStore, createListenerMiddleware, createSelector, isAnyOf } from '@reduxjs/toolkit'
import diagramReducer, { addNode, DiagramState, saveDiagramState } from './diagramReducer'
import { CustomEdgeData, DiagramCalculatedData, DiagramSettings, NodeFlowData, ProcessFlowPart, UserDiagramOptions } from '../../../../src/process-flow-types/shared-process-flow-types';
import { addEdge, Edge, getConnectedEdges, Node } from '@xyflow/react';
import { getEdgeSourceAndTarget, getNodeSourceEdges, getNodeTargetEdges, getNodeTotalFlow } from './FlowUtils';


export function configureAppStore() {
  const store = configureStore({
    reducer: { diagram: diagramReducer },
    preloadedState: {
      diagram: getResetData()
    },
    middleware: (getDefaultMiddleware) => {
      const listenerMiddleware = createListenerMiddleware();
      listenerMiddleware.startListening({
        matcher: isAnyOf(addNode),
        effect: async (_, { dispatch }) => {
          dispatch(saveDiagramState());
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
export const selectEdges = (state: RootState) => state.diagram.edges;
export const selectNodes = (state: RootState) => state.diagram.nodes;
export const selectIsDrawerOpen = (state: RootState) => state.diagram.isDrawerOpen;
export const selectHasAssessment = (state: RootState) => state.diagram.assessmentId !== undefined;
export const selectCurrentNode = (state: RootState) => state.diagram.nodes.find((node: Node<ProcessFlowPart>) => node.id === state.diagram.selectedDataId) as Node<ProcessFlowPart>;
export const selectCalculatedData = (state: RootState) => state.diagram.calculatedData;
export const selectNodeValidation = (state: RootState) => {
  return state.diagram.nodeErrors[state.diagram.selectedDataId]
};

export const selectNodeFlowData = (state: RootState, nodeId: string) => {
  return state.diagram.calculatedData.nodes[nodeId]};
export const selectNodeId = (state: RootState, nodeId?: number) => {
  return nodeId ? nodeId : state.diagram.selectedDataId;
} 

// * MEMOIZED SELECTORS
export const selectNodeSourceEdges = createSelector([selectEdges, selectNodeId], (edges: Edge[], nodeId?: string) => {
  return getNodeSourceEdges(edges, nodeId);
});

export const selectNodeTargetEdges = createSelector([selectEdges, selectNodeId], (edges: Edge[], nodeId?: string) => {
  return getNodeTargetEdges(edges, nodeId);
});

export const selectCalculatedNodeData = createSelector([selectCalculatedData, selectNodeId], (data: DiagramCalculatedData, nodeId?: string) => {
  return data.nodes[nodeId];
});

export const selectTotalSourceFlow = createSelector([selectCalculatedNodeData, selectNodes, selectNodeId], (calculatedNode: NodeFlowData, nodes: Node<ProcessFlowPart>[], nodeId?: string) => {
  const nodeTotalFlow = getNodeTotalFlow('totalSourceFlow', calculatedNode, nodes, nodeId);
  return nodeTotalFlow;
});

export const selectTotalDischargeFlow = createSelector([selectCalculatedNodeData, selectNodes, selectNodeId], (calculatedNode: NodeFlowData, nodes: Node<ProcessFlowPart>[], nodeId?: string) => {
  const nodeTotalFlow = getNodeTotalFlow('totalDischargeFlow', calculatedNode, nodes, nodeId);
  return nodeTotalFlow;
});


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


// helpers
export const getDefaultUserDiagramOptions = (): UserDiagramOptions => {
  return {
    strokeWidth: 2,
    edgeType: 'smoothstep',
    minimapVisible: false,
    controlsVisible: true,
    directionalArrowsVisible: true,
    showFlowLabels: false,
    flowLabelSize: 1,
    animated: true,
  }
}

export const getDefaultSettings = (): DiagramSettings => {
  return {
    unitsOfMeasure: 'Imperial',
    flowDecimalPrecision: 2
  }
}

export const getDefaultColorPalette = () => {
  return ['#75a1ff', '#7f7fff', '#00bbff', '#009386', '#93e200'];
}

export const getResetData = (currentState?: DiagramState): DiagramState => {
  return {
    nodes: [],
    edges: [],
    settings: getDefaultSettings(),
    diagramOptions: getDefaultUserDiagramOptions(),
    isDrawerOpen: false,
    selectedDataId: undefined,
    focusedEdgeId: undefined,
    calculatedData: {nodes: {}},
    nodeErrors: {},
    recentEdgeColors: getDefaultColorPalette(),
    recentNodeColors: getDefaultColorPalette(),
    diagramParentDimensions: {
      height: undefined,
      headerHeight: undefined,
      footerHeight: undefined
    },
    isDialogOpen: false,
    assessmentId: undefined,
    isValidationWindowOpen: false
  }
}


