import { Box, Chip,  } from "@mui/material";
import { getEdgeSourceAndTarget, getNodeFlowTotals } from "../Diagram/FlowUtils";
import { Edge, Node, useReactFlow } from "@xyflow/react";

import React, { memo, useContext, useState } from "react";
import { CustomEdgeData, ProcessFlowPart, WasteWaterTreatment, WaterTreatment } from "../../../../src/process-flow-types/shared-process-flow-types";
import { wasteWaterTreatmentTypeOptions, waterTreatmentTypeOptions } from "../../../../src/process-flow-types/shared-process-flow-constants";
import { Accordion, AccordionDetails, AccordionSummary } from "../StyledMUI/AccordianComponents";
import FlowDisplayUnit from "../Diagram/FlowDisplayUnit";
import FlowValueDisplay from "../Diagram/FlowValueDisplay";
import SourceFlowForm from "./SourceFlowForm";
import DischargeFlowForm from "./DischargeFlowForm";
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InvalidIcon from "../../validation/InvalidIcon";
import { DiagramContext } from "../Diagram/FlowTypes";
import { RootDiagramContext } from "../Diagram/Diagram";

const ComponentDataForm = (props: ComponentDataFormProps) => {
    const { getNodes, setNodes } = useReactFlow();
    const [sourcesExpanded, setSourcesExpanded] = useState<boolean>(true);
    const [dischargeExpanded, setDischargeExpanded] = useState<boolean>(true);

    // todo for future diagrams - setComponentTypeData<T>
    let componentData: ProcessFlowPart = { ...props.selectedNode.data } as ProcessFlowPart;
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
    
    // const diagramContext: DiagramContext = useContext<DiagramContext>(RootDiagramContext);
    // const componentValidation: ComponentValidation = diagramContext.diagramValidation.nodes[componentData.diagramNodeId];
    // const isValid = isValidComponent(componentValidation);
    // console.log('ComponentDataForm isValidComponent', isValid);

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

    const hasSources = props.connectedEdges.some((edge: Edge<CustomEdgeData>) => {
        const { source, target } = getEdgeSourceAndTarget(edge, getNodes());
        return props.selectedNode.id === target.diagramNodeId;
    });
    
    const hasTargets = props.connectedEdges.some((edge: Edge<CustomEdgeData>) => {   
        const { source, target } = getEdgeSourceAndTarget(edge, getNodes());
        return props.selectedNode.id === source.diagramNodeId;
    });
    
    const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(props.connectedEdges, getNodes(), props.selectedNode.id);
    const totalSourceFlow = componentData.userEnteredData.totalSourceFlow !== undefined ? componentData.userEnteredData.totalSourceFlow : totalCalculatedSourceFlow;
    const totalDischargeFlow = componentData.userEnteredData.totalDischargeFlow !== undefined ? componentData.userEnteredData.totalDischargeFlow : totalCalculatedDischargeFlow;

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

            {hasSources &&
                <Accordion expanded={sourcesExpanded} onChange={(event, newExpanded) => handleAccordianChange(newExpanded, setSourcesExpanded)}>
                    <AccordionSummary>
                    <span style={{ display: 'flex', alignSelf: 'center' }}>
                            <span>
                                Sources
                            </span>
                        </span>
                        {/* <span style={{ display: 'flex', alignSelf: 'center' }}>
                            <span>
                                Sources
                            </span>
                            {componentValidation && !isValid &&
                                <span style={{ marginLeft: '.5rem' }}><InvalidIcon status={componentValidation.status} /></span>
                            }
                        </span> */}
                        <Chip label={
                            <>
                            <FlowValueDisplay flowValue={totalSourceFlow}/>
                            <FlowDisplayUnit/>
                            </>
                        }
                            variant="outlined"
                            sx={{ background: '#fff', borderRadius: '8px', marginRight: '1rem' }}
                        />
                    </AccordionSummary>
                    <AccordionDetails>
                        <SourceFlowForm selectedNodeId={props.selectedNode.data.diagramNodeId}></SourceFlowForm>
                    </AccordionDetails>
                </Accordion>
            }

            {hasTargets &&
                <Accordion expanded={dischargeExpanded}
                    onChange={(event, newExpanded) => handleAccordianChange(newExpanded, setDischargeExpanded)}
                    slotProps={{
                        transition: { unmountOnExit: true }
                    }}>
                    <AccordionSummary>
                        <span style={{ alignSelf: 'center' }}>Discharge</span>
                        <Chip label={
                            <>
                            <FlowValueDisplay flowValue={totalDischargeFlow}/>
                            <FlowDisplayUnit/>
                            </>
                        }
                            variant="outlined"
                            sx={{ background: '#fff', borderRadius: '8px', marginRight: '1rem' }}
                        />
                    </AccordionSummary>
                    <AccordionDetails>
                        {/* <DischargeFlowForm selectedNodeId={props.selectedNode.data.diagramNodeId}></DischargeFlowForm> */}
                    </AccordionDetails>
                </Accordion>
            }
        </Box>
    </Box>);
}

export default memo(ComponentDataForm);

export interface ComponentDataFormProps {
    connectedEdges: Edge[];
    selectedNode: Node<ProcessFlowPart>;
}



