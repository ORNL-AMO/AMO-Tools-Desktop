import { Node } from "@xyflow/react";
import { DiagramFlowErrors, FlowDiagramData, ProcessFlowPart } from "../types/diagram";

/**
 * Renames the legacy `nodeErrors` field (saved by pre-rename versions of the
 * diagram) to `diagramFlowErrors`, in place. Shared by the React upgrade path
 * (`diagramReducer.ts`'s `upgradeDiagram`) and the Angular startup migration
 * (`UpdateDataService.updateWaterDiagram`) so a future field rename only has
 * to be made once.
 */
export const migrateFlowDiagramFieldNames = (flowDiagramData: FlowDiagramData): void => {
    const flowDiagramDataNew = flowDiagramData as FlowDiagramData & { nodeErrors?: DiagramFlowErrors };
    if (flowDiagramDataNew.nodeErrors !== undefined) {
        flowDiagramDataNew.diagramFlowErrors = flowDiagramDataNew.nodeErrors;
        delete flowDiagramDataNew.nodeErrors;
    }
}

/**
 * Clears the stored total on the side an intake (source) or discharge outlet (discharge) does not have,
 * left behind as a 0 by older versions of the diagram. Same callers as `migrateFlowDiagramFieldNames`.
 */
export const migrateInapplicableNodeTotals = (flowDiagramData: FlowDiagramData): void => {
    flowDiagramData.nodes.forEach((node: Node<ProcessFlowPart>) => {
        const userEnteredData = node.data.userEnteredData;
        if (node.data.processComponentType === 'water-intake' && userEnteredData?.totalSourceFlow !== undefined) {
            userEnteredData.totalSourceFlow = undefined;
        } else if (node.data.processComponentType === 'water-discharge' && userEnteredData?.totalDischargeFlow !== undefined) {
            userEnteredData.totalDischargeFlow = undefined;
        }
    });
}
