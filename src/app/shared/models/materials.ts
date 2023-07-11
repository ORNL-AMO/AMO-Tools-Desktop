export interface FlueGasMaterial {
    C2H6: number;
    C3H8: number;
    C4H10_CnH2n: number;
    CH4: number;
    CO: number;
    CO2: number;
    H2: number;
    H2O: number;
    N2: number;
    O2: number;
    SO2: number;
    heatingValue: number;
    heatingValueVolume: number;
    id?: number;
    selected?: boolean;
    specificGravity: number;
    substance: string;
}

export interface GasLoadChargeMaterial {
    id?: number;
    selected?: boolean;
    specificHeatVapor: number;
    substance: string;
}

export interface LiquidLoadChargeMaterial {
    id?: number;
    selected?: boolean;
    latentHeat: number;
    specificHeatLiquid: number;
    specificHeatVapor: number;
    substance: string;
    vaporizationTemperature: number;
}


export interface SolidLiquidFlueGasMaterial {
    carbon: number;
    hydrogen: number;
    id?: number;
    selected?: boolean;
    inertAsh: number;
    moisture: number;
    nitrogen: number;
    o2: number;
    substance: string;
    sulphur: number;
    heatingValue: number;
}

export interface SolidLoadChargeMaterial {
    id?: number;
    selected?: boolean;
    latentHeat: number;
    meltingPoint: number;
    specificHeatLiquid: number;
    specificHeatSolid: number;
    substance: string;
}

export interface AtmosphereSpecificHeat {
    id?: number;
    selected?: boolean;
    specificHeat: number;
    substance: string;
}


export interface WallLossesSurface {
    conditionFactor: number;
    id?: number;
    selected?: boolean;
    surface: string;
}

export interface SuiteDbMotor {
    catalog: string,
    efficiencyClass: number,
    hp: number,
    lineFrequency: number,
    id?: number,
    enclosureType: string,
    nemaTable: string,
    nominalEfficiency: number,
    poles: number,
    synchronousSpeed: number,
    voltageLimit: number
}

export interface SuiteDbPump {
    manufacturer: string, 
    model: string, 
    serialNumber: string,
    status: string, 
    pumpType: string, 
    shaftOrientation: string, 
    shaftSealType: string, 
    fluidType: string, 
    priority: string,
    driveType: string, 
    flangeConnectionClass: string, 
    flangeConnectionSize: number,
    componentId: string,
    motorEfficiencyClass: string,
    system: string, 
    location: string,
    speed: number, 
    numStages: number,  
    yearlyOperatingHours: number, 
    yearInstalled: number, 
    finalMotorRpm: number,
    motorRatedVoltage: number,
    inletDiameter: number, 
    outletDiameter: number,
    staticSuctionHead: number,
    staticDischargeHead: number, 
    fluidDensity: number, 
    maxWorkingPressure: number, 
    maxAmbientTemperature: number,
    maxSuctionLift: number,  
    displacement: number, 
    startingTorque: number, 
    ratedSpeed: number,
    impellerDiameter: number, 
    efficiency: number, 
    lineFrequency: number, 
    minFlowSize: number,
    pumpSize: number,  
    designHead: number,
    designFlow: number,
    designEfficiency: number,
    motorRatedPower: number,
    motorFullLoadAmps: number,
    operatingFlowRate: number,
    operatingHead: number,
    measuredCurrent: number,
    measuredPower: number,
    measuredVoltage: number,
    motorEfficiency: number,
}

// export interface SuiteDbPump {
//     dailyPumpCapacity: number,
//     displacement: number,
//     driveType: string,
//     efficiency: number,
//     finalMotorRpm: number,
//     flangeConnectionClass: string,
//     flangeConnectionSize: string,
//     fluidDensity: number,
//     fluidType: string,
//     id?: number,
//     impellerDiameter: number,
//     inletDiameter: number,
//     lengthOfDischargePipe: number,
//     manufacturer: string,
//     maxAmbientTemperature: number,
//     maxSuctionLift: number,
//     maxWorkingPressure: number,
//     measuredPumpCapacity: number,
//     minFlowSize: number,
//     model: string,
//     numShafts: number,
//     numStages: number,
//     outOfService: number,
//     outletDiameter: number,
//     output60Hz: number,
//     percentageOfSchedule: number,
//     pipeDesignFrictionLosses: number,
//     priority: string,
//     pumpPerformance: number,
//     pumpSize: number,
//     pumpType: string,
//     radialBearingType: string,
//     ratedSpeed: number,
//     serialNumber: string,
//     shaftDiameter: number,
//     shaftOrientation: string,
//     shaftSealType: string,
//     speed: number,
//     startingTorque: number,
//     staticDischargeHead: number,
//     staticSuctionHead: number,
//     status: string,
//     thrustBearingType: string,
//     type: string,
//     weight: number,
//     yearInstalled: number,
//     yearlyOperatingHours: number
// }