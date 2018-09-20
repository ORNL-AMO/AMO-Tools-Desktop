export interface OperatingHours {
    weeksPerYear?: number,
    daysPerWeek?: number,
    shiftsPerDay?: number,
    hoursPerShift?: number,
    hoursPerYear?: number,
    isCalculated?: boolean,
    operatingConditions?: string
  }

  
export interface OperatingCosts {
    fuelCost?: number,
    steamCost?: number,
    electricityCost?: number,
    makeUpWaterCost?: number
  }