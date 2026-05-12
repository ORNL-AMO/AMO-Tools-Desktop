import { Edge, Node } from "@xyflow/react";
import { CustomEdgeData, DiagramCalculatedData, DiagramSettings, FlowErrors, FlowType, NodeErrors, NodeFlowTypeErrors, ProcessFlowPart, WaterProcessComponentType } from "../types/diagram";
import { getNodeEstimatedUnknownLosses } from "./results";
import { WaterUsingSystem } from "../types/water-components";
import { getNodeTotalFlow } from "./utils";

export const TOTAL_SOURCE_FLOW_GREATER_THAN_ERROR = `Total Source Flow must be greater than 0`;
export const TOTAL_DISCHARGE_FLOW_GREATER_THAN_ERROR = `Total Discharge Flow must be greater than 0`;
export const TOTAL_DISCHARGE_FLOW_GREATER_THAN_OR_EQUAL_TO_ZERO_ERROR = `Total Discharge Flow must be greater than or equal to 0`;
export const CONNECTED_FLOW_GREATER_THAN_ERROR = `Flow must be greater than 0`;
export const CONNECTED_FLOW_GREATER_THAN_OR_EQUAL_TO_ZERO_ERROR = `Flow must be greater than or equal to 0`;
export const ESTIMATED_UNKNOWN_LOSS_LABEL = `Estimated Unknown Loss`;
export const SYSTEM_IMBALANCE_LABEL = `System Imbalance`;

export const getIsDiagramValid = (nodeErrors: NodeErrors) => {
    return !nodeErrors || Object.keys(nodeErrors).length === 0;
}

/**
   * Check accuracy of calculated or stateful total flow against each other
   * @param calculatedValue retrived from getNodeFlowTotals()
   * @param userEnteredTotalFlow componentData.userEnteredData.totalSourceFlow or componentData.userEnteredData.totalSourceFlow 
   */
export const validateTotalFlowValue = (connectedEdges: Edge[], calculatedTotalFlow: number, unaccountedFlow: number, userEnteredTotalFlow: number, precision: number) => {
    let shouldValidate = connectedEdges.length > 0 && calculatedTotalFlow !== null && calculatedTotalFlow !== undefined && userEnteredTotalFlow !== null && userEnteredTotalFlow !== undefined;
    // *If a user entered value exists, check that our calculated total does not differ with component saved value (useEnteredValue)\
    if (shouldValidate) {
        // console.log(`## validate totalFlow computed: ${calculatedTotalFlow} vs userEntered: ${userEnteredTotalFlow}`);
        const calculatedTotalFlowToPrecision = Number(calculatedTotalFlow?.toFixed(precision));
        const userEnteredFlowToPrecision = Number(userEnteredTotalFlow?.toFixed(precision));
        if (userEnteredFlowToPrecision !== undefined && userEnteredFlowToPrecision !== null
            && userEnteredFlowToPrecision !== calculatedTotalFlowToPrecision) {
            if (unaccountedFlow !== undefined && unaccountedFlow !== null) {
                let adjustedFlowToPrecision;
                if (calculatedTotalFlowToPrecision < userEnteredFlowToPrecision) {
                    adjustedFlowToPrecision = Number((userEnteredFlowToPrecision - unaccountedFlow).toFixed(precision));
                } else {
                    adjustedFlowToPrecision = Number((userEnteredFlowToPrecision + unaccountedFlow).toFixed(precision));
                }
                const isAdjustedValid = adjustedFlowToPrecision === calculatedTotalFlowToPrecision;
                return isAdjustedValid;
            }
            return false;
        }
    }
    return true;
};

/**
   * Users can enter total known losses as input, or construct them from diagram components. Ensure they match
   * @param sumKnownLosses sum of user placed Known Loss components on diagram (Known Loss Flows)
   * @param userEnteredKnownLoss 
   */
export const validateKnownLosses = (sumKnownLosses: number, userEnteredKnownLoss: number) => {
    if (sumKnownLosses > 0) {
        if (userEnteredKnownLoss !== undefined && userEnteredKnownLoss !== null && userEnteredKnownLoss !== sumKnownLosses) {
            return false;
        }
    }
    return true;
};


export const validateFlowValue = (value: number | null) => {
    let validationMessage = "";
    if (value === null || value === undefined || value <= 0) {
        validationMessage = "Flow value must be greater than 0";
    }
    return validationMessage;
};



export const isValidComponent = (errors: NodeFlowTypeErrors) => {
    const hasValidSource = errors.source?.totalFlow === undefined && errors.source?.flows?.length === 0;
    const hasValidDischarge = errors.discharge?.totalFlow === undefined && errors.discharge?.flows?.length === 0;
    return hasValidSource && hasValidDischarge;
}

export const hasValidSourceForm = (errors: NodeFlowTypeErrors) => {
    return Boolean(errors.source);
}

export const hasValidDischargeForm = (errors: NodeFlowTypeErrors) => {
    return Boolean(errors.discharge);
}

export const getHasErrorLevel = (errors: NodeErrors) => {
    return errors && Object.entries(errors as NodeErrors).some(([, errors]) => {
        return getNodeHasErrorLevel(errors);
    });
}

export const getNodeHasErrorLevel = (nodeErrors: NodeFlowTypeErrors) => {
     if (!nodeErrors) return false;
    return nodeErrors.source?.level === 'error' || nodeErrors.discharge?.level === 'error';
}

/**
   * Check if any node flow has errors or specify by type
   */
export const getHasTotalFlowError = (errors: NodeFlowTypeErrors, flowType?: FlowType) => {
    if (!flowType) {
        return errors.source?.totalFlow !== undefined || errors.discharge?.totalFlow !== undefined;
    } else {
        return errors[flowType].totalFlow !== undefined;
    }
}

/**
   * Check if any node flow has errors or specify by type
   */
export const getHasFlowError = (errors: NodeFlowTypeErrors, flowType?: FlowType) => {
    if (!flowType) {
        return errors.source?.flows?.length > 0 || errors.discharge?.flows?.length > 0;
    } else {
        return errors[flowType].flows?.length > 0;
    }
}

export const getHasUnknownLossWarning = (errors: NodeFlowTypeErrors): boolean => {
    return errors?.unknownLoss !== undefined;
}


export const checkDiagramNodeErrors = (nodes: Node[], allEdges: Edge[], settings: DiagramSettings, calculatedData: DiagramCalculatedData): NodeErrors => {
    let diagramNodeErrors: NodeErrors = {};
    nodes.forEach((nd: Node<ProcessFlowPart>) => {
        const { userEnteredData, diagramNodeId } = nd.data;
        const sourceEdges = allEdges.filter((edge: Edge<CustomEdgeData>) => edge.target === diagramNodeId) as Edge<CustomEdgeData>[];
        const dischargeEdges = allEdges.filter((edge: Edge<CustomEdgeData>) => edge.source === diagramNodeId) as Edge<CustomEdgeData>[];

        validateFlowType(diagramNodeErrors, nd.id, 'source', sourceEdges, userEnteredData.dischargeUnaccounted, userEnteredData.totalSourceFlow, settings.flowDecimalPrecision);
        validateFlowType(diagramNodeErrors, nd.id, 'discharge', dischargeEdges, userEnteredData.intakeUnaccounted, userEnteredData.totalDischargeFlow, settings.flowDecimalPrecision);

        // * Unknown loss warning (water-using-system, water-treatment, waste-water-treatment only)
        const unknownLossTypes: WaterProcessComponentType[] = ['water-using-system', 'water-treatment', 'waste-water-treatment'];
        if (unknownLossTypes.includes(nd.data.processComponentType as WaterProcessComponentType)) {
            const totalSourceFlow = getNodeTotalFlow('totalSourceFlow', nd, calculatedData.nodes[nd.id]);
            const totalDischargeFlow = getNodeTotalFlow('totalDischargeFlow', nd, calculatedData.nodes[nd.id]);
            const totalUnknownLoss = getNodeEstimatedUnknownLosses(nd.data as WaterUsingSystem, totalSourceFlow, totalDischargeFlow);

            if (totalUnknownLoss !== 0) {
                if (!diagramNodeErrors[nd.id]) {
                    diagramNodeErrors[nd.id] = {};
                }
                diagramNodeErrors[nd.id].unknownLoss = {
                    message: totalUnknownLoss < 0 ? SYSTEM_IMBALANCE_LABEL : ESTIMATED_UNKNOWN_LOSS_LABEL,
                    value: totalUnknownLoss,
                    level: 'warning'
                };
            } else if (diagramNodeErrors[nd.id]?.unknownLoss) {
                delete diagramNodeErrors[nd.id].unknownLoss;
            }
        }
    });

    console.log('diagramNodeErrors', diagramNodeErrors);
    return diagramNodeErrors;
}

const validateFlowType = (
    diagramNodeErrors: NodeErrors,
    nodeId: string,
    flowType: FlowType,
    edges: Edge<CustomEdgeData>[],
    unaccountedFlow: number,
    userEnteredTotalFlow: number,
    precision: number
) => {
    const flowErrors: FlowErrors = { level: undefined, totalFlow: undefined, flows: [] };
    const calculatedFlow = edges.reduce((sum, e: Edge<CustomEdgeData>) => sum + (e.data?.flowValue ?? 0), 0);
    const isTotalValid = validateTotalFlowValue(edges, calculatedFlow, unaccountedFlow, userEnteredTotalFlow, precision);

    edges.forEach((edge: Edge<CustomEdgeData>) => {
        const validationMessage = validateFlowValue(edge.data.flowValue);
        if (validationMessage) {
            flowErrors.flows.push(validationMessage);
        }
    });

    flowErrors.totalFlow = !isTotalValid ? `Total ${flowType} flow does not match calculated flow` : undefined;
    flowErrors.level = !isTotalValid ? 'error' : flowErrors.flows.length > 0 ? 'warning' : undefined;

    if (getFlowTypeErrorsExist(flowErrors)) {
        setFlowErrors(diagramNodeErrors, nodeId, flowType, flowErrors);
    } else if (diagramNodeErrors[nodeId]) {
        removeFlowErrors(diagramNodeErrors, nodeId, flowType);
    }
}


const getFlowTypeErrorsExist = (flowErrors: FlowErrors) => {
    return Object.entries(flowErrors).some(([, value]) => {
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        return value !== undefined;
    });
}

const setFlowErrors = (nodeErrors: NodeErrors, nodeId: string, flowType: FlowType, errors: FlowErrors) => {
    if (nodeErrors[nodeId]) {
        nodeErrors[nodeId][flowType] = errors;
    } else {
        nodeErrors[nodeId] = {
            [flowType]: errors
        }
    }
}

const removeFlowErrors = (nodeErrors: NodeErrors, nodeId: string, flowType: FlowType) => {
    delete nodeErrors[nodeId][flowType];
    if (Object.entries(nodeErrors[nodeId]).every(([, value]) => value === undefined)) {
        delete nodeErrors[nodeId];
    }
}


