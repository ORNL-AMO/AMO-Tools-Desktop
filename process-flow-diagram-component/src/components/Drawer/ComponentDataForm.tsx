import { Box, List, TextField, InputAdornment, ListItem, ListItemButton, ListItemIcon, Divider, styled, Typography, Select, MenuItem, FormControl, Chip, Tooltip, TooltipProps, tooltipClasses, Button } from "@mui/material";
import { getEdgeSourceAndTarget, getNodeFlowTotals, updateNodeCalculatedDataMap } from "../Flow/FlowUtils";
import { Edge, getConnectedEdges, Node, useReactFlow } from "@xyflow/react";
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined';

import React, { memo, useContext, useState } from "react";
import FlowConnectionText from "./FlowConnectionText";
import { CustomEdgeData, NodeCalculatedData, ProcessFlowPart, WasteWaterTreatment, WaterTreatment } from "../../../../src/process-flow-types/shared-process-flow-types";
import { wasteWaterTreatmentTypeOptions, waterTreatmentTypeOptions } from "../../../../src/process-flow-types/shared-process-flow-constants";
import { Accordion, AccordionDetails, AccordionSummary } from "../MUIStyledComponents";
import { FlowContext } from "../Flow";

const SmallTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        padding: '.5rem',
        fontSize: 14,
    },
}));

const ComponentDataForm = (props: ComponentDataFormProps) => {
    const flowContext: FlowContext = useContext<FlowContext>(FlowContext);
    const { getNodes, setNodes, setEdges, getEdges } = useReactFlow();
    const [sourcesExpanded, setSourcesExpanded] = useState<boolean>(true);
    const [dischargeExpanded, setDischargeExpanded] = useState<boolean>(true);

    // todo for future diagrams - setComponentTypeData<T>
    let componentData: ProcessFlowPart | WaterTreatment = {...props.selectedNode.data} as ProcessFlowPart;
    const isWaterTreatment = props.selectedNode.type === 'waterTreatment';
    const isWasteWaterTreatment = props.selectedNode.type === 'wasteWaterTreatment';
    let defaultSelectedTreatmentType: number = 0;
    let treatmentTypeOptions: Array<{ value: number, display: string }> = [];

    if (isWaterTreatment) {
        componentData = componentData as WaterTreatment;
        defaultSelectedTreatmentType = componentData.treatmentType !== undefined ? Number(componentData.treatmentType) : 0;
        treatmentTypeOptions = waterTreatmentTypeOptions;
    } else if (isWasteWaterTreatment) {
        componentData = componentData as WasteWaterTreatment;
        defaultSelectedTreatmentType = componentData.treatmentType !== undefined ? Number(componentData.treatmentType) : 0;
        treatmentTypeOptions = wasteWaterTreatmentTypeOptions;
    } else {
        componentData = componentData as ProcessFlowPart;
    }


    const handleAccordianChange = (newExpanded: boolean, setExpanded: (newExpanded: boolean) => void) => {
        if (props.connectedEdges.length !== 0) {
            setExpanded(newExpanded);
        }
    };

    const handleTreatmentTypeChange = (event) => {
        setNodes((nds) =>
            nds.map((n: Node<ProcessFlowPart>) => {
                if (n.data.diagramNodeId === props.selectedNode.id) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            treatmentType: Number(event.target.value)
                        }
                    };
                }
                return n;
            }),
        );
    };

    const getTotalChipLabel = (totalFlowValue) => {
        if (totalFlowValue === undefined || totalFlowValue === null) {
            return '';
        }
        return totalFlowValue;
    }

    /**
   * Edge states are assumed to be updated from caller
   */
    const updateCalculatedDataFromConnectedIds = (nodes, connectedNodeIds, nodeCalculatedDataMap, setNodeCalculatedData) => {
      let updatedNodeCalculatedDataMap: Record<string, NodeCalculatedData> = {
        ...nodeCalculatedDataMap,
      }

      nodes.forEach((node: Node<ProcessFlowPart>) => {
        if (connectedNodeIds.includes(node.id)) {
          if (node.data.processComponentType === 'water-intake' || node.data.processComponentType === 'water-discharge') {
            const nodeEdges = getConnectedEdges([node], getEdges());
            updateNodeCalculatedDataMap(
              node,
              nodes,
              nodeEdges,
              updatedNodeCalculatedDataMap,
              setNodeCalculatedData
            );
          }
        }
      });
    }

    const onDistributeFlowEvenly = (totalFlowValue: number, updateIds: string[]) => {
        let dividedTotalFlow = totalFlowValue / updateIds.length;
        let connectedEdges = [];
        const allEdges = [...getEdges()].map((edge: Edge<CustomEdgeData>) => {
            if (updateIds.includes(edge.id)) {
                edge.data.flowValue = dividedTotalFlow;
            }
            if (edge.source === componentData.diagramNodeId || edge.target === componentData.diagramNodeId) {
                connectedEdges.push(edge);
            }
            return edge;
        });
        props.setConnectedEdges(connectedEdges);
        setEdges(allEdges);
    }

    // todo can this be optimized? updating a lot of state here...
    const onFlowDataChange = (event, edgeId: string) => {
        let connectedEdges = [];
        let connectedNodeIds = [];
        const updatedValue = event.target.value === "" ? null : Number(event.target.value);

        const allEdges = [...getEdges()].map((edge: Edge<CustomEdgeData>) => {
            if (edge.id === edgeId) {
                edge.data.flowValue = updatedValue;
            }
            if (edge.source === props.selectedNode.id) {
                // push target id to check for potential discharge
                connectedEdges.push(edge);
                connectedNodeIds.push(edge.target);
            }
            if (edge.target === props.selectedNode.id) {
                // push source id to check for potential intake
                connectedNodeIds.push(edge.source);
                connectedEdges.push(edge);
            }
            return edge;
        });

        const nodes = getNodes();
        const {sourceCalculatedTotalFlow, dischargeCalculatedTotalFlow} = getNodeFlowTotals(connectedEdges, nodes, props.selectedNode.id);
        if (componentData.userEnteredData.totalSourceFlow === undefined) {
            setTotalSourceFlow(sourceCalculatedTotalFlow);
        }
        if (componentData.userEnteredData.totalDischargeFlow === undefined) {
            setTotalDischargeFlow(dischargeCalculatedTotalFlow);
        }

        if (props.selectedNode.data.processComponentType === 'water-intake' || props.selectedNode.data.processComponentType === 'water-discharge') {
            // * Update self
            let updatedNodeCalculatedDataMap: Record<string, NodeCalculatedData> = {
                ...flowContext.nodeCalculatedDataMap,
            }
            updatedNodeCalculatedDataMap[props.selectedNode.id] = {
                totalSourceFlow: sourceCalculatedTotalFlow,
                totalDischargeFlow: dischargeCalculatedTotalFlow,
            }
            flowContext.setNodeCalculatedData(updatedNodeCalculatedDataMap);
        } else {
            // * Update related nodes
            updateCalculatedDataFromConnectedIds(nodes, connectedNodeIds, flowContext.nodeCalculatedDataMap, flowContext.setNodeCalculatedData);
        }

        setEdges(allEdges);
        props.setConnectedEdges(connectedEdges);
    }


    const onTotalFlowValueChange = (event, setTotalFlow: (number) => void, isSource: boolean) => {
        const updatedValue = event.target.value === "" ? null : Number(event.target.value);
        setTotalFlow(updatedValue);
        setNodes((nds) =>
            nds.map((n: Node<ProcessFlowPart>) => {
                if (n.data.diagramNodeId === componentData.diagramNodeId) {
                    const updatedNode = {
                        ...n,
                        data: {
                            ...n.data,
                            userEnteredData: {
                                totalSourceFlow: isSource ? updatedValue : n.data.userEnteredData.totalSourceFlow,
                                totalDischargeFlow: isSource ? n.data.userEnteredData.totalDischargeFlow : updatedValue,
                            }
                        }
                    };
                    return updatedNode;
                }
                return n;
            }),
        );
        
    }

    const getConnectionListItem = (edge: Edge, source: ProcessFlowPart, target: ProcessFlowPart) => {
        const flowId: string = edge.id;
        return (
            <ListItem
                sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '.5rem' }}
                key={flowId}
                disablePadding>
                <TextField
                    label={<FlowConnectionText source={source} target={target} />}
                    id={flowId}
                    type={'number'}
                    size="small"
                    value={edge.data.flowValue === null ? "" : Number(edge.data.flowValue)}
                    onChange={(event) => onFlowDataChange(event, edge.id)}
                    sx={{ m: 1, width: '100%' }}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">Mgal</InputAdornment>,
                    }}
                />
            </ListItem>
        );
    }

    const dischargeEdgeInputElements = [];
    let sourceEdgesTotalFlow = 0;
    let dischargeEdgesTotalFlow = 0;

    const sourceEdgeIds = [];
    const dischargeEdgeIds = [];
    const sourceEdgeInputElements: JSX.Element[] = props.connectedEdges.map((edge: Edge<CustomEdgeData>) => {
        const { source, target } = getEdgeSourceAndTarget(edge, getNodes());
        if (props.selectedNode.id === target.diagramNodeId) {
            sourceEdgesTotalFlow += edge.data.flowValue;
            sourceEdgeIds.push(edge.id);
            return getConnectionListItem(edge, source, target);
        } else if (props.selectedNode.id === source.diagramNodeId) {
            dischargeEdgesTotalFlow += edge.data.flowValue;
            dischargeEdgeIds.push(edge.id);
            dischargeEdgeInputElements.push(getConnectionListItem(edge, source, target));
        }
    });

    const [totalSourceFlow, setTotalSourceFlow] = useState<number>(componentData.userEnteredData.totalSourceFlow !== undefined? componentData.userEnteredData.totalSourceFlow : sourceEdgesTotalFlow);
    const [totalDischargeFlow, setTotalDischargeFlow] = useState<number>(componentData.userEnteredData.totalDischargeFlow !== undefined? componentData.userEnteredData.totalDischargeFlow : dischargeEdgesTotalFlow);
    const sourceEdgeItems = sourceEdgeInputElements.filter(edge => edge !== undefined);

    return (<Box sx={{ paddingY: '.25rem', width: '100%' }} role="presentation" >
        <Box sx={{ marginTop: 1 }}>

            {(isWaterTreatment || isWasteWaterTreatment) &&
                <Box display={'flex'} flexDirection={'column'} marginBottom={'1rem'}>
                    <label htmlFor={'treatmentType'} className={'diagram-label'} style={{ fontSize: '.9rem' }}>Treatment Type</label>
                    <select className="form-control diagram-select" id={'treatmentType'} name="treatmentType"
                        value={defaultSelectedTreatmentType}
                        onChange={handleTreatmentTypeChange}>
                        {treatmentTypeOptions.map(option => {
                            return (
                                <option key={option.display + '' + option.value} value={option.value}>{option.display}</option>
                            )
                        })
                        }
                    </select>
                </Box>
            }

            {sourceEdgeItems.length > 0 &&
                <Accordion expanded={sourcesExpanded} onChange={(event, newExpanded) => handleAccordianChange(newExpanded, setSourcesExpanded)}>
                    <AccordionSummary>
                        <span style={{alignSelf: 'center'}}>Sources</span>
                            <Chip label={`${getTotalChipLabel(totalSourceFlow)} Mgal`}
                                variant="outlined"
                                sx={{ background: '#fff', borderRadius: '8px', marginRight: '1rem' }}
                            />
                    </AccordionSummary>
                    <AccordionDetails>
                        <SmallTooltip title="Set flows evenly from total source value"
                            slotProps={{
                                popper: {
                                    disablePortal: true,
                                }
                            }}>
                            {/* * must wrap with span to allow tooltip events when disabled*/}
                            <span>
                            <Button onClick={() => onDistributeFlowEvenly(totalSourceFlow, sourceEdgeIds)}
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

                                }}/>
                            </Button>
                            </span>
                        </SmallTooltip>
                        <TextField
                            label={'Total Flow'}
                            id={'totalSourceFlow'}
                            type={'number'}
                            color={'primary'}
                            size="small"
                            value={totalSourceFlow ?? ''}
                            onChange={(event) => onTotalFlowValueChange(event, setTotalSourceFlow, true)}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Mgal</InputAdornment>,
                            }}
                        />
                        <Divider sx={{ marginY: '1rem', backgroundColor: '#1976d2' }}></Divider>

                        <List sx={{ padding: 0 }}>
                            {sourceEdgeItems}
                        </List>
                    </AccordionDetails>
                </Accordion>
            }

            {dischargeEdgeInputElements.length > 0 &&
                <Accordion expanded={dischargeExpanded}
                    onChange={(event, newExpanded) => handleAccordianChange(newExpanded, setDischargeExpanded)}
                    slotProps={{
                        transition: { unmountOnExit: true }
                    }}>
                    <AccordionSummary>
                        <span style={{alignSelf: 'center'}}>Discharge</span>
                            <Chip label={`${getTotalChipLabel(totalDischargeFlow)} Mgal`}
                                variant="outlined"
                                sx={{ background: '#fff', borderRadius: '8px', marginRight: '1rem' }}
                            />
                    </AccordionSummary>
                    <AccordionDetails>
                        <SmallTooltip title="Set flows evenly from total discharge value"
                            slotProps={{
                                popper: {
                                    disablePortal: true,
                                }
                            }}>
                            {/* * must wrap with span to allow tooltip events when disabled*/}
                            <span>
                                <Button onClick={() => onDistributeFlowEvenly(totalDischargeFlow, dischargeEdgeIds)}
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
                                    }}/>
                                </Button>
                            </span>

                        </SmallTooltip>
                        <TextField
                            label={'Total Flow'}
                            id={'totalDischargeFlow'}
                            type={'number'}
                            size="small"
                            color={'primary'}
                            value={totalDischargeFlow ?? ''}
                            onChange={(event) => onTotalFlowValueChange(event, setTotalDischargeFlow, false)}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Mgal</InputAdornment>,
                            }}
                        />

                        <Divider sx={{ marginY: '1rem', backgroundColor: '#1976d2' }}></Divider>
                        <List sx={{ padding: 0 }}>
                            {dischargeEdgeInputElements}
                        </List>
                    </AccordionDetails>
                </Accordion>
            }
        </Box>
    </Box>);
}

export default memo(ComponentDataForm);

export interface ComponentDataFormProps {
    connectedEdges: Edge[];
    setConnectedEdges: (connectedEdges: Edge[]) => void;
    selectedNode: Node;
}



