import React, { useEffect, useState } from 'react';
import { Box, Button, Divider, IconButton, InputAdornment, MenuItem, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Node } from '@xyflow/react';
import { HeatEnergy, MotorEnergy, ProcessFlowPart, getDefaultHeatEnergy, getDefaultMotorEnergy } from 'process-flow-lib';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import { nodeDataPropertyChange } from '../Diagram/diagramReducer';
import InputField from '../StyledMUI/InputField';
import { Accordion, AccordionDetails, AccordionSummary } from '../StyledMUI/AccordianComponents';

const toNumberOrUndefined = (value: string): number | undefined => value === '' ? undefined : Number(value);

const isMotorEnergyComplete = (motor: MotorEnergy): boolean => Boolean(
    motor.name?.trim() &&
    motor.numberUnits !== undefined && motor.numberUnits !== null &&
    motor.hoursPerYear !== undefined && motor.hoursPerYear !== null &&
    motor.loadFactor !== undefined && motor.loadFactor !== null &&
    motor.ratedPower !== undefined && motor.ratedPower !== null &&
    motor.systemEfficiency !== undefined && motor.systemEfficiency !== null
);

export default function NodeEnergy({ node, showHeatEnergy }: { node: Node<ProcessFlowPart>, showHeatEnergy: boolean }) {
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.diagram.settings);
    const [heatEnergy, setHeatEnergy] = useState<HeatEnergy>(node.data.heatEnergy || getDefaultHeatEnergy());
    const [motorEnergy, setMotorEnergy] = useState<MotorEnergy[]>(node.data.addedMotorEnergy || []);
    const [draftMotorEnergy, setDraftMotorEnergy] = useState<MotorEnergy>(getDefaultMotorEnergy((node.data.addedMotorEnergy || []).length));
    const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

    // * Node switched - resync local state from the newly selected node instead of carrying over the previous node's values
    useEffect(() => {
        const nextMotorEnergy = node.data.addedMotorEnergy || [];
        setHeatEnergy(node.data.heatEnergy || getDefaultHeatEnergy());
        setMotorEnergy(nextMotorEnergy);
        setDraftMotorEnergy(getDefaultMotorEnergy(nextMotorEnergy.length));
        setExpandedIndices(new Set());
    }, [node.data.diagramNodeId]);

    useEffect(() => {
        if (showHeatEnergy) {
            dispatch(nodeDataPropertyChange({ optionsProp: 'heatEnergy', updatedValue: heatEnergy }));
        }
    }, [heatEnergy]);

    useEffect(() => {
        dispatch(nodeDataPropertyChange({ optionsProp: 'addedMotorEnergy', updatedValue: motorEnergy }));
    }, [motorEnergy]);

    const handleHeatEnergyChange = (field: keyof HeatEnergy, value: number) => {
        setHeatEnergy({ ...heatEnergy, [field]: value });
    };

    const handleMotorEnergyChange = (index: number, field: keyof MotorEnergy, value: string | number) => {
        const updatedMotorEnergy = motorEnergy.map((motor, i) =>
            i === index ? { ...motor, [field]: value } : motor
        );
        setMotorEnergy(updatedMotorEnergy);
    };

    const handleDraftMotorEnergyChange = (field: keyof MotorEnergy, value: string | number) => {
        setDraftMotorEnergy({ ...draftMotorEnergy, [field]: value });
    };

    const addMotorEnergy = () => {
        const updatedMotorEnergy = [...motorEnergy, draftMotorEnergy];
        setMotorEnergy(updatedMotorEnergy);
        setDraftMotorEnergy(getDefaultMotorEnergy(updatedMotorEnergy.length));
    };

    const removeMotorEnergy = (index: number) => {
        setMotorEnergy(motorEnergy.filter((_, i) => i !== index));
        setExpandedIndices((prev) => {
            const next = new Set<number>();
            prev.forEach((i) => {
                if (i < index) next.add(i);
                else if (i > index) next.add(i - 1);
            });
            return next;
        });
    };

    const toggleExpanded = (index: number, expanded: boolean) => {
        setExpandedIndices((prev) => {
            const next = new Set(prev);
            if (expanded) next.add(index);
            else next.delete(index);
            return next;
        });
    };

    const isDraftComplete = isMotorEnergyComplete(draftMotorEnergy);

    const temperatureUnit = settings.unitsOfMeasure === 'Metric' ? '°C' : '°F';
    const powerUnit = settings.unitsOfMeasure === 'Imperial' ? 'hp' : 'kW';
    const dischargeFlowUnit = settings.unitsOfMeasure === 'Imperial' ? 'Mgal/yr' : 'm³/yr';

    return (
        <Box sx={{ marginTop: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
            {showHeatEnergy &&
                <>
                    <Typography variant="subtitle2" sx={{ paddingLeft: 1 }}>Heat Energy in Discharge</Typography>

                    <InputField
                        label="Incoming Water Temperature"
                        type="number"
                        size="small"
                        fullWidth
                        margin="normal"
                        value={heatEnergy?.incomingTemp ?? ''}
                        onChange={(e) => handleHeatEnergyChange('incomingTemp', toNumberOrUndefined(e.target.value))}
                        slotProps={{ input: { endAdornment: <InputAdornment position="end">{temperatureUnit}</InputAdornment> } }}
                    />
                    <InputField
                        label="Outgoing Water Temperature"
                        type="number"
                        size="small"
                        fullWidth
                        margin="normal"
                        value={heatEnergy?.outgoingTemp ?? ''}
                        onChange={(e) => handleHeatEnergyChange('outgoingTemp', toNumberOrUndefined(e.target.value))}
                        slotProps={{ input: { endAdornment: <InputAdornment position="end">{temperatureUnit}</InputAdornment> } }}
                    />
                    <InputField
                        select
                        label="Fuel Type"
                        size="small"
                        fullWidth
                        margin="normal"
                        value={heatEnergy?.heatingFuelType ?? 0}
                        onChange={(e) => handleHeatEnergyChange('heatingFuelType', Number(e.target.value))}
                    >
                        <MenuItem value={0}>Electricity</MenuItem>
                        <MenuItem value={1}>Fuel</MenuItem>
                    </InputField>
                    <InputField
                        label="Heater Efficiency"
                        type="number"
                        size="small"
                        fullWidth
                        margin="normal"
                        value={heatEnergy?.heaterEfficiency ?? ''}
                        onChange={(e) => handleHeatEnergyChange('heaterEfficiency', toNumberOrUndefined(e.target.value))}
                        slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                    />
                    <Box sx={{ paddingY: 1, textAlign: 'center' }}>
                        <Typography variant="caption" component="div">Waste Water Discharge</Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {heatEnergy?.wasteWaterDischarge
                                ? `${heatEnergy.wasteWaterDischarge.toLocaleString()} ${dischargeFlowUnit}`
                                : '— —'}
                        </Typography>
                    </Box>

                    <Divider sx={{ marginY: 2 }} />
                </>
            }

            <Typography variant="subtitle2" sx={{ paddingLeft: 1 }}>Add Pump Energy</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <InputField
                    label="Name"
                    size="small"
                    fullWidth
                    margin="normal"
                    value={draftMotorEnergy.name}
                    onChange={(e) => handleDraftMotorEnergyChange('name', e.target.value)}
                />
                <InputField
                    label="Number Units"
                    type="number"
                    size="small"
                    fullWidth
                    margin="normal"
                    value={draftMotorEnergy.numberUnits ?? ''}
                    onChange={(e) => handleDraftMotorEnergyChange('numberUnits', toNumberOrUndefined(e.target.value))}
                />
                <InputField
                    label="Operating Hours"
                    type="number"
                    size="small"
                    fullWidth
                    margin="normal"
                    value={draftMotorEnergy.hoursPerYear ?? ''}
                    onChange={(e) => handleDraftMotorEnergyChange('hoursPerYear', toNumberOrUndefined(e.target.value))}
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">hrs/yr</InputAdornment> } }}
                />
                <InputField
                    label="Load Factor"
                    type="number"
                    size="small"
                    fullWidth
                    margin="normal"
                    value={draftMotorEnergy.loadFactor ?? ''}
                    onChange={(e) => handleDraftMotorEnergyChange('loadFactor', toNumberOrUndefined(e.target.value))}
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                />
                <InputField
                    label="Rated Power"
                    type="number"
                    size="small"
                    fullWidth
                    margin="normal"
                    value={draftMotorEnergy.ratedPower ?? ''}
                    onChange={(e) => handleDraftMotorEnergyChange('ratedPower', toNumberOrUndefined(e.target.value))}
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">{powerUnit}</InputAdornment> } }}
                />
                <InputField
                    label="System Efficiency"
                    type="number"
                    size="small"
                    fullWidth
                    margin="normal"
                    value={draftMotorEnergy.systemEfficiency ?? ''}
                    onChange={(e) => handleDraftMotorEnergyChange('systemEfficiency', toNumberOrUndefined(e.target.value))}
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                />
                <Button
                    sx={{ width: '100%', marginY: 1 }}
                    variant="contained"
                    disabled={!isDraftComplete}
                    onClick={addMotorEnergy}
                >
                    Add Energy
                </Button>
            </Box>

            {motorEnergy.length > 0 &&
                <Box sx={{ marginTop: 2, display: 'flex', flexDirection: 'column' }}>
                    {motorEnergy.map((motor, index) => (
                        <Accordion
                            key={index}
                            expanded={expandedIndices.has(index)}
                            onChange={(_, expanded) => toggleExpanded(index, expanded)}
                        >
                            <AccordionSummary
                                component="div"
                                aria-controls={`pump-energy-${index}-content`}
                                id={`pump-energy-${index}-header`}
                            >
                                <Typography sx={{ alignSelf: 'center' }}>{motor.name}</Typography>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => { e.stopPropagation(); removeMotorEnergy(index); }}
                                    aria-label={`Delete ${motor.name}`}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </AccordionSummary>
                            <AccordionDetails sx={{ display: 'flex', flexDirection: 'column' }}>
                                <InputField
                                    label="Name"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    value={motor.name}
                                    onChange={(e) => handleMotorEnergyChange(index, 'name', e.target.value)}
                                />
                                <InputField
                                    label="Number Units"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    value={motor.numberUnits ?? ''}
                                    onChange={(e) => handleMotorEnergyChange(index, 'numberUnits', toNumberOrUndefined(e.target.value))}
                                />
                                <InputField
                                    label="Operating Hours"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    value={motor.hoursPerYear ?? ''}
                                    onChange={(e) => handleMotorEnergyChange(index, 'hoursPerYear', toNumberOrUndefined(e.target.value))}
                                    slotProps={{ input: { endAdornment: <InputAdornment position="end">hrs/yr</InputAdornment> } }}
                                />
                                <InputField
                                    label="Load Factor"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    value={motor.loadFactor ?? ''}
                                    onChange={(e) => handleMotorEnergyChange(index, 'loadFactor', toNumberOrUndefined(e.target.value))}
                                    slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                                />
                                <InputField
                                    label="Rated Power"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    value={motor.ratedPower ?? ''}
                                    onChange={(e) => handleMotorEnergyChange(index, 'ratedPower', toNumberOrUndefined(e.target.value))}
                                    slotProps={{ input: { endAdornment: <InputAdornment position="end">{powerUnit}</InputAdornment> } }}
                                />
                                <InputField
                                    label="System Efficiency"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    value={motor.systemEfficiency ?? ''}
                                    onChange={(e) => handleMotorEnergyChange(index, 'systemEfficiency', toNumberOrUndefined(e.target.value))}
                                    slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                                />
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            }
        </Box>
    );
}
