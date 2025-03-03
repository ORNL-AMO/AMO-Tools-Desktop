import { FlowType, NodeErrors, NodeFlowTypeErrors } from "../../../src/process-flow-types/shared-process-flow-types";
import * as Yup from 'yup';

export const getDefaultFlowValidationSchema = (flowLabel: 'Source' | 'Discharge', totalCalculatedFlow: number): Yup.ObjectSchema<FlowForm> => {
    // const totalFlowField = `total${flowLabel}Flow`;
    let validationSchema = Yup.object({
        totalFlow: Yup.number()
            .nullable()
            .moreThan(0, `Total ${flowLabel} Flow must be greater than 0`)
            .test('sum-differs',
                (d) => {
                    return `Total ${flowLabel} Flow must equal the sum of all flow values`
                },
                (value) => {
                    const isValid = validateTotalFlowValue(totalCalculatedFlow, value)
                    return isValid;
                },
            ),
        flows: Yup.array().of(Yup.number()
            .nullable()
            .moreThan(0, `Flow must be greater than 0`)
        ),
    })
    return validationSchema;
}

/**
   * Check accuracy of calculated or stateful total flow against each other
   * @param calculatedValue retrived from getNodeFlowTotals()
   * @param userEnteredTotalFlow componentData.userEnteredData.totalSourceFlow or componentData.userEnteredData.totalSourceFlow 
   */
export const validateTotalFlowValue = (calculatedTotalFlow: number, userEnteredTotalFlow: number) => {
    let hasFlows = calculatedTotalFlow !== null && calculatedTotalFlow !== undefined;
    // *If a user entered value exists, check that our calculated total does not differ with component saved value (useEnteredValue)
    if (hasFlows) {
        // console.log(`## validate totalFlow computed: ${calculatedTotalFlow} vs userEntered: ${userEnteredTotalFlow}`);
        if (userEnteredTotalFlow !== undefined && userEnteredTotalFlow !== null && userEnteredTotalFlow !== calculatedTotalFlow) {
            // console.log('## totalFlow invalid');
            return false;
        }
    }
    // console.log('## totalFlow valid');
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

export const getIsDiagramValid = (nodeErrors: NodeErrors) => {
    return !nodeErrors || Object.keys(nodeErrors).length === 0;
}


export type FlowForm = { totalFlow: number | null, flows: (number | null)[] };



// export const getInitialDiagramValidation = (flowDiagramData: FlowDiagramData, allEdges: Edge[]): DiagramValidation => {
//     let diagramValidation: DiagramValidation = { nodes: {}};

//     flowDiagramData.nodes.forEach((nd: Node<ProcessFlowPart>) => {
//         const componentSourceEdges = allEdges.filter((edge: Edge<CustomEdgeData>) => edge.target === nd.data.diagramNodeId);
//         const componentDischargeEdges = allEdges.filter((edge: Edge<CustomEdgeData>) => edge.source === nd.data.diagramNodeId);
//         const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(componentSourceEdges.concat(componentDischargeEdges), flowDiagramData.nodes, nd.data.diagramNodeId);
//         let sourceValidation: ComponentFlowValidation = {totalFlowValueDifferent: undefined, flowValues: {}, status: 'VALID'};
//         // sourceValidation.totalFlowValueDifferent = validateTotalFlowValue(totalCalculatedSourceFlow, nd.data.userEnteredData.totalSourceFlow, nd.data.userEnteredData.totalSourceFlow);
//          componentSourceEdges.map((edge: Edge<CustomEdgeData>) => {
//              const validationMessage = validateFlowValue(edge.data.flowValue);
//              sourceValidation.status = validationMessage? 'warning' : sourceValidation.status;
//              sourceValidation.flowValues = {
//                  ...sourceValidation.flowValues,
//                  [edge.id]: {
//                      flowValueGreaterThan: validationMessage,
//                  }
//              }
//          });

//         let dischargeFlowValidation: ComponentFlowValidation = {totalFlowValueDifferent: undefined, flowValues: {}, status: 'VALID'};
//         // dischargeFlowValidation.totalFlowValueDifferent = validateTotalFlowValue(totalCalculatedDischargeFlow, nd.data.userEnteredData.totalDischargeFlow, nd.data.userEnteredData.totalDischargeFlow);
//         componentDischargeEdges.map((edge: Edge<CustomEdgeData>) => {
//              const validationMessage = validateFlowValue(edge.data.flowValue);
//              dischargeFlowValidation.status = validationMessage? 'warning' : dischargeFlowValidation.status;
//              dischargeFlowValidation.flowValues = {
//                  ...dischargeFlowValidation.flowValues,
//                  [edge.id]: {
//                      flowValueGreaterThan: validationMessage,
//                  }
//              }
//          });


//         diagramValidation.nodes[nd.data.diagramNodeId] = {
//             status: getComponentValidStatus(sourceValidation, dischargeFlowValidation),
//             source: sourceValidation,
//             discharge: dischargeFlowValidation,
//         }
//     });

//     return diagramValidation;
// }