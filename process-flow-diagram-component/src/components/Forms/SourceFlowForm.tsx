
import React, { useState } from "react";
import { List, TextField, InputAdornment, ListItem, Divider, Button, Box, useTheme } from "@mui/material";
import { getEdgeSourceAndTarget, getFlowDisplayValues, getFlowValueFromPercent, getFlowValuePercent, getNodeFlowTotals } from "../Diagram/FlowUtils";
import { Edge, Node } from "@xyflow/react";
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined';
import FlowConnectionText from "../Drawer/FlowConnectionText";
import InputField from "../StyledMUI/InputField";
import SmallTooltip from "../StyledMUI/SmallTooltip";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { distributeTotalSourceFlow, modalOpenChange, focusedEdgeChange, sourceFlowValueChange, totalFlowChange } from "../Diagram/diagramReducer";
import FlowDisplayUnit from "../Diagram/FlowDisplayUnit";
import { selectNodes, selectNodeSourceEdges, selectTotalSourceFlow } from "../Diagram/store";
import { Formik, Form, FieldArray, useFormikContext } from 'formik';
import { FlowForm, getDefaultFlowValidationSchema, TOTAL_SOURCE_FLOW_GREATER_THAN_ERROR } from "../../validation/Validation";
import UpdateNodeErrors from "./UpdateNodeErrors";
import DistributeTotalFlowField from "./DistributeTotalFlowField";
import ToggleDataEntryUnitButton from "./ToggleDataEntryUnitButton";
import { ObjectSchema } from "yup";
import { CustomEdgeData } from "process-flow-lib";
/**
   * Formik is used for validation only, while source of truth for values is redux store. This avoids state race conditions when rendering.
   * Functionality for SourceFlowForm.tsx vs DischargeFlowForm.tsx is similar, but separated for readability and future flexibility
   */
const SourceFlowForm = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const nodes: Node[] = useAppSelector(selectNodes);
    const componentSourceEdges: Edge<CustomEdgeData>[] = useAppSelector(selectNodeSourceEdges) as Edge<CustomEdgeData>[];
    const selectedDataId = useAppSelector((state) => state.diagram.selectedDataId);
    const [inPercent, setInPercent] = useState<boolean>(false);
    const totalSourceFlow = useAppSelector(selectTotalSourceFlow);
    const settings = useAppSelector((state) => state.diagram.settings);
    // const [fieldState, setFieldState] = useState<{ focused: boolean, touched: boolean }>({ focused: undefined, touched: undefined });
    // const handleFieldState = (edgeId: string, stateProp: string, val: boolean) => {
    //     if (stateProp === 'focused') {
    //         dispatch(focusedEdgeChange({ edgeId: edgeId }));
    //     }
    //     setFieldState((prev) => {
    //         return {
    //             ...prev,
    //             [stateProp]: val
    //         }
    //     });
    // }

    const onFlowValueInputChange = (event, sourceEdgeId: string, handleChange: (event: React.ChangeEvent<any>) => void) => {
        handleChange(event);
        let flowValue = event.target.value === "" ? null : Number(event.target.value);
        if (inPercent && flowValue) {
            flowValue = getFlowValueFromPercent(flowValue, totalSourceFlow);
        }
        dispatch(sourceFlowValueChange({ sourceEdgeId, flowValue }));
    }

    const onToggleDataEntryUnit = () => {
        setInPercent(!inPercent);
    }

    const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(componentSourceEdges, nodes, selectedDataId);
    const validationSchema: ObjectSchema<FlowForm> = getDefaultFlowValidationSchema('Source', componentSourceEdges, totalCalculatedSourceFlow, settings.flowDecimalPrecision);

    return (
        <Formik
            initialValues={{
                totalFlow: "",
                flows: getFlowDisplayValues(componentSourceEdges),
            }}
            validationSchema={validationSchema}
            validateOnMount={true}
            onSubmit={() => { }}
        >
            {({ values, errors, handleChange, setFieldValue }) => {
                const disabledToggle = values.totalFlow === null;
                const disabledPercentDataEntryFields = inPercent && (disabledToggle || (errors.totalFlow && errors.totalFlow === TOTAL_SOURCE_FLOW_GREATER_THAN_ERROR));

                return (
                    <Form>
                        <UpdateNodeErrors flowType={'source'} errors={errors} />
                        <DistributeTotalFlowField componentEdges={componentSourceEdges} setFieldValue={setFieldValue}/>

                        <TotalSourceFlowField />

                        <Box sx={{ border: `1px solid ${theme.palette.primary.main}`, padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>

                            <ToggleDataEntryUnitButton inPercent={inPercent} disabled={disabledToggle} handleToggleDataEntryUnit={onToggleDataEntryUnit} />
                            <FieldArray name="fields">
                                {({ push, remove }) => (
                                    <List sx={{ padding: 0 }}>
                                        {componentSourceEdges.map((edge: Edge<CustomEdgeData>, index) => {
                                            const { source, target } = getEdgeSourceAndTarget(edge, nodes);
                                            const hasWarning = Boolean(errors?.flows && errors.flows[index]) && values?.flows[index] !== null;

                                            let currentValue: string | number = '';
                                            if (edge.data.flowValue !== null) {
                                                currentValue = inPercent ? getFlowValuePercent(edge.data.flowValue, totalSourceFlow) : edge.data.flowValue;
                                            }
                                            return (
                                                <ListItem
                                                    sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '.5rem' }}
                                                    key={edge.id}
                                                    disablePadding>
                                                    <InputField
                                                        disabled={disabledPercentDataEntryFields}
                                                        label={<FlowConnectionText source={source} target={target} />}
                                                        id={edge.id}
                                                        name={`flows[${index}]`}
                                                        type={'number'}
                                                        size="small"
                                                        value={currentValue}
                                                        // onFocus={() => handleFieldState(edge.id, 'focused', true)}
                                                        // onBlur={() => handleFieldState(edge.id, 'touched', true)}
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
                                                            endAdornment:
                                                                <InputAdornment position="end" sx={{ zIndex: 1 }}>
                                                                    <span style={{ zIndex: 1, background: 'white' }}>
                                                                        {inPercent ?
                                                                            <span>%</span>
                                                                            :
                                                                            <FlowDisplayUnit />
                                                                        }
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
                        </Box>

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
    // const [fieldState, setFieldState] = useState<{ focused: boolean, touched: boolean }>({ focused: undefined, touched: undefined });

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
        <Box display={'flex'}>
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
                // onFocus={() => setFieldState({ ...fieldState, focused: true })}
                // onAbort={() => setFieldState({ ...fieldState, touched: true })}
                error={hasError}
                helperText={hasError ? String(errors.totalFlow) : ""}
                FormHelperTextProps={{ sx: { whiteSpace: 'normal', maxWidth: 250 } }}
                InputProps={{
                    endAdornment: <InputAdornment position="end">
                        <FlowDisplayUnit />
                    </InputAdornment>,
                }}
            />
        </Box>
    );
};


export default SourceFlowForm;
export interface SourceFlowFormProps { }


