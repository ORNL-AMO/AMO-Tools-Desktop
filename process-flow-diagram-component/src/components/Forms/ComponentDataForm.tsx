import { Box, Chip, createTheme, Typography, useTheme, } from "@mui/material";
import { getEdgeSourceAndTarget, getNodeFlowTotals } from "../Diagram/FlowUtils";
import { Edge, Node } from "@xyflow/react";

import React, { memo, useState } from "react";
import { CustomEdgeData, ProcessFlowPart, WasteWaterTreatment, WaterTreatment } from "../../../../src/process-flow-types/shared-process-flow-types";
import { wasteWaterTreatmentTypeOptions, waterTreatmentTypeOptions } from "../../../../src/process-flow-types/shared-process-flow-constants";
import { Accordion, AccordionDetails, AccordionSummary } from "../StyledMUI/AccordianComponents";
import FlowDisplayUnit from "../Diagram/FlowDisplayUnit";
import FlowValueDisplay from "../Diagram/FlowValueDisplay";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { nodeDataPropertyChange } from "../Diagram/diagramReducer";
import SourceFlowForm from "./SourceFlowForm";
import { selectNodes, selectNodeValidation, selectTotalDischargeFlow, selectTotalSourceFlow } from "../Diagram/store";
import DischargeFlowForm from "./DischargeFlowForm";
import InvalidIcon from "../../validation/InvalidIcon";
import { hasValidDischargeForm, hasValidSourceForm, isValidComponent } from "../../validation/Validation";
import { yellow } from "@mui/material/colors";
import SelectTreatmentType from "./SelectTreatmentType";


const theme = createTheme({
    palette: {
      info: yellow,
    },
  });

const ComponentDataForm = (props: ComponentDataFormProps) => {
    // const theme = useTheme();
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
        setExpanded(newExpanded);
    };

    const handleTreatmentTypeChange = (event) => {
        dispatch(nodeDataPropertyChange({ optionsProp: 'treatmentType', updatedValue: Number(event.target.value) }));
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
    const unknownLoss = totalSourceFlow - totalDischargeFlow;
    const hasSourceErrors = errors && hasValidSourceForm(errors);
    const hasTargetErrors = errors && hasValidDischargeForm(errors);

    const invalidIconStyle = {
        marginRight: '.5rem',
        height: '24px',
    }

    return (<Box sx={{ paddingY: '.25rem', width: '100%' }} role="presentation" >
        <Box sx={{ marginTop: 1, display: 'flex', justifyContent: 'space-evenly', flexDirection: 'row', flexWrap: 'wrap', flexBasis: '100%' }}>
            {(isWaterTreatment || isWasteWaterTreatment) &&
                <Box display={'flex'} flexDirection={'column'} marginBottom={'1rem'}>
                    <label htmlFor={'treatmentType'} className={'diagram-label'} style={{ fontSize: '.9rem' }}>Treatment Type</label>
                    <SelectTreatmentType
                        treatmentType={defaultSelectedTreatmentType}
                        handleTreatmentTypeChange={handleTreatmentTypeChange}
                        treatmentOptions={treatmentTypeOptions}
                    ></SelectTreatmentType>
                </Box>
            }

            {hasSources &&
                <Accordion expanded={sourcesExpanded} onChange={(event, newExpanded) => handleAccordianChange(newExpanded, setSourcesExpanded)}>
                    <AccordionSummary>
                        <span style={{ display: 'flex', alignSelf: 'center' }}>
                            <span>
                                Source
                            </span>
                            {hasSourceErrors &&
                                <span style={{ marginLeft: '.5rem' }}><InvalidIcon level={errors.source.level} sx={invalidIconStyle} /></span>
                            }
                        </span>
                        <Chip label={
                            <>
                                <FlowValueDisplay flowValue={totalSourceFlow} />
                                <FlowDisplayUnit />
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

            <Accordion expanded={dischargeExpanded}
                onChange={(event, newExpanded) => handleAccordianChange(newExpanded, setDischargeExpanded)}
                >
                <AccordionSummary>
                    <span style={{ display: 'flex', alignSelf: 'center' }}>
                        <span>
                            Discharge
                        </span>
                        {hasTargetErrors &&
                            <span style={{ marginLeft: '.5rem' }}><InvalidIcon level={errors.discharge.level} sx={invalidIconStyle} /></span>
                        }
                    </span>
                    <Chip label={
                        <>
                            <FlowValueDisplay flowValue={totalDischargeFlow} />
                            <FlowDisplayUnit />
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

        </Box>
        <Box sx={{ marginY: '1rem', marginLeft: '1rem', display: 'flex', justifyContent: 'space-evenly', flexDirection: 'row', flexWrap: 'wrap' }}>
            <Box sx={{ flexGrow: 1, minWidth: 0 }} />
            {Boolean(unknownLoss)  &&
            <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}
                sx={{ 
                    background: theme.palette.info.main, 
                    borderRadius: '8px', 
                    width: '100%', 
                }}>
                <Typography fontSize={'.9rem'} sx={{ color: theme.palette.info.contrastText, marginTop: '.5rem' }}>
                    Unknown Loss
                </Typography>
                <Typography fontSize={'1.25rem'} sx={{ color: theme.palette.info.contrastText, marginBottom: '.5rem' }}>
                    <span>{unknownLoss}</span>
                    <FlowDisplayUnit style={{fontSize: '.9rem'}}/>
                </Typography>
            </Box>
            }
        </Box>
    </Box>);
}

export default memo(ComponentDataForm);

export interface ComponentDataFormProps {
    connectedEdges: Edge[];
    selectedNode: Node<ProcessFlowPart>;
}



