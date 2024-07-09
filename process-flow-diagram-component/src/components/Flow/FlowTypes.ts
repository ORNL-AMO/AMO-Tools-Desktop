import { NodeTypes } from "reactflow";
import ProcessFlowComponentNode from "../Nodes/ProcessFlowComponentNode";
import SelfConnectingEdge from "../Edges/SelfConnectingEdge";
import SplitterNode from "../Nodes/SplitterNode";
import SplitterNodeFour from "../Nodes/SplitterNodeFour";
import SplitterNodeEight from "../Nodes/SplitterNodeEight";


export const nodeTypes: NodeTypes = {
  waterIntake: ProcessFlowComponentNode,
  waterUsingSystem: ProcessFlowComponentNode,
  waterDischarge: ProcessFlowComponentNode,
  splitterNode: SplitterNode,
  splitterNodeFour: SplitterNodeFour,
  splitterNodeEight: SplitterNodeEight
};

export const edgeTypes = {
  selfconnecting: SelfConnectingEdge,
};


