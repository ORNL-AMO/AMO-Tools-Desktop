import { Edge } from "@xyflow/react";
import { validateKnownLosses, validateTotalFlowValue } from "process-flow-lib";
import * as Yup from 'yup';
export const TOTAL_SOURCE_FLOW_GREATER_THAN_ERROR = `Total Source Flow must be greater than 0`;
export const TOTAL_DISCHARGE_FLOW_GREATER_THAN_ERROR = `Total Discharge Flow must be greater than 0`;

// todo move to forms
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
                    return `Total ${flowLabel} Flow must equal the sum of all flow values (${totalCalculatedFlow})`
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


export type FlowForm = { totalFlow: number | null, flows: (number | null)[] };
export type WaterSystemFormMapping = { [formControlName: string]: { display: string, initialValue: number | string } };