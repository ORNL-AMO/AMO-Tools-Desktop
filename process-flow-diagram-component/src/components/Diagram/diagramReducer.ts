import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, Node, NodeChange, Connection, addEdge, MarkerType } from '@xyflow/react';
import { CSSProperties } from 'react';
import { ValidationWindowLocation } from './ValidationWindow';
import { ComponentManageDataTabs, CustomEdgeData, DEFAULT_EDGE_STROKE_COLOR, DiagramAlertMessages, DiagramCalculatedData, DiagramFlowErrors, DiagramSettings, FlowConfidence, FlowDiagramData, getDefaultFlowConfidence, Handles, ManageDataTab, NodeFlowProperty, ParentContainerDimensions, ProcessFlowNodeType, ProcessFlowPart, UserDiagramOptions, WaterProcessComponentType, WaterSystemResults, WaterTreatment, checkDiagramNodeErrors, convertFlowDiagramData, getConnectionFromEdgeId, getContrastTextColor, getDefaultColorPalette, getDefaultSettings, getDefaultUserDiagramOptions, getEdgeDescription, getEdgeFromConnection, migrateFlowDiagramFieldNames } from 'process-flow-lib';
import { createNewNode, formatDataForMEASUR } from './FlowUtils';
import { DiagramAlertState } from './DiagramAlert';
import {
  totalFlowChangeReducer,
  sumTotalFlowChangeReducer,
  sourceFlowValueChangeReducer,
  distributeTotalSourceFlowReducer,
  dischargeFlowValueChangeReducer,
  distributeTotalDischargeFlowReducer,
  applyEstimatedFlowResultsReducer,
  edgesChangeFromPropagationReducer,
} from './flowCalculationReducers';
// * re-exported so components dispatch every flow-related action (including this thunk) from one
// * place, even though its implementation lives in flowCalculationReducers.ts
export { propagateFlowFromNode } from './flowCalculationReducers';

import packageJson from '../../../package.json';
const CURRENT_DIAGRAM_VERSION: string = packageJson.version;

/**
 * Maps palette array index to its WaterProcessComponentType.
 * Must stay in sync with allPalettes ordering in ColorPaletteDropdown.
 */
export const PALETTE_COMPONENT_ORDER: WaterProcessComponentType[] = [
  'water-intake',
  'water-using-system',
  'water-discharge',
  'water-treatment',
  'waste-water-treatment'
];

export const getDefaultPaletteColors = (): string[] => [
  '#75a1ff', '#00bbff', '#7f7fff', '#009386', '#93e200'
];

export const getPaletteColorForType = (type: WaterProcessComponentType, paletteColors: string[]): string | undefined => {
  const typeIndex = PALETTE_COMPONENT_ORDER.indexOf(type);
  return typeIndex !== -1 && paletteColors[typeIndex] ? paletteColors[typeIndex] : undefined;
};

export interface DiagramState {
  name: string,
  nodes: Node[];
  edges: Edge[];
  // * Owned or managed by another node. Does not display in the diagram
  composedNodeData: ProcessFlowPart[];
  settings: DiagramSettings,
  diagramOptions: UserDiagramOptions,
  isDataDrawerOpen: boolean,
  isMenuDrawerOpen: boolean,
  // * Selected node or edge 
  selectedDataId: string,
  calculatedData: DiagramCalculatedData,
  recentNodeColors: string[],
  recentEdgeColors: string[],
  diagramParentDimensions: ParentContainerDimensions,
  diagramFlowErrors: DiagramFlowErrors,
  focusedEdgeId: string,
  isDialogOpen: boolean,
  assessmentId: number,
  validationWindowLocation: ValidationWindowLocation,
  isModalOpen: boolean,
  manageDataTabs: ManageDataTab[],
  diagramAlert: DiagramAlertState,
  diagramNotes: string,
}

export const getDefaultDiagramData = (currentState?: DiagramState): DiagramState => {
  return {
    name: undefined,
    nodes: [],
    edges: [],
    composedNodeData: [],
    settings: getDefaultSettings(),
    diagramOptions: { ...getDefaultUserDiagramOptions(), paletteColors: getDefaultPaletteColors() },
    isDataDrawerOpen: false,
    isMenuDrawerOpen: true,
    selectedDataId: undefined,
    focusedEdgeId: undefined,
    calculatedData: { nodes: {} },
    diagramFlowErrors: {},
    recentEdgeColors: getDefaultColorPalette(),
    recentNodeColors: getDefaultColorPalette(),
    diagramParentDimensions: {
      height: currentState?.diagramParentDimensions?.height,
      headerHeight: currentState?.diagramParentDimensions?.headerHeight,
      footerHeight: currentState?.diagramParentDimensions?.footerHeight
    },
    isDialogOpen: false,
    assessmentId: undefined,
    validationWindowLocation: 'diagram',
    isModalOpen: false,
    manageDataTabs: [],
    diagramAlert: {
      open: false,
    },
    diagramNotes: '',
  }
}

export const getStoreSerializedDate = (dateObject: Date): string => {
  return dateObject.toISOString();
}


/**
 * Sets initialized state on process-flow-diagram-component's parent first render
 */
const diagramInitializedReducer = (state: DiagramState, action: PayloadAction<{ diagramData: FlowDiagramData, parentContainer: ParentContainerDimensions, assessmentId: number }>) => {
  const { diagramData, parentContainer, assessmentId } = action.payload;

  if (diagramData.meta === undefined) {
    diagramData.meta = {
      version: '0.0.0',
      upgrades: [],
    } 
  }

  if (diagramData.meta.version !== CURRENT_DIAGRAM_VERSION) {
    upgradeDiagram(diagramData);
  }

  state.nodes = diagramData.nodes.filter((node: Node<ProcessFlowPart>) => {
    if (node.position) {
      return node;
    }
  });
  state.edges = diagramData.edges.map((edge: Edge<CustomEdgeData>) => edge);
  state.diagramOptions = diagramData.userDiagramOptions ? { ...diagramData.userDiagramOptions } : getDefaultUserDiagramOptions();
  state.settings = diagramData.settings ? { ...diagramData.settings } : getDefaultSettings();
  state.calculatedData = diagramData.calculatedData ? { ...diagramData.calculatedData } : { nodes: {} };
  const diagramFlowErrors = checkDiagramNodeErrors(state.nodes, state.edges, state.settings);
  state.diagramFlowErrors = diagramFlowErrors;

  state.recentNodeColors = diagramData.recentNodeColors.length !== 0 ? { ...diagramData.recentNodeColors } : getDefaultColorPalette();
  state.recentEdgeColors = diagramData.recentEdgeColors.length !== 0 ? { ...diagramData.recentEdgeColors } : getDefaultColorPalette();
  state.diagramOptions.paletteColors = diagramData.userDiagramOptions?.paletteColors ?? getDefaultPaletteColors();
  // * these fields are newer than most saved diagrams' userDiagramOptions - explicit assignment (even to
  // * undefined) ensures the key exists on state.diagramOptions, since diagramOptionsChangeReducer's
  // * `optionsProp in state.diagramOptions` guard requires the key to already be present, not just typed optional
  state.diagramOptions.colorEdgesByConfidence = diagramData.userDiagramOptions?.colorEdgesByConfidence ?? false;
  state.diagramOptions.estimatedFlowColor = diagramData.userDiagramOptions?.estimatedFlowColor;
  state.diagramOptions.meteredFlowColor = diagramData.userDiagramOptions?.meteredFlowColor;
  state.diagramOptions.flowConfidenceEnabled = diagramData.userDiagramOptions?.flowConfidenceEnabled ?? true;
  state.isDataDrawerOpen = false;
  state.isMenuDrawerOpen = state.isMenuDrawerOpen ?? true;
  state.focusedEdgeId = undefined;
  state.selectedDataId = undefined;
  state.diagramParentDimensions = { ...parentContainer };
  state.isDialogOpen = false;
  state.validationWindowLocation = 'diagram';
  state.assessmentId = assessmentId
}

const resetDiagramReducer = (state: DiagramState) => {
  const diagramState = getDefaultDiagramData(state);
  return diagramState;
};

const setDialogOpenReducer = (state: DiagramState) => {
  state.isDialogOpen = !state.isDialogOpen;
}

const nodesChangeReducer = (state: DiagramState, action: PayloadAction<NodeChange[]>) => {
  const updatedNodes: Node[] = applyNodeChanges(action.payload, state.nodes) as Node[];
  state.nodes = updatedNodes;
};
const addNodesReducer = (state: DiagramState, action: PayloadAction<Node[]>) => {
  state.nodes = state.nodes.concat(action.payload);
}

const addNodeReducer = (state: DiagramState, action: PayloadAction<{ nodeType: WaterProcessComponentType, position: { x: number, y: number } }>) => {
  const { nodeType, position } = action.payload;
  const existingNames = state.nodes.map((node: Node<ProcessFlowPart>) => node.data.name);
  let newNode: Node = createNewNode(nodeType, position, existingNames);
  // * modifiedDate is not currently being read in the app
  newNode.data.modifiedDate = getStoreSerializedDate(newNode.data.modifiedDate as Date);
  // Apply the active palette color for this node's component type
  const paletteColor = getPaletteColorForType(nodeType, state.diagramOptions.paletteColors ?? getDefaultPaletteColors());
  if (paletteColor) {
    newNode.style = { ...newNode.style, backgroundColor: paletteColor, color: getContrastTextColor(paletteColor) };
  }
  state.nodes.push(newNode);
};

const recomputeNodeErrorsReducer = (state: DiagramState) => {
  state.diagramFlowErrors = checkDiagramNodeErrors(state.nodes, state.edges, state.settings);
};

const validationWindowOpenChangeReducer = (state: DiagramState, action: PayloadAction<ValidationWindowLocation>) => {
  state.validationWindowLocation = action.payload;
}

const setNodeNameReducer = (state: DiagramState, action: PayloadAction<string>) => {
  const updateNode = state.nodes.find((n: Node<ProcessFlowPart>) => n.data.diagramNodeId === state.selectedDataId);
  updateNode.data.name = action.payload;
}

const nodeDataPropertyChangeReducer = <K extends keyof ProcessFlowPart, T extends keyof WaterTreatment>(state: DiagramState, action: PayloadAction<NodeDataPayload<K> | NodeTreatmentDataPayload<T>>) => {
  const updateNode: Node<ProcessFlowPart> = state.nodes.find((n: Node<ProcessFlowPart>) => n.data.diagramNodeId === state.selectedDataId) as Node<ProcessFlowPart>;
  const { optionsProp, updatedValue } = action.payload;
  if (updateNode && optionsProp in updateNode.data) {
    updateNode.data[optionsProp] = updatedValue;
  }
}

/**
 * Sets estimated/metered confidence on a node's total flow value (source or discharge). Only ever set
 * explicitly by the user via the drawer toggle - a value stays Metered through any later recalculation
 * (distribute/sum/apply-estimate) until the user toggles it back. Exception: edgesChangeFromPropagation
 * sets a node's relevant total to match the seed edge's confidence when one of its edges is populated
 * by propagation.
 */
const setNodeFlowConfidenceReducer = (state: DiagramState, action: PayloadAction<{ nodeId: string, flowProperty: NodeFlowProperty, confidence: FlowConfidence }>) => {
  const updateNode: Node<ProcessFlowPart> = state.nodes.find((node: Node<ProcessFlowPart>) => node.id === action.payload.nodeId) as Node<ProcessFlowPart>;
  updateNode.data.flowConfidence[action.payload.flowProperty] = action.payload.confidence;
}

const setNodeColorReducer = (state: DiagramState, action: PayloadAction<{ color: string, recentColors?: string[] }>) => {
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

/**
 * "Delete Component" button click from drawer
 */
const deleteNodeReducer = (state: DiagramState, action: PayloadAction<string>) => {
  state.nodes = state.nodes.filter((nd) => nd.id !== state.selectedDataId);
  state.edges = state.edges.filter((edge) => edge.source !== state.selectedDataId && edge.target !== state.selectedDataId);
  state.isDataDrawerOpen = !state.isDataDrawerOpen;
  delete state.diagramFlowErrors[state.selectedDataId];
  state.selectedDataId = action.payload ? action.payload : undefined;
};

/**
 * Node deleted from keyboard input. Update related state. nodesChangeReducer handles nodes state update
 */
const keyboardDeleteNodeReducer = (state: DiagramState, action: PayloadAction<Node<ProcessFlowPart>>) => {
  const node = action.payload;
  if (node.selected) {
    state.selectedDataId = undefined;
  }
  delete state.diagramFlowErrors[node.id];
};

const updateNodeHandlesReducer = (state: DiagramState, action: PayloadAction<Handles>) => {
  const { inflowHandles, outflowHandles } = action.payload;
  const updatedNode: Node<ProcessFlowPart> = state.nodes.find((n: Node<ProcessFlowPart>) => n.id === state.selectedDataId) as Node<ProcessFlowPart>;
  let activeEdges: Edge[] = [];

  // * Need to check equality/changes because the user will modify one handle set at a time
  if (inflowHandles && !getAreHandlesEqual(updatedNode.data.handles.inflowHandles, inflowHandles)) {
    activeEdges.push(...state.edges.filter(edge => {
      return getIsActiveTargetEdge(updatedNode, inflowHandles, edge.id);
    }));
  }
  if (outflowHandles && !getAreHandlesEqual(updatedNode.data.handles.outflowHandles, outflowHandles)) {
    activeEdges.push(...state.edges.filter(edge => {
      return getIsActiveSourceEdge(updatedNode, outflowHandles, edge.id);
    }));
  }

  state.edges = activeEdges;
  updatedNode.data.handles = action.payload;
}

// * EDGES
const connectEdgeReducer = (state: DiagramState, action: PayloadAction<Connection | Edge>) => {
  const connectedParams = action.payload;
  const newEdge: Edge = getEdgeFromConnection(connectedParams, state.diagramOptions);
  const updatedEdges: Edge[] = addEdge(newEdge, state.edges);
  let connectedToSameTarget = 0;
  let connectedToSameSource = 0;
  updatedEdges.forEach((edge: Edge) => {
    if (edge.target === newEdge.target && edge.targetHandle === newEdge.targetHandle) {
      connectedToSameTarget++;
    }
    if (edge.source === newEdge.source && edge.sourceHandle === newEdge.sourceHandle) {
      connectedToSameSource++;
    }
  });

  if (connectedToSameTarget > 2 || connectedToSameSource > 2) {
    state.diagramAlert = {
      open: true,
      alertMessage: DiagramAlertMessages.EdgeConnectionLimit,
      alertSeverity: 'warning',
      dismissMS: 6000
    };
  }
  

  state.edges = updatedEdges;
};

const edgesChangeReducer = (state: DiagramState, action: PayloadAction<EdgeChange[]>) => {
  const updateEdges: Edge[] = applyEdgeChanges(action.payload, state.edges) as Edge[];
  state.edges = updateEdges;
};

const edgesUpdateReducer = (state: DiagramState, action: PayloadAction<Edge[]>) => {
  state.edges = action.payload;
};

const deleteEdgeReducer = (state: DiagramState, action: PayloadAction<string>) => {
  state.edges = state.edges.filter((edg) => edg.id !== action.payload);

  state.isDataDrawerOpen = !state.isDataDrawerOpen;
  state.selectedDataId = action.payload ? action.payload : undefined;
}

const focusedEdgeChangeReducer = (state: DiagramState, action: PayloadAction<{ edgeId: string }>) => {
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

const setEdgeStrokeColorReducer = (state: DiagramState, action: PayloadAction<{ color: string, recentColors?: string[], isReset?: boolean }>) => {
  const updatedEdge = state.edges.find((edge: Edge<CustomEdgeData>) => edge.id === state.selectedDataId);
  updatedEdge.style.stroke = action.payload.color;
  updatedEdge.data.hasManualColorOverride = !action.payload.isReset;

  if (action.payload.recentColors) {
    state.recentEdgeColors = action.payload.recentColors;
  }
}

/**
 * Sets estimated/metered confidence on a single edge's flow value. Only ever set explicitly by the
 * user via the drawer toggle - a value stays Metered through any later recalculation (distribute/sum)
 * until the user toggles it back. Exception: edgesChangeFromPropagation sets a downstream edge to match
 * the seed edge's confidence when propagation overwrites its flow value.
 */
const setEdgeFlowConfidenceReducer = (state: DiagramState, action: PayloadAction<{ edgeId: string, confidence: FlowConfidence }>) => {
  const updatedEdge = state.edges.find((edge: Edge<CustomEdgeData>) => edge.id === action.payload.edgeId);
  updatedEdge.data.confidence = action.payload.confidence;
}

const setDiagramNotesReducer = (state: DiagramState, action: PayloadAction<string>) => {
  state.diagramNotes = action.payload;
};

/**
 * Apply a full color palette to all nodes, coloring each by its processComponentType.
 * Uses the same node.style.backgroundColor pattern as setNodeColorReducer.
 */
const setPaletteColorsReducer = (state: DiagramState, action: PayloadAction<string[]>) => {
  const palette = action.payload;
  state.diagramOptions.paletteColors = palette;
  state.nodes = state.nodes.map((node: Node<ProcessFlowPart>) => {
    const paletteColor = getPaletteColorForType(node.data.processComponentType as WaterProcessComponentType, palette);
    if (!paletteColor) {
      return node;
    }
    return { ...node, style: { ...node.style, backgroundColor: paletteColor, color: getContrastTextColor(paletteColor) } };
  });
};

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
    return { ...edge };
  });
}

const conductivityUnitChangeReducer = (state: DiagramState, action: PayloadAction<string>) => {
  state.settings.conductivityUnit = action.payload;
}

const electricityCostChangeReducer = (state: DiagramState, action: PayloadAction<number>) => {
  state.settings.electricityCost = action.payload;
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
      return { ...edge };
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

      return edge;
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
  state.isDataDrawerOpen = !state.isDataDrawerOpen;
};

const toggleMenuDrawerReducer = (state: DiagramState, action?: PayloadAction<string>) => {
  state.isMenuDrawerOpen = !state.isMenuDrawerOpen;
};

const openDrawerWithSelectedReducer = (state: DiagramState, action?: PayloadAction<string>) => {
  if (!state.isDataDrawerOpen) {
    state.isDataDrawerOpen = true;
  }
  setSelectedId(state, action);
};

const selectedIdChangeReducer = (state: DiagramState, action?: PayloadAction<string>) => {
  setSelectedId(state, action);
};

const setSelectedId = (state: DiagramState, action: PayloadAction<string>) => {
  state.selectedDataId = action.payload ? action.payload : undefined;
  const componentTabs = ComponentManageDataTabs[state.nodes.find((n: Node<ProcessFlowPart>) => n.id === action.payload)?.data.processComponentType as WaterProcessComponentType];
  if (componentTabs) {
    // * is component, not edge
    state.manageDataTabs = componentTabs;
  }
};

const modalOpenChangeReducer = (state: DiagramState, action: PayloadAction<boolean>) => {
  state.isModalOpen = action.payload;
}

const diagramAlertChangeReducer = (state: DiagramState, action: PayloadAction<DiagramAlertState>) => {
  state.diagramAlert = action.payload;
}

export const diagramSlice = createSlice({
  name: 'diagram',
  initialState: getDefaultDiagramData(),
  reducers: {
    resetDiagram: resetDiagramReducer,
    recomputeNodeErrors: recomputeNodeErrorsReducer,
    diagramInitialized: diagramInitializedReducer,
    nodesChange: nodesChangeReducer,
    addNode: addNodeReducer,
    addNodes: addNodesReducer,
    updateNodeHandles: updateNodeHandlesReducer,
    sourceFlowValueChange: sourceFlowValueChangeReducer,
    totalFlowChange: totalFlowChangeReducer,
    validationWindowOpenChange: validationWindowOpenChangeReducer,
    deleteNode: deleteNodeReducer,
    setNodeName: setNodeNameReducer,
    nodeDataPropertyChange: nodeDataPropertyChangeReducer,
    setNodeStyle: setNodeStyleReducer,
    setNodeColor: setNodeColorReducer,
    setNodeFlowConfidence: setNodeFlowConfidenceReducer,
    edgesChange: edgesChangeReducer,
    edgesUpdate: edgesUpdateReducer,
    setEdgeStrokeColor: setEdgeStrokeColorReducer,
    setEdgeFlowConfidence: setEdgeFlowConfidenceReducer,
    connectEdge: connectEdgeReducer,
    deleteEdge: deleteEdgeReducer,
    keyboardDeleteNode: keyboardDeleteNodeReducer,
    focusedEdgeChange: focusedEdgeChangeReducer,
    defaultEdgeTypeChange: defaultEdgeTypeChangeReducer,
    customEdgeTypeChange: customEdgeTypeChangeReducer,
    diagramOptionsChange: diagramOptionsChangeReducer,
    unitsOfMeasureChange: unitsOfMeasureChangeReducer,
    flowDecimalPrecisionChange: flowDecimalPrecisionChangeReducer,
    showMarkerEndArrows: showMarkerEndArrowsReducer,
    distributeTotalSourceFlow: distributeTotalSourceFlowReducer,
    dischargeFlowValueChange: dischargeFlowValueChangeReducer,
    distributeTotalDischargeFlow: distributeTotalDischargeFlowReducer,
    toggleDrawer: toggleDrawerReducer,
    setDialogOpen: setDialogOpenReducer,
    conductivityUnitChange: conductivityUnitChangeReducer,
    electricityCostChange: electricityCostChangeReducer,
    modalOpenChange: modalOpenChangeReducer,
    applyEstimatedFlowResults: applyEstimatedFlowResultsReducer,
    openDrawerWithSelected: openDrawerWithSelectedReducer,
    selectedIdChange: selectedIdChangeReducer,
    diagramAlertChange: diagramAlertChangeReducer,
    toggleMenuDrawer: toggleMenuDrawerReducer,
    edgesChangeFromPropagation: edgesChangeFromPropagationReducer,
    sumTotalFlowChange: sumTotalFlowChangeReducer,
    setDiagramNotes: setDiagramNotesReducer,
    setPaletteColors: setPaletteColorsReducer,
  }
})

export const {
  nodesChange,
  recomputeNodeErrors,
  edgesChange,
  edgesUpdate,
  connectEdge,
  addNode,
  addNodes,
  setNodeName,
  deleteNode,
  keyboardDeleteNode,
  diagramInitialized,
  nodeDataPropertyChange,
  setNodeStyle,
  totalFlowChange,
  sourceFlowValueChange,
  sumTotalFlowChange,
  dischargeFlowValueChange,
  distributeTotalSourceFlow,
  distributeTotalDischargeFlow,
  validationWindowOpenChange,
  updateNodeHandles,
  deleteEdge,
  focusedEdgeChange,
  defaultEdgeTypeChange,
  customEdgeTypeChange,
  setNodeColor,
  setNodeFlowConfidence,
  setEdgeStrokeColor,
  setEdgeFlowConfidence,
  resetDiagram,
  diagramOptionsChange,
  unitsOfMeasureChange,
  flowDecimalPrecisionChange,
  applyEstimatedFlowResults,
  showMarkerEndArrows,
  toggleDrawer,
  setDialogOpen,
  modalOpenChange,
  conductivityUnitChange,
  electricityCostChange,
  openDrawerWithSelected,
  selectedIdChange,
  diagramAlertChange,
  toggleMenuDrawer,
  edgesChangeFromPropagation,
  setDiagramNotes,
  setPaletteColors,
} = diagramSlice.actions
export default diagramSlice.reducer

export type DiagramActionType = keyof typeof diagramSlice.actions;

/**
 * true = this action must trigger a `diagramFlowErrors` recompute (it changes nodes/edges/
 * settings.flowDecimalPrecision). New reducer → this object won't compile until you add it here.
 * `store.ts`'s recompute-listener matcher is derived from the `true` entries — get one wrong and
 * errors either go stale or recompute fires on high-frequency events like drag.
 */

export const RECOMPUTES_DIAGRAM_ERRORS: Record<DiagramActionType, boolean> = {
  // self-referential / already-handled inline — matching these would be redundant or circular
  recomputeNodeErrors: false, // this *is* the recompute action
  diagramInitialized: false, // recomputes inline in diagramInitializedReducer
  resetDiagram: false, // resets diagramFlowErrors to {} directly via getDefaultDiagramData

  // cosmetic — position/selection/viewport/styling, never read by checkDiagramNodeErrors
  nodesChange: false, // drag/select/dimension events fire at pointer-move frequency; node deletion is separately covered by keyboardDeleteNode
  setNodeName: false,
  setNodeStyle: false,
  setNodeColor: false,
  setNodeFlowConfidence: false, // cosmetic annotation, doesn't affect flow totals or validation
  setEdgeStrokeColor: false,
  setEdgeFlowConfidence: false, // cosmetic annotation, doesn't affect flow totals or validation
  focusedEdgeChange: false,
  defaultEdgeTypeChange: false, // edge.type/diagramOptions.edgeType are rendering-only
  customEdgeTypeChange: false,
  diagramOptionsChange: false,
  showMarkerEndArrows: false,
  toggleDrawer: false,
  setDialogOpen: false,
  modalOpenChange: false,
  conductivityUnitChange: false, // settings field unrelated to flow validation
  electricityCostChange: false, // settings field unrelated to flow validation
  diagramAlertChange: false,
  toggleMenuDrawer: false,
  setDiagramNotes: false,
  setPaletteColors: false, // node background color only
  validationWindowOpenChange: false,

  // structural — change validation inputs, must trigger recompute
  addNode: true,
  addNodes: true,
  updateNodeHandles: true,
  sourceFlowValueChange: true,
  totalFlowChange: true,
  deleteNode: true,
  nodeDataPropertyChange: true,
  edgesChange: true, // generic onEdgesChange handler — also carries edge *removal* via keyboard/selection, there is no separate keyboardDeleteEdge action
  edgesUpdate: true, // wholesale edge replace from onReconnect — changes source/target
  connectEdge: true,
  deleteEdge: true,
  keyboardDeleteNode: true,
  unitsOfMeasureChange: true, // converts flow values across nodes/edges
  flowDecimalPrecisionChange: true,
  distributeTotalSourceFlow: true,
  dischargeFlowValueChange: true,
  distributeTotalDischargeFlow: true,
  applyEstimatedFlowResults: true,
  edgesChangeFromPropagation: true,
  sumTotalFlowChange: true,

  // don't mutate validation inputs themselves, but force a recompute so errors are guaranteed
  // fresh the moment a node's forms become visible (insurance against any other stale path)
  openDrawerWithSelected: true,
  selectedIdChange: true,
};

export interface UserOptionsPayload<K extends keyof UserDiagramOptions> { optionsProp: K, updatedValue: UserDiagramOptions[K], updateDependencies?: OptionsDependentState[] };
export interface NodeDataPayload<K extends keyof ProcessFlowPart> { optionsProp: K, updatedValue: ProcessFlowPart[K] };
export interface NodeTreatmentDataPayload<K extends keyof WaterTreatment> { optionsProp: K, updatedValue: WaterTreatment[K] };

/**
 * estimated system results Object, i.e. ProcessUseResults, BoilerResults
 */
export interface EstimatedSystemPayload<K extends keyof WaterSystemResults> { systemResultProp: K, updatedValue: WaterSystemResults[K] };
export type OptionsDependentState = 'updateEdges' | 'updateEdgeProperties';


// todo 7364 - migrate save event to thunk
// pass MEASUR save method here, 
// need to check for assessment added nodes,
//  handle debouncing
export const saveDiagramState = createAsyncThunk(
  'diagram/save',
  async (_, { getState }) => {
    const diagramState = getState() as DiagramState;
    const { name, nodes, edges, diagramFlowErrors, settings, diagramOptions, calculatedData, recentNodeColors, recentEdgeColors } = diagramState;
    const userDiagramOptions = diagramOptions;
    const updatedDiagramData: FlowDiagramData = {
      name: name,
      nodes: nodes,
      diagramFlowErrors: diagramFlowErrors,
      edges: edges,
      settings,
      userDiagramOptions,
      calculatedData,
      recentNodeColors,
      recentEdgeColors,
    };
    formatDataForMEASUR(updatedDiagramData);

    // props.saveFlowDiagram(updatedDiagramData);
    // console.log('=== SAVED FlowDiagram', updatedDiagramData);
  }
);



// helpers
const getIsActiveTargetEdge = (updatedNode: Node, handleSet: Handles[keyof Handles], edgeId: string): boolean => {
  const { source, target, sourceHandle, targetHandle } = getConnectionFromEdgeId(edgeId);
  const isTargetConnection = target === updatedNode.id;
  if (isTargetConnection) {
    return target === updatedNode.id && handleSet[targetHandle];
  }
  return true;
}

const getIsActiveSourceEdge = (updatedNode: Node, handleSet: Handles[keyof Handles], edgeId: string): boolean => {
  const { source, target, sourceHandle, targetHandle } = getConnectionFromEdgeId(edgeId);
  const isSourceConnection = source === updatedNode.id;
  if (isSourceConnection) {
    return source === updatedNode.id && handleSet[sourceHandle];
  }
  return true;
}

const getAreHandlesEqual = (handleSet: Handles[keyof Handles], updatedHandleSet: Handles[keyof Handles]) => {
  const keys = new Set([...Object.keys(handleSet), ...Object.keys(updatedHandleSet)]);
  const isEqual = [...keys].every(key => handleSet[key] === updatedHandleSet[key]);
  return isEqual;
}


/**
 * Apply upgrades to outdated diagram versions, such as: adding new properties, default data, and patches to avoid runtime errors
 */
const upgradeDiagram = (diagramData: FlowDiagramData) => {
  upgradeNodeData(diagramData);
  upgradeEdgeData(diagramData);
  migrateFlowDiagramFieldNames(diagramData);

  diagramData.meta.upgrades.push({
    fromVersion: diagramData.meta.version,
    toVersion: CURRENT_DIAGRAM_VERSION,
    upgradeDate: getStoreSerializedDate(new Date()),
  });
  diagramData.meta.version = CURRENT_DIAGRAM_VERSION;
}


/**
 * Upgrade node data for backwards compatibility with diagrams from prior versions
 */
const upgradeNodeData = (diagramData: FlowDiagramData) => {
  diagramData.nodes.map((node: Node<ProcessFlowPart>) => {
    upgradeHandles(node.data);
    upgradeFlowConfidence(node.data);
    return node;
  });
}

const upgradeEdgeData = (diagramData: FlowDiagramData) => {
  diagramData.edges.map((edge: Edge<CustomEdgeData>) => {
    upgradeEdgeDescription(edge);
    return edge;
  });
}

/**
 * Stamp default estimated/metered confidence onto node total flow values for diagrams saved before
 * this feature shipped.
 */
const upgradeFlowConfidence = (nodeData: ProcessFlowPart) => {
  if (!nodeData.flowConfidence) {
    nodeData.flowConfidence = getDefaultFlowConfidence();
  }
}

/**
 * Update node data handles to include 4 additional inflow and outflow handles.
 * Version 0.1.0 Adds e,f,g,h for inflow and i,j,k,l for outflow, removes unused handles for water-intake and water-discharge nodes
 */
const upgradeHandles = (nodeData: ProcessFlowPart) => {
  const nodeType: ProcessFlowNodeType = nodeData.processComponentType;
  
  if (nodeType == 'water-intake') {
    delete nodeData.handles.inflowHandles;
  }

  if (nodeType == 'water-discharge') {
    delete nodeData.handles.outflowHandles;
  }

  const newVersionInflowProperty = nodeData.handles.inflowHandles?.hasOwnProperty('e');
  const newVersionOutflowProperty = nodeData.handles.outflowHandles?.hasOwnProperty('i');
  
  if (nodeData.handles.inflowHandles && !newVersionInflowProperty) {
    nodeData.handles.inflowHandles = {
      a: nodeData.handles.inflowHandles.a ?? true,
      b: nodeData.handles.inflowHandles.b ?? true,
      c: nodeData.handles.inflowHandles.c ?? true,
      d: nodeData.handles.inflowHandles.d ?? true,
      e: nodeData.handles.inflowHandles.e ?? false,
      f: nodeData.handles.inflowHandles.f ?? false,
      g: nodeData.handles.inflowHandles.g ?? false,
      h: nodeData.handles.inflowHandles.h ?? false,
    };
  }
  if (nodeData.handles.outflowHandles && !newVersionOutflowProperty) {
    nodeData.handles.outflowHandles = {
      e: nodeData.handles.outflowHandles.e ?? true,
      f: nodeData.handles.outflowHandles.f ?? true,
      g: nodeData.handles.outflowHandles.g ?? true,
      h: nodeData.handles.outflowHandles.h ?? true,
      i: nodeData.handles.outflowHandles.i ?? false,
      j: nodeData.handles.outflowHandles.j ?? false,
      k: nodeData.handles.outflowHandles.k ?? false,
      l: nodeData.handles.outflowHandles.l ?? false,
    };
  }
}


/**
 * Update edge data with description of connection names
 * Version 0.1.0
 */
export const upgradeEdgeDescription = (edge: Edge<CustomEdgeData>) => {
  if (!edge.data) {
    edge.data = {
      flowValue: null,
      hasOwnEdgeType: null,
      edgeDescription: getEdgeDescription(edge),
      confidence: 'estimated',
      hasManualColorOverride: hasNonDefaultStroke(edge),
    };
    return;
  }

  if (!edge.data.edgeDescription) {
    edge.data.edgeDescription = getEdgeDescription(edge);
  }
  if (edge.data.confidence === undefined) {
    edge.data.confidence = 'estimated';
  }
  if (edge.data.hasManualColorOverride === undefined) {
    edge.data.hasManualColorOverride = hasNonDefaultStroke(edge);
  }
}

/**
 * A legacy edge (saved before manual color overrides were tracked) has a user-selected stroke
 * if its saved color differs from the old default, since every edge used that default unless
 * a user picked a different color.
 */
const hasNonDefaultStroke = (edge: Edge<CustomEdgeData>): boolean => {
  const stroke = edge.style?.stroke;
  return stroke !== undefined && stroke !== DEFAULT_EDGE_STROKE_COLOR;
}