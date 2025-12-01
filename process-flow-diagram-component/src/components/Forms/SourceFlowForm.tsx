
import React, { useState } from "react";
import { List, TextField, InputAdornment, ListItem, Button, Box, useTheme, Fade, Collapse } from "@mui/material";
import { getEdgeSourceAndTarget, getFlowDisplayValues, getFlowValueFromPercent, getFlowValuePercent, getNodeFlowTotals } from "../Diagram/FlowUtils";
import { Edge, Node } from "@xyflow/react";
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined';
import FlowConnectionText from "../Drawer/FlowConnectionText";
import InputField from "../StyledMUI/InputField";
import SmallTooltip from "../StyledMUI/SmallTooltip";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { distributeTotalSourceFlow, sourceFlowValueChange, totalFlowChange, nodeDataPropertyChange, sumTotalFlowChange } from "../Diagram/diagramReducer";
import FlowDisplayUnit from "../Diagram/FlowDisplayUnit";
import { selectCalculatedNodeData, selectCurrentNode, selectNodes, selectNodeSourceEdges, selectTotalSourceFlow } from "../Diagram/store";
import { Formik, Form, FieldArray, useFormikContext } from 'formik';
import { FlowForm, getDefaultFlowValidationSchema, TOTAL_SOURCE_FLOW_GREATER_THAN_ERROR } from "../../validation/Validation";
import UpdateNodeErrors from "./UpdateNodeErrors";
import DistributeTotalFlowField from "./DistributeTotalFlowField";
import ToggleDataEntryUnitButton from "./ToggleDataEntryUnitButton";
import { ObjectSchema } from "yup";
import { CustomEdgeData, NodeFlowData } from "process-flow-lib";
import CallMergeIcon from '@mui/icons-material/CallMerge';

/**
   * Formik is used for validation only, while source of truth for values is redux store. This avoids state race conditions when rendering.
   * Functionality for SourceFlowForm.tsx vs DischargeFlowForm.tsx is similar, but separated for readability and future flexibility
   */
const SourceFlowForm = (props: SourceFlowFormProps) => {
    const { inView } = props;

    const theme = useTheme();
    const dispatch = useAppDispatch();
    const nodes: Node[] = useAppSelector(selectNodes);
    const componentSourceEdges: Edge<CustomEdgeData>[] = useAppSelector(selectNodeSourceEdges) as Edge<CustomEdgeData>[];
    const selectedDataId = useAppSelector((state) => state.diagram.selectedDataId);
    const [inPercent, setInPercent] = useState<boolean>(false);
    const totalSourceFlow = useAppSelector(selectTotalSourceFlow);
    const settings = useAppSelector((state) => state.diagram.settings);
    const selectedNode = useAppSelector(selectCurrentNode);
    const isDischargeOutlet = selectedNode.type === 'waterDischarge';

    const onFlowValueInputChange = (event, sourceEdgeId: string, handleChange: (event: React.ChangeEvent<any>) => void) => {
        handleChange(event);
        let flowValue = event.target.value === "" ? null : Number(event.target.value);
        if (inPercent && flowValue) {
            flowValue = getFlowValueFromPercent(flowValue, totalSourceFlow);
        }
        dispatch(sourceFlowValueChange({ sourceEdgeId, flowValue }));
    }

    const onUnaccountedFlowChange = (event, handleChange: (event: React.ChangeEvent<any>) => void) => {
        handleChange(event);
        const updated: NodeFlowData = {
            ...selectedNode.data.userEnteredData,
            dischargeUnaccounted: event.target.value === "" ? null : Number(event.target.value)
        }
        dispatch(nodeDataPropertyChange({ optionsProp: 'userEnteredData', updatedValue: updated }));
    }


    const onToggleDataEntryUnit = () => {
        setInPercent(!inPercent);
    }

    const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(componentSourceEdges, nodes, selectedDataId);
    const validationSchema: ObjectSchema<FlowForm> = getDefaultFlowValidationSchema('Source', componentSourceEdges, totalCalculatedSourceFlow, selectedNode.data.userEnteredData.dischargeUnaccounted, settings);

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
                        <DistributeTotalFlowField componentEdges={componentSourceEdges} setFieldValue={setFieldValue} />

                        <TotalSourceFlowField inView={inView} />

                        <Box sx={{ border: `1px solid ${theme.palette.primary.main}`, padding: '1rem', borderRadius: '8px', marginTop: '2rem', paddingTop: '2rem' }}>

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

                        {isDischargeOutlet &&
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                marginTop: '1rem',
                                padding: '1rem',
                                border: `1px solid ${theme.palette.primary.main}`,
                                borderRadius: '8px'
                            }}>
                                <InputField
                                    name={'dischargeUnaccounted'}
                                    id={'dischargeUnaccounted'}
                                    label={'Unaccounted Flow'}
                                    type={'number'}
                                    size="small"
                                    value={selectedNode.data.userEnteredData.dischargeUnaccounted ?? ''}
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
        </Formik>
    );

}


/**
   * TotalFlow field implemented as a separate component handles a number of problems with Formik and app state including, 
   * 1. the formik errors array reflects values from a previous render even when validation triggered immediately after setFieldValue is run
   * 2. the total flow field (and not the rest of the form) should rerender with value computed from other flow changes
   * 
   */
const TotalSourceFlowField = (props: TotalSourceFlowFieldProps) => {
    const { inView } = props;
    const { setFieldValue, values, handleChange, errors } = useFormikContext<any>();

    const dispatch = useAppDispatch();
    const totalSourceFlow = useAppSelector(selectTotalSourceFlow);
    const calculatedData: NodeFlowData = useAppSelector(selectCalculatedNodeData);
    const componentSourceEdges: Edge<CustomEdgeData>[] = useAppSelector(selectNodeSourceEdges) as Edge<CustomEdgeData>[];

    // const [fieldState, setFieldState] = useState<{ focused: boolean, touched: boolean }>({ focused: undefined, touched: undefined });

    const onTotalFlowValueInputChange = (event: React.ChangeEvent<any>) => {
        handleChange(event);
        const totalFlow = event.target.value === "" ? null : Number(event.target.value);
        dispatch(totalFlowChange({ flowProperty: 'totalSourceFlow', totalFlow }));
    }

    const onClickDistributeFlowEvenly = (totalFlowValue: number,) => {
        dispatch(distributeTotalSourceFlow(totalFlowValue));
    }

    const onClickSumFlows = () => {
        dispatch(sumTotalFlowChange({ flowProperty: 'totalSourceFlow' }));
    }

    React.useEffect(() => {
        setFieldValue('totalFlow', totalSourceFlow, true);
    }, [totalSourceFlow, errors, values]);

    const hasError = Boolean(errors.totalFlow) && totalSourceFlow !== null;

    return (
        <Box>
                <TextField
                    label={'Total Flow'}
                    id={'totalFlow'}
                    type={'number'}
                    size="small"
                    value={values.totalFlow ?? ''}
                    fullWidth
                    onChange={(event) => onTotalFlowValueInputChange(event)}
                    error={hasError}
                    helperText={hasError ? String(errors.totalFlow) : ""}
                    FormHelperTextProps={{ sx: { whiteSpace: 'normal'} }}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">
                            <FlowDisplayUnit />
                        </InputAdornment>,
                    }}
                />



            <Collapse in={inView} timeout={{ enter: 10, exit: 100 }} unmountOnExit>
                <Box display={'flex'} justifyContent={'center'} position={'absolute'} width="100%" marginTop={'1rem'}>
                    <Box position={'relative'} 
                    sx={{
                        backgroundColor: '#fff',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '0 1rem',
                    }}>
                <SmallTooltip title="Set flows evenly from total inflow"
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
                <SmallTooltip title="Set total from sum of inflow"
                    slotProps={{
                        popper: {
                            disablePortal: true,
                        }
                    }}>
                    <span>
                        <Button onClick={onClickSumFlows}
                            disabled={!calculatedData || !componentSourceEdges?.length}
                            variant="outlined"
                            sx={{
                                padding: '2px 12px',
                                display: 'inline-block',
                                minWidth: 0
                            }}>
                            <CallMergeIcon />
                        </Button>
                    </span>
                </SmallTooltip>
                    </Box>
                </Box>
            </Collapse>
        </Box>

    );
};


export default SourceFlowForm;
export interface SourceFlowFormProps {
    inView: boolean;
}


export interface TotalSourceFlowFieldProps {
    inView: boolean;
 }
