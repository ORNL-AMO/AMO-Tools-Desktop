import { CoolingChartData } from "../cooling-weather-chart/cooling-weather-chart.component";

//====== Cooling Tower ======
export interface CoolingTowerData {
    name: string;
    operationalHours: number;
    flowRate: number;
    userDefinedCoolingLoad: boolean;
    temperatureDifference: number;
    coolingLoad: number;
    lossCorrectionFactor: number;
    hasDriftEliminator: number;
    driftLossFactor: number;
    cyclesOfConcentration: number;
  }
  
  export interface CoolingTowerInput {
    coolingTowerMakeupWaterCalculator: CoolingTowerMakeupWaterCalculator;
  }
  
  export interface CoolingTowerMakeupWaterCalculator {
    operatingConditionsData: OperatingConditionsData;
    waterConservationBaselineData: WaterConservationData;
    waterConservationModificationData: WaterConservationData;
  }
  
  export interface CoolingTowerOutput extends CoolingTowerResult {
    wcBaseline: number;
    wcModification: number;
    waterSavings: number;
    savingsPercentage: number;
    coolingTowerCaseResults: Array<CoolingTowerResult>;
  }
  
  export interface CoolingTowerResult {
    wcBaseline: number;
    wcModification: number;
    waterSavings: number;
  }
  
  export interface OperatingConditionsData {
    operationalHours: number;
    flowRate: number;
    coolingLoad: number;
    lossCorrectionFactor: number;
  }
  
  export interface WaterConservationData {
    driftLossFactor: number;
    cyclesOfConcentration: number;
  }

  export interface CoolingTowerBasinInput {
    ratedCapacity: number,
    ratedTempSetPoint: number,
    ratedTempDryBulb: number,
    ratedWindSpeed: number,
    panLossRatio: number,
    operatingTempDryBulb: number,
    operatingWindSpeed: number,
    operatingHours: number,
    baselineTempSetPoint: number,
    modTempSetPoint: number
  }

  export interface CoolingTowerBasinResult {
    baselinePower: number,
    baselineEnergy: number,
    modPower: number,
    modEnergy: number,
    savingsEnergy: number,
  }

  export interface WeatherBinnedResult {
    caseName: string,
    operatingHours: number, 
    results: CoolingTowerBasinResult
  }

  export interface CoolingTowerBasinOutput {
    results: CoolingTowerBasinResult;
    // todo merge after demo
    totalResults?: CoolingTowerBasinResult;
    weatherBinnedResults?: Array<WeatherBinnedResult>;
    weatherBinnedChartData?: WeatherBinnedChartData;
  }

  export interface WeatherBinnedChartData {
    barChartDataArray: Array<CoolingChartData>
    yValueUnit: string;
    yAxisLabel: string;
    parameterUnit: string;
  }
  

  //====== Chiller Performance and Temperature ======

  export interface ChillerPerformanceInput {
    // chiller characteristics
    chillerType: number,
    condenserCoolingType: number,
    motorDriveType: number,
    compressorConfigType: number
    // chiller rated conditions
    ariCapacity: number,
    ariEfficiency: number,
    maxCapacityRatio: number,
    // chiller operating conditions
    waterDeltaT: number,
    waterFlowRate: number,
    operatingHours: number,
    // chilled water temperature reset
    baselineWaterSupplyTemp: number,
    baselineWaterEnteringTemp: number
    modWaterSupplyTemp: number,
    modWaterEnteringTemp: number
  }


  export interface ChillerPerformanceOutput {
    baselineActualEfficiency: number,
    baselineActualCapacity: number,
    baselinePower: number,
    baselineEnergy: number,
    modActualEfficiency: number,
    modActualCapacity: number,
    modPower: number,
    modEnergy: number,
    savingsEnergy: number,
  }


export interface CoolingTowerFanInput {
  towerType: number,
  numCells: number,
  waterFlowRate: number,
  ratedFanPower: number,
  waterLeavingTemp: number,
  waterEnteringTemp: number,
  operatingTempWetBulb: number,
  operatingHours: number,
  baselineSpeedType: number,
  modSpeedType: number,
}


export interface CoolingTowerFanOutput {
  baselinePower: number,
  baselineEnergy: number,
  modPower: number,
  modEnergy: number,
  savingsEnergy: number,
}


  // Chiller staging 
  export interface ChillerStagingInput {
    // chiller characteristics
    chillerType: number,
    condenserCoolingType: number,
    motorDriveType: number,
    compressorConfigType: number
    // chiller rated conditions
    ariCapacity: number,
    ariEfficiency: number,
    maxCapacityRatio: number,
    // chiller operating conditions
    waterSupplyTemp: number,
    waterEnteringTemp: number,
    coolingLoad: number,
    operatingHours: number,
    // bl/mod
    baselineLoadList: Array<number>,
    modLoadList: Array<number>,
  }


  export interface ChillerStagingOutput {
    baselineTotalPower: number,
    baselineTotalEnergy: number,
    modTotalPower: number,
    modTotalEnergy: number,
    savingsEnergy: number,
    baselinePowerList: Array<number>,
    modPowerList: Array<number>,
    chillerLoadResults?: Array<{baseline: number, modification: number}>
  }

