import React, { JSX, ReactNode, useContext, useRef } from 'react';
import { useFormik } from 'formik';
import { TextField, FormControl, InputAdornment, FormHelperText, Box, MenuItem, Select, InputLabel, useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../hooks/state';
import { RootState } from '../../Diagram/store';
import { EstimateSystemContext, EstimateSystemState } from './EstimateWaterSystem';
import EstimateResult from './EstimateResult';
import HoursPerYearInputField from './HoursPerYearInputField';
import { getEstimateSystemValidationSchema, WaterSystemFormMapping } from '../../../validation/Validation';
import { getInitialValuesFromForm } from './SystemEstimationFormUtils';
import { modalOpenChange } from '../../Diagram/diagramReducer';
import { calculateProcessUseResults, convertAnnualFlowResult, FlowMetric, ImperialFlowUnitMap, MetricFlowUnitMap, ProcessUse, ProcessUseResults, waterFlowMetricOptions } from 'process-flow-lib';

const systemFormMapping: WaterSystemFormMapping = {
    fractionGrossWaterRecirculated: { display: 'Fraction of Gross Water Use Recirculated', initialValue: 0 },
    annualProduction: { display: 'Annual Production Units', initialValue: 0 },
    waterRequiredMetric: { display: 'Flow Metric', initialValue: 0 },
    waterRequiredMetricValue: { display: 'Water Required for Processing', initialValue: 0 },
    waterConsumedMetric: { display: 'Flow Metric', initialValue: 0 },
    waterConsumedMetricValue: { display: 'Water Consumed in Process', initialValue: 0 },
    waterLossMetric: { display: 'Flow Metric', initialValue: 0 },
    waterLossMetricValue: { display: 'Water Losses', initialValue: 0 },
    hoursPerYear: { display: 'Hours Water Used Per Year', initialValue: 0 }
}


const WaterMetricGroup = ({ formik, handleInputChange, inputUnitMap, options, metricType }): ReactNode => {
    const metricNameCased = metricType.charAt(0).toUpperCase() + metricType.slice(1)
    const metricControlId = `water${metricNameCased}Metric`;
    const metricValueControlId = `water${metricNameCased}MetricValue`;
    const estimateSystemContext = useContext<EstimateSystemState>(EstimateSystemContext);


    let metricValueLabel = formik.values.waterRequiredMetric === FlowMetric.ANNUAL ? 'Annual Flow' : FlowMetric.HOURLY ? 'Hourly Flow' : 'Water Intensity';
    if (metricType === 'consumed') {
        metricValueLabel = formik.values.waterConsumedMetric === FlowMetric.ANNUAL ? 'Annual Flow' : formik.values.waterConsumedMetric === FlowMetric.HOURLY ? 'Hourly Flow' : formik.values.waterConsumedMetric === FlowMetric.INTENSITY ? 'Water Intensity' : formik.values.waterConsumedMetric === FlowMetric.FRACTION_GROSS ? 'Fraction of Gross Water Use' : 'Fraction of Incoming Water';
    } else if (metricType === 'loss') {
        metricValueLabel = formik.values.waterLossMetric === FlowMetric.ANNUAL ? 'Annual Flow' : formik.values.waterLossMetric === FlowMetric.HOURLY ? 'Hourly Flow' : formik.values.waterLossMetric === FlowMetric.INTENSITY ? 'Water Intensity' : formik.values.waterLossMetric === FlowMetric.FRACTION_GROSS ? 'Fraction of Gross Water Use' : 'Fraction of Incoming Water';
    };

    return (
        <Box margin="normal" className={'water-flow-metric-group'}>
            <InputLabel id={`${metricControlId}-label`} sx={{marginBottom: '.5rem'}}>
                Water {metricNameCased} Metric
            </InputLabel>
            <Select
                labelId={`${metricControlId}-label`}
                id={metricControlId}
                name={metricControlId}
                size='small'
                fullWidth
                value={formik.values[metricControlId]}
                onChange={handleInputChange}
                onBlur={formik.handleBlur}
                MenuProps={{
                    container: () => {
                        const modalContainer = estimateSystemContext.shadowRootRef.getElementById('modal-container');
                        return modalContainer;
                    },
                    disablePortal: false,
                }}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.display}
                    </MenuItem>
                ))}
            </Select>


            <FormControl fullWidth margin="normal" error={formik.touched[metricValueControlId] && Boolean(formik.errors[metricValueControlId])}>
                <TextField
                    id={metricValueControlId}
                    name={metricValueControlId}
                    label={metricValueLabel}
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values[metricValueControlId]}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">{inputUnitMap[formik.values[metricControlId]]}</InputAdornment>
                        }
                    }}
                />
                {formik.touched[metricValueControlId] && formik.errors[metricValueControlId] && (
                    <FormHelperText>{formik.errors[metricValueControlId]}</FormHelperText>
                )}
            </FormControl>
        </Box>
    );
}

const ProcessUseForm = (props: ProcessUseFormProps) => {
    const dispatch = useAppDispatch();
    const estimateSystemContext = useContext<EstimateSystemState>(EstimateSystemContext);
    const settings = useAppSelector((state: RootState) => state.diagram.settings);
    const flowMetricOptions = waterFlowMetricOptions;
    const waterRequiredFlowMetricOptions = waterFlowMetricOptions.slice(0, 3);
    const inputUnitMap = settings.unitsOfMeasure === 'Imperial' ? ImperialFlowUnitMap : MetricFlowUnitMap;

    const [processUseResults, setProcessUseResults] = React.useState<ProcessUseResults>(undefined);


    const formik = useFormik({
        initialValues: getInitialValuesFromForm(systemFormMapping),
        validationSchema: getEstimateSystemValidationSchema(systemFormMapping),
        onSubmit: values => { },
    });

    const handleInputChange = (e) => {
        formik.handleChange(e);
        const values: {[key: string | number]: any} = { ...formik.values, [e.target.name]: Number(e.target.value) };
        
        let processUse: ProcessUse = {
            hoursPerYear: values.hoursPerYear,
            fractionGrossWaterRecirculated: values.fractionGrossWaterRecirculated,
            annualProduction: values.annualProduction,
            waterRequiredMetric: values.waterRequiredMetric,
            waterRequiredMetricValue: values.waterRequiredMetricValue,
            waterConsumedMetric: values.waterConsumedMetric,
            waterConsumedMetricValue: values.waterConsumedMetricValue,
            waterLossMetric: values.waterLossMetric,
            waterLossMetricValue: values.waterLossMetricValue
        };
        
      let processUseResults: ProcessUseResults = calculateProcessUseResults(processUse, formik.values.hoursPerYear);
      processUseResults.incomingWater = convertAnnualFlowResult(processUseResults.incomingWater, settings);
      processUseResults.recirculatedWater = convertAnnualFlowResult(processUseResults.recirculatedWater, settings);
      processUseResults.wasteDischargedAndRecycledOther = convertAnnualFlowResult(processUseResults.wasteDischargedAndRecycledOther, settings);
      processUseResults.waterConsumed = convertAnnualFlowResult(processUseResults.waterConsumed, settings);
      processUseResults.waterLoss = convertAnnualFlowResult(processUseResults.waterLoss, settings);
      processUseResults.grossWaterUse = convertAnnualFlowResult(processUseResults.grossWaterUse, settings);
    
      setProcessUseResults(processUseResults);
      estimateSystemContext.setEstimate(processUseResults.grossWaterUse);
      console.log('processUseResults', processUseResults);
    };

    const resetEstimate = () => {
        formik.resetForm();
        estimateSystemContext.setEstimate(0);
    }

    const applyEstimate = (estimate: number) => {
        // todo  dispatch - update populated field 
        dispatch(modalOpenChange(false))
    }

    return (
        <Box component="form" onSubmit={formik.handleSubmit}>
            <HoursPerYearInputField formik={formik} handleInputChange={handleInputChange}/>
            <FormControl fullWidth margin="normal" error={formik.touched.fractionGrossWaterRecirculated && Boolean(formik.errors.fractionGrossWaterRecirculated)}>
                <TextField
                    id="fractionGrossWaterRecirculated"
                    name="fractionGrossWaterRecirculated"
                    label={'Fraction of Gross Water Use Recirculated'}
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.fractionGrossWaterRecirculated}
                />
                {formik.touched.fractionGrossWaterRecirculated && formik.errors.fractionGrossWaterRecirculated && (
                    <FormHelperText>{typeof formik.errors.fractionGrossWaterRecirculated === 'string'? formik.errors.fractionGrossWaterRecirculated : ''}</FormHelperText>
                )}
            </FormControl>

            <FormControl fullWidth margin="normal" error={formik.touched.annualProduction && Boolean(formik.errors.annualProduction)}>
                <TextField
                    id="annualProduction"
                    name="annualProduction"
                    label={'Annual Production Units'}
                    type="number"
                    size={'small'}
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.annualProduction}
                />
                {formik.touched.annualProduction && formik.errors.annualProduction && (
                    <FormHelperText>{typeof formik.errors.annualProduction === 'string'? formik.errors.annualProduction : ''}</FormHelperText>
                )}
            </FormControl>

            <WaterMetricGroup formik={formik} handleInputChange={handleInputChange} inputUnitMap={inputUnitMap} options={waterRequiredFlowMetricOptions} metricType={'required'} />
            <WaterMetricGroup formik={formik} handleInputChange={handleInputChange} inputUnitMap={inputUnitMap} options={flowMetricOptions} metricType={'consumed'} />
            <WaterMetricGroup formik={formik} handleInputChange={handleInputChange} inputUnitMap={inputUnitMap} options={flowMetricOptions} metricType={'loss'} />

            <EstimateResult handleResetEstimate={resetEstimate} handleApplyEstimate={applyEstimate}/>

        </Box>

    );
};

export default ProcessUseForm;

export interface ProcessUseFormProps {}