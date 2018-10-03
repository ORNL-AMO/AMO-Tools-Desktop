import { OperatingHours, OperatingCosts } from "../operations";

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
    boilerInput?: BoilerInput,
    headerInput?: HeaderInput,
    turbineInput?: TurbineInput
}

export interface SSMTInputs {
    operationsInput: OperationsInput,
    boilerInput: BoilerInput,
    headerInput: Array<Header>,
    turbineInput: TurbineInput
}

export interface TurbineInput {
    condensingTurbine: CondensingTurbine,
    highToLowTurbine: PressureTurbine,
    highToMediumTurbine: PressureTurbine,
    mediumToLowTurbine: PressureTurbine
}

export const CondensingTurbineOperationTypes: Array<{ value: number, display: string }> = [
    {
        value: 0,
        display: 'Steam Flow'
    },
    {
        value: 1,
        display: 'Power Generation'
    }
]

export const PressureTurbineOperationTypes: Array<{ value: number, display: string }> = [
    {
        value: 0,
        display: 'Steam Flow'
    },
    {
        value: 1,
        display: 'Power Generation'
    },
    {
        value: 2,
        display: 'Balance Header'
    },
    {
        value: 3,
        display: 'Power Range'
    },
    {
        value: 4,
        display: 'Flow Range'
    }
]

export interface CondensingTurbine {
    isentropicEfficiency: number,
    generationEfficiency: number,
    condenserPressure: number,
    operationType: number,
    operationValue: number,
    useTurbine: boolean
}

export interface PressureTurbine {
    isentropicEfficiency: number,
    generationEfficiency: number,
    operationType: number,
    operationValue1: number,
    operationValue2: number,
    useTurbine: boolean
}


export interface OperationsInput {
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


export interface BoilerInput {
    fuelType: number,
    fuel: number,
    combustionEfficiency: number,
    blowdownRate: number,
    blowdownFlashed: boolean,
    preheatMakeupWater: boolean,
    steamTemperature: number,
    deaeratorVentRate: number,
    deaeratorPressure: number,
    approachTemperature: number
}


export interface HeaderInput {
    numberOfHeaders: number,
    headers: Array<Header>
}

export interface Header {
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