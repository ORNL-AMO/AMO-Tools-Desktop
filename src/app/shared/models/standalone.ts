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
};


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
};

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
};

export interface NaturalGasReductionResult {
  energyUse: number,
  energyCost: number,
  heatFlow: number,
  totalFlow: number
};
//====== end natural gas reduction objects =======



//====== compressed air reduction objects ======
export interface CompressedAirReductionInput {
  compressedAirReductionInputVec: Array<CompressedAirReductionData>
};

export interface CompressedAirReductionData {
  name: string,
  hoursPerYear: number,
  utilityType: number,
  utilityCost: number,
  compressedAirCost: number,
  electricityCost: number,
  measurementMethod: number,
  flowMeterMethodData: CompressedAirFlowMeterMethodData,
  bagMethodData: BagMethodData,
  pressureMethodData: PressureMethodData,
  otherMethodData: CompressedAirOtherMethodData,
  compressorElectricityData: CompressorElectricityData,
  units: number
};

export interface CompressedAirFlowMeterMethodData {
  meterReading: number
};

export interface BagMethodData {
  height: number,
  diameter: number,
  fillTime: number
};

export interface PressureMethodData {
  nozzleType: number,
  numberOfNozzles: number,
  supplyPressure: number
};

export interface CompressedAirOtherMethodData {
  consumption: number
};

export interface CompressorElectricityData {
  compressorControl: number,
  compressorControlAdjustment: number,
  compressorSpecificPowerControl: number,
  compressorSpecificPower: number
};

export interface CompressedAirReductionResults {
  baselineResults: CompressedAirReductionResult,
  modificationResults: CompressedAirReductionResult,
  annualEnergySavings: number,
  annualCostSavings: number,
  annualFlowRateReduction: number,
  annualConsumptionReduction: number
};

export interface CompressedAirReductionResult {
  energyUse: number,
  energyCost: number,
  flowRate: number,
  singleNozzeFlowRate: number,
  consumption: number
};
//===== END compressed air reduction objects =====



//====== compressed air pressure reduction objects =====
export interface CompressedAirPressureReductionInput {
  compressedAirPressureReductionInputVec: Array<CompressedAirPressureReductionData>;
};

export interface CompressedAirPressureReductionData {
  name: string,
  isBaseline: boolean,
  hoursPerYear: number,
  electricityCost: number,
  compressorPower: number,
  pressure: number,
  proposedPressure: number
};

export interface CompressedAirPressureReductionResults {
  baselineResults: CompressedAirPressureReductionResult,
  modificationResults: CompressedAirPressureReductionResult,
  annualEnergySavings: number,
  annualCostSavings: number
};

export interface CompressedAirPressureReductionResult {
  energyUse: number,
  energyCost: number
};
//==== END compressed air pressure reduction objects =====



//====== water/wastewater reduction objects ======
// wastewater shares the same objects as water
export interface WaterReductionInput {
  waterReductionInputVec: Array<WaterReductionData>
};

export interface WaterReductionData {
  name: string,
  hoursPerYear: number,
  waterCost: number,
  measurementMethod: number,
  meteredFlowMethodData: MeteredFlowMethodData,
  volumeMeterMethodData: VolumeMeterMethodData,
  bucketMethodData: BucketMethodData,
  otherMethodData: WaterOtherMethodData,
  isWastewater: boolean
};

export interface VolumeMeterMethodData {
  finalMeterReading: number,
  initialMeterReading: number,
  elapsedTime: number
};

export interface MeteredFlowMethodData {
  meterReading: number
};

export interface BucketMethodData {
  bucketVolume: number,
  bucketFillTime: number
};

export interface WaterOtherMethodData {
  consumption: number
};

export interface WaterReductionResults {
  baselineResults: WaterReductionResult,
  modificationResults: WaterReductionResult,
  annualWaterSavings: number,
  annualCostSavings: number
};

export interface WaterReductionResult {
  waterUse: number,
  waterCost: number,
  annualWaterSavings: number,
  costSavings: number
};
//===== END water/wastewater reduction objects =====


//====== steam reduction objects ======
export interface SteamReductionInput {
  steamReductionInputVec: Array<SteamReductionData>
};

export interface SteamReductionData {
  name: string,
  hoursPerYear: number,
  utilityType: number,
  utilityCost: number,
  steamUtilityCost: number,
  naturalGasUtilityCost: number,
  otherUtilityCost: number,
  measurementMethod: number,
  systemEfficiency: number,
  pressure: number,
  flowMeterMethodData: SteamFlowMeterMethodData,
  airMassFlowMethodData: SteamMassFlowMethodData,
  waterMassFlowMethodData: SteamMassFlowMethodData,
  otherMethodData: SteamOtherMethodData,
  units: number
};

export interface SteamFlowMeterMethodData {
  flowRate: number
};

export interface SteamMassFlowNameplateData {
  flowRate: number
};

export interface SteamMassFlowMeasuredData {
  areaOfDuct: number,
  airVelocity: number
};

export interface SteamMassFlowMethodData {
  isNameplate: boolean,
  massFlowMeasuredData: SteamMassFlowMeasuredData,
  massFlowNameplateData: SteamMassFlowNameplateData,
  inletTemperature: number,
  outletTemperature: number
};

export interface SteamOtherMethodData {
  consumption: number
};

export interface SteamReductionResults {
  baselineResults: SteamReductionResult,
  modificationResults: SteamReductionResult,
  annualEnergySavings: number,
  annualCostSavings: number,
  annualSteamSavings: number
};

export interface SteamReductionResult {
  energyCost: number,
  energyUse: number,
  steamUse: number
};
//===== END steam reduction objects =====


//====== pipe insulation reduction objects ======
export interface PipeInsulationReductionInput {
  operatingHours: number,
  utilityType: number,
  utilityCost: number,
  naturalGasUtilityCost: number,
  otherUtilityCost: number,
  pipeLength: number,
  pipeDiameterSelection: number,
  pipeDiameter: number,
  pipeThickness: number,
  pipeTemperature: number,
  ambientTemperature: number,
  windVelocity: number,
  systemEfficiency: number,
  insulationThickness: number,
  pipeEmissivity: number,
  pipeJacketMaterialSelection: number,
  jacketEmissivity: number,
  pipeBaseMaterialSelection: number,
  pipeMaterialCoefficients: Array<number>,
  insulationMaterialSelection: number,
  insulationMaterialCoefficients: Array<number>
};

export interface PipeInsulationReductionResults {
  baselineResults: PipeInsulationReductionResult,
  modificationResults: PipeInsulationReductionResult,
  annualHeatSavings: number,
  annualCostSavings: number
};

export interface PipeInsulationReductionResult {
  heatLength: number,
  annualHeatLoss: number,
  energyCost: number
};

//===== END pipe insulation reduction objects =====



//====== tank insulation reduction objects ======
export interface TankInsulationReductionInput {
  operatingHours: number,
  utilityType: number,
  utilityCost: number,
  naturalGasUtilityCost: number,
  otherUtilityCost: number,
  tankHeight: number,
  tankDiameter: number,
  tankThickness: number,
  tankEmissivity: number,
  tankConductivity: number,
  tankTemperature: number,
  ambientTemperature: number,
  systemEfficiency: number,
  insulationThickness: number,
  insulationConductivity: number,
  customInsulationConductivity: number,
  jacketEmissivity: number,
  tankMaterialSelection: number,
  insulationMaterialSelection: number,
  jacketMaterialSelection: number
};

export interface TankInsulationReductionResults {
  baselineResults: TankInsulationReductionResult,
  modificationResults: TankInsulationReductionResult,
  annualHeatSavings: number,
  annualCostSavings: number
};

export interface TankInsulationReductionResult {
  heatLoss: number,
  annualHeatLoss: number,
  energyCost: number
};

//===== END tank insulation reduction objects =====
