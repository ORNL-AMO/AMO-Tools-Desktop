import { OperatingHours, OperatingCosts } from "./operations";

export interface SSMT {
    name?: string,
    selected?: boolean,
    // notes: Notes,
    implementationCosts?: number,
    setupDone?: boolean,
    operatingHours?: OperatingHours,
    operatingCosts?: OperatingCosts,
    equipmentNotes?: string,
    generalSteamOperations?: GeneralSteamOperations,
    modifications?: Array<Modification>
}

export interface GeneralSteamOperations {
    sitePowerImport: number,
    makeUpWaterTemperature: number
}

export interface Modification {
    ssmt?: SSMT,
    // notes?: Notes,
    exploreOpportunities?: boolean
}