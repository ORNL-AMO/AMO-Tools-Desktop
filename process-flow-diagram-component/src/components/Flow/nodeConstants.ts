import { NodeTypes } from "reactflow";
import CustomNode from "../CustomNode/CustomNode";

export const nodeTypes: NodeTypes = {
    waterIntake: CustomNode,
    processUse: CustomNode,
    waterDischarge: CustomNode
};

export const nodeDefaultLabels: { [id: string]: string; } = {
    waterIntake: 'Water Intake',
    processUse: 'Process Use',
    waterDischarge: 'Water Discharge'
};
  