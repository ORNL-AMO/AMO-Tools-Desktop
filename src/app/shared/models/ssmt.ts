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
    boilerData?: BoilerData,
    headerData?: HeaderData,
    turbineData?: TurbineData
}

export interface SSMTInputs {
    operationsData: OperationsData,
    boilerData: BoilerData,
    headerData: HeaderData,
    turbineData?: TurbineData
}

export interface TurbineData {

}

export interface OperationsData {
    sitePowerImport: number,
    makeUpWaterTemperature: number,
    operatingHoursPerYear: number,
    fuelCosts: number,
    electricityCosts: number,
    makeUpWaterCosts: number,
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


export interface BoilerData {
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


export interface HeaderData {
    numberOfHeaders: number,
    headers: Array<HeaderInput>
}

export interface HeaderInput {
    pressure: number,
    processSteamUsage: number,
    condensationRecoveryRate: number,
    heatLoss: number,
    //do we want to use an index for lowest to highest pressure
    pressureIndex: number,
    //not for highest pressure (highest index?)
    flashCondensateIntoHeader?: boolean,
    desuperheatSteamIntoNextHighest?: boolean,
    desuperheatSteamTemperature?: number,
    //only highest pressure (highest index?)
    condensateReturnTemperature?: number,
    flashCondensateReturn?: boolean
}