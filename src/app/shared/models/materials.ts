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
    isDefault?: boolean
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
    isDefault?: boolean;
}

export interface AtmosphereSpecificHeat {
    id?: number;
    selected?: boolean;
    specificHeat: number;
    substance: string;
    isDefault?: boolean
}


export interface WallLossesSurface {
    conditionFactor: number;
    id?: number;
    isDefault?: boolean;
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
