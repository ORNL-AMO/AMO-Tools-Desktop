import { OpportunityUtilityType } from "../treasure-hunt"

export interface AirHeatingInput {
    utilityType?: OpportunityUtilityType,
    operatingHours: number,
    gasFuelType: boolean,
    fuelCost: number,
    materialTypeId: number,
    flueTemperature: number,
    oxygenCalculationMethod: string,
    moistureInAirCombustion?: number
    flueGasO2: number,
    excessAir: number,
    fireRate: number,
    airflow: number,
    inletTemperature: number,
    heaterEfficiency: number,
    hxEfficiency: number,
    substance: string,
    // gas fuel elements
    CH4?: number,
    C2H6?: number,
    N2?: number,
    H2?: number,
    C3H8?: number,
    C4H10_CnH2n?: number,
    H2O?: number,
    CO?: number,
    CO2?: number,
    SO2?: number,
    O2?: number
    // solid/liquid fuel elements
    carbon?: number,
    hydrogen?: number,
    sulphur?: number,
    inertAsh?: number,
    o2?: number,
    moisture?: number,
    nitrogen?: number,
}

export interface AirHeatingOutput {
    hxColdAir: number,
    hxOutletExhaust: number,
    energySavings: number,
    costSavings: number,
    heatCapacityFlue: number,
    heatCapacityAir: number
    baselineEnergy: number,
    modificationEnergy: number,
}
