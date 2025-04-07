import React, { useContext } from 'react';
import { useFormik } from 'formik';
import { TextField, FormControl, InputAdornment, FormHelperText, Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../hooks/state';
import { RootState } from '../../Diagram/store';
import { EstimateSystemContext, EstimateSystemState } from './EstimateWaterSystem';
import EstimateResult from './EstimateResult';
import HoursPerYearInputField from './HoursPerYearInputField';
import { getEstimateSystemValidationSchema, WaterSystemFormMapping } from '../../../validation/Validation';
import { getInitialValuesFromForm } from './SystemEstimationFormUtils';
import { modalOpenChange } from '../../Diagram/diagramReducer';
import { BoilerWaterResults, BoilerWater, calculateBoilerWaterResults, convertAnnualFlowResult } from 'process-flow-lib';

const formLabelMapping: WaterSystemFormMapping = {
    power: { display: 'Power', initialValue: 0 },
    loadFactor: { display: 'Load Factor', initialValue: 0 },
    steamPerPower: { display: 'Steam Generation', initialValue: 0 },
    feedwaterConductivity: { display: 'Feedwater Conductivity', initialValue: 0 },
    makeupConductivity: { display: 'Makeup Conductivity', initialValue: 0 },
    blowdownConductivity: { display: 'Blowdown Conductivity', initialValue: 0 },
    hoursPerYear: { display: 'Hours Water Used Per Year', initialValue: 0 }
}

const BoilerWaterForm = (props: BoilerWaterProps) => {
    const estimateSystemContext = useContext<EstimateSystemState>(EstimateSystemContext);
    const settings = useAppSelector((state: RootState) => state.diagram.settings);
    const dispatch = useAppDispatch();
    const [ boilerWaterResults, setBoilerWaterResults ] = React.useState<BoilerWaterResults>(undefined);

    const formik = useFormik({
        initialValues: getInitialValuesFromForm(formLabelMapping),
        validationSchema: getEstimateSystemValidationSchema(formLabelMapping),
        onSubmit: values => { },
    });

    const handleInputChange = (e) => {
        formik.handleChange(e);
        const values: {[key: string | number]: any} = { ...formik.values, [e.target.name]: Number(e.target.value) };

        const boilerWater: BoilerWater = {
            hoursPerYear: values.hoursPerYear,
            power: values.power,
            loadFactor: values.loadFactor,
            steamPerPower: values.steamPerPower,
            feedwaterConductivity: values.feedwaterConductivity,
            makeupConductivity: values.makeupConductivity,
            blowdownConductivity: values.blowdownConductivity,
          }
          

        let boilerWaterResults: BoilerWaterResults = calculateBoilerWaterResults(boilerWater, formik.values.hoursPerYear);
        boilerWaterResults.cycleOfConcentration = convertAnnualFlowResult(boilerWaterResults.cycleOfConcentration, settings);
        boilerWaterResults.grossWaterUse = convertAnnualFlowResult(boilerWaterResults.grossWaterUse, settings);
        boilerWaterResults.makeupWater = convertAnnualFlowResult(boilerWaterResults.makeupWater, settings);
        boilerWaterResults.steamLoss = convertAnnualFlowResult(boilerWaterResults.steamLoss, settings);
        boilerWaterResults.blowdownLoss = convertAnnualFlowResult(boilerWaterResults.blowdownLoss, settings);
        boilerWaterResults.condensateReturn = convertAnnualFlowResult(boilerWaterResults.condensateReturn, settings);
        boilerWaterResults.rateOfRecirculation = convertAnnualFlowResult(boilerWaterResults.rateOfRecirculation, settings);

        console.log('boilerWaterResults', boilerWaterResults);
        setBoilerWaterResults(boilerWaterResults);
        estimateSystemContext.setEstimate(boilerWaterResults.grossWaterUse);

    };

    const resetEstimate = () => {
        formik.resetForm();
        estimateSystemContext.setEstimate(0);
    }

    const applyEstimate = (estimate: number) => {
        dispatch(modalOpenChange(false));
    }


    return (
        <Box component="form" onSubmit={formik.handleSubmit}>
            <HoursPerYearInputField formik={formik} handleInputChange={handleInputChange} />
            <FormControl fullWidth margin="normal" error={formik.touched.power && Boolean(formik.errors.power)}>
                <TextField
                    id="power"
                    name="power"
                    label={'Boiler'}
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.power}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">{settings.unitsOfMeasure === 'Imperial' ? 'hp' : 'MW'}</InputAdornment>
                        }
                    }}
                />
                {formik.touched.power && formik.errors.power && (
                    <FormHelperText>{typeof formik.errors.power === 'string' ? formik.errors.power : ''}</FormHelperText>
                )}
            </FormControl>

            <FormControl fullWidth margin="normal" error={formik.touched.loadFactor && Boolean(formik.errors.loadFactor)}>
                <TextField
                    id="loadFactor"
                    label={'Load Factor'}
                    name="loadFactor"
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.loadFactor}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                        }
                    }}
                />
                {formik.touched.loadFactor && formik.errors.loadFactor && (
                    <FormHelperText>{String(formik.errors.loadFactor)}</FormHelperText>
                )}
            </FormControl>

            <FormControl fullWidth margin="normal" error={formik.touched.steamPerPower && Boolean(formik.errors.steamPerPower)}>
                <TextField
                    id="steamPerPower"
                    name="steamPerPower"
                    label={`Steam Generation per ${settings.unitsOfMeasure === 'Imperial' ? 'BHP' : 'MW'}`}
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.steamPerPower}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">{settings.unitsOfMeasure === 'Imperial' ? 'lb/hr/BHP' : 'kg/hr/MW'}</InputAdornment>
                        }
                    }}
                />
                {formik.touched.steamPerPower && formik.errors.steamPerPower && (
                    <FormHelperText>{String(formik.errors.steamPerPower)}</FormHelperText>
                )}
            </FormControl>

            <FormControl fullWidth margin="normal" error={formik.touched.feedwaterConductivity && Boolean(formik.errors.feedwaterConductivity)}>
                <TextField
                    id="feedwaterConductivity"
                    name="feedwaterConductivity"
                    type="number"
                    size={'small'}
                    label={'Feedwater Conductivity'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.feedwaterConductivity}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">{settings.conductivityUnit === 'MuS/cm' ? <span>&#x3BC;</span> : settings.conductivityUnit}</InputAdornment>
                        }
                    }}
                />
                {formik.touched.feedwaterConductivity && formik.errors.feedwaterConductivity && (
                    <FormHelperText>{String(formik.errors.feedwaterConductivity)}</FormHelperText>
                )}
            </FormControl>

            <FormControl fullWidth margin="normal" error={formik.touched.makeupConductivity && Boolean(formik.errors.makeupConductivity)}>
                <TextField
                    id="makeupConductivity"
                    name="makeupConductivity"
                    type="number"
                    size={'small'}
                    label={'Makeup Water Conductivity'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.makeupConductivity}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">{settings.conductivityUnit === 'MuS/cm' ? <span>&#x3BC;</span> : settings.conductivityUnit}</InputAdornment>
                        }
                    }}
                />
                {formik.touched.makeupConductivity && formik.errors.makeupConductivity && (
                    <FormHelperText>{String(formik.errors.makeupConductivity)}</FormHelperText>
                )}
            </FormControl>

            <FormControl fullWidth margin="normal" error={formik.touched.blowdownConductivity && Boolean(formik.errors.blowdownConductivity)}>
                <TextField
                    id="blowdownConductivity"
                    name="blowdownConductivity"
                    type="number"
                    size={'small'}
                    label={'Blowdown Conductivity'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.blowdownConductivity}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">{settings.conductivityUnit === 'MuS/cm' ? <span>&#x3BC;</span> : settings.conductivityUnit}</InputAdornment>
                        }
                    }}
                />
                {formik.touched.blowdownConductivity && formik.errors.blowdownConductivity && (
                    <FormHelperText>{String(formik.errors.blowdownConductivity)}</FormHelperText>
                )}
            </FormControl>
            <EstimateResult handleResetEstimate={resetEstimate} handleApplyEstimate={applyEstimate} />

        </Box>
    );
};

export default BoilerWaterForm;

export interface BoilerWaterProps { }