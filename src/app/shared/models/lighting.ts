export interface LightingReplacementData {
    hoursPerDay?: number,
    daysPerMonth?: number,
    monthsPerYear?: number,
    hoursPerYear?: number,
    wattsPerLamp?: number,
    lampsPerFixture?: number,
    numberOfFixtures?: number,
    lumensPerLamp?: number,
    totalLighting?: number,
    electricityUse?: number
  }
  
  
  export interface LightingReplacementResults {
    totalElectricityUse: number;
    totalLighting: number;
    totalOperatingHours: number;
  }