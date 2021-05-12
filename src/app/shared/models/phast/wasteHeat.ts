export interface WasteHeatInput {
    oppHours: number,
    cost: number,
    availableHeat: number,
    heatInput: number,
    hxEfficiency: number,
    chillerInTemperature: number,
    chillerOutTemperature: number,
    copChiller: number,
    chillerEfficiency: number,
    copCompressor: number,
    energySourceType: string
}

export interface WasteHeatOutput {
    baseline: WasteHeatResults,
    modification?: WasteHeatResults,
    annualEnergySavings?: number,
    annualCostSavings?: number,
    energyUnit?: string
}

export interface WasteHeatResults {
    recoveredHeat: number,
    hotWaterFlow: number,
    tonsRefrigeration: number,
    capacityChiller: number,
    electricalEnergy: number,
    annualEnergy: number,
    annualCost: number
}

export interface WasteHeatWarnings {
    exchangeEfficiencyWarning: string,
    chillerEfficiencyWarning: string,
}
