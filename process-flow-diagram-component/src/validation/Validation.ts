import { Edge } from "@xyflow/react";
import { CustomEdgeData, DiagramSettings, FlowType, validateFlowSection, WaterProcessComponentType } from "process-flow-lib";
import * as Yup from 'yup';

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

/**
 * Thin adapter over `validateFlowSection` — the shared rule set also used by
 * `checkDiagramNodeErrors`. This schema only maps its result onto Yup field
 * errors for form display; it no longer encodes any validation rules itself.
 */
export const getDefaultFlowValidationSchema = (
    flowLabel: 'Source' | 'Discharge',
    connectedEdges: Edge[],
    totalCalculatedFlow: number,
    unaccountedFlow: number,
    settings: DiagramSettings,
    componentType: WaterProcessComponentType,
    sumUserKnownLosses?: number,
): Yup.ObjectSchema<FlowForm> => {
    const flowDirection: FlowType = flowLabel === 'Source' ? 'source' : 'discharge';

    let totalFlowSchema = Yup.number()
        .nullable()
        .test(
            'total-flow-error',
            '',
            function (value) {
                const { path, createError } = this;
                const { totalFlowError } = validateFlowSection({
                    totalFlow: value,
                    edges: connectedEdges as Edge<CustomEdgeData>[],
                    calculatedTotal: totalCalculatedFlow,
                    unaccountedFlow,
                    componentType,
                    flowDirection,
                    precision: settings.flowDecimalPrecision,
                });
                if (totalFlowError) {
                    return createError({ path, message: totalFlowError });
                }
                return true;
            }
        );

    let connectedFlowsSchema = Yup.array().of(
        Yup.number()
        .nullable()
        .test(
            'flow-min',
            '',
            function (value) {
                const { path, createError } = this;
                if (value === null || value === undefined) return true;
                const { edgeErrors } = validateFlowSection({
                    totalFlow: null,
                    edges: [{ data: { flowValue: value } } as Edge<CustomEdgeData>],
                    calculatedTotal: 0,
                    unaccountedFlow: undefined,
                    componentType,
                    flowDirection,
                    precision: settings.flowDecimalPrecision,
                });
                if (edgeErrors[0]) {
                    return createError({ path, message: edgeErrors[0] });
                }
                return true;
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
            '',
            function (value) {
                const { path, createError } = this;
                const { knownLossesError } = validateFlowSection({
                    totalFlow: null,
                    edges: [],
                    calculatedTotal: 0,
                    unaccountedFlow: undefined,
                    componentType,
                    flowDirection,
                    precision: settings.flowDecimalPrecision,
                    sumKnownLossEdges: sumUserKnownLosses,
                    userKnownLosses: value,
                });
                if (knownLossesError) {
                    return createError({ path, message: knownLossesError });
                }
                return true;
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
