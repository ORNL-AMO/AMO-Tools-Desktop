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

  export interface CoolingTowerBasinOutput {
    baselinePower: number,
    baselineEnergy: number,
    modPower: number,
    modEnergy: number,
    savingsEnergy: number
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

