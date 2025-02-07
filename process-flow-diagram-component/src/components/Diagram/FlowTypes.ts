import ProcessFlowComponentNode from "../Nodes/ProcessFlowComponentNode";
import SelfConnectingEdge from "../Edges/SelfConnectingEdge";
import SplitterNodeFour from "../Nodes/SplitterNodeFour";
import SplitterNodeEight from "../Nodes/SplitterNodeEight";
import StraightDiagramEdge from "../Edges/StraightDiagramEdge";
import SmoothStepDiagramEdge from "../Edges/SmoothStepDiagramEdge";
import StepDiagramEdge from "../Edges/StepDiagramEdge";
import BezierDiagramEdge from "../Edges/BezierDiagramEdge";
import { EdgeTypes, NodeTypes } from "@xyflow/react";
import KnownLossNode from "../Nodes/KnownLossNode";
import { ParentContainerDimensions, UserDiagramOptions, DiagramSettings, NodeCalculatedData } from "../../../../src/process-flow-types/shared-process-flow-types";


export interface DiagramContext {
  diagramParentDimensions: ParentContainerDimensions,
  userDiagramOptions: UserDiagramOptions;
  settings: DiagramSettings,
  // diagramValidation: DiagramValidation,
  // setDiagramValidation: React.Dispatch<React.SetStateAction<DiagramValidation>>; 
  nodeCalculatedDataMap: Record<string, NodeCalculatedData>;
  setNodeCalculatedData: React.Dispatch<Record<string, NodeCalculatedData>>;
  setRecentNodeColors: React.Dispatch<React.SetStateAction<string[]>>;
  setRecentEdgeColors: React.Dispatch<React.SetStateAction<string[]>>;
  recentNodeColors: string[];
  recentEdgeColors: string[];
  setManageDataId: (id: string) => void;
  setIsDataDrawerOpen: (isOpen: boolean) => void;
}

export interface UserDiagramOptionsHandlers {
  handleMinimapVisible: (enabled: boolean) => void;
  handleShowMarkerEndArrows: (enabled: boolean) => void;
  handleControlsVisible: (enabled: boolean) => void;
  handleShowFlowValues: (enabled: boolean) => void;
  handleEdgeTypeChange: (edgeTypeOption: string) => void;
  handleEdgeOptionsChange: (edgeOptions: any) => void;
  handleEdgeThicknessChange: (event: Event, edgeThickness: number) => void;
  handleFlowLabelSizeChange: (event: Event, flowLabelSize: number) => void;
  handleFlowDecimalPrecisionChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleUnitsOfMeasureChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const nodeTypes: NodeTypes = {
  waterIntake: ProcessFlowComponentNode,
  waterUsingSystem: ProcessFlowComponentNode,
  waterDischarge: ProcessFlowComponentNode,
  waterTreatment: ProcessFlowComponentNode,
  wasteWaterTreatment: ProcessFlowComponentNode,
  splitterNodeFour: SplitterNodeFour,
  splitterNodeEight: SplitterNodeEight,
  knownLoss: KnownLossNode,
};

export const edgeTypes: EdgeTypes = {
  selfconnecting: SelfConnectingEdge,
  default: BezierDiagramEdge,
  bezier: BezierDiagramEdge,
  straight: StraightDiagramEdge,
  step: StepDiagramEdge,
  smoothstep: SmoothStepDiagramEdge,
};

export const edgeTypeOptions: SelectListOption[] = [
  {
    value: 'bezier',
    display: 'Curve',
  },
  {
    value: 'straight',
    display: 'Straight',
  },
  {
    value: 'step',
    display: 'Step',
  },
  {
    value: 'smoothstep',
    display: 'Smooth Step',
  }
]

export interface SelectListOption {value: string | number, display: string}

