import { Edge, Node } from "@xyflow/react";
import { ComponentFlowErrors, CustomEdgeData, DiagramFlowErrors, DiagramSettings, FlowErrors, FlowType, ProcessFlowPart, ValidationLevel, WaterProcessComponentType } from "../types/diagram";

export const getIsDiagramValid = (diagramFlowErrors: DiagramFlowErrors): boolean => {
    return !diagramFlowErrors || Object.keys(diagramFlowErrors).length === 0;
}

/**
   * Check accuracy of calculated or stateful total flow against each other
   * @param calculatedValue retrived from getNodeFlowTotals()
   * @param userEnteredTotalFlow componentData.userEnteredData.totalSourceFlow or componentData.userEnteredData.totalSourceFlow
   *
   * Only runs the comparison once every connected edge has a flow value entered.
   * `calculatedTotalFlow` sums missing edge values as 0 (see `checkDiagramNodeErrors`),
   * so a total flow entered before its edges are filled in would otherwise always
   * "mismatch" against that artificial 0 rather than reflect a real discrepancy.
   */
export const validateTotalFlowValue = (connectedEdges: Edge<CustomEdgeData>[], calculatedTotalFlow: number, unaccountedFlow: number, userEnteredTotalFlow: number, precision: number): boolean => {
    const allEdgesHaveFlowValues: boolean = connectedEdges.every((edge) => edge.data?.flowValue !== null && edge.data?.flowValue !== undefined);
    const shouldValidate: boolean = connectedEdges.length > 0 && allEdgesHaveFlowValues && calculatedTotalFlow !== null && calculatedTotalFlow !== undefined && userEnteredTotalFlow !== null && userEnteredTotalFlow !== undefined;
    // *If a user entered value exists, check that our calculated total does not differ with component saved value (useEnteredValue)\
    if (shouldValidate) {
        const calculatedTotalFlowToPrecision: number = Number(calculatedTotalFlow?.toFixed(precision));
        const userEnteredFlowToPrecision: number = Number(userEnteredTotalFlow?.toFixed(precision));
        if (userEnteredFlowToPrecision !== undefined && userEnteredFlowToPrecision !== null
            && userEnteredFlowToPrecision !== calculatedTotalFlowToPrecision) {
            if (unaccountedFlow !== undefined && unaccountedFlow !== null) {
                let adjustedFlowToPrecision: number;
                if (calculatedTotalFlowToPrecision < userEnteredFlowToPrecision) {
                    adjustedFlowToPrecision = Number((userEnteredFlowToPrecision - unaccountedFlow).toFixed(precision));
                } else {
                    adjustedFlowToPrecision = Number((userEnteredFlowToPrecision + unaccountedFlow).toFixed(precision));
                }
                const isAdjustedValid: boolean = adjustedFlowToPrecision === calculatedTotalFlowToPrecision;
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
export const validateKnownLosses = (sumKnownLosses: number, userEnteredKnownLoss: number): boolean => {
    if (sumKnownLosses > 0) {
        if (userEnteredKnownLoss !== undefined && userEnteredKnownLoss !== null && userEnteredKnownLoss !== sumKnownLosses) {
            return false;
        }
    }
    return true;
};


export const isValidComponent = (errors: ComponentFlowErrors): boolean => {
    const hasValidSource: boolean = errors.source?.totalFlow === undefined && errors.source?.flows?.length === 0 && errors.source?.knownLosses === undefined;
    const hasValidDischarge: boolean = errors.discharge?.totalFlow === undefined && errors.discharge?.flows?.length === 0 && errors.discharge?.knownLosses === undefined;
    return hasValidSource && hasValidDischarge;
}

export const hasValidSourceForm = (errors: ComponentFlowErrors): boolean => {
    return Boolean(errors.source);
}

export const hasValidDischargeForm = (errors: ComponentFlowErrors): boolean => {
    return Boolean(errors.discharge);
}

export const getHasErrorLevel = (errors: DiagramFlowErrors): boolean => {
    if (!errors) return false;
    return Object.entries(errors).some(([, componentErrors]: [string, ComponentFlowErrors]) => {
        return getNodeHasErrorLevel(componentErrors);
    });
}

export const getNodeHasErrorLevel = (componentErrors: ComponentFlowErrors): boolean => {
    if (!componentErrors) return false;
    return componentErrors.source?.level === 'error' || componentErrors.discharge?.level === 'error';
}

/**
   * Check if any node flow has errors or specify by type
   */
export const getHasTotalFlowError = (errors: ComponentFlowErrors, flowType?: FlowType): boolean => {
    if (!flowType) {
        return errors.source?.totalFlow !== undefined || errors.discharge?.totalFlow !== undefined;
    } else {
        return errors[flowType].totalFlow !== undefined;
    }
}

/**
   * Check if any node flow has errors or specify by type
   */
export const getHasFlowError = (errors: ComponentFlowErrors, flowType?: FlowType): boolean => {
    if (!flowType) {
        return errors.source?.flows?.length > 0 || errors.discharge?.flows?.length > 0;
    } else {
        return errors[flowType].flows?.length > 0;
    }
}


/**
 * Single shared source of truth for flow validation rules. Both the Formik
 * Yup schema (form field display) and `checkDiagramNodeErrors`
 * (`diagramFlowErrors` store) call this
 */
export interface FlowValidationInput {
    totalFlow: number | null | undefined;
    /** Edges connected to the node on the `flowDirection` side only (source or discharge), not all diagram edges. */
    edges: Edge<CustomEdgeData>[];
    calculatedTotal: number;
    unaccountedFlow: number | null | undefined;
    componentType: WaterProcessComponentType;
    flowDirection: FlowType;
    precision: number;
    sumKnownLossEdges?: number;   // discharge only — sum of Known Loss component edges
    userKnownLosses?: number;     // discharge only — node.data.userEnteredData.totalKnownLosses
}

export interface FlowValidationResult {
    totalFlowError: string | undefined;
    edgeErrors: string[];
    knownLossesError: string | undefined;
    level: ValidationLevel | undefined;
}

const isWaterUsingSystemDischarge = (componentType: WaterProcessComponentType, flowDirection: FlowType): boolean => {
    return componentType === 'water-using-system' && flowDirection === 'discharge';
}

/** WUS discharge allows 0 (>= 0); every other case requires strictly > 0. */
const getTotalFlowMinError = (totalFlow: number, isWusDischarge: boolean, flowLabel: string): string | undefined => {
    if (isWusDischarge) {
        return totalFlow < 0 ? `Total ${flowLabel} Flow must be greater than or equal to 0` : undefined;
    }
    return totalFlow <= 0 ? `Total ${flowLabel} Flow must be greater than 0` : undefined;
}

export const validateFlowSection = (input: FlowValidationInput): FlowValidationResult => {
    const { totalFlow, edges, calculatedTotal, unaccountedFlow, componentType, flowDirection, precision, sumKnownLossEdges, userKnownLosses } = input;
    const isWusDischarge: boolean = isWaterUsingSystemDischarge(componentType, flowDirection);
    const flowLabel: string = flowDirection === 'source' ? 'Source' : 'Discharge';

    let totalFlowError: string | undefined;
    if (totalFlow !== null && totalFlow !== undefined) {
        totalFlowError = getTotalFlowMinError(totalFlow, isWusDischarge, flowLabel);
        if (totalFlowError === undefined) {
            const isTotalFlowValid: boolean = validateTotalFlowValue(edges, calculatedTotal, unaccountedFlow, totalFlow, precision);
            if (!isTotalFlowValid) {
                const difference: number = Number(Math.abs(calculatedTotal - totalFlow).toFixed(precision));
                totalFlowError = `Total ${flowDirection} flow does not match calculated flow (difference: ${difference})`;
            }
        }
    }

    const edgeErrors: string[] = edges.reduce((errors: string[], edge: Edge<CustomEdgeData>) => {
        const value: number | undefined = edge.data?.flowValue;
        if (value === null || value === undefined) return errors;
        if (isWusDischarge) {
            if (value < 0) errors.push('Flow must be greater than or equal to 0');
        } else if (value <= 0) {
            errors.push('Flow must be greater than 0');
        }
        return errors;
    }, []);

    let knownLossesError: string | undefined;
    if (sumKnownLossEdges !== undefined && sumKnownLossEdges > 0) {
        const isKnownLossesValid: boolean = validateKnownLosses(sumKnownLossEdges, userKnownLosses);
        if (!isKnownLossesValid) {
            knownLossesError = `Known Losses should equal the sum of all Known Loss flows (${sumKnownLossEdges})`;
        }
    }

    let level: ValidationLevel | undefined;
    if (totalFlowError !== undefined) {
        level = 'error';
    } else if (edgeErrors.length > 0 || knownLossesError !== undefined) {
        level = 'warning';
    } else {
        level = undefined;
    }

    return { totalFlowError, edgeErrors, knownLossesError, level };
}


/**
 * Sum of flow on `selectedNodeId`'s discharge edges that end at a Known Loss
 * component; checked against `sumKnownLossEdges` in `validateFlowSection`.
 *
 * O(N) `.find()` per edge inside `checkDiagramNodeErrors`'s per-node loop —
 * worth a `diagramNodeId -> Node` map if dense diagrams make it a real cost.
 */
export const getKnownLossComponentTotals = (dischargeEdges: Edge<CustomEdgeData>[], nodes: Node<ProcessFlowPart>[], selectedNodeId: string): number => {
    return dischargeEdges.reduce((sum: number, edge: Edge<CustomEdgeData>) => {
        if (edge.source !== selectedNodeId) return sum;
        const targetNode: Node<ProcessFlowPart> | undefined = nodes.find((node: Node<ProcessFlowPart>) => node.data.diagramNodeId === edge.target);
        if (targetNode?.data.processComponentType === 'known-loss') {
            return sum + (edge.data?.flowValue ?? 0);
        }
        return sum;
    }, 0);
}

export const checkDiagramNodeErrors = (nodes: Node[], allEdges: Edge[], settings: DiagramSettings): DiagramFlowErrors => {
    let diagramFlowErrors: DiagramFlowErrors = {};
    nodes.forEach((nd: Node<ProcessFlowPart>) => {
        const componentSourceEdges: Edge[] = allEdges.filter((edge: Edge<CustomEdgeData>) => edge.target === nd.data.diagramNodeId);
        const componentDischargeEdges: Edge[] = allEdges.filter((edge: Edge<CustomEdgeData>) => edge.source === nd.data.diagramNodeId);

        // * Source errors
        const calculatedSourceFlow: number = componentSourceEdges.reduce((sum: number, e: Edge<CustomEdgeData>) => sum + (e.data?.flowValue ?? 0), 0);
        const sourceResult: FlowValidationResult = validateFlowSection({
            totalFlow: nd.data.userEnteredData.totalSourceFlow,
            edges: componentSourceEdges as Edge<CustomEdgeData>[],
            calculatedTotal: calculatedSourceFlow,
            unaccountedFlow: nd.data.userEnteredData.dischargeUnaccounted,
            componentType: nd.data.processComponentType,
            flowDirection: 'source',
            precision: settings.flowDecimalPrecision,
        });
        const sourceErrors: FlowErrors = {
            totalFlow: sourceResult.totalFlowError,
            flows: sourceResult.edgeErrors,
            knownLosses: sourceResult.knownLossesError,
            level: sourceResult.level,
        };
        const sourceErrorsExist: boolean = getFlowTypeErrorsExist(sourceErrors);
        if (sourceErrorsExist) {
            setFlowErrors(diagramFlowErrors, nd.id, 'source', sourceErrors);
        } else if (diagramFlowErrors[nd.id]) {
            removeFlowErrors(diagramFlowErrors, nd.id, 'source');
        }

        // * Discharge errors
        const calculatedDischargeFlow: number = componentDischargeEdges.reduce((sum: number, e: Edge<CustomEdgeData>) => sum + (e.data?.flowValue ?? 0), 0);
        const sumKnownLossEdges: number = getKnownLossComponentTotals(componentDischargeEdges as Edge<CustomEdgeData>[], nodes as Node<ProcessFlowPart>[], nd.data.diagramNodeId);
        const dischargeResult: FlowValidationResult = validateFlowSection({
            totalFlow: nd.data.userEnteredData.totalDischargeFlow,
            edges: componentDischargeEdges as Edge<CustomEdgeData>[],
            calculatedTotal: calculatedDischargeFlow,
            unaccountedFlow: nd.data.userEnteredData.intakeUnaccounted,
            componentType: nd.data.processComponentType,
            flowDirection: 'discharge',
            precision: settings.flowDecimalPrecision,
            sumKnownLossEdges,
            userKnownLosses: nd.data.userEnteredData.totalKnownLosses,
        });
        const dischargeErrors: FlowErrors = {
            totalFlow: dischargeResult.totalFlowError,
            flows: dischargeResult.edgeErrors,
            knownLosses: dischargeResult.knownLossesError,
            level: dischargeResult.level,
        };
        const dischargeErrorsExist: boolean = getFlowTypeErrorsExist(dischargeErrors);
        if (dischargeErrorsExist) {
            setFlowErrors(diagramFlowErrors, nd.id, 'discharge', dischargeErrors);
        } else if (diagramFlowErrors[nd.id]) {
            removeFlowErrors(diagramFlowErrors, nd.id, 'discharge');
        }
    });

    return diagramFlowErrors;
}


const getFlowTypeErrorsExist = (flowErrors: FlowErrors): boolean => {
    return Object.entries(flowErrors).some(([, value]: [string, FlowErrors[keyof FlowErrors]]) => {
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        return value !== undefined;
    });
}

const setFlowErrors = (diagramFlowErrors: DiagramFlowErrors, nodeId: string, flowType: FlowType, errors: FlowErrors): void => {
    if (diagramFlowErrors[nodeId]) {
        diagramFlowErrors[nodeId][flowType] = errors;
    } else {
        diagramFlowErrors[nodeId] = {
            [flowType]: errors
        }
    }
}

const removeFlowErrors = (diagramFlowErrors: DiagramFlowErrors, nodeId: string, flowType: FlowType): void => {
    delete diagramFlowErrors[nodeId][flowType];
    if (Object.entries(diagramFlowErrors[nodeId]).every(([, value]: [string, ComponentFlowErrors[keyof ComponentFlowErrors]]) => value === undefined)) {
        delete diagramFlowErrors[nodeId];
    }
}


