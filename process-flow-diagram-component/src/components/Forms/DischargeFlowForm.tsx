import { List, TextField, InputAdornment, ListItem, Divider, styled, Tooltip, TooltipProps, tooltipClasses, Button } from "@mui/material";
import { formatDecimalPlaces, getEdgeSourceAndTarget, getNodeFlowTotals } from "../Flow/FlowUtils";
import { Edge, getConnectedEdges, Node, useReactFlow } from "@xyflow/react";
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined';

import React, { memo, useContext, useEffect, useRef, useState } from "react";
import FlowConnectionText from "../Drawer/FlowConnectionText";
import { CustomEdgeData, NodeCalculatedData, NodeFlowValidation, ProcessFlowPart } from "../../../../src/process-flow-types/shared-process-flow-types";
import { MAX_FLOW_DECIMALS } from "../../../../src/process-flow-types/shared-process-flow-constants";
import { FlowContext } from "../Flow";
import FlowDisplayUnit from "../Flow/FlowDisplayUnit";
import SmallTooltip from "../StyledMUI/SmallTooltip";
import InputField from "../StyledMUI/InputField";

/**
   * Handle Flow states for discharge edges of selected node/component
   * Functionality for SourceFlowForm.tsx vs DischargeFlowForm.tsx is similar, but separated for readability and future flexibility
   */
const DischargeFlowForm = (props: DischargeFlowFormProps) => {
    const flowContext: FlowContext = useContext<FlowContext>(FlowContext);
    const { getNodes, setNodes, setEdges, getEdges } = useReactFlow();

    const allNodes = getNodes();
    const selectedNode = allNodes.find((node: Node<ProcessFlowPart>) => node.data.diagramNodeId === props.selectedNodeId) as Node<ProcessFlowPart>;
    const componentData: ProcessFlowPart = { ...selectedNode.data } as ProcessFlowPart;

    const [allEdges, setAllEdges] = useState<Edge<CustomEdgeData>[]>(getEdges() as Edge<CustomEdgeData>[]);
    const componentDischargeEdges = allEdges.filter((edge: Edge<CustomEdgeData>) => edge.source === props.selectedNodeId);
    const componentDischargeEdgeIds = componentDischargeEdges.map((edge: Edge<CustomEdgeData>) => edge.id);
    
    const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(componentDischargeEdges, allNodes, props.selectedNodeId);
    const [totalDischargeFlow, setTotalDischargeFlow] = useState<number>(componentData.userEnteredData.totalDischargeFlow !== undefined ? componentData.userEnteredData.totalDischargeFlow : totalCalculatedDischargeFlow);
    const isFirstRender = useRef(true);

     const validateFlowValue = (value: number | null) => {
            let validationMessage = "";
            if (value === null || value === undefined || value <= 0) {
                validationMessage = "Flow value must be greater than 0";
            }
            return validationMessage;
        };
    
        const validateTotalFlowValue = (newValue: number) => {
            let validationMessage = "";
            let hasValue = newValue !== null && newValue !== undefined;
            if (hasValue && componentData.userEnteredData.totalDischargeFlow !== undefined && newValue !== totalDischargeFlow) {
                validationMessage = "The sum of all discharge flows should equal Total Flow";
            }
            return validationMessage;
        };
    
    
        const initialValidation: NodeFlowValidation = {totalFlowValueDifferent: undefined, flowValues: {}};
        initialValidation.totalFlowValueDifferent = validateTotalFlowValue(totalCalculatedDischargeFlow);
        componentDischargeEdges.map((edge: Edge<CustomEdgeData>) => {
            const validationMessage = validateFlowValue(edge.data.flowValue);
            initialValidation.flowValues = {
                ...initialValidation.flowValues,
                [edge.id]: {
                    flowValueGreaterThan: validationMessage,
                }
            }
        });
        const [validation, setValidation] = useState<NodeFlowValidation>(initialValidation); 
    

    // * side-effects of allEdges must be handled here after state update or xyFlow setEdges will cause state inconsistency over multiple renders. Could also debounce user input in the future
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false; 
            return; 
        }

        setEdges(allEdges);
        const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(componentDischargeEdges, allNodes, props.selectedNodeId);
        if (componentData.userEnteredData.totalDischargeFlow === undefined && totalCalculatedDischargeFlow !== totalDischargeFlow) {
            setTotalDischargeFlow(totalCalculatedDischargeFlow);
        }

        const totalFlowValueDifferent = validateTotalFlowValue(totalCalculatedDischargeFlow);
        setValidation((prevValidation: NodeFlowValidation) => {
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
    }, allEdges);

    
        useEffect(() => {
            if (isFirstRender.current) {
                isFirstRender.current = false; 
                return; 
            }
    
            setValidation((prevValidation: NodeFlowValidation) => {
                let updatedMap = {...prevValidation};
                updatedMap.totalFlowValueDifferent = validateTotalFlowValue(totalCalculatedDischargeFlow);
                return updatedMap;
            });
    
        }, [totalDischargeFlow]);

    const onTotalFlowValueInputChange = (event) => {
        const updatedValue = event.target.value === "" ? null : Number(event.target.value);
        setNodes((nds) =>
            nds.map((n: Node<ProcessFlowPart>) => {
                if (n.data.diagramNodeId === componentData.diagramNodeId) {
                    const updatedNode = {
                        ...n,
                        data: {
                            ...n.data,
                            userEnteredData: {
                                totalDischargeFlow: updatedValue,
                            }
                        }
                    };
                    return updatedNode;
                }
                return n;
            }),
        );
        setTotalDischargeFlow(updatedValue);
    }

    /**
   * Divide total flow value evenly to edges where the selectedNode is the target
   */
    const onClickDistributeFlowEvenly = (totalFlowValue: number) => {
        let dividedTotalFlow = totalFlowValue / componentDischargeEdges.length;
        dividedTotalFlow = Number(formatDecimalPlaces(dividedTotalFlow, MAX_FLOW_DECIMALS));
        setAllEdges((prevEdges) => {
            return prevEdges.map((edge: Edge<CustomEdgeData>) => {
                if (componentDischargeEdgeIds.includes(edge.id)) {
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

    const onFlowValueInputChange = (event, componentDischargeEdgeId: string) => {
        const updatedValue = event.target.value === "" ? null : Number(event.target.value);
        setAllEdges((prevEdges) => {
            return prevEdges.map((edge: Edge<CustomEdgeData>) => {
                if (edge.id === componentDischargeEdgeId) {
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
                totalSourceFlow: updatedNodeCalculatedDataMap[props.selectedNodeId]? updatedNodeCalculatedDataMap[props.selectedNodeId].totalSourceFlow : undefined,
                totalDischargeFlow: totalCalculatedDischargeFlow,
            }
            flowContext.setNodeCalculatedData(updatedNodeCalculatedDataMap);

        } else {
            updateDischargeOutletTotalLabels();
        }
    }


    /**
* Update water-discharge nodes with total flow values, so label displays current value. 
* Other component types don't need update - they will show updated value from edges array on drawer open
*/
    const updateDischargeOutletTotalLabels = () => {
        let updatedNodeCalculatedDataMap: Record<string, NodeCalculatedData> = {
            ...flowContext.nodeCalculatedDataMap,
        }
        const componentDischargeNodeIds: string[] = componentDischargeEdges.map((edge: Edge<CustomEdgeData>) => edge.target);
        allNodes.forEach((node: Node<ProcessFlowPart>) => {
            if (componentDischargeNodeIds.includes(node.id)) {
                if (node.data.processComponentType === 'water-discharge') {
                    const plantDischargeConnectedEdges = getConnectedEdges([node], allEdges);
                    const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(plantDischargeConnectedEdges, allNodes, node.id);
                    let calculatedData = { ...updatedNodeCalculatedDataMap[node.id] };
                    calculatedData.totalSourceFlow = totalCalculatedSourceFlow;
                    updatedNodeCalculatedDataMap[node.id] = calculatedData;
                }
            }
        });
        flowContext.setNodeCalculatedData(updatedNodeCalculatedDataMap);
    }

    console.log('validation', validation);
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
                id={'totalDischargeFlow'}
                type={'number'}
                size="small"
                value={totalDischargeFlow ?? ''}
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
                {componentDischargeEdges.map((edge: Edge<CustomEdgeData>) => {
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

export default DischargeFlowForm;

export interface DischargeFlowFormProps {
    selectedNodeId: string,
}
