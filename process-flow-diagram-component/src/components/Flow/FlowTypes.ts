import ProcessFlowComponentNode from "../Nodes/ProcessFlowComponentNode";
import SelfConnectingEdge from "../Edges/SelfConnectingEdge";
import SplitterNode from "../Nodes/SplitterNode";
import SplitterNodeFour from "../Nodes/SplitterNodeFour";
import SplitterNodeEight from "../Nodes/SplitterNodeEight";
import StraightDiagramEdge from "../Edges/StraightDiagramEdge";
import SmoothStepDiagramEdge from "../Edges/SmoothStepDiagramEdge";
import StepDiagramEdge from "../Edges/StepDiagramEdge";
import BezierDiagramEdge from "../Edges/BezierDiagramEdge";
import { NodeTypes } from "@xyflow/react";


export const nodeTypes: NodeTypes = {
  waterIntake: ProcessFlowComponentNode,
  waterUsingSystem: ProcessFlowComponentNode,
  waterDischarge: ProcessFlowComponentNode,
  waterTreatment: ProcessFlowComponentNode,
  wasteWaterTreatment: ProcessFlowComponentNode,
  // custom
  // splitterNode: SplitterNode,
  splitterNodeFour: SplitterNodeFour,
  splitterNodeEight: SplitterNodeEight
};

export const edgeTypes = {
  selfconnecting: SelfConnectingEdge,
  default: BezierDiagramEdge,
  straight: StraightDiagramEdge,
  step: StepDiagramEdge,
  smoothstep: SmoothStepDiagramEdge,
};

export const edgeTypeOptions: SelectListOption[] = [
  {
    value: 'default',
    display: 'Bezier (default)',
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

export interface SelectListOption {value: string, display: string}

