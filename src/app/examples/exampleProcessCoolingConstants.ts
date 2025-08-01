export const EXAMPLE_CO2_SAVINGS_DATA = {
  energyType: 'fuel',
  totalEmissionOutputRate: 401.07,
  totalFuelEmissionOutputRate: undefined,
  electricityUse: 0,
  energySource: 'Natural Gas',
  fuelType: 'Natural Gas',
  eGridRegion: '',
  eGridSubregion: 'U.S. Average',
  totalEmissionOutput: 0,
  userEnteredBaselineEmissions: false,
  userEnteredModificationEmissions: false,
  zipcode: '00000',
  percentFuelUsage: undefined,
  otherFuelMixedCO2SavingsData: undefined
};
export const EXAMPLE_SYSTEM_BASICS = {
  utilityType: 'electric',
  electricityCost: 0.1,
  fuelCost: 0,
  location: 1,
  waterSupplyTemperature: 44,
  condenserCoolingMethod: 'water' as CoolingMethodString,
  notes: ''
};

export const EXAMPLE_SYSTEM_INFORMATION_OPERATIONS = {
  annualOperatingHours: 2,
  geographicLocation: 1,
  chilledWaterSupplyTemp: 44,
  condenserCoolingMethod: 0,
  co2SavingsData: {} as any
};


export const EXAMPLE_CHILLER_INVENTORY_ITEM = {
  itemId: '1',
  name: 'Chiller1',
  modifiedDate: new Date(),
  chillerType: CompressorChillerTypeEnum.CENTRIFUGAL,
  capacity: 100,
  isFullLoadEffKnown: true,
  fullLoadEff: 0.5,
  age: 5,
  installVSD: false,
  useARIMonthlyLoadSchedule: false,
  monthlyLoads: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  description: ''
};


export const EXAMPLE_INVENTORY = [
  { ...EXAMPLE_CHILLER_INVENTORY_ITEM }
];
// testProcessCoolingConstants.ts
// Shared test constants for process cooling API/service tests and mocks

import { CompressorChillerTypeEnum, CoolingMethodString } from '../shared/models/process-cooling-assessment';

export const EXAMPLE_AIR_COOLED_SYSTEM_INPUT = {
  CHWT: 44,
  OADT: 95,
  ACSource: 0,
  indoorTemp: 70,
  CWTFollow: 10
};

export const EXAMPLE_WATER_COOLED_SYSTEM_INPUT = {
  CHWT: 44,
  useFreeCooling: false,
  HEXApproachTemp: 10,
  constantCWT: true,
  CWT: 85,
  CWVariableFlow: false,
  CWFlowRate: 3,
  CWTFollow: 10
};

export const EXAMPLE_PUMP_INPUT = {
  variableFlow: false,
  flowRate: 100,
  efficiency: 0.8,
  motorSize: 50,
  motorEfficiency: 0.9
};

export const EXAMPLE_TOWER_INPUT = {
  numTowers: 1,
  numFanPerTowerCells: 1,
  fanSpeedType: 0,
  towerSizing: 0,
  towerCellFanType: 0,
  cellFanHP: 10,
  tonnage: 100
};