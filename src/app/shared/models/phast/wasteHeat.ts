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
    copCompressor: number
}

export interface WasteHeatOutput {
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
