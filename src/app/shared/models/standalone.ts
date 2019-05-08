export interface CombinedHeatPower {
  annualOperatingHours: number;
  annualElectricityConsumption: number;
  annualThermalDemand: number;
  boilerThermalFuelCosts: number;
  avgElectricityCosts: number;
  option: number;
  boilerThermalFuelCostsCHPcase: number;
  CHPfuelCosts: number;
  percentAvgkWhElectricCostAvoidedOrStandbyRate: number;
  displacedThermalEfficiency: number;
  chpAvailability: number;
  thermalUtilization: number;
}

export interface CombinedHeatPowerOutput {
  annualOperationSavings: number;
  totalInstalledCostsPayback: number;
  simplePayback: number;
  fuelCosts: number;
  thermalCredit: number;
  incrementalOandM: number;
  totalOperatingCosts: number;
}

export interface PneumaticAirRequirementInput {
  pistonType: number;
  cylinderDiameter: number;
  cylinderStroke: number;
  pistonRodDiameter?: number; // only used / needed if pistonType == 1  meaning Double Acting Piston Type
  airPressure: number;
  cyclesPerMinute: number;
}

export interface PneumaticAirRequirementOutput {
  airRequirementPneumaticCylinder: number;
  volumeAirIntakePiston: number;
  compressionRatio: number;
}

export interface ReceiverTank {
  method: number;
  atmosphericPressure: number;
}

export interface ReceiverTankGeneral extends ReceiverTank {
  airDemand: number;
  allowablePressureDrop: number;
}

export interface ReceiverTankDedicatedStorage extends ReceiverTank {
  lengthOfDemand: number;
  airFlowRequirement: number;
  initialTankPressure: number;
  finalTankPressure: number;
}

export interface ReceiverTankBridgingCompressor extends ReceiverTankGeneral {
  distanceToCompressorRoom: number;
  speedOfAir: number;
}


export interface ReceiverTankMeteredStorage extends ReceiverTankDedicatedStorage {
  meteredControl: number;
}

export interface OperatingCostInput {
  motorBhp: number;
  bhpUnloaded: number;
  annualOperatingHours: number;
  runTimeLoaded: number;
  runTimeUnloaded: number;
  efficiencyLoaded: number;
  efficiencyUnloaded: number;
  costOfElectricity: number;
}

export interface OperatingCostOutput {
  runTimeUnloaded: number;
  costForLoaded: number;
  costForUnloaded: number;
  totalAnnualCost: number;
}

export interface PipeSizes {
  oneHalf: number;
  threeFourths: number;
  one: number;
  oneAndOneFourth: number;
  oneAndOneHalf: number;
  two: number;
  twoAndOneHalf: number;
  three: number;
  threeAndOneHalf: number;
  four: number;
  five: number;
  six: number;
}

export interface AirSystemCapacityInput extends PipeSizes {
  receiverCapacities: Array<number>;
  customPipes: Array<{ pipeSize: number, pipeLength: number }>;
}

export interface AirSystemCapacityOutput {
  totalPipeVolume: number;
  totalReceiverVolume: number;
  totalCapacityOfCompressedAirSystem: number;
  receiverCapacities: Array<number>;
}

export interface AirVelocityInput {
  airFlow: number;
  pipePressure: number;
  atmosphericPressure: number;
}

export interface PipeSizingInput {
  airFlow: number;
  airlinePressure: number;
  designVelocity: number;
  atmosphericPressure: number;
}

export interface PipeSizingOutput {
  crossSectionalArea: number;
  pipeDiameter: number;
}

export interface PneumaticValve {
  inletPressure: number;
  outletPressure: number;
  flowRate: number;
}

export interface BagMethodInput {
  operatingTime: number;
  bagFillTime: number;
  heightOfBag: number;
  diameterOfBag: number;
  numberOfUnits: number;
}

export interface BagMethodOutput {
  flowRate: number;
  annualConsumption: number;
}

export interface CalculateUsableCapacity {
  tankSize: number;
  airPressureIn: number;
  airPressureOut: number;
}


//======= electricity reduction objects =======
export interface ElectricityReductionInput {
  electricityReductionInputVec: Array<ElectricityReductionData>
};

export interface ElectricityReductionData {
  name: string,
  operatingHours: number,
  electricityCost: number,
  measurementMethod: number, // 0 = multimeter reading, 1 = name plate data, 2 = power meter method, 3 = offsheet / other method
  multimeterData: MultimeterReadingData,
  nameplateData: NameplateData,
  powerMeterData: PowerMeterData,
  otherMethodData: OtherMethodData,
  units: number
};

export interface MultimeterReadingData {
  numberOfPhases: number,
  supplyVoltage: number,
  averageCurrent: number,
  powerFactor: number
};

export interface NameplateData {
  ratedMotorPower: number,
  variableSpeedMotor: boolean,
  operationalFrequency: number,
  lineFrequency: number,
  motorAndDriveEfficiency: number,
  loadFactor: number
};

export interface PowerMeterData {
  power: number,
};

export interface OtherMethodData {
  energy: number;
};

export interface ElectricityReductionResults {
  baselineResults: ElectricityReductionResult,
  modificationResults: ElectricityReductionResult,
  annualEnergySavings: number,
  annualCostSavings: number,
};

export interface ElectricityReductionResult {
  energyUse: number,
  energyCost: number,
  power: number;
}

//====== end electricity reduction objects ====

//======= natural gas reduction objects ========
export interface NaturalGasReductionInput {
  naturalGasReductionInputVec: Array<NaturalGasReductionData>
};

export interface NaturalGasReductionData {
  name: string,
  operatingHours: number,
  fuelCost: number,
  measurementMethod: number,
  flowMeterMethodData: FlowMeterMethodData,
  otherMethodData: NaturalGasOtherMethodData,
  airMassFlowData: AirMassFlowData,
  waterMassFlowData: WaterMassFlowData,
  units: number
};

export interface FlowMeterMethodData {
  flowRate: number
};

export interface NaturalGasOtherMethodData {
  consumption: number
};

export interface AirMassFlowData {
  isNameplate: boolean,
  airMassFlowMeasuredData: AirMassFlowMeasuredData,
  airMassFlowNameplateData: AirMassFlowNameplateData,
  inletTemperature: number,
  outletTemperature: number,
  systemEfficiency: number
};

export interface AirMassFlowMeasuredData {
  areaOfDuct: number,
  airVelocity: number
};

export interface AirMassFlowNameplateData {
  airFlow: number
};

export interface WaterMassFlowData {
  waterFlow: number,
  inletTemperature: number,
  outletTemperature: number,
  systemEfficiency: number
};

export interface NaturalGasReductionResults {
  baselineResults: NaturalGasReductionResult,
  modificationResults: NaturalGasReductionResult,
  annualEnergySavings: number,
  annualCostSavings: number,
}

export interface NaturalGasReductionResult {
  energyUse: number,
  energyCost: number,
  heatFlow: number,
  totalFlow: number
};
//====== end natural gas reduction objects =======