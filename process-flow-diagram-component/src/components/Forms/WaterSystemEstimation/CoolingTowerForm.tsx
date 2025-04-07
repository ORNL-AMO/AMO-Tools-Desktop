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
import { CoolingTowerResults, CoolingTower, calculateCoolingTowerResults, convertAnnualFlowResult } from 'process-flow-lib';

const formLabelMapping: WaterSystemFormMapping = {
    tonnage: { display: 'Cooling Tower Tonnage', initialValue: 0 },
    loadFactor: { display: 'Load Factor', initialValue: 0 },
    evaporationRateDegree: { display: 'Evaporation Rate Per 10', initialValue: 0 },
    temperatureDrop: { display: 'Temperature Drop Across Cooling Tower', initialValue: 0 },
    makeupConductivity: { display: 'Makeup Conductivity', initialValue: 0 },
    blowdownConductivity: { display: 'Blowdown Conductivity', initialValue: 0 },
    hoursPerYear: { display: 'Hours Water Used Per Year', initialValue: 0 }
}

const CoolingTowerForm = (props: CoolingTowerProps) => {
    const estimateSystemContext = useContext<EstimateSystemState>(EstimateSystemContext);
    const settings = useAppSelector((state: RootState) => state.diagram.settings);
    const dispatch = useAppDispatch();
    const [coolingTowerResults, setCoolingTowerResults] = React.useState<CoolingTowerResults>(null);
    
    const formik = useFormik({
        initialValues: getInitialValuesFromForm(formLabelMapping),
        validationSchema: getEstimateSystemValidationSchema(formLabelMapping),
        onSubmit: values => {},
    });

    const handleInputChange = (e) => {
        formik.handleChange(e);
        const values: {[key: string | number]: any} = { ...formik.values, [e.target.name]: Number(e.target.value) };

        const coolingTower: CoolingTower = {
            hoursPerYear: values.hoursPerYear,
            tonnage: values.tonnage,
            loadFactor: values.loadFactor,
            evaporationRateDegree: values.evaporationRateDegree,
            temperatureDrop: values.temperatureDrop,
            makeupConductivity: values.makeupConductivity,
            blowdownConductivity: values.blowdownConductivity,
        }

        const coolingTowerResults: CoolingTowerResults = calculateCoolingTowerResults(coolingTower, coolingTower.hoursPerYear);
        coolingTowerResults.grossWaterUse = convertAnnualFlowResult(coolingTowerResults.grossWaterUse, settings);
        coolingTowerResults.evaporationLoss = convertAnnualFlowResult(coolingTowerResults.evaporationLoss, settings);
        coolingTowerResults.cycleOfConcentration = convertAnnualFlowResult(coolingTowerResults.cycleOfConcentration, settings);
        coolingTowerResults.makeupWater = convertAnnualFlowResult(coolingTowerResults.makeupWater, settings);
        coolingTowerResults.blowdownLoss = convertAnnualFlowResult(coolingTowerResults.blowdownLoss, settings);

        setCoolingTowerResults(coolingTowerResults);
        estimateSystemContext.setEstimate(coolingTowerResults.grossWaterUse);
        console.log(coolingTowerResults);
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
            <HoursPerYearInputField formik={formik} handleInputChange={handleInputChange}/>
            <FormControl fullWidth margin="normal" error={formik.touched.tonnage && Boolean(formik.errors.tonnage)}>
                <TextField
                    id="tonnage"
                    name="tonnage"
                    label={'Cooling Tower Tonnage'}
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.tonnage}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">{settings.unitsOfMeasure === 'Imperial' ? 'Mgal/yr' : 'm³/yr'}</InputAdornment>
                        }
                    }}
                />
                {formik.touched.tonnage && formik.errors.tonnage && (
                    <FormHelperText>{String(formik.errors.tonnage)}</FormHelperText>
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

            <FormControl fullWidth margin="normal" error={formik.touched.evaporationRateDegree && Boolean(formik.errors.evaporationRateDegree)}>
                <TextField
                    id="evaporationRateDegree"
                    name="evaporationRateDegree"
                    label={`Evaporation Rate Per 10 ${settings.unitsOfMeasure === 'Imperial' ? '°F' : '°C'}`}
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.evaporationRateDegree}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                        }
                    }}
                />
                {formik.touched.evaporationRateDegree && formik.errors.evaporationRateDegree && (
                    <FormHelperText>{String(formik.errors.evaporationRateDegree)}</FormHelperText>
                )}
            </FormControl>

            <FormControl fullWidth margin="normal" error={formik.touched.temperatureDrop && Boolean(formik.errors.temperatureDrop)}>
                <TextField
                    id="temperatureDrop"
                    name="temperatureDrop"
                    label={'Temperature Drop Across Cooling Tower'}
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.temperatureDrop}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">{settings.unitsOfMeasure === 'Imperial' ? '°F' : '°C'}</InputAdornment>
                        }
                    }}
                />
                {formik.touched.temperatureDrop && formik.errors.temperatureDrop && (
                    <FormHelperText>{String(formik.errors.temperatureDrop)}</FormHelperText>
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
            <EstimateResult handleResetEstimate={resetEstimate} handleApplyEstimate={applyEstimate}/>
        </Box>
    );
};

export default CoolingTowerForm;

export interface CoolingTowerProps {

}