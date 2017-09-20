export interface MeteredEnergy {
    meteredEnergyFuel?: MeteredEnergyFuel,
    meteredEnergyElectricity?: MeteredEnergyElectricity,
    meteredEnergySteam?: MeteredEnergySteam
}


export interface MeteredEnergyFuel {
    fuelType: number,
    heatingValue: number,
    collectionTime: number,
    fuelFlowRateInput?: number,
    electricityUsed: number,
    electricityCollectionTime: number,
    fuelEnergy: number
}
export interface MeteredEnergyResults {
    meteredEnergyUsed: number,
    meteredEnergyIntensity: number,
    meteredElectricityUsed: number,
    calculatedFuelEnergyUsed: number,
    calculatedEnergyIntensity: number,
    calculatedElectricityUsed: number
}
export interface MeteredEnergySteam {
    totalHeatSteam: number,
    flowRate: number,
    collectionTime: number,
    electricityUsed: number,
    electricityCollectionTime: number
}

export interface MeteredEnergyElectricity {
    electricityCollectionTime: number,
    electricityUsed: number,
    auxElectricityUsed: number,
    auxElectricityCollectionTime: number
}
