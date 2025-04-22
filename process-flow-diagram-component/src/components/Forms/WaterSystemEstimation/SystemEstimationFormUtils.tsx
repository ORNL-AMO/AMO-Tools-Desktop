import * as React from 'react';
import { TwoCellResultRow } from "../../StyledMUI/ResultTables";
import FlowDisplayUnit from "../../Diagram/FlowDisplayUnit";
import { WaterSystemFormMapping } from "../../../validation/Validation";
import FlowResultDisplay from '../../Diagram/FlowResultDisplay';

export const getInitialValuesFromForm = (systemFormMapping: WaterSystemFormMapping) => {
    const initialValues: {[key: EstimateSystemField]: any} = Object.keys(systemFormMapping).reduce((acc, key: EstimateSystemField) => {
      acc[key] = systemFormMapping[key].initialValue;
      return acc;
    }, {});
    return initialValues;
  }
  type EstimateSystemField = keyof WaterSystemFormMapping;

  export const adaptEstimatedFlowResults = (
    totalSourceFlow: number,
    totalDischargeFlow: number,
    knownLosses: number,
    waterInProduct: number,
    grossWaterUse: number
  ): EstimatedFlowResults => {
    return {
      totalSourceFlow: totalSourceFlow,
      totalDischargeFlow: totalDischargeFlow,
      knownLosses: knownLosses,
      waterInProduct: waterInProduct,
      grossWaterUse: grossWaterUse
    }
  }

  export const getDefaultResultRows = () => [
      { label: 'Total Source Flow', result: 0, unit: <FlowDisplayUnit /> },
      { label: 'Total Discharge Flow', result: 0, unit: <FlowDisplayUnit /> },
      { label: 'Known Losses', result: 0, unit: <FlowDisplayUnit /> },
      { label: 'Water in Product', result: 0, unit: <FlowDisplayUnit /> },
      { label: 'Gross Water Use', result: 0, unit: <FlowDisplayUnit /> },
  ]

  export const getEstimatedFlowResultRows = (estimatedFlowResults: EstimatedFlowResults): TwoCellResultRow[] => {
    return [
      { label: 'Total Source Flow', result: <FlowResultDisplay flowValue={estimatedFlowResults.totalSourceFlow}/>, unit: <FlowDisplayUnit/> },
      { label: 'Total Discharge Flow', result: <FlowResultDisplay flowValue={estimatedFlowResults.totalDischargeFlow}/>, unit: <FlowDisplayUnit/> },
      { label: 'Known Losses', result: <FlowResultDisplay flowValue={estimatedFlowResults.knownLosses}/>, unit: <FlowDisplayUnit/> },
      { label: 'Water in Product', result: <FlowResultDisplay flowValue={estimatedFlowResults.waterInProduct}/>, unit: <FlowDisplayUnit/> },
      { label: 'Gross Water Use', result: <FlowResultDisplay flowValue={estimatedFlowResults.grossWaterUse}/>, unit: <FlowDisplayUnit/> },
    ]
  }
  

  export interface EstimatedFlowResults {
      totalSourceFlow: number,
      totalDischargeFlow: number,
      knownLosses: number,
      waterInProduct: number,
      grossWaterUse: number
  }