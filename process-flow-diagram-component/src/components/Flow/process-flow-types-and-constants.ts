import { NodeTypes } from "reactflow";
import ProcessFlowPartNode from "../Nodes/ProcessFlowPartNode";
import { ProcessFlowPart } from "../../../../src/process-flow-types/shared-process-flow-types";


export const nodeTypes: NodeTypes = {
  waterIntake: ProcessFlowPartNode,
  processUse: ProcessFlowPartNode,
  waterDischarge: ProcessFlowPartNode
};


// * Assign innate behaviors and context for Diagram parts
export const processFlowDiagramParts: ProcessFlowPart[] = [
  {
    nodeType: "waterIntake",
    defaultLabel: 'Water Intake',
    className: 'water-intake'
  },
  {
    nodeType: "processUse",
    defaultLabel: 'Process Use',
    className: 'process-use'
  },
  {
    nodeType: "waterDischarge",
    defaultLabel: 'Water Discharge',
    className: 'water-discharge'
  }
];

export type { ProcessFlowPart };

