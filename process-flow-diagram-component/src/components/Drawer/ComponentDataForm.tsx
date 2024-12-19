import { Box, List, TextField, InputAdornment, ListItem, ListItemButton, ListItemIcon, Divider, styled, Typography, Select, MenuItem, FormControl, Chip, Tooltip, TooltipProps, tooltipClasses, Button } from "@mui/material";
import { getEdgeSourceAndTarget } from "../Flow/FlowUtils";
import { Edge, Node, useReactFlow } from "@xyflow/react";
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined';

import React, { memo, useState } from "react";
import FlowConnectionText from "./FlowConnectionText";
import { CustomEdgeData, ProcessFlowPart, WasteWaterTreatment, WaterTreatment } from "../../../../src/process-flow-types/shared-process-flow-types";
import { wasteWaterTreatmentTypeOptions, waterTreatmentTypeOptions } from "../../../../src/process-flow-types/shared-process-flow-constants";
import { Accordion, AccordionDetails, AccordionSummary } from "../MUIStyledComponents";

const SmallTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        padding: '.5rem',
        fontSize: 14,
    },
}));

const ComponentDataForm = (props: ComponentDataFormProps) => {
    const { getNodes, setNodes } = useReactFlow();
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

    const getConnectionListItem = (edge: Edge, source: ProcessFlowPart, target: ProcessFlowPart) => {
        const flowId: string = edge.id;
        return (
            <ListItem
                sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
                key={flowId}
                disablePadding>
                <TextField
                    label={<FlowConnectionText source={source} target={target} />}
                    id={flowId}
                    type={'number'}
                    value={edge.data.flowValue === null ? "" : Number(edge.data.flowValue)}
                    onChange={(event) => props.onFlowDataChange(event, edge.id)}
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
    // if (componentData.totalSourceFlow === undefined) {
    //     componentData.totalSourceFlow = sourceEdgesTotalFlow;
    // }
    // if (componentData.totalDischargeFlow === undefined) {
    //     componentData.totalDischargeFlow = dischargeEdgesTotalFlow;
    // }
    const sourceEdgeItems = sourceEdgeInputElements.filter(edge => edge !== undefined);

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
                        <span>Sources</span>
                        {componentData.totalSourceFlow !== undefined &&
                            <Chip label={`${componentData.totalSourceFlow} Mgal`}
                                variant="outlined"
                                sx={{ background: '#fff', borderRadius: '8px', marginRight: '1rem' }}
                            />
                        }
                    </AccordionSummary>
                    <AccordionDetails>
                        <SmallTooltip title="Set evenly-distributed flows"
                            slotProps={{
                                popper: {
                                    disablePortal: true,
                                }
                            }}>
                            {/* * must wrap with span to allow tooltip events when disabled*/}
                            <span>
                            <Button onClick={() => props.onDistributeFlowEvenly(componentData.totalSourceFlow, sourceEdgeIds)}
                                disabled={!componentData.totalSourceFlow}
                                variant="outlined" sx={{
                                    marginRight: '1rem',
                                    padding: '.5rem',
                                    display: 'inline-block'
                                }}>
                                <CallSplitOutlinedIcon />
                            </Button>
                            </span>
                        </SmallTooltip>
                        {/* // todo should become uncontrolled or use debounce. overwriting user input */}

                        <TextField
                            label={'Total Source Flow'}
                            id={'totalSourceFlow'}
                            type={'number'}
                            color={'primary'}
                            value={componentData.totalSourceFlow ?? ''}
                            onChange={(event) => props.onTotalFlowValueChange(event, true)}
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
                        <span>Discharge</span>
                        {componentData.totalDischargeFlow !== undefined &&
                            <Chip label={`${componentData.totalDischargeFlow} Mgal`}
                                variant="outlined"
                                sx={{ background: '#fff', borderRadius: '8px', marginRight: '1rem' }}
                            />
                        }
                    </AccordionSummary>
                    <AccordionDetails>
                        <SmallTooltip title="Set evenly-distributed flows"
                            slotProps={{
                                popper: {
                                    disablePortal: true,
                                }
                            }}>
                            {/* * must wrap with span to allow tooltip events when disabled*/}
                            <span>
                                <Button onClick={() => props.onDistributeFlowEvenly(componentData.totalDischargeFlow, dischargeEdgeIds)}
                                    disabled={!componentData.totalDischargeFlow}
                                    variant="outlined" sx={{
                                        marginRight: '1rem',
                                        padding: '.5rem',
                                        display: 'inline-block'
                                    }}>
                                    <CallSplitOutlinedIcon />
                                </Button>
                            </span>

                        </SmallTooltip>
                        <TextField
                            label={'Total Discharge Flow'}
                            id={'totalDischargeFlow'}
                            type={'number'}
                            color={'primary'}
                            value={componentData.totalDischargeFlow ?? ''}
                            onChange={(event) => props.onTotalFlowValueChange(event, false)}
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
    onFlowDataChange: (event, edgeId: string) => void;
    onTotalFlowValueChange: (event, isSource: boolean) => void;
    onDistributeFlowEvenly: (totalFlowValue: number, updateIds: string[]) => void;
    selectedNode: Node;
}



