import React, { useContext } from 'react';
import { useFormik } from 'formik';
import { TextField, FormControl, InputAdornment, FormHelperText, Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../hooks/state';
import { RootState } from '../../Diagram/store';
import { EstimateSystemContext, EstimateSystemState } from './EstimateWaterSystem';
import { getEstimateSystemValidationSchema, WaterSystemFormMapping } from '../../../validation/Validation';
import { adaptEstimatedFlowResults, EstimatedFlowResults, getDefaultResultRows, getEstimatedFlowResultRows, getInitialValuesFromForm } from './SystemEstimationFormUtils';
import { applyEstimatedFlowResults, modalOpenChange } from '../../Diagram/diagramReducer';
import { calculateLandscapingResults, convertAnnualFlowResult, convertLandscapingResults, convertLandscapingSuiteInput, Landscaping, LandscapingResults } from 'process-flow-lib';
import { TwoCellResultRow, TwoCellResultTable } from '../../StyledMUI/ResultTables';
import FormActionGroupButtons from '../FormActionGroupButtons';

const formLabelMapping: WaterSystemFormMapping = {
    areaIrrigated: { display: 'Area of Land Irrigated', initialValue: 0 },
    yearlyInchesIrrigated: { display: 'Yearly Inches Irrigated', initialValue: 0 },
}


const LandscapingForm = (props: LandscapingProps) => {
    const estimateSystemContext = useContext<EstimateSystemState>(EstimateSystemContext);
    const settings = useAppSelector((state: RootState) => state.diagram.settings);
    const dispatch = useAppDispatch();
    const [estimatedFlowResults, setEstimatedFlowResults] = React.useState<EstimatedFlowResults>(undefined);


    const formik = useFormik({
        initialValues: getInitialValuesFromForm(formLabelMapping),
        validationSchema: getEstimateSystemValidationSchema(formLabelMapping),
        onSubmit: values => { },
    });

    const handleInputChange = (e) => {
        formik.handleChange(e);
        const values: { [key: string | number]: any } = { ...formik.values, [e.target.name]: Number(e.target.value) };

        let landscaping: Landscaping = {
            areaIrrigated: values.areaIrrigated,
            yearlyInchesIrrigated: values.yearlyInchesIrrigated
        }

        landscaping = convertLandscapingSuiteInput(landscaping, settings.unitsOfMeasure);
        let landscapingResults: LandscapingResults = calculateLandscapingResults(landscaping);
        landscapingResults = convertLandscapingResults(landscapingResults, settings.unitsOfMeasure);
        landscapingResults.grossWaterUse = convertAnnualFlowResult(landscapingResults.grossWaterUse, settings);

        const estimatedFlowResults = adaptEstimatedFlowResults(
            landscapingResults.grossWaterUse,
            0,
            0,
            0,
            landscapingResults.grossWaterUse);
        setEstimatedFlowResults(estimatedFlowResults);
        estimateSystemContext.setEstimate(landscapingResults.grossWaterUse);
        console.log(landscapingResults);
    };

    const resetEstimate = () => {
        formik.resetForm();
        estimateSystemContext.setEstimate(0);
        setEstimatedFlowResults(undefined);
    }

    const applyEstimate = () => {
        dispatch(applyEstimatedFlowResults(estimatedFlowResults));
    }

    let estimatedResultsRows: TwoCellResultRow[] = getDefaultResultRows();
    if (estimatedFlowResults) {
        estimatedResultsRows = getEstimatedFlowResultRows(estimatedFlowResults);
    }
    return (
        <Box component="form" onSubmit={formik.handleSubmit}>
            <FormControl fullWidth margin="normal" error={formik.touched.areaIrrigated && Boolean(formik.errors.areaIrrigated)}>
                <TextField
                    id="areaIrrigated"
                    name="areaIrrigated"
                    label={'Area of Land Irrigated'}
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.areaIrrigated}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">{settings.unitsOfMeasure === 'Imperial' ? 'ft²' : 'm²'}</InputAdornment>
                        }
                    }}
                />
                {formik.touched.areaIrrigated && formik.errors.areaIrrigated && (
                    <FormHelperText>{String(formik.errors.areaIrrigated)}</FormHelperText>
                )}
            </FormControl>

            <FormControl fullWidth margin="normal" error={formik.touched.yearlyInchesIrrigated && Boolean(formik.errors.yearlyInchesIrrigated)}>
                <TextField
                    id="yearlyInchesIrrigated"
                    name="yearlyInchesIrrigated"
                    label={settings.unitsOfMeasure === 'Imperial' ? 'Inches of Irrigation Water Per Year' : 'Centimeters of Irrigation Water Per Year'}
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.yearlyInchesIrrigated}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">{settings.unitsOfMeasure === 'Imperial' ? 'in' : 'cm'}</InputAdornment>
                        }
                    }}
                />
                {formik.touched.yearlyInchesIrrigated && formik.errors.yearlyInchesIrrigated && (
                    <FormHelperText>{String(formik.errors.yearlyInchesIrrigated)}</FormHelperText>
                )}
            </FormControl>
            <Box marginTop={'2rem'}>
                <TwoCellResultTable
                    headerTitle={'Landscaping Results'}
                    rows={estimatedResultsRows} />
            </Box>
            <FormActionGroupButtons
                cancelContext={{ label: 'Reset', handler: resetEstimate }}
                actionContext={{ label: 'Apply to Flows', handler: applyEstimate, isDisabled: estimatedFlowResults === undefined }}
            />
        </Box>
    );
};

export default LandscapingForm;

export interface LandscapingProps {
    // settings: any;
}