// * Validation rules for Process Cooling Assessment forms pulled from CWSAT Engineering Ref doc (Doc updated 11/26/2024) 

/**
 * Validation defined here as constant for ease of maintenance and sharing with SME's
 */
export const PROCESS_COOLING_VALIDATION = {
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
  flowRate: {
    required: true,
    min: 1.6,
    max: 3.0
  },
  efficiency: {
    required: true,
    min: 70,
    max: 95
  },
  motorSize: {
    required: true,
    min: 1,
    max: 100
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
    max: 90
  },
  followingTempDifferential: {
    required: true,
    min: 5,
    max: 30
  },

  // WaterCooledSystemInputForm
  isConstantCondenserWaterTemp: {},
  condenserWaterTemp: {
    required: true,
    min: 65,
    max: 90
  },

  // TowerForm
  usesFreeCooling: {},
  isHEXRequired: {},
  HEXApproachTemp: {
    required: true,
    min: 5,
    max: 20
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
  towerSize: {
    required: true,
    min: 20,
    max: 3000
  }


};


export interface FieldValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  custom?: {
    [ruleName: string]: (value: unknown) => boolean;
  };
}

export type ProcessCoolingValidation = {
  [field: string]: FieldValidationRules;
};