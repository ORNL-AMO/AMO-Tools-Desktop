export interface DesignedEnergyFuel {
    zoneNumber: number,
    fuelType: number,
    percentCapacityUsed: number,
    totalBurnerCapacity: number,
    percentOperatingHours: number
}
export interface DesignedEnergySteam {
    zoneNumber: number,
    totalHeat: number,
    steamFlow: number,
    percentCapacityUsed: number,
    percentOperatingHours: number
}
export interface DesignedEnergyElectricity {
    zoneNumber: number,
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