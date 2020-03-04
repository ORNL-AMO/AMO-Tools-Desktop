import { OperatingHours } from "./operations";

export interface FSAT {
  name?: string;
  modifications?: Modification[];
  selected?: boolean;
  fieldData?: FieldData;
  fanMotor?: FanMotor;
  fanSetup?: FanSetup;
  baseGasDensity?: BaseGasDensity;
  notes: Notes;
  implementationCosts?: number;
  setupDone?: boolean;
  isVFD?: boolean;
  operatingHours?: OperatingHours;
  outputs?: FsatOutput;
}

export interface Modification {
  notes?: Notes;
  fsat?: FSAT;
  exploreOpportunities?: boolean;
}

export interface Notes {
  fieldDataNotes?: string;
  fanMotorNotes?: string;
  fanSetupNotes?: string;
  fluidNotes?: string;
}

//fsat Data
export interface FieldData {
  //TODO: remove operatingFraction support
  //removed from suite v0.3.2
  operatingFraction?: number;
  operatingHours: number;
  cost: number;
  flowRate: number;
  inletPressure: number;
  outletPressure: number;
  loadEstimatedMethod: number;
  motorPower: number;
  specificHeatRatio: number;
  compressibilityFactor: number;
  measuredVoltage: number;
  inletPressureData?: InletPressureData;
  outletPressureData?: OutletPressureData;
  fanRatedInfo?: FanRatedInfo;
  planeData?: PlaneData;
  pressureCalcResultType?: string;
}

export interface FanMotor {
  lineFrequency: number;
  motorRatedPower: number;
  motorRpm: number;
  efficiencyClass: number;
  specifiedEfficiency?: number;
  motorRatedVoltage: number;
  fullLoadAmps: number;
}

export interface FanSetup {
  fanType: number;
  fanSpeed: number;
  drive: number;
  specifiedDriveEfficiency?: number;
  fanEfficiency?: number;
}
//

export interface FanRatedInfo {
  fanSpeed: number;
  motorSpeed: number;
  fanSpeedCorrected: number;
  densityCorrected: number;
  pressureBarometricCorrected: number;
  //Mark additions
  includesEvase: string;
  upDownStream: string;
  traversePlanes: number;
  globalBarometricPressure: number;
}

export interface Plane {
  planeType: string;
  length: number;
  width: number;
  area: number;
  //tdx => dryBulbTemp
  dryBulbTemp: number;
  //pbx => barometricPressure
  barometricPressure: number;
  //noInletBoxes => numInletBoxes
  numInletBoxes?: number; // should have a default of 1 and the
  //psx => staticPressure
  staticPressure?: number;
  pitotTubeCoefficient?: number;
  traverseData?: Array<Array<number>>;
  pitotTubeType?: string;
  numTraverseHoles?: number;
  numInsertionPoints?: number;
}

export interface PlaneData {
  plane5upstreamOfPlane2: boolean;
  totalPressureLossBtwnPlanes1and4: number;
  totalPressureLossBtwnPlanes2and5: number;
  inletSEF: number;
  outletSEF: number;
  //variationInBarometricPressure: boolean;
  // globalBarometricPressure: number;
  estimate2and5TempFrom1: boolean;
  FanInletFlange: Plane;
  FanEvaseOrOutletFlange: Plane;
  FlowTraverse: Plane;
  AddlTraversePlanes: Array<Plane>;
  InletMstPlane: Plane;
  OutletMstPlane: Plane;
}

export interface BaseGasDensity {
  dryBulbTemp?: number;
  staticPressure?: number;
  barometricPressure?: number;
  gasDensity?: number;
  gasType?: string;
  specificGravity?: number;
  // used for gasDensity Calculations
  inputType?: string; // relativeHumidity, dewPoint, or wetBulb are the options
  dewPoint?: number;
  relativeHumidity?: number;
  wetBulbTemp?: number;
  specificHeatGas?: number; //used with wetBulb
}

export interface FanShaftPower {
  isMethodOne: boolean;
  voltage: number;
  amps: number;
  powerFactorAtLoad: number;
  efficiencyMotor: number;
  efficiencyVFD: number;
  efficiencyBelt: number;
  sumSEF: number;
  motorShaftPower: number;
  //mark additions
  driveType: string;
  isVFD: string;
  mainsDataAvailable: string;
  ratedHP: number;
  synchronousSpeed: number;
  npv: number;
  fla: number;
  // vfdInput: number,
  phase1: MotorPhase;
  phase2: MotorPhase;
  phase3: MotorPhase;
  efficiencyClass: number;
  frequency: number;
}
export interface MotorPhase {
  voltage: number;
  amps: number;
}

export interface Fan203Inputs {
  FanRatedInfo: FanRatedInfo;
  BaseGasDensity: BaseGasDensity;
  FanShaftPower: FanShaftPower;
  PlaneData?: PlaneData | PlaneData;
}

export interface Fan203Results {
  fanEfficiencyTotalPressure: number;
  fanEfficiencyStaticPressure: number;
  fanEfficiencyStaticPressureRise: number;
  flowCorrected: number;
  flow: number;
  pressureTotal: number;
  pressureTotalCorrected: number;
  pressureStatic: number;
  pressureStaticCorrected: number;
  staticPressureRiseCorrected: number;
  staticPressureRise: number;
  powerCorrected: number;
  power: number;
  kpc: number;
  kpcCorrected: number;
}


export interface PlaneResults {
  AddlTraversePlanes: Array<PlaneResult>;
  FanInletFlange: PlaneResult;
  FanOrEvaseOutletFlange: PlaneResult;
  FlowTraverse: PlaneResult;
  InletMstPlane: PlaneResult;
  OutletMstPlane: PlaneResult;
}

export interface PlaneResult {
  gasDensity: number;
  gasTotalPressure: number;
  gasVelocity: number;
  gasVelocityPressure: number;
  gasVolumeFlowRate: number;
  staticPressure?: number;
}

export interface FanCurveInputData {
  //baseGasDensity?
  density: number;
  //results density?
  densityCorrected: number;
  //synchronous speed?
  speed: number;
  //Converted Power?
  speedCorrected: number;
  //global barometric pressure?
  pressureBarometric: number;
  //
  pressureBarometricCorrected: number;
  //power factor at load?
  pt1Factor: number;
  //no idea where these come from
  gamma: number;
  gammaCorrected: number;
  area1: number;
  area2: number;

  curveType: string;
  //Do array values have a data pattern?
  //[x, y, z] what are x,y,z?
  //traverse plane data?
  //BaseCurveData: Array<Array<number>
  BaseCurveData: [
    [0, 22.3, 115],
    [14410, 22.5, 154],
    [28820, 22.3, 194],
    [43230, 21.8, 241],
    [57640, 21.2, 293],
    [72050, 20.3, 349],
    [86460, 19.3, 406],
    [100871, 18, 462],
    [115281, 16.5, 515],
    [129691, 14.8, 566],
    [144101, 12.7, 615],
    [158511, 10.2, 667],
    [172921, 7.3, 725],
    [187331, 3.7, 789],
    [201741, -0.8, 861]
  ];
}


export interface FsatInput {
  fanSpeed: number;
  drive: number;
  specifiedDriveEfficiency?: number;
  lineFrequency: number;
  motorRatedPower: number;
  motorRpm: number;
  efficiencyClass: number;
  specifiedEfficiency: number;
  motorRatedVoltage: number;
  fullLoadAmps: number;
  sizeMargin: number;
  measuredVoltage: number;
  measuredAmps: number;
  flowRate: number;
  inletPressure: number;
  outletPressure: number;
  compressibilityFactor: number;
  // operatingFraction: number,
  operatingHours: number;
  unitCost: number;
  airDensity: number;
  userInputFanEfficiency?: number;
  //existing
  loadEstimationMethod?: number;
  measuredPower?: number;
  //modified, optimal
  fanEfficiency?: number;
  fanType?: number;
};


export interface FsatOutput {
  fanEfficiency: number;
  motorRatedPower: number;
  motorShaftPower: number;
  fanShaftPower: number;
  motorEfficiency: number;
  motorPowerFactor: number;
  motorCurrent: number;
  motorPower: number;
  loadFactor: number;
  driveEfficiency: number;
  annualEnergy: number;
  annualCost: number;
  fanEnergyIndex: number;
  //modified
  estimatedFLA?: number;
  percentSavings?: number;
  energySavings?: number;
  annualSavings?: number;
}


export interface InletPressureData {
  inletLoss: number;
  inletDuctworkLoss: number;
  systemDamperLoss: number;
  airTreatmentLoss: number;
  flowMeasurementLoss: number;
  inletDamperLoss: number;
  processRequirements: number;
  inletSystemEffectLoss: number;
  calculatedInletPressure: number;
}

export interface OutletPressureData {
  outletSystemEffectLoss: number;
  outletDamperLoss: number;
  airTreatmentLoss: number;
  systemDamperLoss: number;
  processRequirements: number;
  calculatedOutletPressure: number;
}


export interface CompressibilityFactor {
  moverShaftPower: number;
  inletPressure: number;
  outletPressure: number;
  barometricPressure: number;
  flowRate: number;
  specificHeatRatio: number;
};
