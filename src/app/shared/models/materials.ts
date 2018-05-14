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
    heatingValueVolume: number,
    id?: number,
    selected?: boolean,
    specificGravity: number,
    substance: string
}

export interface GasLoadChargeMaterial {
    id?: number,
    selected?: boolean,
    specificHeatVapor: number,
    substance: string
}

export interface LiquidLoadChargeMaterial {
    id?: number,
    selected?: boolean,
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
    selected?: boolean,
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
    selected?: boolean,
    latentHeat: number,
    meltingPoint: number,
    specificHeatLiquid: number,
    specificHeatSolid: number,
    substance: string
}

export interface AtmosphereSpecificHeat {
    id?: number,
    selected?: boolean,
    specificHeat: number,
    substance: string
}


export interface WallLossesSurface {
    conditionFactor: number,
    id?: number,
    selected?: boolean,
    surface: string
}
