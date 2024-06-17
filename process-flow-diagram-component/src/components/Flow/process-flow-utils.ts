import { ProcessFlowPart, processFlowDiagramParts } from "./process-flow-types-and-constants";

export const getProcessFlowParts = () => [...processFlowDiagramParts];

export const getPropDataFromPartNode = (nodeType): ProcessFlowPart => {
    return getProcessFlowParts().find(part => part.nodeType === nodeType);
  }

export { processFlowDiagramParts };

