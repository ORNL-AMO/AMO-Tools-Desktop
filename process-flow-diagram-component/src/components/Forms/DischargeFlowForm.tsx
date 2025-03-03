import { List, TextField, InputAdornment, ListItem, Divider, Button } from "@mui/material";
import { getEdgeSourceAndTarget, getNodeFlowTotals } from "../Diagram/FlowUtils";
import { Edge, Node } from "@xyflow/react";
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined';

import React, { useEffect, useState }  from "react";
import FlowConnectionText from "../Drawer/FlowConnectionText";
import { CustomEdgeData } from "../../../../src/process-flow-types/shared-process-flow-types";
import SmallTooltip from "../StyledMUI/SmallTooltip";
import { dischargeFlowValueChange, distributeTotalDischargeFlow, focusedEdgeChange, totalFlowChange } from "../Diagram/diagramReducer";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import InputField from "../StyledMUI/InputField";
import FlowDisplayUnit from "../Diagram/FlowDisplayUnit";
import { selectNodes, selectNodeTargetEdges, selectTotalDischargeFlow } from "../Diagram/store";
import { FlowForm, getDefaultFlowValidationSchema } from "../../validation/Validation";
import { FieldArray, Form, Formik, FormikErrors, useFormikContext } from "formik";
import UpdateNodeErrors from "./UpdateNodeErrors";
import DistributeTotalFlowField from "./DistributeTotalFlowField";
import { ObjectSchema } from "yup";

/**
   * Handle Flow states for discharge edges of selected node/component
   * Functionality for SourceFlowForm.tsx vs DischargeFlowForm.tsx is similar, but separated for readability and future flexibility
   */
const DischargeFlowForm = () => {
    const dispatch = useAppDispatch();
    const nodes: Node[] = useAppSelector(selectNodes);
    const componentDischargeEdges: Edge<CustomEdgeData>[] = useAppSelector(selectNodeTargetEdges);
    const selectedDataId = useAppSelector((state) => state.diagram.selectedDataId);
    const [fieldState, setFieldState] = useState<{ focused: boolean, touched: boolean }>({ focused: undefined, touched: undefined });

    const onFlowValueInputChange = (event, dischargeEdgeId: string, handleChange: (event: React.ChangeEvent<any>) => void) => {
        handleChange(event);
        const flowValue = event.target.value === "" ? null : Number(event.target.value);
        dispatch(dischargeFlowValueChange({ dischargeEdgeId, flowValue }));
    }

    const handleFieldState = (edgeId: string, stateProp: string, val: boolean) => {
        if (stateProp === 'focused') {
            dispatch(focusedEdgeChange({ edgeId: edgeId }));
        }
        setFieldState((prev) => {
            return {
                ...prev,
                [stateProp]: val
            }
        });
    }

    const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(componentDischargeEdges, nodes, selectedDataId);
    const validationSchema: ObjectSchema<FlowForm> = getDefaultFlowValidationSchema('Discharge', totalCalculatedDischargeFlow);
    
    return (
        <Formik
            initialValues={{
                totalDischargeFlow: "",
                flows: componentDischargeEdges.map((edge: Edge<CustomEdgeData>) => {
                    let flowValue: number | string = edge.data.flowValue === null ? "" : Number(edge.data.flowValue);
                    return flowValue;
                }),
            }}
            validationSchema={validationSchema}
            validateOnMount={true}
            onSubmit={() => { }}
        >
            {({ values, errors, handleChange, setFieldValue }) => {
                console.log('values', values);
                console.log('errors', errors);

                return (
                    <Form>
                        <UpdateNodeErrors flowType={'discharge'} errors={errors} />
                        <DistributeTotalFlowField componentEdges={componentDischargeEdges} setFieldValue={setFieldValue} />

                        <TotaDischargeFlowField />
                        <Divider sx={{ marginY: '1rem', backgroundColor: '#1976d2' }}></Divider>

                        <FieldArray name="fields">
                            {({ push, remove }) => (
                                <List sx={{ padding: 0 }}>
                                    {componentDischargeEdges.map((edge: Edge<CustomEdgeData>, index) => {
                                        const { source, target } = getEdgeSourceAndTarget(edge, nodes);

                                        const hasWarning = Boolean(errors?.flows && errors.flows[index]) && values?.flows[index] !== null;
                                        return (
                                            <ListItem
                                                sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '.5rem' }}
                                                key={edge.id}
                                                disablePadding>
                                                <InputField
                                                    label={<FlowConnectionText source={source} target={target} />}
                                                    id={edge.id}
                                                    name={`flows[${index}]`}
                                                    type={'number'}
                                                    size="small"
                                                    value={values.flows[index] ?? ''}
                                                    onFocus={() => handleFieldState(edge.id, 'focused', true )}
                                                    onBlur={() => handleFieldState(edge.id, 'touched', true )}
                                                    warning={hasWarning}
                                                    helperText={hasWarning ? String(errors.flows[index]) : ""}
                                                    FormHelperTextProps={{
                                                        sx: {
                                                            whiteSpace: 'normal',
                                                            maxWidth: 250,
                                                        }
                                                    }}
                                                    onChange={(event) => onFlowValueInputChange(event, edge.id, handleChange)}
                                                    sx={{ m: 1, width: '100%' }}
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end" sx={{ zIndex: 1 }}>
                                                            <span style={{ zIndex: 1, background: 'white' }}>
                                                                <FlowDisplayUnit />
                                                            </span>
                                                        </InputAdornment>,
                                                    }}
                                                />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            )}
                        </FieldArray>
                    </Form>
                );
            }}
        </Formik>

    );

}


/**
   * TotalFlow field implemented as a separate component handles a number of problems with Formik and app state including, 
   * 1. the formik errors array reflects values from a previous render even when validation triggered immediately after setFieldValue is run
   * 2. the total flow field (and not the rest of the form) should rerender with value computed from other flow changes
   */
const TotaDischargeFlowField = () => {
    const { setFieldValue, values, handleChange, errors } = useFormikContext<any>();
    const dispatch = useAppDispatch();
    const totalDischargeFlow = useAppSelector(selectTotalDischargeFlow);
    const [fieldState, setFieldState] = useState<{ focused: boolean, touched: boolean }>({ focused: undefined, touched: undefined });

    const onTotalFlowValueInputChange = (event: React.ChangeEvent<any>) => {
        handleChange(event);
        const totalFlow = event.target.value === "" ? null : Number(event.target.value);
        dispatch(totalFlowChange({ flowProperty: 'totalDischargeFlow', totalFlow }));
    }

    const onClickDistributeFlowEvenly = (totalFlowValue: number,) => {
        dispatch(distributeTotalDischargeFlow(totalFlowValue));
    }

    React.useEffect(() => {
        setFieldValue('totalFlow', totalDischargeFlow, true);
    }, [totalDischargeFlow, errors, values]);

    const hasError = Boolean(errors.totalFlow) && totalDischargeFlow !== null;
    return (
        <>
            <SmallTooltip title="Set flows evenly from total discharge value"
                slotProps={{
                    popper: {
                        disablePortal: true,
                    }
                }}>
                <span>
                    <Button onClick={() => onClickDistributeFlowEvenly(totalDischargeFlow)}
                        disabled={!totalDischargeFlow}
                        variant="outlined"
                        sx={{
                            marginRight: '1rem',
                            padding: '2px 12px',
                            display: 'inline-block',
                            minWidth: 0
                        }}>
                        <CallSplitOutlinedIcon
                            sx={{
                                transform: 'rotate(180deg) scaleX(-1)',

                            }} />
                    </Button>
                </span>
            </SmallTooltip>
            <TextField
                label={'Total Flow'}
                id={'totalFlow'}
                type={'number'}
                size="small"
                value={values.totalFlow ?? ''}
                onChange={(event) => onTotalFlowValueInputChange(event)}
                onFocus={() => setFieldState({ ...fieldState, focused: true })}
                onAbort={() => setFieldState({ ...fieldState, touched: true })}
                error={hasError}
                helperText={hasError ? String(errors.totalFlow) : ""}
                FormHelperTextProps={{ sx: { whiteSpace: 'normal', maxWidth: 250 } }}
                InputProps={{
                    endAdornment: <InputAdornment position="end">
                        <FlowDisplayUnit />
                    </InputAdornment>,
                }}
            />
        </>
    );
};


export default DischargeFlowForm;

export interface DischargeFlowFormProps {
    selectedNodeId: string,
}
