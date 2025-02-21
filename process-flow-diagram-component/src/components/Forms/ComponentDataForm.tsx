import { Box, Chip,  } from "@mui/material";
import { getEdgeSourceAndTarget, getNodeFlowTotals } from "../Diagram/FlowUtils";
import { Edge, Node } from "@xyflow/react";

import React, { memo, useState } from "react";
import { CustomEdgeData, ProcessFlowPart, WasteWaterTreatment, WaterTreatment } from "../../../../src/process-flow-types/shared-process-flow-types";
import { wasteWaterTreatmentTypeOptions, waterTreatmentTypeOptions } from "../../../../src/process-flow-types/shared-process-flow-constants";
import { Accordion, AccordionDetails, AccordionSummary } from "../StyledMUI/AccordianComponents";
import FlowDisplayUnit from "../Diagram/FlowDisplayUnit";
import FlowValueDisplay from "../Diagram/FlowValueDisplay";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { setNodeDataProperty } from "../Diagram/diagramReducer";
import SourceFlowForm from "./SourceFlowForm";
import { selectNodes, selectNodeValidation, selectTotalDischargeFlow, selectTotalSourceFlow } from "../Diagram/store";
import DischargeFlowForm from "./DischargeFlowForm";
import InvalidIcon from "../../validation/InvalidIcon";
import { hasValidDischargeForm, hasValidSourceForm, isValidComponent } from "../../validation/Validation";

const ComponentDataForm = (props: ComponentDataFormProps) => {
    const dispatch = useAppDispatch();
    const nodes = useAppSelector(selectNodes);
    const errors = useAppSelector(selectNodeValidation);

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
    
    
    const handleAccordianChange = (newExpanded: boolean, setExpanded: (newExpanded: boolean) => void) => {
        if (props.connectedEdges.length !== 0) {
            setExpanded(newExpanded);
        }
    };

    const handleTreatmentTypeChange = (event) => {
        dispatch(setNodeDataProperty({optionsProp: 'treatmentType', updatedValue: Number(event.target.value)}));
    };
    
    const hasSources = props.connectedEdges.some((edge: Edge<CustomEdgeData>) => {
        const { source, target } = getEdgeSourceAndTarget(edge, nodes);
        return props.selectedNode.id === target.diagramNodeId;
    });
    
    const hasTargets = props.connectedEdges.some((edge: Edge<CustomEdgeData>) => {   
        const { source, target } = getEdgeSourceAndTarget(edge, nodes);
        return props.selectedNode.id === source.diagramNodeId;
    });
    
    const totalSourceFlow = useAppSelector(selectTotalSourceFlow);
    const totalDischargeFlow = useAppSelector(selectTotalDischargeFlow);
    
    const hasSourceErrors = errors && hasValidSourceForm(errors);
    const hasTargetErrors = errors && hasValidDischargeForm(errors);

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
                            {hasSourceErrors &&
                                <span style={{ marginLeft: '.5rem' }}><InvalidIcon level={errors.level} /></span>
                            }
                        </span>
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
                        <SourceFlowForm></SourceFlowForm>
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
                        <span style={{ display: 'flex', alignSelf: 'center' }}>
                            <span>
                                Discharge
                            </span>
                            {hasTargetErrors &&
                                <span style={{ marginLeft: '.5rem' }}><InvalidIcon level={errors.level} /></span>
                            }
                        </span>
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
                        <DischargeFlowForm></DischargeFlowForm>
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



