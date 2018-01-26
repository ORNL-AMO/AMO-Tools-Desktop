export interface FanRatedInfo {
  fanSpeed?: number;
  motorSpeed?: number;
  fanSpeedCorrected?: number;
  densityCorrected?: number;
  pressureBarometricCorrected?: number;
}

export interface PlaneRectangular {
  length?: number;
  width?: number;
  tdx?: number;
  pbx?: number;
  noInletBoxes?: number; // should have a default of 1
}

export interface PlaneCircular {
  circularDiameter?: number;
  tdx?: number;
  pbx?: number;
  noInletBoxes?: number; // should have a default of 1
}

export interface TraverseRectangular extends PlaneRectangular {
  psx?: number;
  pitotTubeCoefficient?: number;
  traverseData?: Array< Array <number> >;
}

export interface TraverseCircular extends PlaneCircular {
  psx?: number;
  pitotTubeCoefficient?: number;
  traverseData?: Array< Array <number> >;
}

export interface PlaneMstRectangular extends PlaneRectangular {
  psx?: number;
}

export interface PlaneMstCircular extends PlaneCircular {
  psx?: number;
}

export interface PlaneDataRectangular {
  plane5upstreamOfPlane2?: boolean;
  totalPressureLossBtwnPlanes1and4?: number;
  totalPressureLossBtwnPlanes2and5?: number;

  FanInletFlange: PlaneRectangular;
  FanEvaseOrOutletFlange: PlaneRectangular;
  FlowTraverse: TraverseRectangular;
  AddlTraversePlanes: Array<TraverseRectangular>;
  InletMstPlane: PlaneMstRectangular;
  OutletMstPlane: PlaneMstRectangular;
}

export interface PlaneDataCircular {
  plane5upstreamOfPlane2?: boolean;
  totalPressureLossBtwnPlanes1and4?: number;
  totalPressureLossBtwnPlanes2and5?: number;

  FanInletFlange: PlaneCircular;
  FanEvaseOrOutletFlange: PlaneCircular;
  FlowTraverse: TraverseCircular;
  AddlTraversePlanes: Array<TraverseCircular>;
  InletMstPlane: PlaneMstCircular;
  OutletMstPlane: PlaneMstCircular;
}

export interface BaseGasDensity {
  dryBulbTemp?: number;
  staticPressure?: number;
  barometricPressure?: number;
  gasDensity?: number;
  gasType?: string;
}

export interface FanShaftPower {
  isMethodOne?: boolean;
  voltage?: number;
  amps?: number;
  powerFactorAtLoad?: number;
  efficiencyMotor?: number;
  efficiencyVFD?: number;
  efficiencyBelt?: number;
  sumSEF?: number;
}

class Fan203Rectangular {
  private fanRatedInfo: FanRatedInfo;
  private planeDataRectangular: PlaneDataRectangular;
  private baseGasDensity: BaseGasDensity;
  private fanShaftPower: FanShaftPower;

  constructor (fanRatedInfo: FanRatedInfo, planeDataRectangular: PlaneDataRectangular, baseGasDensity: BaseGasDensity, fanShaftPower: FanShaftPower) {
    this.fanRatedInfo = fanRatedInfo;
    this.planeDataRectangular = planeDataRectangular;
    this.baseGasDensity = baseGasDensity;
    this.fanShaftPower = fanShaftPower;
  }
}

class Fan203Circular {
  private fanRatedInfo: FanRatedInfo;
  private planeDataCircular: PlaneDataCircular;
  private baseGasDensity: BaseGasDensity;
  private fanShaftPower: FanShaftPower;

  constructor (fanRatedInfo: FanRatedInfo, planeDataCircular: PlaneDataCircular, baseGasDensity: BaseGasDensity, fanShaftPower: FanShaftPower) {
    this.fanRatedInfo = fanRatedInfo;
    this.planeDataCircular = planeDataCircular;
    this.baseGasDensity = baseGasDensity;
    this.fanShaftPower = fanShaftPower;
  }
}
