import { configureStore } from '@reduxjs/toolkit'
import diagramReducer, { DiagramState } from './diagramReducer'
import { DiagramSettings, FlowDiagramData, ProcessFlowPart, UserDiagramOptions } from '../../../../src/process-flow-types/shared-process-flow-types';
import { Node } from '@xyflow/react';
import { DiagramProps } from './Diagram';


export function configureAppStore(diagramProps: DiagramProps) {
  const diagramData: FlowDiagramData = diagramProps.processDiagram?.flowDiagramData;

  let initialState: { diagram: DiagramState } = {
    diagram: getResetData()
  };

  if (diagramData) {
    initialState = {
      diagram: {
        nodes: diagramData.nodes.filter((node: Node<ProcessFlowPart>) => {
          if (node.position) {
            return node;
          }
        }),
        edges: diagramData.edges,
        diagramOptions: diagramData.userDiagramOptions ? diagramData.userDiagramOptions : getDefaultUserDiagramOptions(),
        settings: diagramData.settings ? diagramData.settings : getDefaultSettings(),
        calculatedData: diagramData.calculatedData ? diagramData.calculatedData : {},
        recentNodeColors: diagramData.recentNodeColors.length !== 0 ? diagramData.recentNodeColors : getDefaultColorPalette(),
        recentEdgeColors: diagramData.recentEdgeColors.length !== 0 ? diagramData.recentEdgeColors : getDefaultColorPalette(),
        isDrawerOpen: false,
        selectedDataId: undefined,
        diagramParentDimensions: diagramProps.parentContainer,
        isDialogOpen: false,
        assessmentId: diagramProps.processDiagram?.assessmentId
      }
    }
  }

  const store = configureStore({
    reducer: { diagram: diagramReducer },
    preloadedState: initialState
  });

  return store;
}

export type AppStore = ReturnType<typeof configureAppStore>
// Infer the type of `store`
export type RootState = ReturnType<AppStore['getState']>
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore['dispatch']

// * memoize selectors only if deriving results (returning new references, i.e. .map())
// * may also use globalized selectors
export const selectIsDrawerOpen = (state: RootState) => state.diagram.isDrawerOpen;
export const selectHasAssessment = (state: RootState) => state.diagram.assessmentId !== undefined;


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
  return ['#75a1ff', '#7f7fff', '#00bbff', '#009386', '#e28000'];
}

export const getResetData = (currentState?: DiagramState): DiagramState => {  
  return {
      nodes: [],
      edges: [],
      settings: getDefaultSettings(),
      diagramOptions: getDefaultUserDiagramOptions(),
      isDrawerOpen: false,
      selectedDataId: undefined,
      calculatedData: {},
      recentEdgeColors: getDefaultColorPalette(),
      recentNodeColors: getDefaultColorPalette(),
      diagramParentDimensions: currentState?.diagramParentDimensions,
      isDialogOpen: false,
      assessmentId: undefined
    }
}