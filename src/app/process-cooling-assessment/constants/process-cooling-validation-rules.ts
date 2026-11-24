// * Validation rules for Process Cooling Assessment forms pulled from CWSAT Engineering Ref doc (Doc updated 11/26/2024)
// * min/max/greaterThan (red) and warningMin/warningMax (yellow) updated from "PC key field ranges" doc

/**
 * Validation defined here for better maintenance and verification.
 * All units in Imperial, conversion handled in form services as needed.
 * - min / max / greaterThan: form validators, value is invalid outside the range
 * - warningMin / warningMax: value is valid but outside the typical range, show a warning
 */
export const PROCESS_COOLING_VALIDATION: ProcessCoolingValidation = {
  // OperationsForm
  annualOperatingHours: {
    required: true,
    min: 0,
    max: 8760
  },
  fuelCost: {
    required: true,
    min: 0
  },
  electricityCost: {
    required: true,
    min: 0
  },
  chilledWaterSupplyTemp: {
    required: true,
    min: 20,
    max: 60
  },
  condenserCoolingMethod: {},
  doChillerLoadSchedulesVary: {},

  // PumpInputForm
  variableFlow: {},
  chilledWaterPumpFlowRate: {
    required: true,
    min: 0,
    max: 4.0,
    warningMin: 1.6,
    warningMax: 3.0
  },
  condenserWaterPumpFlowRate: {
    required: true,
    min: 0,
    max: 4.0,
    warningMin: 1.6,
    warningMax: 3.0
  },
  efficiency: {
    required: true,
    min: 70,
    max: 95
  },
  motorSize: {
    required: true,
    // * no max, consistent with other motor size fields in MEASUR
    greaterThan: 0
  },
  motorEfficiency: {
    required: true,
    min: 80,
    max: 95
  },
  // AirCooledSystemInputForm
  outdoorAirTemp: {
    required: true,
    min: 80,
    max: 110
  },
  airCoolingSource: {},
  indoorTemp: {
    required: true,
    min: 60,
    max: 110,
    warningMax: 100
  },
  airCooledFollowingTempDiffential: {
    required: true,
    min: 5,
    max: 30
  },
  waterCooledFollowingTempDiffential: {
    required: true,
    // * no explicity min/max is listed for !isConstantCondenserWaterTemp, so continue to use below for both cases
    min: 2,
    max: 20,
    warningMin: 5,
    warningMax: 12
  },
  // WaterCooledSystemInputForm
  isConstantCondenserWaterTemp: {},
  condenserWaterTemp: {
    required: true,
    min: 60,
    max: 90,
    warningMin: 65
  },

  // TowerForm
  usesFreeCooling: {},
  isHEXRequired: {},
  HEXApproachTemp: {
    required: true,
    min: 3,
    max: 20,
    warningMin: 5
  },
  numberOfTowers: {
    required: true,
    min: 1,
    max: 5
  },
  towerType: {},
  numberOfFans: {
    required: true,
    min: 1,
    max: 3
  },
  fanSpeedType: {},
  towerSizeMetric: {},
  fanType: {},
  towerSizeTons: {
    required: true,
    min: 20,
    max: 3000
  },
  towerSizeHP: {
    required: true,
    min: 1,
    max: 100
  },

  // ChillerInventoryForm, kW/ton
  fullLoadEfficiency: {
    required: true,
    min: 0,
    max: 2.5,
    warningMin: 0.2,
    warningMax: 2.0
  }
};


export interface FieldValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  greaterThan?: number;
  warningMin?: number;
  warningMax?: number;
  custom?: {
    [ruleName: string]: (value: unknown) => boolean;
  };
}

export interface ProcessCoolingValidation {
  [field: string]: FieldValidationRules;
}

/**
 * Returns a warning when a value is valid but outside the expected (typical) range of a rule.
 * @param value value in display units
 * @param toDisplayUnits converts an Imperial limit to display units
 */
export function getRangeWarning(value: number, rule: FieldValidationRules, toDisplayUnits: (imperialLimit: number) => number): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const isAboveExpected: boolean = rule.warningMax !== undefined && value > toDisplayUnits(rule.warningMax);
  const isBelowExpected: boolean = rule.warningMin !== undefined && value < toDisplayUnits(rule.warningMin);
  return isAboveExpected || isBelowExpected ? 'Value falls outside expected range' : null;
}
