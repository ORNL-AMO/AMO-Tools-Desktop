import { OperatingHours, OperatingCosts } from "./operations";

export interface SSMT {
    name?: string,
    selected?: boolean,
    notes?: Notes,
    implementationCosts?: number,
    setupDone?: boolean,
    operatingHours?: OperatingHours,
    operatingCosts?: OperatingCosts,
    equipmentNotes?: string,
    generalSteamOperations?: GeneralSteamOperations,
    modifications?: Array<Modification>,
    boiler?: Boiler
}

export interface GeneralSteamOperations {
    sitePowerImport: number,
    makeUpWaterTemperature: number
}

export interface Modification {
    ssmt?: SSMT,
    exploreOpportunities?: boolean
}

export interface Notes {
    operationsNotes?: string,
    boilerNotes?: string,
    turbineNotes?: string,
    headerNotes?: string
}


export interface Boiler {
    fuelType: number,
    fuel: number,
    combustionEfficiency: number,
    blowdownRate: number,
    blowdownFlashed: number,
    preheatMakeupWater: number,
    steamTemperature: number,
    deaeratorVentRate: number,
    deaeratorPressure: number,
    approachTemperature: number
}