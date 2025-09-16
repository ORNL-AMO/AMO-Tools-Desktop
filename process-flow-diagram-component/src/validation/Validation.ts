import { Edge } from "@xyflow/react";
import { DiagramSettings, validateKnownLosses, validateTotalFlowValue } from "process-flow-lib";
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

export const getDefaultFlowValidationSchema = (
    flowLabel: 'Source' | 'Discharge', 
    connectedEdges: Edge[], 
    totalCalculatedFlow: number,
    unaccountedFlow: number,
    settings: DiagramSettings, 
    sumUserKnownLosses?: number): Yup.ObjectSchema<FlowForm> => {
    const totalFlowError = flowLabel === 'Source' ? TOTAL_SOURCE_FLOW_GREATER_THAN_ERROR : TOTAL_DISCHARGE_FLOW_GREATER_THAN_ERROR;
    const unit = settings.unitsOfMeasure === 'Imperial'? 'Mgal' : 'm<sup>3</sup>';
    let defaultSchema = {
        totalFlow: Yup.number()
            .nullable()
            .moreThan(0, totalFlowError)
            .test(
                'sum-differs',
                totalFlowError,
                function (value) {
                    const { path, createError } = this;
                    const flowDifference = Math.abs(totalCalculatedFlow - value);
                    const unallocated = Number((flowDifference).toFixed(settings.flowDecimalPrecision));
                    const totalCalculatedFlowFixed = Number(totalCalculatedFlow.toFixed(settings.flowDecimalPrecision));
                    const isValid = validateTotalFlowValue(connectedEdges, totalCalculatedFlow, unaccountedFlow, value, settings.flowDecimalPrecision);
                    if (!isValid) {
                        return createError({
                            path,
                            message: `Total Flow must be equal to the sum of individual flows. There is unallocated flow of ${unallocated} ${unit}.`,
                        });
                    }
                    return true;
                }
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