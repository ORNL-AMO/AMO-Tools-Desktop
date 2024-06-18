import { NodeTypes } from "reactflow";
import { ProcessFlowPart } from "../../../../src/process-flow-types/shared-process-flow-types";
import ProcessFlowComponentNode from "../Nodes/ProcessFlowComponentNode";


export const nodeTypes: NodeTypes = {
  waterIntake: ProcessFlowComponentNode,
  processUse: ProcessFlowComponentNode,
  waterDischarge: ProcessFlowComponentNode
};


// * Assign innate behaviors and context for Diagram parts
export const processFlowDiagramParts: ProcessFlowPart[] = [
  {
    processComponentType: "waterIntake",
    name: 'Water Intake',
    className: 'water-intake',
    isValid: true,
  },
  {
    processComponentType: "processUse",
    name: 'Process Use',
    className: 'process-use',
    isValid: true,
  },
  {
    processComponentType: "waterDischarge",
    name: 'Water Discharge',
    className: 'water-discharge',
    isValid: true,
  }
];

export type { ProcessFlowPart };

