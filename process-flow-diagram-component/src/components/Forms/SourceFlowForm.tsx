import { List, TextField, InputAdornment, ListItem, Divider, Button } from "@mui/material";
import { formatDecimalPlaces, getEdgeSourceAndTarget, getNodeFlowTotals } from "../Diagram/FlowUtils";
import { Edge, getConnectedEdges, Node, useReactFlow } from "@xyflow/react";
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined';

import React, { useEffect, useRef, useState } from "react";
import FlowConnectionText from "../Drawer/FlowConnectionText";
import { CustomEdgeData, NodeCalculatedData, ProcessFlowPart } from "../../../../src/process-flow-types/shared-process-flow-types";
import { MAX_FLOW_DECIMALS } from "../../../../src/process-flow-types/shared-process-flow-constants";
import InputField from "../StyledMUI/InputField";
import SmallTooltip from "../StyledMUI/SmallTooltip";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { calculatedDataUpdate } from "../Diagram/diagramReducer";
import { validateTotalFlowValue } from "../../validation/Validation";
import FlowDisplayUnit from "../Diagram/FlowDisplayUnit";


/**
   * Handle Flow states for source edges of selected node/component
   * Functionality for SourceFlowForm.tsx vs DischargeFlowForm.tsx is similar, but separated for readability and future flexibility
   */
const SourceFlowForm = (props: SourceFlowFormProps) => {
    const dispatch = useAppDispatch();
    const calculatedData = useAppSelector((state) => state.diagram.calculatedData);
    const { getNodes, setNodes, setEdges, getEdges } = useReactFlow();

    const allNodes = getNodes();
    const selectedNode = allNodes.find((node: Node<ProcessFlowPart>) => node.data.diagramNodeId === props.selectedNodeId) as Node<ProcessFlowPart>;
    const componentData: ProcessFlowPart = { ...selectedNode.data } as ProcessFlowPart;

    const [allEdges, setAllEdges] = useState<Edge<CustomEdgeData>[]>(getEdges() as Edge<CustomEdgeData>[]);
    const componentSourceEdges = allEdges.filter((edge: Edge<CustomEdgeData>) => edge.target === props.selectedNodeId);
    const componentSourceEdgeIds = componentSourceEdges.map((edge: Edge<CustomEdgeData>) => edge.id);

    const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(componentSourceEdges, allNodes, props.selectedNodeId);
    const [totalSourceFlow, setTotalSourceFlow] = useState<number>(componentData.userEnteredData.totalSourceFlow !== undefined ? componentData.userEnteredData.totalSourceFlow : totalCalculatedSourceFlow);
    const isFirstRender = useRef(true);

    // const sourceValidation: ComponentFlowValidation = {totalFlowValueDifferent: undefined, flowValues: {}, status: 'VALID'};
    // const totalFlowValueDifferent = validateTotalFlowValue(totalCalculatedSourceFlow, componentData.userEnteredData.totalSourceFlow, totalSourceFlow);
    // componentSourceEdges.map((edge: Edge<CustomEdgeData>) => {
    //     const validationMessage = validateFlowValue(edge.data.flowValue);
    //     sourceValidation.status = validationMessage? 'WARNING' : sourceValidation.status;
    //     sourceValidation.flowValues = {
    //         ...sourceValidation.flowValues,
    //         [edge.id]: {
    //             flowValueGreaterThan: validationMessage,
    //         }
    //     }
    // });
    // sourceValidation.totalFlowValueDifferent = totalFlowValueDifferent;
    // sourceValidation.status = totalFlowValueDifferent? 'ERROR' : sourceValidation.status;
    // const [validation, setValidation] = useState<ComponentFlowValidation>(sourceValidation); 

    // * side-effects of allEdges must be handled here after state update or xyFlow setEdges() will cause state inconsistency over multiple renders. Could also resolve by debounce user input in the future
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        setEdges(allEdges);
        const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(componentSourceEdges, allNodes, props.selectedNodeId);
        if (componentData.userEnteredData.totalSourceFlow === undefined && totalCalculatedSourceFlow !== totalSourceFlow) {
            setTotalSourceFlow(totalCalculatedSourceFlow);
        }

        const totalFlowValueDifferent = validateTotalFlowValue(totalCalculatedSourceFlow, componentData.userEnteredData.totalSourceFlow, totalSourceFlow);
        // setValidation((prevValidation: ComponentFlowValidation) => {
        //     let status: ValidationStatus = 'VALID';
        //     let flowValidation: ComponentFlowValidation = {...prevValidation};
        //     allEdges.forEach((edge) => {
        //         const validationMessage = validateFlowValue(edge.data.flowValue);
        //         status = validationMessage? 'WARNING' : status;
        //         flowValidation.flowValues[edge.id] = {
        //             ...flowValidation.flowValues[edge.id],
        //             flowValueGreaterThan: validationMessage,
        //         }
        //     });
        //     flowValidation.totalFlowValueDifferent = totalFlowValueDifferent;
        //     flowValidation.status = totalFlowValueDifferent? 'ERROR' : status;
        //     return flowValidation;
        // });

        updateRelatedDiagramData();
    }, [allEdges]);

    // useEffect(() => {
    //     if (isFirstRender.current) {
    //         isFirstRender.current = false; 
    //         return; 
    //     }
    //     flowContext.setDiagramValidation((prev) => {
    //         let newValidation: DiagramValidation = {
    //             ...prev,

    //         }

    //         newValidation.nodes[componentData.diagramNodeId] = {
    //             source: validation,
    //             discharge: newValidation.nodes[componentData.diagramNodeId]?.discharge,
    //             status: getComponentValidStatus(validation, newValidation.nodes[componentData.diagramNodeId]?.discharge)
    //         }
    //         return newValidation;
    //     });
    // }, [validation]);


    const onTotalFlowValueInputChange = (event) => {
        const updatedValue = event.target.value === "" ? null : Number(event.target.value);

        // setValidation((prevValidation: ComponentFlowValidation) => {
        //     let updatedSourceValidation = {...prevValidation};
        //     componentSourceEdges.map((edge: Edge<CustomEdgeData>) => {
        //         const validationMessage = validateFlowValue(edge.data.flowValue);
        //         updatedSourceValidation.status = validationMessage? 'WARNING' : sourceValidation.status;
        //         updatedSourceValidation.flowValues = {
        //             ...updatedSourceValidation.flowValues,
        //             [edge.id]: {
        //                 flowValueGreaterThan: validationMessage,
        //             }
        //         }
        //     });
        //     updatedSourceValidation.totalFlowValueDifferent = validateTotalFlowValue(totalCalculatedSourceFlow, updatedValue, updatedValue);
        //     updatedSourceValidation.status = updatedSourceValidation.totalFlowValueDifferent? 'ERROR' : 'VALID';
        //     return updatedSourceValidation;
        // });

        setNodes((nds) =>
            nds.map((n: Node<ProcessFlowPart>) => {
                if (n.data.diagramNodeId === componentData.diagramNodeId) {
                    const updatedNode = {
                        ...n,
                        data: {
                            ...n.data,
                            userEnteredData: {
                                totalSourceFlow: updatedValue,
                            }
                        }
                    };
                    return updatedNode;
                }
                return n;
            }),
        );
        setTotalSourceFlow(updatedValue);
    }

    /**
   * Divide total flow value evenly to edges where the selectedNode is the target
   */
    const onClickDistributeFlowEvenly = (totalFlowValue: number) => {
        let dividedTotalFlow = totalFlowValue / componentSourceEdges.length;
        dividedTotalFlow = Number(formatDecimalPlaces(dividedTotalFlow, MAX_FLOW_DECIMALS));
        setAllEdges((prevEdges) => {
            return prevEdges.map((edge: Edge<CustomEdgeData>) => {
                if (componentSourceEdgeIds.includes(edge.id)) {
                    const updatedEdge: Edge<CustomEdgeData> = {
                        ...edge,
                        data: {
                            ...edge.data,
                            flowValue: dividedTotalFlow,
                        }
                    };
                    return updatedEdge;
                }
                return edge;
            });
        });
    }

    const onFlowValueInputChange = (event, componentSourceEdgeId: string) => {
        const updatedValue = event.target.value === "" ? null : Number(event.target.value);
        setAllEdges((prevEdges) => {
            return prevEdges.map((edge: Edge<CustomEdgeData>) => {
                if (edge.id === componentSourceEdgeId) {
                    const updatedEdge = {
                        ...edge,
                        data: {
                            ...edge.data,
                            flowValue: updatedValue,
                        }
                    };
                    return updatedEdge;
                }
                return edge;
            });
        });
    }

    const updateRelatedDiagramData = () => {
        if (componentData.processComponentType === 'water-discharge') {
            let updatedCalculatedData: Record<string, NodeCalculatedData> = {
                ...calculatedData,
            }

            updatedCalculatedData[props.selectedNodeId] = {
                totalSourceFlow: totalCalculatedSourceFlow,
                totalDischargeFlow: updatedCalculatedData[props.selectedNodeId] ? updatedCalculatedData[props.selectedNodeId].totalDischargeFlow : undefined,
            }
            dispatch(calculatedDataUpdate(updatedCalculatedData));
        } else {
            updateIntakeSourceTotalLabels();
        }
    }


    /**
* Update water-intake nodes with total flow values, so label displays current value. 
* Other component types don't need update - they will show updated value from edges array on drawer open
*/
    const updateIntakeSourceTotalLabels = () => {
        let updatedCalculatedData: Record<string, NodeCalculatedData> = {
            ...calculatedData,
        }
        const componentSourceNodeIds: string[] = componentSourceEdges.map((edge: Edge<CustomEdgeData>) => edge.source);
        allNodes.forEach((node: Node<ProcessFlowPart>) => {
            if (componentSourceNodeIds.includes(node.id)) {
                if (node.data.processComponentType === 'water-intake') {
                    const plantIntakeConnectedEdges = getConnectedEdges([node], allEdges);
                    const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(plantIntakeConnectedEdges, allNodes, node.id);
                    let calculatedData = { ...updatedCalculatedData[node.id] };
                    calculatedData.totalDischargeFlow = totalCalculatedDischargeFlow;
                    updatedCalculatedData[node.id] = calculatedData;
                }
            }
        });
        dispatch(calculatedDataUpdate(updatedCalculatedData));
    }

    // console.log('validation', validation);
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
                value={totalSourceFlow ?? ''}
                onChange={(event) => onTotalFlowValueInputChange(event)}
                // color={validation.totalFlowValueDifferent? 'error' : 'primary'}
                // error={validation.totalFlowValueDifferent ? true : false}
                // helperText={validation.totalFlowValueDifferent}
                FormHelperTextProps={{ sx: { whiteSpace: 'normal', maxWidth: 250 } }}
                InputProps={{
                    endAdornment: <InputAdornment position="end">
                        <FlowDisplayUnit />
                    </InputAdornment>,
                }}
            />
            <Divider sx={{ marginY: '1rem', backgroundColor: '#1976d2' }}></Divider>

            <List sx={{ padding: 0 }}>
                {componentSourceEdges.map((edge: Edge<CustomEdgeData>) => {
                    const { source, target } = getEdgeSourceAndTarget(edge, getNodes());
                    let flowValue: number | string = edge.data.flowValue === null ? "" : Number(edge.data.flowValue);

                    return (
                        <ListItem
                            sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '.5rem' }}
                            key={edge.id}
                            disablePadding>
                            <InputField
                                label={<FlowConnectionText source={source} target={target} />}
                                id={edge.id}
                                type={'number'}
                                size="small"
                                value={flowValue}
                                // color={validation.flowValues[edge.id]?.flowValueGreaterThan? 'warning' : 'primary'}
                                // helperText={validation.flowValues[edge.id]?.flowValueGreaterThan}
                                // warning={validation.flowValues[edge.id]?.flowValueGreaterThan? true : false}
                                onChange={(event) => onFlowValueInputChange(event, edge.id)}
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
                    )
                })
                }
            </List>
        </>

    );

}

export default SourceFlowForm;

export interface SourceFlowFormProps {
    selectedNodeId: string,
}


