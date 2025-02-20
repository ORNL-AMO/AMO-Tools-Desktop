
import React, { memo, useEffect } from "react";
import { List, TextField, InputAdornment, ListItem, Divider, Button } from "@mui/material";
import { getEdgeSourceAndTarget, getNodeFlowTotals } from "../Diagram/FlowUtils";
import { Edge, Node } from "@xyflow/react";
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined';
import FlowConnectionText from "../Drawer/FlowConnectionText";
import { CustomEdgeData } from "../../../../src/process-flow-types/shared-process-flow-types";
import InputField from "../StyledMUI/InputField";
import SmallTooltip from "../StyledMUI/SmallTooltip";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { distributeTotalSourceFlow, sourceFlowValueChange, totalFlowChange } from "../Diagram/diagramReducer";
import FlowDisplayUnit from "../Diagram/FlowDisplayUnit";
import { selectNodes, selectNodeSourceEdges, selectTotalSourceFlow } from "../Diagram/store";
import * as Yup from 'yup';
import { Formik, Form, FieldArray, FormikErrors, useField, useFormikContext } from 'formik';
import { validateTotalFlowValue } from "../../validation/Validation";

/**
   * Handle Flow states for source edges of selected node/component
   * Functionality for SourceFlowForm.tsx vs DischargeFlowForm.tsx is similar, but separated for readability and future flexibility
   */
const SourceFlowForm = () => {
    const dispatch = useAppDispatch();
    const nodes: Node[] = useAppSelector(selectNodes);
    const componentSourceEdges: Edge<CustomEdgeData>[] = useAppSelector(selectNodeSourceEdges);
    // const selectedDataId = useAppSelector((state) => state.diagram.selectedDataId);


    const onFlowValueInputChange = (event, sourceEdgeId: string, handleChange: (event: React.ChangeEvent<any>) => void) => {
        handleChange(event);
        const flowValue = event.target.value === "" ? null : Number(event.target.value);
        dispatch(sourceFlowValueChange({ sourceEdgeId, flowValue }));
    }

      let validationSchema = Yup.object({
            totalSourceFlow: Yup.number().moreThan(0, `Total Source Flow must be greater than 0`),
            // .nonNullable(totalMinMessage)
            // .required(`Total ${flowLabel} Flow is required`)
                // .test('sum-differs',
                //     (d) => {
                //         return `Total Source Flow must equal the sum of all flow values`
                //     },
                //     (value) => {
                //         debugger;
                //         const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(componentSourceEdges, nodes, selectedDataId);
                //         const isValid = validateTotalFlowValue(totalCalculatedSourceFlow, value)
                //         return isValid;
                //     },
                // ),
            flows: Yup.array().of(Yup.number().moreThan(0, `Flow must be greater than 0`)
                // .required('Flow value is required')
                // .nonNullable(`Flow must be greater than 0`)
            ),
        });

      
    console.log('====== render Flows')
   return (
        <Formik
            initialValues={{
                totalSourceFlow: "",
                // totalSourceFlow: totalSourceFlow || "",
                flows: componentSourceEdges.map((edge: Edge<CustomEdgeData>, index) => {
                    let flowValue: number | string = edge.data.flowValue === null ? "" : Number(edge.data.flowValue);
                    return flowValue;
                }),
            }}
            validationSchema={validationSchema}
            // validateOnMount
            onSubmit={() => { }}
        >
            {({ values, errors, handleChange, setFieldValue, validateField, validateForm }) => {
                return (
                    <Form>
                        <DistributeFlowEvenlyUpdate componentSourceEdges={componentSourceEdges} setFieldValue={setFieldValue} validateForm={validateForm} />
                        
                        <TotalFlowField />
                        <Divider sx={{ marginY: '1rem', backgroundColor: '#1976d2' }}></Divider>

                        <FieldArray name="fields">
                            {({ push, remove }) => (
                                <List sx={{ padding: 0 }}>
                                    {componentSourceEdges.map((edge: Edge<CustomEdgeData>, index) => {
                                        const { source, target } = getEdgeSourceAndTarget(edge, nodes);
                                        const hasWarning = Boolean(errors?.flows && errors.flows[index]);
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

  const DistributeFlowEvenlyUpdate = ({ componentSourceEdges, setFieldValue, validateForm }: { 
    componentSourceEdges: Edge<CustomEdgeData>[], 
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<{ totalSourceFlow: string | number; flows: (string | number)[]; }>>, 
    validateForm: () => Promise<FormikErrors<{ totalSourceFlow: string | number; flows: (string | number)[] }>>
}) => {
    const flowValues = componentSourceEdges.map(edge => edge.data.flowValue);

    useEffect(() => {
        setFieldValue("flows", flowValues, true);
        // setFieldValue("flows", flowValues, false).then(() => {
        //     validateForm(); 
        // });
    }, [componentSourceEdges, setFieldValue, validateForm]);

    return null;
};


/**
   * TotalFlow field implemented as a separate component handles a number of problems with Formik and app state including, 
   * 1. the formik errors array reflects values from a previous render even when validation triggered immediately after setFieldValue is run
   * 2. the total flow field (and not the rest of the form) should rerender with value computed from other flow changes
   * 
   */
const TotalFlowField = () => {
    const { setFieldValue, values, handleChange, errors } = useFormikContext<any>();
    const dispatch = useAppDispatch();
    const totalSourceFlow = useAppSelector(selectTotalSourceFlow);
    console.log('====== render TotalFlowField', totalSourceFlow);

    const onTotalFlowValueInputChange = (event: React.ChangeEvent<any>) => {
        handleChange(event);
        const totalFlow = event.target.value === "" ? null : Number(event.target.value);
        dispatch(totalFlowChange({ flowProperty: 'totalSourceFlow', totalFlow }));
    }

    const onClickDistributeFlowEvenly = (totalFlowValue: number, ) => {
        dispatch(distributeTotalSourceFlow(totalFlowValue));
    }

      React.useEffect(() => {
          setFieldValue('totalSourceFlow', totalSourceFlow, true);
      }, [totalSourceFlow, errors, values]);
    
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
                            id={'totalSourceFlow'}
                            type={'number'}
                            size="small"
                            value={values.totalSourceFlow ?? ''}
                            onChange={(event) => onTotalFlowValueInputChange(event)}
                            error={Boolean(errors.totalSourceFlow)}
                            helperText={(errors.totalSourceFlow) ? String(errors.totalSourceFlow) : ""}
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


