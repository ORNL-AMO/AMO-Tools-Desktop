import { Box, Button, Chip, createTheme, FormControl, InputLabel, MenuItem, Select, Typography, useTheme, } from "@mui/material";
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
import { ProcessFlowPart, WaterTreatment, waterTreatmentTypeOptions, WasteWaterTreatment, wasteWaterTreatmentTypeOptions, CustomEdgeData, waterUsingSystemTypeOptions } from "process-flow-lib";


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

    const handleTreatmentTypeChange = (treatmentType: number) => {
        dispatch(nodeDataPropertyChange({ optionsProp: 'treatmentType', updatedValue: treatmentType }));
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
    // todo subtract known losses and water in product
    const unknownLoss = totalSourceFlow - totalDischargeFlow;
    const hasSourceErrors = errors && hasValidSourceForm(errors);
    const hasTargetErrors = errors && hasValidDischargeForm(errors);

    const invalidIconStyle = {
        marginRight: '.5rem',
        height: '24px',
    }

    return (<Box sx={{ paddingY: '.25rem', width: '100%' }} role="presentation" >
        <Box sx={{ marginTop: 1, display: 'flex', justifyContent: 'space-evenly', flexDirection: 'row', flexWrap: 'wrap', flexBasis: '100%' }}>
            {isWaterUsingSystem && Boolean(unknownLoss) &&
                <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}
                    sx={{
                        background: theme.palette.info.main,
                        borderRadius: '8px',
                        border: `1px solid ${theme.palette.info.dark}`,
                        width: '100%',
                        marginBottom: '1rem',
                    }}>
                    <Box display={'flex'}
                        flexDirection={'row'}
                        justifyContent={'space-around'}
                        alignItems={'center'}
                        margin={'1rem .5rem'}
                        width={'100%'}
                        fontSize={'.9rem'}
                        fontWeight={'700'}
                        sx={{ color: theme.palette.info.contrastText, fontWeight: '700' }}
                    >
                        <Typography>
                            Unknown Loss
                        </Typography>
                        <Typography fontSize={'1.25rem'}>
                            <span>{unknownLoss}</span>
                            <FlowDisplayUnit style={{ fontSize: '1.25rem' }} />
                        </Typography>
                    </Box>
                </Box>
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



