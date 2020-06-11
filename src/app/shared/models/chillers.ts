//====== process-cooling objects ======
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
  
  //====== end process-cooling objects =======
  