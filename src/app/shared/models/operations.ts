export interface OperatingHours {
    weeksPerYear?: number;
    daysPerWeek?: number;
    hoursPerDay?: number;
    hoursPerYear?: number;
    secondsPerMinute?: number;
    minutesPerHour?: number;
    operatingConditions?: string;
  }

  
export interface OperatingCosts {
    fuelCost?: number;
    coalCarbonCost?: number;
    electrodeCost?: number;
    otherFuelCost?: number;
    steamCost?: number;
    electricityCost?: number;
    makeUpWaterCost?: number;
    implementationCosts?: number;
  }
  