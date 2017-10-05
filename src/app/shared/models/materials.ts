export interface FlueGasMaterial {
    C2H6: number,
    C3H8: number,
    C4H10_CnH2n: number,
    CH4: number,
    CO: number,
    CO2: number,
    H2: number,
    H2O: number,
    N2: number,
    O2: number,
    SO2: number,
    heatingValue: number,
    id?: number,
    specificGravity: number,
    substance: string
}

export interface GasLoadChargeMaterial {
    id?: number,
    specificHeatVapor: number,
    substance: string
}

export interface LiquidLoadChargeMaterial {
    id?: number,
    latentHeat: number,
    specificHeatLiquid: number,
    specificHeatVapor: number,
    substance: string,
    vaporizationTemperature: number
}


export interface SolidLiquidFlueGasMaterial {
    carbon: number,
    hydrogen: number,
    id?: number,
    inertAsh: number,
    moisture: number,
    nitrogen: number,
    o2: number,
    substance: string,
    sulphur: number,
    heatingValue: number
}

export interface SolidLoadChargeMaterial {
    id?: number,
    latentHeat: number,
    meltingPoint: number,
    specificHeatLiquid: number,
    specificHeatSolid: number,
    substance: string
}

export interface AtmosphereSpecificHeat {
    id?: number,
    specificHeat: number,
    substance: string
}


export interface WallLossesSurface {
    conditionFactor: number,
    id?: number,
    surface: string
}