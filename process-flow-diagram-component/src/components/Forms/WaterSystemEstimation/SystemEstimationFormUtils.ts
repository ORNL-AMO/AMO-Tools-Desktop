import { WaterSystemFormMapping } from "../../../validation/Validation";

export const getInitialValuesFromForm = (systemFormMapping: WaterSystemFormMapping) => {
    const initialValues: {[key: EstimateSystemField]: any} = Object.keys(systemFormMapping).reduce((acc, key: EstimateSystemField) => {
      acc[key] = systemFormMapping[key].initialValue;
      return acc;
    }, {});
    return initialValues;
  }
  
  type EstimateSystemField = keyof WaterSystemFormMapping;