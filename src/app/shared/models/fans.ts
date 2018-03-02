export interface FSAT {
  name?: string
}


export interface FanRatedInfo {
  fanSpeed: number;
  motorSpeed: number;
  fanSpeedCorrected: number;
  densityCorrected: number;
  pressureBarometricCorrected: number;
  //Mark additions
  driveType: string;
  includesEvase: string;
  upDownStream: string;
  traversePlanes: number;
}

export interface Plane {
  planeType: string,
  length: number,
  width: number,
  area: number,
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
  pitotTubeType?: string,
  numTraverseHoles?: number,
  numInsertionPoints?: number
}

export interface PlaneData {
  plane5upstreamOfPlane2: boolean;
  totalPressureLossBtwnPlanes1and4: number;
  totalPressureLossBtwnPlanes2and5: number;

  FanInletFlange: Plane;
  FanEvaseOrOutletFlange: Plane;
  FlowTraverse: Plane;
  AddlTraversePlanes: Array<Plane>;
  InletMstPlane: Plane;
  OutletMstPlane: Plane;
}

export interface BaseGasDensity {
  dryBulbTemp: number;
  staticPressure: number;
  barometricPressure: number;
  gasDensity: number;
  gasType: string;
  //mark additions
  method: string, // this I think should be mapped to inputType - the bindings expect a string labeled inputType
  conditionLocation: number,
  gasSpecificGravity: number, // this should be replaced by specificGravity below
  wetBulbTemp: number,
  relativeHumidity: number, // both this variable and gasDewpointTemp should be unused, they are covered by relativeHumidityOrDewPoint
  gasDewpointTemp: number, // see above comment


  // new optional fields - used when gasDensity isn't an explicit user input
  inputType?: string; // relativeHumidity, dewPoint, or wetBulb are the options
  relativeHumidityOrDewPoint?: number; // required for when inputType is relativeHumidity or dewPoint
  specificGravity?: number; // required for anything other than explicit user input gasDensity (custom)
  specificHeatGas?: number; // required when method 3 wetBulb is used
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
  //mark additions
  // method: string,
  isVFD: string,
  mainsDataAvailable: string,
  ratedHP: number,
  synchronousSpeed: number,
  npv: number,
  fla: number,
  vfdInput: number,
  phase1: MotorPhase,
  phase2: MotorPhase,
  phase3: MotorPhase
}
export interface MotorPhase {
  voltage: number,
  amps: number,
  powerFactor?: number
}

export interface Fan203Inputs {
  FanRatedInfo: FanRatedInfo,
  BaseGasDensity: BaseGasDensity,
  FanShaftPower: FanShaftPower,
  PlaneData?: PlaneData | PlaneData
}

export interface Fan203Results {
  fanEfficiencyTotalPressure: number;
  fanEfficiencyStaticPressure: number;
  fanEfficiencyStaticPressureRise: number;
  flowCorrected: number;
  pressureTotalCorrected: number;
  pressureStaticCorrected: number;
  staticPressureRiseCorrected: number;
  powerCorrected: number;
  kpc: number;
}
