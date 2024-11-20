import ProcessFlowComponentNode from "../Nodes/ProcessFlowComponentNode";
import SelfConnectingEdge from "../Edges/SelfConnectingEdge";
import SplitterNode from "../Nodes/SplitterNode";
import SplitterNodeFour from "../Nodes/SplitterNodeFour";
import SplitterNodeEight from "../Nodes/SplitterNodeEight";
import StraightDiagramEdge from "../Edges/StraightDiagramEdge";
import SmoothStepDiagramEdge from "../Edges/SmoothStepDiagramEdge";
import StepDiagramEdge from "../Edges/StepDiagramEdge";
import BezierDiagramEdge from "../Edges/BezierDiagramEdge";
import { EdgeTypes, NodeTypes } from "@xyflow/react";
import FlowLossNode from "../Nodes/FlowLossNode";


export const nodeTypes: NodeTypes = {
  waterIntake: ProcessFlowComponentNode,
  waterUsingSystem: ProcessFlowComponentNode,
  waterDischarge: ProcessFlowComponentNode,
  waterTreatment: ProcessFlowComponentNode,
  wasteWaterTreatment: ProcessFlowComponentNode,
  // flowLoss: ProcessFlowComponentNode,
  // custom
  // splitterNode: SplitterNode,
  splitterNodeFour: SplitterNodeFour,
  splitterNodeEight: SplitterNodeEight,
  flowLoss: FlowLossNode,
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

export interface SelectListOption {value: string, display: string}

