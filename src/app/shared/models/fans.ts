export interface FSAT {
  name?: string
}


export interface FanRatedInfo {
  fanSpeed: number;
  motorSpeed: number;
  fanSpeedCorrected: number;
  densityCorrected: number;
  pressureBarometricCorrected: number;
}

// unfortunately as of now we have to have both rectangular and circular variants of every Plane
export interface PlaneRectangular {
  length: number;
  width: number;
  tdx: number;
  pbx: number;
  noInletBoxes?: number; // should have a default of 1
}

export interface PlaneCircular {
  circularDiameter: number;
  tdx: number;
  pbx: number;
  noInletBoxes?: number; // should have a default of 1
}

export interface TraverseRectangular extends PlaneRectangular {
  psx: number;
  pitotTubeCoefficient: number;
  traverseData: Array< Array <number> >;
}

export interface TraverseCircular extends PlaneCircular {
  psx: number;
  pitotTubeCoefficient: number;
  traverseData: Array< Array <number> >;
}

export interface PlaneMstRectangular extends PlaneRectangular {
  psx: number;
}

export interface PlaneMstCircular extends PlaneCircular {
  psx: number;
}

export interface PlaneDataRectangular {
  plane5upstreamOfPlane2: boolean;
  totalPressureLossBtwnPlanes1and4: number;
  totalPressureLossBtwnPlanes2and5: number;

  FanInletFlange: PlaneRectangular;
  FanEvaseOrOutletFlange: PlaneRectangular;
  FlowTraverse: TraverseRectangular;
  AddlTraversePlanes: Array<TraverseRectangular>;
  InletMstPlane: PlaneMstRectangular;
  OutletMstPlane: PlaneMstRectangular;
}

export interface PlaneDataCircular {
  plane5upstreamOfPlane2: boolean;
  totalPressureLossBtwnPlanes1and4: number;
  totalPressureLossBtwnPlanes2and5: number;

  FanInletFlange: PlaneCircular;
  FanEvaseOrOutletFlange: PlaneCircular;
  FlowTraverse: TraverseCircular;
  AddlTraversePlanes: Array<TraverseCircular>;
  InletMstPlane: PlaneMstCircular;
  OutletMstPlane: PlaneMstCircular;
}

export interface BaseGasDensity {
  dryBulbTemp: number;
  staticPressure: number;
  barometricPressure: number;
  gasDensity: number;
  gasType: string;
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
}

// holds the results of the fan203 calculation
export interface Fan203Results {
  fanEfficiencyTp: number;
  fanEfficiencySp: number;
  fanEfficiencySpr: number;
  Qc: number;
  Ptc: number;
  Psc: number;
  SPRc: number;
  Hc: number;
  Kpc: number;
}
