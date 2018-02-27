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
    staticPressure?: number;
    pitotTubeCoefficient?: number;
    traverseData?: Array<Array<number>>;
    pitotTubeType?: string,
    numTraverseHoles?: number,
    numInsertionPoints?: number
}

 export interface Traverse extends Plane {
     //psx => staticPressure
    pitotTubeCoefficient?: number;
    traverseData?: Array<Array<number>>;
    pitotTubeType?: string,
    numTraverseHoles?: number,
    numInsertionPoints?: number
 }

// export interface PlaneMeasurement extends Plane {
//     //psx => staticPressure
//     staticPressure: number;
// }

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
    method: string,
    conditionLocation: number,
    gasSpecificGravity: number,
    wetBulbTemp: number,
    relativeHumidity: number,
    gasDewpointTemp: number,
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


export interface Fan203Inputs {
    FanRatedInfo: FanRatedInfo,
    BaseGasDensity: BaseGasDensity,
    FanShaftPower: FanShaftPower,
    PlaneData?: PlaneData | PlaneData
}

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