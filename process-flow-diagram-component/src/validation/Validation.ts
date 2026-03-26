import { Edge } from "@xyflow/react";
import { DiagramSettings, validateKnownLosses, validateTotalFlowValue } from "process-flow-lib";
import * as Yup from 'yup';

const TOTAL_SOURCE_FLOW_GREATER_THAN_ERROR = `Total Source Flow must be greater than 0`;
const TOTAL_DISCHARGE_FLOW_GREATER_THAN_ERROR = `Total Discharge Flow must be greater than 0`;
const TOTAL_DISCHARGE_FLOW_GREATER_THAN_OR_EQUAL_TO_ZERO_ERROR = `Total Discharge Flow must be greater than or equal to 0`;
const CONNECTED_FLOW_GREATER_THAN_ERROR = `Flow must be greater than 0`;
const CONNECTED_FLOW_GREATER_THAN_OR_EQUAL_TO_ZERO_ERROR = `Flow must be greater than or equal to 0`;

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
    sumUserKnownLosses?: number,
    isWaterUsingSystem?: boolean
): Yup.ObjectSchema<FlowForm> => {
    let totalFlowError = TOTAL_SOURCE_FLOW_GREATER_THAN_ERROR;
    if (flowLabel === 'Discharge' && isWaterUsingSystem) {
        totalFlowError = TOTAL_DISCHARGE_FLOW_GREATER_THAN_OR_EQUAL_TO_ZERO_ERROR;
    } else if (flowLabel === 'Discharge') {
        totalFlowError = TOTAL_DISCHARGE_FLOW_GREATER_THAN_ERROR;
    } 

    const unit = settings.unitsOfMeasure === 'Imperial'? 'Mgal' : 'm<sup>3</sup>';

    const getTotalFlowMinError = (value: number | null, path: string, createError: any) => {
        if (value === null || value === undefined) return true;

        let invalidMessage = totalFlowError;
        let isValid: boolean = value > 0;
        if (flowLabel === 'Discharge' && isWaterUsingSystem) {
            isValid = value >= 0;
        }

        if (!isValid) {
            return createError({
                path,
                message: invalidMessage,
            });
        }
        return true;
    };

    const getConnectedFlowMinError = (value: number | null, path: string, createError: any) => {
        if (value === null || value === undefined) return true;

        let invalidMessage: string = CONNECTED_FLOW_GREATER_THAN_ERROR;
        let isValid: boolean = value > 0;
        if (flowLabel === 'Discharge' && isWaterUsingSystem) {
            invalidMessage = CONNECTED_FLOW_GREATER_THAN_OR_EQUAL_TO_ZERO_ERROR;
            isValid = value >= 0;
        }

        if (!isValid) {
            return createError({
                path,
                message: invalidMessage,
            });
        }
        return true;
    };

    let totalFlowSchema = Yup.number()
        .nullable()
        .test(
            'total-flow-min',
            totalFlowError,
            function (value) {
                const { path, createError } = this;
                return getTotalFlowMinError(value, path, createError);
            }
        )
        .test(
            'sum-differs',
            'Total Flow must be equal to the sum of individual flows',
            function (value) {
                const { path, createError } = this;
                const flowDifference = Math.abs(totalCalculatedFlow - value);
                const unallocated = Number((flowDifference).toFixed(settings.flowDecimalPrecision));
                const isValid = validateTotalFlowValue(connectedEdges, totalCalculatedFlow, unaccountedFlow, value, settings.flowDecimalPrecision);
                if (!isValid) {
                    return createError({
                        path,
                        message: `Total ${flowLabel} Flow must be equal to the sum of individual flows. There is unallocated flow of ${unallocated} ${unit}.`,
                    });
                }
                return true;
            }
        );

    let connectedFlowsSchema = Yup.array().of(
        Yup.number()
        .nullable()
        .test(
            'flow-min',
            'Flow must be greater than 0',
            function (value) {
                const { path, createError } = this;
                return getConnectedFlowMinError(value, path, createError);
            }
        )
    )

    let defaultSchema = {
        totalFlow: totalFlowSchema,
        flows: connectedFlowsSchema
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