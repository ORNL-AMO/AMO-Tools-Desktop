import { useEffect, useState } from 'react';
import { Box, Button, Divider, IconButton, InputAdornment, MenuItem, Paper, Table, TableBody, TableContainer, TableHead, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Node } from '@xyflow/react';
import { DiagramCalculatedData, HeatEnergy, MotorEnergy, ProcessFlowPart, getDefaultHeatEnergy, getDefaultMotorEnergy, getMaxHeatEnergyOutgoingTemp, getHeatEnergyCost, getHeatEnergyKWh, getHeatEnergyUse, getMotorEnergyCost, getMotorEnergyKWh, getNodeTotalInflow } from 'process-flow-lib';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import { nodeDataPropertyChange } from '../Diagram/diagramReducer';
import InputField from '../StyledMUI/InputField';
import CalculatorInputField from '../Calculators/CalculatorInputField';
import { Accordion, AccordionDetails, AccordionSummary } from '../StyledMUI/AccordianComponents';
import { StyledHeadTableRow, StyledTableCell, StyledTableRow } from '../StyledMUI/ResultTables';

const toNumberOrUndefined = (value: string): number | undefined => value === '' ? undefined : Number(value);

const MAX_LOAD_FACTOR = 150;

const getLoadFactorError = (loadFactor: number): string | undefined => {
    return loadFactor !== undefined && loadFactor !== null && loadFactor > MAX_LOAD_FACTOR
        ? `Value can't be greater than ${MAX_LOAD_FACTOR} %`
        : undefined;
};

interface HeatEnergyErrors {
    outgoingTemp?: string,
    heaterEfficiency?: string,
}

const getHeatEnergyErrors = (heatEnergy: HeatEnergy, unitsOfMeasure: string): HeatEnergyErrors => {
    const errors: HeatEnergyErrors = {};
    const isMetric = unitsOfMeasure === 'Metric';
    const maxOutgoingTemp = getMaxHeatEnergyOutgoingTemp(unitsOfMeasure);
    if (heatEnergy.outgoingTemp !== undefined && heatEnergy.outgoingTemp !== null && heatEnergy.outgoingTemp > maxOutgoingTemp) {
        errors.outgoingTemp = `Value can't be greater than ${maxOutgoingTemp} ${isMetric ? '°C' : '°F'}`;
    }
    if (heatEnergy.heaterEfficiency !== undefined && heatEnergy.heaterEfficiency !== null) {
        if (heatEnergy.heaterEfficiency <= 0) {
            errors.heaterEfficiency = 'Value must be greater than 0 %';
        } else if (heatEnergy.heaterEfficiency > 100) {
            errors.heaterEfficiency = "Value can't be greater than 100 %";
        }
    }
    return errors;
};

interface EnergyResult {
    annualEnergy: number,
    annualCost: number,
    // * fuel-fired heat only - energy in the fuel's native unit (MMBtu/yr ; GJ/yr), shown below kWh/yr
    annualFuelEnergy?: { value: number, unit: string },
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const formatNumber = (value: number): string => value.toLocaleString('en-US', { maximumFractionDigits: 2 });
const formatAnnualEnergy = (value: number): string => `${formatNumber(value)} kWh/yr`;

const EnergyResultReadout = ({ result }: { result: EnergyResult }) => (
    <Box sx={{ display: 'flex', paddingY: 1, textAlign: 'center' }}>
        <Box sx={{ flex: 1 }}>
            <Typography variant="caption" component="div">Energy</Typography>
            <Typography variant="body2" fontWeight="bold">{formatAnnualEnergy(result.annualEnergy)}</Typography>
            {result.annualFuelEnergy &&
                <Typography variant="body2" fontWeight="bold">{formatNumber(result.annualFuelEnergy.value)} {result.annualFuelEnergy.unit}</Typography>
            }
        </Box>
        <Box sx={{ flex: 1 }}>
            <Typography variant="caption" component="div">Annual Cost</Typography>
            <Typography variant="body2" fontWeight="bold">{currency.format(result.annualCost)}</Typography>
        </Box>
    </Box>
);

export default function NodeEnergy({ node, showHeatEnergy }: { node: Node<ProcessFlowPart>, showHeatEnergy: boolean }) {
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.diagram.settings);
    const calculatedData: DiagramCalculatedData = useAppSelector((state) => state.diagram.calculatedData);
    const [heatEnergy, setHeatEnergy] = useState<HeatEnergy>(node.data.heatEnergy || getDefaultHeatEnergy());
    const [motorEnergy, setMotorEnergy] = useState<MotorEnergy[]>(node.data.addedMotorEnergy || []);
    const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

    // * Node switched - resync local state from the newly selected node instead of carrying over the previous node's values
    useEffect(() => {
        setHeatEnergy(node.data.heatEnergy || getDefaultHeatEnergy());
        setMotorEnergy(node.data.addedMotorEnergy || []);
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

    // * Append a default entry and expand it so its form is ready to fill in
    const addMotorEnergy = () => {
        const newIndex = motorEnergy.length;
        setMotorEnergy([...motorEnergy, getDefaultMotorEnergy(newIndex)]);
        setExpandedIndices(new Set([newIndex]));
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

    const getMotorEnergyResult = (motor: MotorEnergy): EnergyResult => ({
        annualEnergy: getMotorEnergyKWh(motor, settings.unitsOfMeasure),
        annualCost: getMotorEnergyCost(motor, settings.electricityCost, settings.unitsOfMeasure),
    });

    const heatEnergyWithWaterUse: HeatEnergy = { ...heatEnergy, systemWaterUse: getNodeTotalInflow(node, calculatedData) };
    const heatEnergyResult: EnergyResult = {
        annualEnergy: getHeatEnergyKWh(heatEnergyWithWaterUse, settings.unitsOfMeasure),
        annualCost: getHeatEnergyCost(
            heatEnergyWithWaterUse,
            heatEnergy.heatingFuelType === 0 ? settings.electricityCost : settings.fuelCost,
            settings.unitsOfMeasure
        ),
        annualFuelEnergy: heatEnergy.heatingFuelType === 0 ? undefined : {
            value: getHeatEnergyUse(heatEnergyWithWaterUse, settings.unitsOfMeasure),
            unit: settings.unitsOfMeasure === 'Imperial' ? 'MMBtu/yr' : 'GJ/yr',
        },
    };

    const motorEnergyResults: EnergyResult[] = motorEnergy.map(getMotorEnergyResult);
    const turbomachineryResult: EnergyResult = motorEnergyResults.reduce((total, result) => ({
        annualEnergy: total.annualEnergy + result.annualEnergy,
        annualCost: total.annualCost + result.annualCost,
    }), { annualEnergy: 0, annualCost: 0 });

    const energyTotalRows: Array<{ label: string, result: EnergyResult }> = [
        ...(showHeatEnergy ? [{ label: 'Heat Energy', result: heatEnergyResult }] : []),
        { label: 'Turbomachinery Energy', result: turbomachineryResult },
    ];
    energyTotalRows.push({
        label: 'Total Energy',
        result: energyTotalRows.reduce((total, row) => ({
            annualEnergy: total.annualEnergy + row.result.annualEnergy,
            annualCost: total.annualCost + row.result.annualCost,
        }), { annualEnergy: 0, annualCost: 0 }),
    });

    const heatEnergyErrors: HeatEnergyErrors = getHeatEnergyErrors(heatEnergy, settings.unitsOfMeasure);

    const temperatureUnit = settings.unitsOfMeasure === 'Metric' ? '°C' : '°F';
    const powerUnit = settings.unitsOfMeasure === 'Imperial' ? 'hp' : 'kW';

    return (
        <Box sx={{ marginTop: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
            <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
                <Table size="small" aria-label="node energy totals">
                    <TableHead>
                        <StyledHeadTableRow>
                            <StyledTableCell>Node Energy</StyledTableCell>
                            <StyledTableCell align="right">Energy</StyledTableCell>
                            <StyledTableCell align="right">Annual Cost</StyledTableCell>
                        </StyledHeadTableRow>
                    </TableHead>
                    <TableBody>
                        {energyTotalRows.map((row) => (
                            <StyledTableRow key={row.label}>
                                <StyledTableCell component="th" scope="row">{row.label}</StyledTableCell>
                                <StyledTableCell align="right">{formatAnnualEnergy(row.result.annualEnergy)}</StyledTableCell>
                                <StyledTableCell align="right">{currency.format(row.result.annualCost)}</StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

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
                        error={Boolean(heatEnergyErrors.outgoingTemp)}
                        helperText={heatEnergyErrors.outgoingTemp}
                        onChange={(e) => handleHeatEnergyChange('outgoingTemp', toNumberOrUndefined(e.target.value))}
                        slotProps={{ input: { endAdornment: <InputAdornment position="end">{temperatureUnit}</InputAdornment> } }}
                    />
                    <InputField
                        select
                        label="Fuel Type"
                        size="small"
                        fullWidth
                        margin="normal"
                        value={heatEnergy?.heatingFuelType ?? 1}
                        onChange={(e) => handleHeatEnergyChange('heatingFuelType', Number(e.target.value))}
                        slotProps={{
                            select: {
                                MenuProps: {
                                    disablePortal: true,
                                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                                    transformOrigin: { vertical: 'top', horizontal: 'left' },
                                },
                            },
                        }}
                    >
                        <MenuItem value={0}>Electricity</MenuItem>
                        <MenuItem value={1}>Fuel</MenuItem>
                    </InputField>
                    <CalculatorInputField
                        calculators={['heater-efficiency']}
                        onCalculatedValue={(value) => handleHeatEnergyChange('heaterEfficiency', value)}
                        label="Heater Efficiency"
                        type="number"
                        size="small"
                        fullWidth
                        margin="normal"
                        value={heatEnergy?.heaterEfficiency ?? ''}
                        error={Boolean(heatEnergyErrors.heaterEfficiency)}
                        helperText={heatEnergyErrors.heaterEfficiency}
                        onChange={(e) => handleHeatEnergyChange('heaterEfficiency', toNumberOrUndefined(e.target.value))}
                        slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                    />
                    <EnergyResultReadout result={heatEnergyResult} />

                    <Divider sx={{ marginY: 2 }} />
                </>
            }

            <Typography variant="subtitle2" sx={{ paddingLeft: 1 }}>Add Turbomachinery Energy</Typography>
            <Button
                sx={{ width: '100%', marginY: 1 }}
                variant="contained"
                onClick={addMotorEnergy}
            >
                Add Energy
            </Button>

            {motorEnergy.length > 0 &&
                <Box sx={{ marginTop: 1, display: 'flex', flexDirection: 'column' }}>
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
                                <CalculatorInputField
                                    calculators={['operating-hours']}
                                    onCalculatedValue={(value) => handleMotorEnergyChange(index, 'hoursPerYear', value)}
                                    label="Operating Hours"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    value={motor.hoursPerYear ?? ''}
                                    onChange={(e) => handleMotorEnergyChange(index, 'hoursPerYear', toNumberOrUndefined(e.target.value))}
                                    slotProps={{ input: { endAdornment: <InputAdornment position="end">hrs/yr</InputAdornment> } }}
                                />
                                <CalculatorInputField
                                    calculators={['load-factor']}
                                    onCalculatedValue={(value) => handleMotorEnergyChange(index, 'loadFactor', value)}
                                    label="Load Factor"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    value={motor.loadFactor ?? ''}
                                    error={Boolean(getLoadFactorError(motor.loadFactor))}
                                    helperText={getLoadFactorError(motor.loadFactor)}
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
                                <EnergyResultReadout result={motorEnergyResults[index]} />
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            }
        </Box>
    );
}
