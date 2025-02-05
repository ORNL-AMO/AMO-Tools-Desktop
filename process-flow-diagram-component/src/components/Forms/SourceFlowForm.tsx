import { List, TextField, InputAdornment, ListItem, Divider, styled, Tooltip, TooltipProps, tooltipClasses, Button, Paper, TextFieldProps } from "@mui/material";
import { formatDecimalPlaces, getEdgeSourceAndTarget, getNodeFlowTotals } from "../Flow/FlowUtils";
import { Edge, getConnectedEdges, Node, useReactFlow } from "@xyflow/react";
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined';

import React, { memo, useContext, useEffect, useRef, useState } from "react";
import FlowConnectionText from "../Drawer/FlowConnectionText";
import { CustomEdgeData, NodeCalculatedData, ComponentFlowValidation, ProcessFlowPart } from "../../../../src/process-flow-types/shared-process-flow-types";
import { MAX_FLOW_DECIMALS } from "../../../../src/process-flow-types/shared-process-flow-constants";
import { FlowContext } from "../Flow";
import FlowDisplayUnit from "../Flow/FlowDisplayUnit";
import InputField from "../StyledMUI/InputField";
import SmallTooltip from "../StyledMUI/SmallTooltip";
import { validateFlowValue, validateTotalFlowValue } from "../../validation-helpers/ValidationHelpers";


/**
   * Handle Flow states for source edges of selected node/component
   * Functionality for SourceFlowForm.tsx vs DischargeFlowForm.tsx is similar, but separated for readability and future flexibility
   */
const SourceFlowForm = (props: SourceFlowFormProps) => {
    const flowContext: FlowContext = useContext<FlowContext>(FlowContext);
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

    const initialValidation: ComponentFlowValidation = {totalFlowValueDifferent: undefined, flowValues: {}};
    initialValidation.totalFlowValueDifferent = validateTotalFlowValue(totalCalculatedSourceFlow, componentData.userEnteredData.totalSourceFlow, totalSourceFlow);
    componentSourceEdges.map((edge: Edge<CustomEdgeData>) => {
        const validationMessage = validateFlowValue(edge.data.flowValue);
        initialValidation.flowValues = {
            ...initialValidation.flowValues,
            [edge.id]: {
                flowValueGreaterThan: validationMessage,
            }
        }
    });
    const [validation, setValidation] = useState<ComponentFlowValidation>(initialValidation); 

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
        setValidation((prevValidation: ComponentFlowValidation) => {
            let updatedMap = {...prevValidation};
            allEdges.forEach((edge) => {
                const flowValueError = validateFlowValue(edge.data.flowValue);
                updatedMap.flowValues[edge.id] = {
                    ...updatedMap.flowValues[edge.id],
                    flowValueGreaterThan: flowValueError,
                }
            });
            
            updatedMap.totalFlowValueDifferent = totalFlowValueDifferent;
            return updatedMap;
        });

        updateRelatedDiagramData();
    }, [allEdges]);


    const onTotalFlowValueInputChange = (event) => {
        const updatedValue = event.target.value === "" ? null : Number(event.target.value);

        setValidation((prevValidation: ComponentFlowValidation) => {
            let updatedMap = {...prevValidation};
            updatedMap.totalFlowValueDifferent = validateTotalFlowValue(totalCalculatedSourceFlow, updatedValue, updatedValue);
            return updatedMap;
        });

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
            let updatedNodeCalculatedDataMap: Record<string, NodeCalculatedData> = {
                ...flowContext.nodeCalculatedDataMap,
            }

            updatedNodeCalculatedDataMap[props.selectedNodeId] = {
                totalSourceFlow: totalCalculatedSourceFlow,
                totalDischargeFlow: updatedNodeCalculatedDataMap[props.selectedNodeId]? updatedNodeCalculatedDataMap[props.selectedNodeId].totalDischargeFlow : undefined,
            }
            flowContext.setNodeCalculatedData(updatedNodeCalculatedDataMap);

        } else {
            updateIntakeSourceTotalLabels();
        }
    }


    /**
* Update water-intake nodes with total flow values, so label displays current value. 
* Other component types don't need update - they will show updated value from edges array on drawer open
*/
    const updateIntakeSourceTotalLabels = () => {
        let updatedNodeCalculatedDataMap: Record<string, NodeCalculatedData> = {
            ...flowContext.nodeCalculatedDataMap,
        }
        const componentSourceNodeIds: string[] = componentSourceEdges.map((edge: Edge<CustomEdgeData>) => edge.source);
        allNodes.forEach((node: Node<ProcessFlowPart>) => {
            if (componentSourceNodeIds.includes(node.id)) {
                if (node.data.processComponentType === 'water-intake') {
                    const plantIntakeConnectedEdges = getConnectedEdges([node], allEdges);
                    const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(plantIntakeConnectedEdges, allNodes, node.id);
                    let calculatedData = { ...updatedNodeCalculatedDataMap[node.id] };
                    calculatedData.totalDischargeFlow = totalCalculatedDischargeFlow;
                    updatedNodeCalculatedDataMap[node.id] = calculatedData;
                }
            }
        });
        flowContext.setNodeCalculatedData(updatedNodeCalculatedDataMap);
    }

    console.log('validation', validation);
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
                color={validation.totalFlowValueDifferent? 'error' : 'primary'}
                error={validation.totalFlowValueDifferent ? true : false}
                helperText={validation.totalFlowValueDifferent}
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
                                color={validation.flowValues[edge.id]?.flowValueGreaterThan? 'warning' : 'primary'}
                                helperText={validation.flowValues[edge.id]?.flowValueGreaterThan}
                                warning={validation.flowValues[edge.id]?.flowValueGreaterThan? true : false}
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


