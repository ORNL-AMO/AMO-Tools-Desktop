export interface DesignedEnergy {
    designedEnergyFuel?: DesignedEnergyFuel[]
    designedEnergySteam?: DesignedEnergySteam[]
    designedEnergyElectricity?: DesignedEnergyElectricity[],
    steam?: boolean,
    fuel?: boolean,
    electricity?: boolean
}

export interface DesignedEnergyFuel {
    name: string,
    fuelType: number,
    percentCapacityUsed: number,
    totalBurnerCapacity: number,
    percentOperatingHours: number
}
export interface DesignedEnergySteam {
    name: string,
    totalHeat: number,
    steamFlow: number,
    percentCapacityUsed: number,
    percentOperatingHours: number
}
export interface DesignedEnergyElectricity {
    name: string,
    kwRating: number,
    percentCapacityUsed: number,
    percentOperatingHours: number
}

export interface DesignedEnergyResults {
    designedEnergyUsed: number,
    designedEnergyIntensity: number,
    designedElectricityUsed: number,
    calculatedFuelEnergyUsed: number,
    calculatedEnergyIntensity: number,
    calculatedElectricityUsed: number
}