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
    steamCost?: number;
    electricityCost?: number;
    makeUpWaterCost?: number;
  }
  