import { createAsyncThunk, createSlice, current } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, Node, NodeChange, Connection, addEdge, MarkerType } from '@xyflow/react';
import { convertFlowDiagramData, CustomEdgeData, DiagramSettings, Handles, NodeCalculatedData, ProcessFlowPart, UserDiagramOptions } from '../../../../src/process-flow-types/shared-process-flow-types';
import { createNewNode, getEdgeFromConnection } from './FlowUtils';
import { CSSProperties } from 'react';

export interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  settings: DiagramSettings,
  diagramOptions: UserDiagramOptions,
  isDrawerOpen: boolean,
  /** Selected node or edge */
  selectedDataId: string,
  calculatedData: Record<string, NodeCalculatedData>,
  recentNodeColors: string[],
  recentEdgeColors: string[],
}

const defaultSettings = {
  unitsOfMeasure: 'Imperial',
  flowDecimalPrecision: 2
}
const defaultDiagramOptions = {
  strokeWidth: 2,
  edgeType: 'smoothstep',
  minimapVisible: false,
  controlsVisible: true,
  directionalArrowsVisible: true,
  showFlowLabels: false,
  flowLabelSize: 1,
  animated: true,
}

const initialState: DiagramState = {
  nodes: [],
  edges: [],
  settings: defaultSettings,
  diagramOptions: defaultDiagramOptions,
  isDrawerOpen: false,
  selectedDataId: undefined,
  calculatedData: {},
  recentEdgeColors: [],
  recentNodeColors: []
}
// todo remove immutable style transformations below

const resetDiagramReducer = (state: DiagramState) => {
  return initialState;
};


// * NODES
const nodesChangeReducer = (state: DiagramState, action: PayloadAction<NodeChange[]>) => {
  const updatedNodes: Node[] = applyNodeChanges(action.payload, state.nodes) as Node[];
  state.nodes = updatedNodes;
};

const addNodeReducer = (state: DiagramState, action: PayloadAction<{ nodeType, position }>) => {
  const { nodeType, position } = action.payload;
  let newNode: Node = createNewNode(nodeType, position);
  newNode.data.modifiedDate = (newNode.data.modifiedDate as Date).toISOString();
  state.nodes = state.nodes.concat(newNode);
};

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

// todo test without maps
/**
 * Update diagram options as well as affected nodes and edges
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
};

const calculatedDataUpdateReducer = (state: DiagramState, action: PayloadAction<Record<string, NodeCalculatedData>>) => {
  console.log(current(state))
  state.calculatedData = action.payload;
}

export const diagramSlice = createSlice({
  name: 'diagram',
  initialState,
  reducers: {
    resetDiagram: resetDiagramReducer,
    nodesChange: nodesChangeReducer,
    addNode: addNodeReducer,
    updateNodeHandles: updateNodeHandlesReducer,
    deleteNode: deleteNodeReducer,
    setNodeName: setNodeNameReducer,
    setNodeDataProperty: setNodeDataPropertyReducer,
    setNodeStyle: setNodeStyleReducer,
    setNodeColor: setNodeColorReducer,
    edgesChange: edgesChangeReducer,
    setEdgeStrokeColor: setEdgeStrokeColorReducer,
    connectEdge: connectEdgeReducer,
    deleteEdge: deleteEdgeReducer,
    defaultEdgeTypeChange: defaultEdgeTypeChangeReducer,
    customEdgeTypeChange: customEdgeTypeChangeReducer,
    calculatedDataUpdate: calculatedDataUpdateReducer,
    diagramOptionsChange: diagramOptionsChangeReducer,
    unitsOfMeasureChange: unitsOfMeasureChangeReducer,
    flowDecimalPrecisionChange: flowDecimalPrecisionChangeReducer,
    showMarkerEndArrows: showMarkerEndArrowsReducer,
    toggleDrawer: toggleDrawerReducer,
  }
})

export const { 
  nodesChange, 
  edgesChange, 
  connectEdge, 
  addNode,
  setNodeName,
  deleteNode,
  setNodeDataProperty,
  setNodeStyle,
  updateNodeHandles,
  deleteEdge,
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
} = diagramSlice.actions
export default diagramSlice.reducer

export interface UserOptionsPayload<K extends keyof UserDiagramOptions> { optionsProp: K, updatedValue: UserDiagramOptions[K], updateDependencies?: OptionsDependentState[] };
export interface NodeDataPayload<K extends keyof ProcessFlowPart> { optionsProp: K, updatedValue: ProcessFlowPart[K] };
export type OptionsDependentState = 'updateEdges' | 'updateEdgeProperties';