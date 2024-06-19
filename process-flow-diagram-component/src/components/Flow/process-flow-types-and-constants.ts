import { NodeTypes } from "reactflow";
import ProcessFlowComponentNode from "../Nodes/ProcessFlowComponentNode";


export const nodeTypes: NodeTypes = {
  waterIntake: ProcessFlowComponentNode,
  processUse: ProcessFlowComponentNode,
  waterDischarge: ProcessFlowComponentNode
};


