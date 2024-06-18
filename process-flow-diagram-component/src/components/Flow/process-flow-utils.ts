import { getNewIdString } from "../../utils";
import { ProcessFlowPart, processFlowDiagramParts } from "./process-flow-types-and-constants";


// todo 6875 shared to process-flow-diagram-component parent
export const getNewProcessComponent = (processComponentType): ProcessFlowPart => {
  let diagramComponent: ProcessFlowPart = processFlowDiagramParts.find(part => part.processComponentType === processComponentType);
  let newProcessComponent = {
    processComponentType: diagramComponent.processComponentType,
    name: diagramComponent.name,
    className: diagramComponent.className,
    isValid: diagramComponent.isValid,
    diagramNodeId: getNewNodeId(),
    modifiedDate: new Date()
  };

  return newProcessComponent;
  }

// todo 6875 shared to process-flow-diagram-component parent
export const getNewNodeId = () => {
  let nodeId = `dndnode_${getNewIdString()}`;
  return nodeId;
}

export { processFlowDiagramParts };

