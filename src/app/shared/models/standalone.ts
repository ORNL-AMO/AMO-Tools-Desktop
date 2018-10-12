export interface CombinedHeatPower {
  annualOperatingHours: number,
  annualElectricityConsumption: number,
  annualThermalDemand: number,
  boilerThermalFuelCosts: number,
  avgElectricityCosts: number,
  option: number,
  boilerThermalFuelCostsCHPcase: number,
  CHPfuelCosts: number,
  percentAvgkWhElectricCostAvoidedOrStandbyRate: number,
  displacedThermalEfficiency: number,
  chpAvailability: number,
  thermalUtilization: number
}

export interface CombinedHeatPowerOutput {
  annualOperationSavings: number,
  totalInstalledCostsPayback: number,
  simplePayback: number,
  fuelCosts: number,
  thermalCredit: number,
  incrementalOandM: number,
  totalOperatingCosts: number
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
