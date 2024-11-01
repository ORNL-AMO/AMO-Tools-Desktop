import { Box, List, TextField, InputAdornment, ListItem, ListItemButton, ListItemIcon, Divider, styled, Typography, Select, MenuItem, FormControl } from "@mui/material";
import { CustomEdgeData } from "../Edges/DiagramBaseEdge";
import { getEdgeSourceAndTarget } from "../Flow/FlowUtils";
import { Edge, Node, useReactFlow } from "@xyflow/react";

import { useState } from "react";
import FlowConnectionText from "./FlowConnectionText";
import { ProcessFlowPart, WaterTreatment } from "../../../../src/process-flow-types/shared-process-flow-types";
import { wasteWaterTreatmentTypeOptions, waterTreatmentTypeOptions } from "../../../../src/process-flow-types/shared-process-flow-constants";
import { Accordion, AccordionDetails, AccordionSummary } from "../MUIStyledComponents";


const ComponentDataForm = (props: ComponentDataFormProps) => {
    // todo for future diagrams - setComponentTypeData<T>
    let componentData: ProcessFlowPart | WaterTreatment = props.selectedNode.data as ProcessFlowPart;
    const isWaterTreatment = props.selectedNode.type === 'waterTreatment';
    const isWasteWaterTreatment = props.selectedNode.type === 'wasteWaterTreatment';
    let defaultSelectedTreatmentType: number = 0;
    let treatmentTypeOptions: Array<{value: number, display: string}> = []
    if (isWaterTreatment) {
        componentData = componentData as WaterTreatment;
        defaultSelectedTreatmentType = componentData.treatmentType !== undefined? Number(componentData.treatmentType) : 0;
        treatmentTypeOptions = waterTreatmentTypeOptions;
    } else if (isWasteWaterTreatment) {
        componentData = componentData as WaterTreatment;
        defaultSelectedTreatmentType = componentData.treatmentType !== undefined? Number(componentData.treatmentType) : 0;
        treatmentTypeOptions = wasteWaterTreatmentTypeOptions;
    }

    const { getNodes, setNodes } = useReactFlow();
    const allNodes: Node[] = getNodes();
    const [sourcesExpanded, setSourcesExpanded] = useState<boolean>(true);
    const [dischargeExpanded, setDischargeExpanded] = useState<boolean>(true);

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
                        value={edge.data.flowValue === null? "" : Number(edge.data.flowValue)}
                        onChange={(event) => props.onFlowDataChange(event, edge.id)}
                        sx={{ m: 1, width: '100%' }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">Mgal</InputAdornment>,
                        }}
                    />
                </ListItem>
            );
    }

    let dischargeEdges = [];
    const sourceEdges: JSX.Element[] = props.connectedEdges.map((edge: Edge<CustomEdgeData>) => {
        const { source, target } = getEdgeSourceAndTarget(edge, allNodes);
        if (props.selectedNode.id === target.diagramNodeId) {
            return getConnectionListItem(edge, source, target);
        } else if (props.selectedNode.id === source.diagramNodeId) {
            dischargeEdges.push(getConnectionListItem(edge, source, target));
        }
    });
    const sourceEdgeItems = sourceEdges.filter(edge => edge !== undefined);

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
                <label htmlFor={'treatmentType'} className={'diagram-label'} style={{fontSize: '.9rem'}}>Treatment Type</label>
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
                    Source
                </AccordionSummary>
                <AccordionDetails>
                    <List sx={{ padding: 0 }}>
                        {sourceEdgeItems}
                    </List>
                </AccordionDetails>
            </Accordion>
        }

        {dischargeEdges.length > 0 &&
            <Accordion expanded={dischargeExpanded}
            onChange={(event, newExpanded) => handleAccordianChange(newExpanded, setDischargeExpanded)}
            slotProps={{
                transition: { unmountOnExit: true }
            }}>
                <AccordionSummary>
                    Discharge
                </AccordionSummary>
                <AccordionDetails>
                    <List sx={{ padding: 0 }}>
                        {dischargeEdges}
                    </List>
                </AccordionDetails>
            </Accordion>
        }
        </Box>
    </Box>);
}

export default ComponentDataForm;

export interface ComponentDataFormProps {
    connectedEdges: Edge[];
    onFlowDataChange: (event, edgeId: string) => void;
    selectedNode: Node;
}



