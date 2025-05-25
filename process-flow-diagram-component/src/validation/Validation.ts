import { Edge } from "@xyflow/react";
import { FlowType, NodeErrors, NodeFlowTypeErrors } from "process-flow-lib";
import * as Yup from 'yup';
export const TOTAL_SOURCE_FLOW_GREATER_THAN_ERROR = `Total Source Flow must be greater than 0`;
export const TOTAL_DISCHARGE_FLOW_GREATER_THAN_ERROR = `Total Discharge Flow must be greater than 0`;

const getSystemNumberFieldValidation = (fieldLabel: string) => Yup.number()
    .nullable()
    .required(`${fieldLabel} is required`)
    .moreThan(0, (d) => {
        return `${fieldLabel} must be greater than 0`;
    });

const getSystemStringFieldValidation = (fieldLabel: string) => Yup.string()
    .nullable()
    .required(`${fieldLabel} is required`);

export const getEstimateSystemValidationSchema = (
    formMapping: WaterSystemFormMapping
): Yup.Lazy<any> => {
    return Yup.lazy((values) =>
        Yup.object().shape(
            Object.keys(values).reduce((schema, key) => {
                const fieldLabel = formMapping[key].display || key;
                if (typeof (formMapping[key].initialValue) === 'number') {
                    schema[key] = getSystemNumberFieldValidation(fieldLabel);
                } else {
                    schema[key] = getSystemStringFieldValidation(fieldLabel);
                }
                return schema;
            }, {} as Record<string, Yup.NumberSchema | Yup.StringSchema>)
        )
    );
};

export const getDefaultFlowValidationSchema = (flowLabel: 'Source' | 'Discharge', connectedEdges: Edge[], totalCalculatedFlow: number, decimalPrecision: number, sumUserKnownLosses?: number): Yup.ObjectSchema<FlowForm> => {
    const totalFlowError = flowLabel === 'Source' ? TOTAL_SOURCE_FLOW_GREATER_THAN_ERROR : TOTAL_DISCHARGE_FLOW_GREATER_THAN_ERROR;
    let defaultSchema = {
        totalFlow: Yup.number()
            .nullable()
            .moreThan(0, totalFlowError)
            .test('sum-differs',
                (d) => {
                    return `Total ${flowLabel} Flow must equal the sum of all flow values`
                },
                (value) => {
                    const isValid = validateTotalFlowValue(connectedEdges, totalCalculatedFlow, value, decimalPrecision);
                    return isValid;
                },
            ),
        flows: Yup.array().of(Yup.number()
            .nullable()
            .moreThan(0, `Flow must be greater than 0`)
        )
    };

    const knownLossesSchema = Yup.number()
        .nullable()
        .test('known-losses-differs',
            (d) => {
                return `Known Losses should equal the sum of all Known Loss flows (${sumUserKnownLosses})`
            },
            (value) => {
                const isValid = validateKnownLosses(sumUserKnownLosses, value);
                return isValid;
            },
        );

    const validationSchema = sumUserKnownLosses ? {
        ...defaultSchema,
        knownLosses: knownLossesSchema
    } : defaultSchema;

    return Yup.object(validationSchema);
};



/**
   * Check accuracy of calculated or stateful total flow against each other
   * @param calculatedValue retrived from getNodeFlowTotals()
   * @param userEnteredTotalFlow componentData.userEnteredData.totalSourceFlow or componentData.userEnteredData.totalSourceFlow 
   */
export const validateTotalFlowValue = (connectedEdges: Edge[], calculatedTotalFlow: number, userEnteredTotalFlow: number, precision: number) => {
    let shouldValidate = connectedEdges.length > 0 && calculatedTotalFlow !== null && calculatedTotalFlow !== undefined;
    // *If a user entered value exists, check that our calculated total does not differ with component saved value (useEnteredValue)
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

export const getIsDiagramValid = (nodeErrors: NodeErrors) => {
    return !nodeErrors || Object.keys(nodeErrors).length === 0;
}


export type FlowForm = { totalFlow: number | null, flows: (number | null)[] };
export type WaterSystemFormMapping = { [formControlName: string]: { display: string, initialValue: number | string } };


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