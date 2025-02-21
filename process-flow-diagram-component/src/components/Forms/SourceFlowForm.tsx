
import React, { useEffect, useState } from "react";
import { List, TextField, InputAdornment, ListItem, Divider, Button } from "@mui/material";
import { getEdgeSourceAndTarget, getNodeFlowTotals } from "../Diagram/FlowUtils";
import { Edge, Node } from "@xyflow/react";
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined';
import FlowConnectionText from "../Drawer/FlowConnectionText";
import { CustomEdgeData } from "../../../../src/process-flow-types/shared-process-flow-types";
import InputField from "../StyledMUI/InputField";
import SmallTooltip from "../StyledMUI/SmallTooltip";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { distributeTotalSourceFlow, focusedEdgeChange, nodeErrorsChange, sourceFlowValueChange, totalFlowChange } from "../Diagram/diagramReducer";
import FlowDisplayUnit from "../Diagram/FlowDisplayUnit";
import { selectNodes, selectNodeSourceEdges, selectTotalSourceFlow } from "../Diagram/store";
import { Formik, Form, FieldArray, useFormikContext } from 'formik';
import { FlowForm, getDefaultFlowValidationSchema } from "../../validation/Validation";
import { useDispatch } from "react-redux";
import UpdateNodeErrors from "./UpdateNodeErrors";
import DistributeTotalFlowField from "./DistributeTotalFlowField";
import { ObjectSchema } from "yup";

/**
   * Handle Flow states for source edges of selected node/component
   * Functionality for SourceFlowForm.tsx vs DischargeFlowForm.tsx is similar, but separated for readability and future flexibility
   */
const SourceFlowForm = () => {
    const dispatch = useAppDispatch();
    const nodes: Node[] = useAppSelector(selectNodes);
    const componentSourceEdges: Edge<CustomEdgeData>[] = useAppSelector(selectNodeSourceEdges);
    const selectedDataId = useAppSelector((state) => state.diagram.selectedDataId);
    const [fieldState, setFieldState] = useState<{ focused: boolean, touched: boolean }>({ focused: undefined, touched: undefined });

    const onFlowValueInputChange = (event, sourceEdgeId: string, handleChange: (event: React.ChangeEvent<any>) => void) => {
        handleChange(event);
        const flowValue = event.target.value === "" ? null : Number(event.target.value);
        dispatch(sourceFlowValueChange({ sourceEdgeId, flowValue }));
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

    const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(componentSourceEdges, nodes, selectedDataId);
    const validationSchema: ObjectSchema<FlowForm> = getDefaultFlowValidationSchema('Source', totalCalculatedSourceFlow);

    return (
        <Formik
            initialValues={{
                totalFlow: "",
                flows: componentSourceEdges.map((edge: Edge<CustomEdgeData>) => {
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
                        <UpdateNodeErrors flowType={'source'} errors={errors} />
                        <DistributeTotalFlowField componentEdges={componentSourceEdges} setFieldValue={setFieldValue} />

                        <TotalSourceFlowField />
                        <Divider sx={{ marginY: '1rem', backgroundColor: '#1976d2' }}></Divider>

                        <FieldArray name="fields">
                            {({ push, remove }) => (
                                <List sx={{ padding: 0 }}>
                                    {componentSourceEdges.map((edge: Edge<CustomEdgeData>, index) => {
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
                                                    onFocus={() => handleFieldState(edge.id, 'focused', true)}
                                                    onBlur={() => handleFieldState(edge.id, 'touched', true)}
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
   * 
   */
const TotalSourceFlowField = () => {
    const { setFieldValue, values, handleChange, errors } = useFormikContext<any>();
    const dispatch = useAppDispatch();
    const totalSourceFlow = useAppSelector(selectTotalSourceFlow);
    const [fieldState, setFieldState] = useState<{ focused: boolean, touched: boolean }>({ focused: undefined, touched: undefined });

    const onTotalFlowValueInputChange = (event: React.ChangeEvent<any>) => {
        handleChange(event);
        const totalFlow = event.target.value === "" ? null : Number(event.target.value);
        dispatch(totalFlowChange({ flowProperty: 'totalSourceFlow', totalFlow }));
    }

    const onClickDistributeFlowEvenly = (totalFlowValue: number,) => {
        dispatch(distributeTotalSourceFlow(totalFlowValue));
    }

    React.useEffect(() => {
        setFieldValue('totalFlow', totalSourceFlow, true);
    }, [totalSourceFlow, errors, values]);

    const hasError = Boolean(errors.totalFlow) && totalSourceFlow !== null;
    return (
        <>
            <SmallTooltip title="Set flows evenly from total source value"
                slotProps={{
                    popper: {
                        disablePortal: true,
                    }
                }}>
                <span>
                    <Button onClick={() => onClickDistributeFlowEvenly(totalSourceFlow)}
                        disabled={!totalSourceFlow}
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


export default SourceFlowForm;
export interface SourceFlowFormProps { }


