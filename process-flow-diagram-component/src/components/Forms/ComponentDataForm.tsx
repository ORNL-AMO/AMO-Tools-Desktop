import { Alert, Box, Button, Chip, createTheme, FormControl, InputAdornment, InputLabel, MenuItem, Select, Typography, useTheme, } from "@mui/material";
import { getEdgeSourceAndTarget, getNodeFlowTotals } from "../Diagram/FlowUtils";
import { Edge, Node } from "@xyflow/react";

import React, { memo, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary } from "../StyledMUI/AccordianComponents";
import FlowDisplayUnit from "../Diagram/FlowDisplayUnit";
import FlowValueDisplay from "../Diagram/FlowValueDisplay";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { modalOpenChange, nodeDataPropertyChange } from "../Diagram/diagramReducer";
import SourceFlowForm from "./SourceFlowForm";
import { selectNodes, selectNodeValidation, selectTotalDischargeFlow, selectTotalSourceFlow } from "../Diagram/store";
import DischargeFlowForm from "./DischargeFlowForm";
import InvalidIcon from "../../validation/InvalidIcon";
import { hasValidDischargeForm, hasValidSourceForm, isValidComponent } from "../../validation/Validation";
import { blue, yellow } from "@mui/material/colors";
import SelectTreatmentType from "./SelectTreatmentType";
import SmallTooltip from "../StyledMUI/SmallTooltip";
import CalculateIcon from '@mui/icons-material/Calculate';
import { ProcessFlowPart, WaterTreatment, waterTreatmentTypeOptions, WasteWaterTreatment, wasteWaterTreatmentTypeOptions, CustomEdgeData, waterUsingSystemTypeOptions, WaterUsingSystem, getSystemEstimatedUnknownLosses } from "process-flow-lib";
import InputField from "../StyledMUI/InputField";


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
    const totalSourceFlow = useAppSelector(selectTotalSourceFlow);
    const totalDischargeFlow = useAppSelector(selectTotalDischargeFlow);
    const settings = useAppSelector((state) => state.diagram.settings);

    const [systemType, setSystemType] = React.useState<number>(props.selectedNode.data.systemType);

    const handleSystemTypeChange = (systemType: number): void => {
        setSystemType(systemType);
        dispatch(nodeDataPropertyChange({ optionsProp: "systemType", updatedValue: systemType }));
    }

    const onClickEstimateFlow = (): void => {
        dispatch(modalOpenChange(true));
    }

    const [sourcesExpanded, setSourcesExpanded] = useState<boolean>(true);
    const [dischargeExpanded, setDischargeExpanded] = useState<boolean>(true);

    // todo for future diagrams - setComponentTypeData<T>
    let componentData: ProcessFlowPart = { ...props.selectedNode.data } as ProcessFlowPart;
    const isWaterTreatment = props.selectedNode.type === 'waterTreatment';
    const isWasteWaterTreatment = props.selectedNode.type === 'wasteWaterTreatment';
    const isWaterUsingSystem = props.selectedNode.type === 'waterUsingSystem';
    const isDischargeOutlet = props.selectedNode.type === 'waterDischarge';
    let totalUnknownLoss: number = 0;

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
    } else if (isWaterUsingSystem) {
        const waterSystem = componentData as WaterUsingSystem;
        totalUnknownLoss = getSystemEstimatedUnknownLosses(waterSystem, totalSourceFlow, totalDischargeFlow);
    } 

    const handleAccordianChange = (newExpanded: boolean, setExpanded: (newExpanded: boolean) => void) => {
        setExpanded(newExpanded);
    };

    const handleNodePropertyChange = (nodeProp: string, value: number) => {
        dispatch(nodeDataPropertyChange({ optionsProp: nodeProp, updatedValue: value }));
    };
    const hasSources = props.connectedEdges.some((edge: Edge<CustomEdgeData>) => {
        const { source, target } = getEdgeSourceAndTarget(edge, nodes);
        return props.selectedNode.id === target.diagramNodeId;
    });
    const hasTargets = props.connectedEdges.some((edge: Edge<CustomEdgeData>) => {
        const { source, target } = getEdgeSourceAndTarget(edge, nodes);
        return props.selectedNode.id === source.diagramNodeId;
    });
    const hasSourceErrors = errors && hasValidSourceForm(errors);
    const hasTargetErrors = errors && hasValidDischargeForm(errors);

    const invalidIconStyle = {
        marginRight: '.5rem',
        height: '24px',
    }

    return (<Box sx={{ paddingY: '.25rem', width: '100%' }} role="presentation" >
        <Box sx={{ marginTop: 1, display: 'flex', justifyContent: 'space-evenly', flexDirection: 'row', flexWrap: 'wrap', flexBasis: '100%' }}>
            {isWaterUsingSystem && totalDischargeFlow > totalSourceFlow && totalUnknownLoss !== 0 &&
                <Alert severity="warning" sx={{marginBottom: '1rem', width: '100%'}}>
                    <span>System Imbalance: </span>
                    <span>{totalUnknownLoss}</span>
                    <FlowDisplayUnit  />
                </Alert>
            }

            {isWaterUsingSystem &&
                <Box display={'flex'} width={'100%'}>

                    <FormControl fullWidth size='small' variant='outlined' sx={{ marginBottom: '1rem' }}>
                        <InputLabel id={`systemType-label`}>
                            System Type
                        </InputLabel>
                        <Select
                            labelId={`systemType-label`}
                            label={'System Type'}
                            id={'systemType'}
                            name={'systemType'}
                            size='small'
                            fullWidth
                            value={systemType}
                            onChange={(e) => handleSystemTypeChange(Number(e.target.value))}
                            MenuProps={{
                                disablePortal: true,
                                anchorOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                },
                                transformOrigin: {
                                    vertical: 'top',
                                    horizontal: 'left',
                                }
                            }}
                        >
                            {waterUsingSystemTypeOptions.map((option, index) => {
                                return (
                                    <MenuItem key={option.display + '_' + index} value={option.value}>
                                        {option.display}
                                    </MenuItem>
                                )
                            })
                            }
                        </Select>
                    </FormControl>
                    <SmallTooltip title="Estimate flow by system type"
                        slotProps={{
                            popper: {
                                disablePortal: true,
                            }
                        }}>
                        <span>
                            <Button onClick={() => onClickEstimateFlow()}
                                sx={{
                                    marginLeft: '1rem',
                                    padding: '.25rem .5rem',
                                    display: 'inline-block',
                                    minWidth: 0
                                }}
                                variant="outlined">
                                <CalculateIcon />
                            </Button>
                        </span>
                    </SmallTooltip>
                </Box>

            }

            {(isWaterTreatment || isWasteWaterTreatment) &&
                <Box display={'flex'} flexDirection={'column'} marginBottom={'1rem'} width={'100%'}>
                    <label htmlFor={'treatmentType'} className={'diagram-label'} style={{ fontSize: '.9rem', marginLeft: '.5rem' }}>Treatment Type</label>
                    <SelectTreatmentType
                        treatmentType={defaultSelectedTreatmentType}
                        handleTreatmentTypeChange={(event) => handleNodePropertyChange('treatmentType', event)}
                        treatmentOptions={treatmentTypeOptions}
                    ></SelectTreatmentType>
                </Box>
            }

            <Box display={'flex'} marginBottom={'1rem'} width={'100%'}>

                <InputField
                    label={'Cost'}
                    id={`${props.selectedNode.id}-cost`}
                    name={`cost`}
                    type={'number'}
                    size="small"
                    value={componentData.cost}
                    // warning={hasWarning}
                    // helperText={hasWarning ? String(errors.flows[index]) : ""}
                    onChange={(event) => handleNodePropertyChange('cost', Number(event.target.value))}
                    sx={{ m: '1 0', width: '100%' }}
                    InputProps={{
                        endAdornment:
                            <InputAdornment position="end" sx={{ zIndex: 1 }}>
                                {settings.unitsOfMeasure === 'Imperial' ?
                                    <span style={{ zIndex: 1, background: 'white' }}>$/kgal</span>
                                    : <span style={{ zIndex: 1, background: 'white' }}>$/kL</span>
                                }
                            </InputAdornment>,
                    }}
                />
            </Box>

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

            {!isDischargeOutlet &&
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
                        {isWaterUsingSystem && totalSourceFlow > totalDischargeFlow && totalUnknownLoss !== 0 &&
                            <Alert severity="warning" sx={{marginBottom: '1rem', width: '100%'}}>
                            <span>Estimated Unknown Loss: </span>
                            <span>{totalUnknownLoss}</span>
                            <FlowDisplayUnit />
                        </Alert>
                        }
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



