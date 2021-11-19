import { OperatingHours } from "../operations";

export interface DesignedEnergy {
    zones: Array<DesignedZone>;
    steam?: boolean;
    fuel?: boolean;
    electricity?: boolean;
}

export interface DesignedEnergyFuel {
    fuelType: number;
    percentCapacityUsed: number;
    totalBurnerCapacity: number;
    // percentOperatingHours: number;
    operatingHours: number;
    operatingHoursCalc?: OperatingHours;
}
export interface DesignedEnergySteam {
    totalHeat: number;
    steamFlow: number;
    percentCapacityUsed: number;
    // percentOperatingHours: number;
    operatingHours: number;
    operatingHoursCalc?: OperatingHours;
}
export interface DesignedEnergyElectricity {
    kwRating: number;
    percentCapacityUsed: number;
    // percentOperatingHours: number;
    operatingHours: number;
    operatingHoursCalc?: OperatingHours;
}

export interface DesignedEnergyResults {
    designed: EnergyResult;
    byPhast: EnergyResult;
}

export interface EnergyResult {
    hourlyEnergy: number;
    annualEnergy: number;
    hourlyElectricity?: number;
    annualElectricity: number;
    energyIntensity: number;
}

export interface DesignedZone {
    name: string;
    designedEnergyFuel: DesignedEnergyFuel;
    designedEnergySteam: DesignedEnergySteam;
    designedEnergyElectricity: DesignedEnergyElectricity;
}
