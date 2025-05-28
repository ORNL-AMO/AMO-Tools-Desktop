import React, { useContext } from 'react';
import { useFormik } from 'formik';
import { TextField, FormControl, InputAdornment, FormHelperText, Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../hooks/state';
import { RootState } from '../../Diagram/store';
import { EstimateSystemContext, EstimateSystemState } from './EstimateWaterSystem';
import { getEstimateSystemValidationSchema, WaterSystemFormMapping } from '../../../validation/Validation';
import { adaptEstimatedFlowResults, EstimatedFlowResults, getDefaultResultRows, getEstimatedFlowResultRows, getInitialValuesFromForm } from './SystemEstimationFormUtils';
import { applyEstimatedFlowResults, modalOpenChange } from '../../Diagram/diagramReducer';
import { KitchenRestroomResults, KitchenRestroom, calculateKitchenRestroomResults, convertAnnualFlowResult } from 'process-flow-lib';
import { TwoCellResultRow, TwoCellResultTable } from '../../StyledMUI/ResultTables';
import FormActionGroupButtons from '../FormActionGroupButtons';

const formLabelMapping: WaterSystemFormMapping = {
    employeeCount: { display: 'Number of Employees', initialValue: 0 },
    workdaysPerYear: { display: 'Workdays Per Year', initialValue: 0 },
    dailyUsePerEmployee: { display: 'Daily Water Use per Employee', initialValue: 0 },
    hoursPerYear: { display: 'Hours Water Used Per Year', initialValue: 0 }
}

const KitchenRestroomForm = () => {
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

        const kitchenRestroom: KitchenRestroom = {
            employeeCount: values.employeeCount,
            workdaysPerYear: values.workdaysPerYear,
            dailyUsePerEmployee: values.dailyUsePerEmployee
        }

        const kitchenRestroomResults: KitchenRestroomResults = calculateKitchenRestroomResults(kitchenRestroom);
        kitchenRestroomResults.grossWaterUse = convertAnnualFlowResult(kitchenRestroomResults.grossWaterUse, settings);

        const estimatedFlowResults = adaptEstimatedFlowResults(
            kitchenRestroomResults.grossWaterUse,
            kitchenRestroomResults.grossWaterUse,
            0,
            0,
            kitchenRestroomResults.grossWaterUse);
        setEstimatedFlowResults(estimatedFlowResults);
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
            <FormControl fullWidth margin="normal" error={formik.touched.employeeCount && Boolean(formik.errors.employeeCount)}>
                <TextField
                    id="employeeCount"
                    name="employeeCount"
                    label={'Number of Employees'}
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.employeeCount}
                />
                {formik.touched.employeeCount && formik.errors.employeeCount && (
                    <FormHelperText>{String(formik.errors.employeeCount)}</FormHelperText>
                )}
            </FormControl>

            <FormControl fullWidth margin="normal" error={formik.touched.workdaysPerYear && Boolean(formik.errors.workdaysPerYear)}>
                <TextField
                    id="workdaysPerYear"
                    name="workdaysPerYear"
                    label={'Workdays Per Year'}
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.workdaysPerYear}
                />
                {formik.touched.workdaysPerYear && formik.errors.workdaysPerYear && (
                    <FormHelperText>{String(formik.errors.workdaysPerYear)}</FormHelperText>
                )}
            </FormControl>

            <FormControl fullWidth margin="normal" error={formik.touched.dailyUsePerEmployee && Boolean(formik.errors.dailyUsePerEmployee)}>
                <TextField
                    id="dailyUsePerEmployee"
                    name="dailyUsePerEmployee"
                    label={'Daily Water Use per Employee'}
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.dailyUsePerEmployee}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">{settings.unitsOfMeasure === 'Imperial' ? 'Mgal/yr' : 'm³/yr'}</InputAdornment>
                        }
                    }}
                />
                {formik.touched.dailyUsePerEmployee && formik.errors.dailyUsePerEmployee && (
                    <FormHelperText>{String(formik.errors.dailyUsePerEmployee)}</FormHelperText>
                )}
            </FormControl>
            <Box marginTop={'2rem'}>
                <TwoCellResultTable
                    headerTitle={'Kitchen and Restroom Results'}
                    rows={estimatedResultsRows} />
            </Box>
            <FormActionGroupButtons
                cancelContext={{ label: 'Reset', handler: resetEstimate }}
                actionContext={{ label: 'Apply to Flows', handler: applyEstimate, isDisabled: estimatedFlowResults === undefined }}
            />
        </Box>
    );
};

export default KitchenRestroomForm;
