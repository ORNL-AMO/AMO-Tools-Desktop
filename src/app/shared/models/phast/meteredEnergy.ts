export interface MeteredEnergy {
    meteredEnergyFuel?: MeteredEnergyFuel;
    meteredEnergyElectricity?: MeteredEnergyElectricity;
    meteredEnergySteam?: MeteredEnergySteam;
    fuel?: boolean;
    steam?: boolean;
    electricity?: boolean;
}


export interface MeteredEnergyFuel {
    fuelDescription?: string;
    fuelType: number;
    heatingValue: number;
    collectionTime: number;
    fuelFlowRateInput?: number;
    electricityUsed: number;
    electricityCollectionTime: number;
    fuelEnergy: number;
    userDefinedMeteredEnergy?: boolean;
    operatingHours: number;
}
export interface MeteredEnergyResults {
    meteredEnergyUsed: number;
    meteredEnergyIntensity: number;
    meteredElectricityUsed: number;
    calculatedFuelEnergyUsed: number;
    calculatedEnergyIntensity: number;
    calculatedElectricityUsed: number;
}
export interface MeteredEnergySteam {
    totalHeatSteam: number;
    flowRate: number;
    collectionTime: number;
    electricityUsed: number;
    electricityCollectionTime: number;
    operatingHours: number;
}

export interface MeteredEnergyElectricity {
    electricityCollectionTime: number;
    electricityUsed: number;
    auxElectricityUsed: number;
    auxElectricityCollectionTime: number;
    operatingHours: number;
}
