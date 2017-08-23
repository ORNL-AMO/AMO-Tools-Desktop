export interface FlueGasMaterial {
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
    sulphur: number
}

export interface SolidLoadChargeMaterial {
    id?: number,
    latentHeat: number,
    meltingPoint: number,
    specificHeatLiquid: number,
    specificHeatSolid: number,
    substance: string
}