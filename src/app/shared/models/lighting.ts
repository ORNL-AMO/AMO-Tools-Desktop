export interface LightingReplacementData {
  name?: string,
  hoursPerYear?: number,
  wattsPerLamp?: number,
  lampsPerFixture?: number,
  numberOfFixtures?: number,
  lumensPerLamp?: number,
  totalLighting?: number,
  electricityUse?: number,
  //added for #2381 update
  lampLife?: number,
  ballastFactor?: number,
  lumenDegradationFactor?: number,
  coefficientOfUtilization?: number,
  lampCRI?: number,
  category?: number,
  type?: string
}


export interface LightingReplacementResults {
  baselineResults: LightingReplacementResult,
  modificationResults: LightingReplacementResult,
  totalEnergySavings: number,
  totalCostSavings: number
}

export interface LightingReplacementResult {
  totalElectricityUse: number;
  totalLighting: number;
  totalOperatingHours: number;
  totalOperatingCosts: number;
}