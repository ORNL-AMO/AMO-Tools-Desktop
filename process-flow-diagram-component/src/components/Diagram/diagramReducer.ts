import { createSlice, current } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, Node, NodeChange, Connection, addEdge, MarkerType } from '@xyflow/react';
import { convertFlowDiagramData, CustomEdgeData, DiagramCalculatedData, DiagramSettings, Handles, NodeFlowData, ParentContainerDimensions, ProcessFlowPart, UserDiagramOptions } from '../../../../src/process-flow-types/shared-process-flow-types';
import { createNewNode, formatDecimalPlaces, getEdgeFromConnection, getNodeFlowTotals, getNodeSourceEdges, getNodeTargetEdges, setCalculatedNodeDataProperty } from './FlowUtils';
import { CSSProperties } from 'react';
import { getResetData } from './store';
import { MAX_FLOW_DECIMALS } from '../../../../src/process-flow-types/shared-process-flow-constants';
import { FormikErrors } from 'formik';
import { NodeErrors } from '../../validation/Validation';

export interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  settings: DiagramSettings,
  diagramOptions: UserDiagramOptions,
  isDrawerOpen: boolean,
  /** Selected node or edge */
  selectedDataId: string,
  calculatedData: DiagramCalculatedData,
  recentNodeColors: string[],
  recentEdgeColors: string[],
  diagramParentDimensions: ParentContainerDimensions,
  nodeErrors: Record<string, NodeErrors>,
  focusedEdgeId: string,
  isDialogOpen: boolean,
  assessmentId: number
}

const resetDiagramReducer = (state: DiagramState) => {
  const diagramState = getResetData(state);
  return diagramState;
};

const setDialogOpenReducer = (state: DiagramState) => {
  state.isDialogOpen = !state.isDialogOpen;
}

// * NODES
const nodesChangeReducer = (state: DiagramState, action: PayloadAction<NodeChange[]>) => {
  const updatedNodes: Node[] = applyNodeChanges(action.payload, state.nodes) as Node[];
  state.nodes = updatedNodes;
};
const addNodesReducer = (state: DiagramState, action: PayloadAction<Node[]>) => {
  state.nodes = state.nodes.concat(action.payload);
}

const addNodeReducer = (state: DiagramState, action: PayloadAction<{ nodeType, position }>) => {
  const { nodeType, position } = action.payload;
  let newNode: Node = createNewNode(nodeType, position, state.nodes.map((node: Node<ProcessFlowPart>) => node.data.name));
  // todo can we remove date completely?
  newNode.data.modifiedDate = (newNode.data.modifiedDate as Date).toISOString();
  state.nodes = state.nodes.concat(newNode);
  current(state);
  console.log('debug addNode', current(state));
};

const totalFlowChangeReducer = (state: DiagramState, action: PayloadAction<{flowProperty: NodeFlowProperty, totalFlow: number}>) => {
  const { flowProperty, totalFlow } = action.payload;
  const updateNode: Node<ProcessFlowPart> = state.nodes.find((node: Node<ProcessFlowPart>) => state.selectedDataId === node.id) as Node<ProcessFlowPart>;
  updateNode.data.userEnteredData[flowProperty] = totalFlow;
}

const sourceFlowValueChangeReducer = (state: DiagramState, action: PayloadAction<{sourceEdgeId: string, flowValue: number}>) => {
  const { sourceEdgeId, flowValue } = action.payload;
  const sourceEdge: Edge<CustomEdgeData> = state.edges.find((edge: Edge<CustomEdgeData>) => edge.id === sourceEdgeId) as Edge<CustomEdgeData>;
  sourceEdge.data.flowValue = flowValue;

  const sourceEdges = getNodeSourceEdges(state.edges, state.selectedDataId);
  const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(sourceEdges, state.nodes, state.selectedDataId);
  setCalculatedNodeDataProperty(state.calculatedData, state.selectedDataId, 'totalSourceFlow', totalCalculatedSourceFlow);

  // * set calculated totals for source nodes
  // * alternatively, getNodeFlowTotals on ComponentFlowData rerender
  const componentSourceNodeIds: string[] = sourceEdges.map((edge: Edge<CustomEdgeData>) => edge.source);
  state.nodes.forEach((node: Node<ProcessFlowPart>) => {
    if (componentSourceNodeIds.includes(node.id)) {
      // * update discharge edges of the node.id calculated data being set
      const nodeDischargeEdges = getNodeTargetEdges(state.edges, node.id);
      const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(nodeDischargeEdges, state.nodes, node.id);
      setCalculatedNodeDataProperty(state.calculatedData, node.id, 'totalDischargeFlow', totalCalculatedDischargeFlow);
    }
  });
}


const dischargeFlowValueChangeReducer = (state: DiagramState, action: PayloadAction<{dischargeEdgeId: string, flowValue: number}>) => {
  const { dischargeEdgeId, flowValue } = action.payload;
  const dischargeEdge: Edge<CustomEdgeData> = state.edges.find((edge: Edge<CustomEdgeData>) => edge.id === dischargeEdgeId) as Edge<CustomEdgeData>;
  dischargeEdge.data.flowValue = flowValue;

  const dischargeEdges = getNodeTargetEdges(state.edges, state.selectedDataId);
  const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(dischargeEdges, state.nodes, state.selectedDataId);
  setCalculatedNodeDataProperty(state.calculatedData, state.selectedDataId, 'totalDischargeFlow', totalCalculatedDischargeFlow);

  // * set calculated totals for dicharge nodes
  // * alternatively, getNodeFlowTotals on ComponentFlowData rerender
  const componentDischargeNodeIds: string[] = dischargeEdges.map((edge: Edge<CustomEdgeData>) => edge.target);
  state.nodes.forEach((node: Node<ProcessFlowPart>) => {
    if (componentDischargeNodeIds.includes(node.id)) {
      // * update source edges of the node.id calculated data being set
      const nodeSourceEdges = getNodeSourceEdges(state.edges, node.id);
      const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(nodeSourceEdges, state.nodes, node.id);
      setCalculatedNodeDataProperty(state.calculatedData, node.id, 'totalSourceFlow', totalCalculatedSourceFlow);
    }
  });
}

const distributeTotalSourceFlowReducer = (state: DiagramState, action: PayloadAction<number>) => {
  const totalFlowValue = action.payload;
  const componentSourceEdges: Edge[] = getNodeSourceEdges(state.edges, state.selectedDataId);
  const componentSourceEdgeIds = componentSourceEdges.map((edge: Edge<CustomEdgeData>) => edge.id);
  
  let dividedTotalFlow = totalFlowValue / componentSourceEdges.length;
  dividedTotalFlow = Number(formatDecimalPlaces(dividedTotalFlow, MAX_FLOW_DECIMALS));
  state.edges = state.edges.map((edge: Edge<CustomEdgeData>) => {
    if (componentSourceEdgeIds.includes(edge.id)) {
      edge.data.flowValue = dividedTotalFlow;
    }
    return edge;
  });

  // todo set connected nodes calculated data
}

const distributeTotalDischargeFlowReducer = (state: DiagramState, action: PayloadAction<number>) => {
  const totalFlowValue = action.payload;
  const componentDischargeEdges: Edge[] = getNodeTargetEdges(state.edges, state.selectedDataId);
  const componentDischargeEdgesIds = componentDischargeEdges.map((edge: Edge<CustomEdgeData>) => edge.id);
  
  let dividedTotalFlow = totalFlowValue / componentDischargeEdges.length;
  dividedTotalFlow = Number(formatDecimalPlaces(dividedTotalFlow, MAX_FLOW_DECIMALS));
  state.edges = state.edges.map((edge: Edge<CustomEdgeData>) => {
    if (componentDischargeEdgesIds.includes(edge.id)) {
      edge.data.flowValue = dividedTotalFlow;
    }
    return edge;
  });

  // todo set connected nodes calculated data
}

const nodeErrorsChangeReducer = (state: DiagramState, action: PayloadAction<{flowType: FlowType, errors: FormikErrors<{ totalFlow: string | number; flows: (string | number)[] }>}>) => {
  const { flowType, errors } = action.payload;
  const validationErrors: NodeErrors = {totalFlow: undefined, flows: undefined, level: 'WARNING', flowType: flowType};

  if (errors.flows) {
    validationErrors.flows = [...errors.flows];
    validationErrors.level = 'WARNING';
  }

  if (errors.totalFlow) {
    validationErrors.totalFlow = errors.totalFlow;
    validationErrors.level = 'ERROR'; 
  }

  if (!errors.flows && !errors.totalFlow) {
    delete state.nodeErrors[state.selectedDataId];
  } else {
    state.nodeErrors[state.selectedDataId] = validationErrors as NodeErrors;
  }

}

const setNodeNameReducer = (state: DiagramState, action: PayloadAction<string>) => {
  const updateNode = state.nodes.find((n: Node<ProcessFlowPart>) => n.data.diagramNodeId === state.selectedDataId);
  updateNode.data.name = action.payload;
}

const setNodeDataPropertyReducer = <K extends keyof ProcessFlowPart>(state: DiagramState, action: PayloadAction<NodeDataPayload<K>>) => {
  const updateNode: Node<ProcessFlowPart> = state.nodes.find((n: Node<ProcessFlowPart>) => n.data.diagramNodeId === state.selectedDataId) as Node<ProcessFlowPart>;
  // todo 6918 currently ignores WaterTreatment and WasteWaterTreatment
  if (updateNode && action.payload.optionsProp in updateNode.data) {
    updateNode.data[action.payload.optionsProp] = action.payload.updatedValue;
  }
}

const setNodeColorReducer = (state: DiagramState, action: PayloadAction<{color: string, recentColors?: string[]}>) => {
  const updateNode: Node<ProcessFlowPart> = state.nodes.find((n: Node<ProcessFlowPart>) => n.data.diagramNodeId === state.selectedDataId) as Node<ProcessFlowPart>;
  updateNode.style.backgroundColor = action.payload.color;

  if (action.payload.recentColors) {
    state.recentNodeColors = action.payload.recentColors;
  }
}

const setNodeStyleReducer = (state: DiagramState, action: PayloadAction<CSSProperties>) => {
  const updateNode: Node<ProcessFlowPart> = state.nodes.find((n: Node<ProcessFlowPart>) => n.data.diagramNodeId === state.selectedDataId) as Node<ProcessFlowPart>;
  updateNode.style = action.payload;
}

const deleteNodeReducer = (state: DiagramState, action: PayloadAction<string>) => {
    state.nodes = state.nodes.filter((nd) => nd.id !== state.selectedDataId);
    state.edges = state.edges.filter((edge) => edge.source !== state.selectedDataId && edge.target !== state.selectedDataId);
    state.isDrawerOpen = !state.isDrawerOpen;
    state.selectedDataId = action.payload ? action.payload : undefined;
};

const updateNodeHandlesReducer = (state: DiagramState, action: PayloadAction<Handles>) => {
  const updateNode = state.nodes.find((n: Node<ProcessFlowPart>) => n.id === state.selectedDataId);
  updateNode.data.handles = action.payload;
}

// * EDGES
const connectEdgeReducer = (state: DiagramState, action: PayloadAction<Connection | Edge>) => {
  const connectedParams = action.payload;
  const newEdge: Edge = getEdgeFromConnection(connectedParams, state.diagramOptions);
  const updatedEdges: Edge[] = addEdge(newEdge, state.edges);
  state.edges = updatedEdges;
};

const edgesChangeReducer = (state: DiagramState, action: PayloadAction<EdgeChange[]>) => {
  const updateEdges: Edge[] = applyEdgeChanges(action.payload, state.edges) as Edge[];
  state.edges = updateEdges;
};

const deleteEdgeReducer = (state: DiagramState, action: PayloadAction<string>) => {
  state.edges = state.edges.filter((edg) => edg.id !== action.payload);

  state.isDrawerOpen = !state.isDrawerOpen;
  state.selectedDataId = action.payload ? action.payload : undefined;
}

const focusedEdgeChangeReducer = (state: DiagramState, action: PayloadAction<{edgeId: string}>) => {
  const { edgeId } = action.payload;
  state.focusedEdgeId = edgeId;
}

const defaultEdgeTypeChangeReducer = (state: DiagramState, action: PayloadAction<string>) => {
  state.diagramOptions.edgeType = action.payload;
  state.edges = state.edges.map((edge: Edge<CustomEdgeData>) => {
        // * ignore self-connecting
        if (edge.source !== edge.target) {
          if (edge.data.hasOwnEdgeType !== undefined) {
            edge.type = edge.data.hasOwnEdgeType;
          } else {
            edge.type = action.payload;
          }
        }
        return edge;
  });
};

const customEdgeTypeChangeReducer = (state: DiagramState, action: PayloadAction<string>) => {
  const updatedEdge = state.edges.find((edge: Edge<CustomEdgeData>) => edge.id === state.selectedDataId);
  updatedEdge.type = action.payload;
  updatedEdge.data.hasOwnEdgeType = action.payload;
};

const setEdgeStrokeColorReducer = (state: DiagramState, action: PayloadAction<{color: string, recentColors?: string[]}>) => {
  const updatedEdge = state.edges.find((edge: Edge<CustomEdgeData>) => edge.id === state.selectedDataId);
  updatedEdge.style.stroke = action.payload.color;

  if (action.payload.recentColors) {
    state.recentEdgeColors = action.payload.recentColors;
  }
}

// * SETTINGS and misc
const unitsOfMeasureChangeReducer = (state: DiagramState, action: PayloadAction<string>) => {
  const convertedDiagramData = {
    nodes: state.nodes,
    edges: state.edges,
    calculatedData: state.calculatedData
  }
  convertFlowDiagramData(convertedDiagramData, action.payload);
  state.settings.unitsOfMeasure = action.payload;
  state.nodes = convertedDiagramData.nodes as Node[];
  state.edges = convertedDiagramData.edges as Edge[];
  state.calculatedData = convertedDiagramData.calculatedData;
};

const flowDecimalPrecisionChangeReducer = (state: DiagramState, action: PayloadAction<string>) => {
  state.settings.flowDecimalPrecision = Number(action.payload);
  state.edges = state.edges.map((edge: Edge) => {
    return {...edge};
  });
}

/**
 * Update diagram options by key as well as affected nodes and edges
 * @param state 
 * @param action 
 */
const diagramOptionsChangeReducer = <K extends keyof UserDiagramOptions>(state: DiagramState, action: PayloadAction<UserOptionsPayload<K>>) => {
  if (action.payload.optionsProp in state.diagramOptions) {
    const property = action.payload.optionsProp;
    state.diagramOptions[property] = action.payload.updatedValue;
  }

  if (action.payload.updateDependencies?.includes('updateEdges')) {
    state.edges = state.edges.map((edge: Edge) => {
      return {...edge};
  });
  }

  if (action.payload.updateDependencies?.includes('updateEdgeProperties')) {
    state.edges = state.edges.map((edge: Edge) => {
      if (action.payload.optionsProp in edge) {
        return {
          ...edge,
          [action.payload.optionsProp]: action.payload.updatedValue,
        };
      }

      // todo could be eliminated to pass whole style object
      if (edge.style && action.payload.optionsProp in edge.style) {
        return {
          ...edge,
          style: {
            ...edge.style,
            [action.payload.optionsProp]: action.payload.updatedValue,
          },
        };
      }
    });
  }
}

const showMarkerEndArrowsReducer = (state: DiagramState, action: PayloadAction<boolean>) => {
  state.diagramOptions.directionalArrowsVisible = action.payload;
  state.edges = state.edges.map((edge: Edge<CustomEdgeData>) => {
    let updatedEdge = {
      ...edge,
      markerEnd: action.payload ? {
        type: MarkerType.ArrowClosed,
        width: 25,
        height: 25
      } : ''
    }
    return updatedEdge;
  });
}

const toggleDrawerReducer = (state: DiagramState, action?: PayloadAction<string>) => {
  state.isDrawerOpen = !state.isDrawerOpen;
  state.selectedDataId = action.payload ? action.payload : undefined;
  if (!state.isDrawerOpen) {
    state.focusedEdgeId = undefined;
  }
};

const calculatedDataUpdateReducer = (state: DiagramState, action: PayloadAction<DiagramCalculatedData>) => {
  console.log(current(state))
  state.calculatedData = action.payload;
}

export const diagramSlice = createSlice({
  name: 'diagram',
  initialState: getResetData(),
  reducers: {
    resetDiagram: resetDiagramReducer,
    nodesChange: nodesChangeReducer,
    addNode: addNodeReducer,
    addNodes: addNodesReducer,
    updateNodeHandles: updateNodeHandlesReducer,
    sourceFlowValueChange: sourceFlowValueChangeReducer,
    totalFlowChange: totalFlowChangeReducer,
    nodeErrorsChange: nodeErrorsChangeReducer,
    deleteNode: deleteNodeReducer,
    setNodeName: setNodeNameReducer,
    setNodeDataProperty: setNodeDataPropertyReducer,
    setNodeStyle: setNodeStyleReducer,
    setNodeColor: setNodeColorReducer,
    edgesChange: edgesChangeReducer,
    setEdgeStrokeColor: setEdgeStrokeColorReducer,
    connectEdge: connectEdgeReducer,
    deleteEdge: deleteEdgeReducer,
    focusedEdgeChange: focusedEdgeChangeReducer,
    defaultEdgeTypeChange: defaultEdgeTypeChangeReducer,
    customEdgeTypeChange: customEdgeTypeChangeReducer,
    calculatedDataUpdate: calculatedDataUpdateReducer,
    diagramOptionsChange: diagramOptionsChangeReducer,
    unitsOfMeasureChange: unitsOfMeasureChangeReducer,
    flowDecimalPrecisionChange: flowDecimalPrecisionChangeReducer,
    showMarkerEndArrows: showMarkerEndArrowsReducer,
    distributeTotalSourceFlow: distributeTotalSourceFlowReducer,
    dischargeFlowValueChange: dischargeFlowValueChangeReducer,
    distributeTotalDischargeFlow: distributeTotalDischargeFlowReducer,
    toggleDrawer: toggleDrawerReducer,
    setDialogOpen: setDialogOpenReducer,
  }
})

export const { 
  nodesChange, 
  edgesChange, 
  connectEdge, 
  addNode,
  addNodes,
  setNodeName,
  deleteNode,
  setNodeDataProperty,
  setNodeStyle,
  totalFlowChange,
  sourceFlowValueChange,
  dischargeFlowValueChange,
  distributeTotalSourceFlow,
  distributeTotalDischargeFlow,
  nodeErrorsChange,
  updateNodeHandles,
  deleteEdge,
  focusedEdgeChange,
  defaultEdgeTypeChange,
  customEdgeTypeChange,
  setNodeColor,
  setEdgeStrokeColor,
  resetDiagram, 
  calculatedDataUpdate,
  diagramOptionsChange, 
  unitsOfMeasureChange,
  flowDecimalPrecisionChange,
  showMarkerEndArrows,
  toggleDrawer,
  setDialogOpen
} = diagramSlice.actions
export default diagramSlice.reducer

export interface UserOptionsPayload<K extends keyof UserDiagramOptions> { optionsProp: K, updatedValue: UserDiagramOptions[K], updateDependencies?: OptionsDependentState[] };
export interface NodeDataPayload<K extends keyof ProcessFlowPart> { optionsProp: K, updatedValue: ProcessFlowPart[K] };
export type OptionsDependentState = 'updateEdges' | 'updateEdgeProperties';
export type NodeFlowProperty = keyof Pick<NodeFlowData, 'totalSourceFlow' | 'totalDischargeFlow'>;
export type FlowType = 'source' | 'discharge';
