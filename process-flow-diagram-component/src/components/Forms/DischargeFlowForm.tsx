import { List, TextField, InputAdornment, ListItem, Button, useTheme, Box, Typography } from "@mui/material";
import { getEdgeSourceAndTarget, getFlowDisplayValues, getFlowValueFromPercent, getFlowValuePercent, getKnownLossComponentTotals, getNodeFlowTotals } from "../Diagram/FlowUtils";
import { Edge, Node } from "@xyflow/react";
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined';

import React, { useEffect, useState } from "react";
import FlowConnectionText from "../Drawer/FlowConnectionText";
import SmallTooltip from "../StyledMUI/SmallTooltip";
import { dischargeFlowValueChange, distributeTotalDischargeFlow, focusedEdgeChange, nodeDataPropertyChange, totalFlowChange } from "../Diagram/diagramReducer";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import InputField from "../StyledMUI/InputField";
import FlowDisplayUnit from "../Diagram/FlowDisplayUnit";
import { selectCurrentNode, selectNodes, selectNodeTargetEdges, selectTotalDischargeFlow } from "../Diagram/store";
import { FlowForm, getDefaultFlowValidationSchema, TOTAL_DISCHARGE_FLOW_GREATER_THAN_ERROR } from "../../validation/Validation";
import { FieldArray, Form, Formik, FormikErrors, useFormikContext } from "formik";
import UpdateNodeErrors from "./UpdateNodeErrors";
import DistributeTotalFlowField from "./DistributeTotalFlowField";
import { ObjectSchema } from "yup";
import ToggleDataEntryUnitButton from "./ToggleDataEntryUnitButton";
import { blue } from "@mui/material/colors";
import { CustomEdgeData } from "process-flow-lib";
import AirlineStopsIcon from '@mui/icons-material/AirlineStops';
import { useFlowService } from "../../services/FlowService";

const blueBackground = blue[50];
/**
   * Formik is used for validation only, while source of truth for values is redux store. This avoids state race conditions when rendering.
   * Functionality for SourceFlowForm.tsx vs DischargeFlowForm.tsx is similar, but separated for readability and future flexibility
   */
const DischargeFlowForm = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const flowService = useFlowService();

    const nodes: Node[] = useAppSelector(selectNodes);
    const componentDischargeEdges: Edge<CustomEdgeData>[] = useAppSelector(selectNodeTargetEdges) as Edge<CustomEdgeData>[];
    const selectedDataId = useAppSelector((state) => state.diagram.selectedDataId);
    const [inPercent, setInPercent] = useState<boolean>(false);
    const totalDischargeFlow = useAppSelector(selectTotalDischargeFlow);
    const selectedNode = useAppSelector(selectCurrentNode);
    const settings = useAppSelector((state) => state.diagram.settings);
    const isIntakeSource = selectedNode.type === 'waterIntake';
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

    const onFlowValueInputChange = (event, dischargeEdgeId: string, handleChange: (event: React.ChangeEvent<any>) => void) => {
        handleChange(event);
        let flowValue = event.target.value === "" ? null : Number(event.target.value);
        if (inPercent && flowValue) {
            flowValue = getFlowValueFromPercent(flowValue, totalDischargeFlow);
        }
        dispatch(dischargeFlowValueChange({ dischargeEdgeId, flowValue }));
    }

    const onKnownLossesChange = (event, handleChange: (event: React.ChangeEvent<any>) => void) => {
        handleChange(event);
        const updated = {
            ...selectedNode.data.userEnteredData,
            totalKnownLosses: event.target.value === "" ? null : Number(event.target.value)
        }
        dispatch(nodeDataPropertyChange({ optionsProp: 'userEnteredData', updatedValue: updated }));
    }

    const onUnaccountedFlowChange = (event, handleChange: (event: React.ChangeEvent<any>) => void) => {
        handleChange(event);
        const updated = {
            ...selectedNode.data.userEnteredData,
            intakeUnaccounted: event.target.value === "" ? null : Number(event.target.value)
        }
        dispatch(nodeDataPropertyChange({ optionsProp: 'userEnteredData', updatedValue: updated }));
    }

    const onWaterInProductChange = (event, handleChange: (event: React.ChangeEvent<any>) => void) => {
        handleChange(event);
        const updated = {
            ...selectedNode.data.userEnteredData,
            waterInProduct: event.target.value === "" ? null : Number(event.target.value)
        }
        dispatch(nodeDataPropertyChange({ optionsProp: 'userEnteredData', updatedValue: updated }));
    }


    const onToggleDataEntryUnit = () => {
        setInPercent(!inPercent);
    }

    const onPropogateFlow = (edge: Edge<CustomEdgeData>) => {
        flowService.propagateFlowFromNode(selectedNode.id, edge);
    }


    // todo 7339 - don't validate when flows dont exist
    const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(componentDischargeEdges, nodes, selectedDataId);
    const totalKnownLosses = getKnownLossComponentTotals(componentDischargeEdges, nodes, selectedDataId);
    const validationSchema: ObjectSchema<FlowForm> = getDefaultFlowValidationSchema('Discharge', componentDischargeEdges, totalCalculatedDischargeFlow, selectedNode.data.userEnteredData.intakeUnaccounted, settings, totalKnownLosses);

    return (
        <Formik
            initialValues={{
                totalFlow: "",
                flows: getFlowDisplayValues(componentDischargeEdges),
                knownLosses: "",
                waterInProduct: "",
            }}
            validationSchema={validationSchema}
            validateOnMount={true}
            onSubmit={() => { }}
        >
            {({ values, errors, handleChange, setFieldValue }) => {
                const disabledToggle = values.totalFlow === null;
                const disabledPercentDataEntryFields = inPercent && (disabledToggle || (errors.totalFlow && errors.totalFlow === TOTAL_DISCHARGE_FLOW_GREATER_THAN_ERROR));

                return (
                    <Form>
                        <UpdateNodeErrors flowType={'discharge'} errors={errors} />
                        <DistributeTotalFlowField componentEdges={componentDischargeEdges} setFieldValue={setFieldValue} />
                        <TotaDischargeFlowField />

                        {componentDischargeEdges.length > 0 &&
                            <Box sx={{ border: `1px solid ${theme.palette.primary.main}`, padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                                <ToggleDataEntryUnitButton inPercent={inPercent} disabled={disabledToggle} handleToggleDataEntryUnit={onToggleDataEntryUnit} />

                                <FieldArray name="fields">
                                    {({ push, remove }) => (
                                        <List sx={{ padding: 0 }}>
                                            {componentDischargeEdges.map((edge: Edge<CustomEdgeData>, index) => {
                                                const { source, target } = getEdgeSourceAndTarget(edge, nodes);
                                                const hasWarning = Boolean(errors?.flows && errors.flows[index]) && values?.flows[index] !== null;

                                                let currentValue: string | number = '';
                                                if (edge.data.flowValue !== null) {
                                                    currentValue = inPercent ? getFlowValuePercent(edge.data.flowValue, totalDischargeFlow) : edge.data.flowValue;
                                                }

                                                const canPropogate = edge.data.flowValue === null || edge.data.flowValue === undefined || edge.data.flowValue === 0;
                                                return (
                                                    <ListItem
                                                        sx={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '.5rem' }}
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
                                                                        {inPercent ?
                                                                            <span>%</span>
                                                                            :
                                                                            <FlowDisplayUnit />
                                                                        }
                                                                    </span>
                                                                </InputAdornment>,
                                                            }}
                                                        />
                                                        {/* `Populate ${currentValue} through all flows to end of path` */}
                                                        <SmallTooltip title={`Set all flow values to the end of path`}
                                                            slotProps={{
                                                                popper: {
                                                                    disablePortal: true,
                                                                }
                                                            }}>
                                                            <span>
                                                                <Button variant="outlined" aria-label="populate" 
                                                                    disabled={canPropogate}
                                                                    size="small" sx={{ ml: 1 }} onClick={() => onPropogateFlow(edge)}>
                                                                    <AirlineStopsIcon fontSize="small" />
                                                                </Button>
                                                            </span>
                                                        </SmallTooltip>
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    )}
                                </FieldArray>
                            </Box>
                        }

                        {selectedNode.type === 'waterUsingSystem' &&
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                marginTop: '1rem',
                                padding: '1rem',
                                border: `1px solid ${theme.palette.primary.main}`,
                                borderRadius: '8px'
                            }}>
                                <Box
                                    sx={{
                                        marginBottom: '1rem',
                                        padding: '2px 12px',
                                        display: 'flex',
                                        justifyContent: 'left',
                                        background: blueBackground,
                                        border: `1px solid ${theme.palette.grey}`,
                                        borderRadius: '8px'
                                    }}
                                >
                                    <Typography color={theme.palette.primary.dark} fontSize={'1rem'} sx={{ margin: '.75rem' }}>Loss Summary</Typography>
                                </Box>
                                <InputField
                                    name={'knownLosses'}
                                    id={'knownLosses'}
                                    label={'Total Known Losses'}
                                    type={'number'}
                                    size="small"
                                    value={selectedNode.data.userEnteredData.totalKnownLosses ?? ''}
                                    onChange={(event) => onKnownLossesChange(event, handleChange)}
                                    sx={{ marginBottom: '1rem', width: '100%' }}
                                    warning={Boolean(errors.knownLosses)}
                                    helperText={Boolean(errors.knownLosses) ? String(errors.knownLosses) : ""}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" sx={{ zIndex: 1 }}>
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
                                {selectedNode.data.systemType === 0 &&
                                    <InputField
                                        name={'waterInProduct'}
                                        id={'waterInProduct'}
                                        label={'Water In Product'}
                                        type={'number'}
                                        size="small"
                                        value={selectedNode.data.userEnteredData.waterInProduct ?? ''}
                                        onChange={(event) => onWaterInProductChange(event, handleChange)}
                                        sx={{ width: '100%' }}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end" sx={{ zIndex: 1 }}>
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
                                }
                            </Box>
                        }

                        {isIntakeSource &&
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                marginTop: '1rem',
                                padding: '1rem',
                                border: `1px solid ${theme.palette.primary.main}`,
                                borderRadius: '8px'
                            }}>
                                <InputField
                                    name={'intakeUnaccounted'}
                                    id={'intakeUnaccounted'}
                                    label={'Unaccounted Flow'}
                                    type={'number'}
                                    size="small"
                                    value={selectedNode.data.userEnteredData.intakeUnaccounted ?? ''}
                                    onChange={(event) => onUnaccountedFlowChange(event, handleChange)}
                                    sx={{ marginBottom: '1rem', width: '100%' }}
                                    // warning={Boolean(errors.unaccountedFlow)}
                                    // helperText={Boolean(errors.unaccountedFlow) ? String(errors.unaccountedFlow) : ""}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" sx={{ zIndex: 1 }}>
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
                            </Box>
                        }
                    </Form>
                );
            }}
        </Formik >

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
    // const [fieldState, setFieldState] = useState<{ focused: boolean, touched: boolean }>({ focused: undefined, touched: undefined });

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
        </>
    );
};


export default DischargeFlowForm;

export interface DischargeFlowFormProps { }
