import { Edge, Node } from "@xyflow/react";
import { CustomEdgeData, DiagramCalculatedData, DiagramSettings, FlowErrors, FlowType, NodeErrors, NodeFlowTypeErrors, ProcessFlowPart } from "../types/diagram";
import { getTotalInflow, getTotalOutflow } from "./results";

export const getIsDiagramValid = (nodeErrors: NodeErrors) => {
    return !nodeErrors || Object.keys(nodeErrors).length === 0;
}

/**
   * Check accuracy of calculated or stateful total flow against each other
   * @param calculatedValue retrived from getNodeFlowTotals()
   * @param userEnteredTotalFlow componentData.userEnteredData.totalSourceFlow or componentData.userEnteredData.totalSourceFlow 
   */
export const validateTotalFlowValue = (connectedEdges: Edge[], calculatedTotalFlow: number, userEnteredTotalFlow: number, precision: number) => {
    let shouldValidate = connectedEdges.length > 0 && calculatedTotalFlow !== null && calculatedTotalFlow !== undefined && userEnteredTotalFlow !== null && userEnteredTotalFlow !== undefined;
    // *If a user entered value exists, check that our calculated total does not differ with component saved value (useEnteredValue)\
    if (shouldValidate) {
        // console.log(`## validate totalFlow computed: ${calculatedTotalFlow} vs userEntered: ${userEnteredTotalFlow}`);
        const calculatedTotalFlowToPrecision = Number(calculatedTotalFlow?.toFixed(precision));
        const userEnteredFlowToPrecision = Number(userEnteredTotalFlow?.toFixed(precision));
        if (userEnteredFlowToPrecision !== undefined && userEnteredFlowToPrecision !== null && userEnteredFlowToPrecision !== calculatedTotalFlowToPrecision) {
            // console.log('## totalFlow invalid');
            return false;
        }
    }
    // console.log('## totalFlow valid');
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
        return errors.source?.level === 'error' || errors.discharge?.level === 'error';
    });
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


export const checkDiagramNodeErrors = (nodes: Node[], allEdges: Edge[], calculatedData: DiagramCalculatedData, settings: DiagramSettings): NodeErrors => {
    let diagramNodeErrors: NodeErrors = {};
    console.time('checkDiagramNodeErrors');
    nodes.forEach((nd: Node<ProcessFlowPart>) => {
        const componentSourceEdges = allEdges.filter((edge: Edge<CustomEdgeData>) => edge.target === nd.data.diagramNodeId);
        const componentDischargeEdges = allEdges.filter((edge: Edge<CustomEdgeData>) => edge.source === nd.data.diagramNodeId);
        let flowErrors: NodeFlowTypeErrors = {
            source: {
                level: undefined,
                totalFlow: undefined,
                flows: []
            },
            discharge: {
                level: undefined,
                totalFlow: undefined,
                flows: []
            }
        };

        // * Source errors
        const totalSourceFlow = getTotalInflow(nd, calculatedData);
        const isTotalFlowValid = validateTotalFlowValue(componentSourceEdges, totalSourceFlow, nd.data.userEnteredData.totalSourceFlow, settings.flowDecimalPrecision);
        componentSourceEdges.map((edge: Edge<CustomEdgeData>) => {
            const validationMessage = validateFlowValue(edge.data.flowValue);
            flowErrors.source.flows.push(validationMessage);
        });
        flowErrors.source.level = !isTotalFlowValid ? 'error' : flowErrors.source.flows?.length > 0 ? 'warning' : undefined;
        const sourceErrorsExist: boolean = getFlowTypeErrorsExist(flowErrors.source);
        if (sourceErrorsExist) {
            setFlowErrors(diagramNodeErrors, nd.id, 'source', flowErrors.source);
        } else if (diagramNodeErrors[nd.id]) {
            removeFlowErrors(diagramNodeErrors, nd.id, 'source');
        }

        // * Discharge errors
        const totalDischargeFlow = getTotalOutflow(nd, calculatedData);
        const isTotalDischargeValid = validateTotalFlowValue(componentDischargeEdges, totalDischargeFlow, nd.data.userEnteredData.totalDischargeFlow, settings.flowDecimalPrecision);
        componentDischargeEdges.map((edge: Edge<CustomEdgeData>) => {
            const validationMessage = validateFlowValue(edge.data.flowValue);
            flowErrors.discharge.flows.push(validationMessage);
        });
        flowErrors.discharge.level = !isTotalDischargeValid ? 'error' : flowErrors.discharge.flows?.length > 0 ? 'warning' : undefined;
        const dischargeErrorsExist: boolean = getFlowTypeErrorsExist(flowErrors.discharge);
        if (dischargeErrorsExist) {
            setFlowErrors(diagramNodeErrors, nd.id, 'discharge', flowErrors.discharge);
        } else if (diagramNodeErrors[nd.id]) {
            removeFlowErrors(diagramNodeErrors, nd.id, 'discharge');
        }
    });

    console.timeEnd('checkDiagramNodeErrors');
    return diagramNodeErrors;
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


