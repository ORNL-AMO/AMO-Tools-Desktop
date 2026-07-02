import { FlowDiagramData } from "../types/diagram";

/**
 * Renames the legacy `nodeErrors` field (saved by pre-rename versions of the
 * diagram) to `diagramFlowErrors`, in place. Shared by the React upgrade path
 * (`diagramReducer.ts`'s `upgradeDiagram`) and the Angular startup migration
 * (`UpdateDataService.updateWaterDiagram`) so a future field rename only has
 * to be made once.
 */
export const migrateFlowDiagramFieldNames = (flowDiagramData: FlowDiagramData): void => {
    const flowDiagramDataNew: any = flowDiagramData;
    if (flowDiagramDataNew.nodeErrors !== undefined) {
        flowDiagramDataNew.diagramFlowErrors = flowDiagramDataNew.nodeErrors;
        delete flowDiagramDataNew.nodeErrors;
    }
}
