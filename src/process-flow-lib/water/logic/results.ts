import { DiagramSettings } from "../types/diagram";
import { BoilerWater, BoilerWaterResults, CoolingTower, CoolingTowerResults, KitchenRestroom, KitchenRestroomResults, Landscaping, LandscapingResults, ProcessUse, ProcessUseResults } from "../types/water-components";
import { convertAnnualFlow, convertNullInputValueForObjectConstructor } from "./utils";

// * WASM Module with suite api
declare var Module: any;


export const calculateProcessUseResults = (processUse: ProcessUse, hoursPerYear: number): ProcessUseResults => {
  let grossWaterUse = convertAnnualFlow(
      processUse.waterRequiredMetricValue, 
      processUse.waterRequiredMetric, 
      hoursPerYear, 
      processUse.annualProduction
    );
    let recirculatedWater = grossWaterUse * processUse.fractionGrossWaterRecirculated;
    let incomingWater = grossWaterUse - recirculatedWater;
    let waterConsumed = convertAnnualFlow(
      processUse.waterConsumedMetricValue, 
      processUse.waterConsumedMetric, 
      hoursPerYear, 
      processUse.annualProduction,
      grossWaterUse, 
      incomingWater
    );
    let waterLoss = convertAnnualFlow(
      processUse.waterLossMetricValue, 
      processUse.waterLossMetric, 
      hoursPerYear, 
      processUse.annualProduction,
      grossWaterUse, 
      incomingWater
    );
    let wasteDischargedAndRecycledOther = incomingWater - waterConsumed - waterLoss;

    return {
      grossWaterUse,
      recirculatedWater,
      incomingWater,
      waterConsumed,
      waterLoss,
      wasteDischargedAndRecycledOther
    }
  }

  export const calculateBoilerWaterResults = (inputData: BoilerWater, hoursPerYear: number): BoilerWaterResults => {
      const suiteApiInputData = JSON.parse(JSON.stringify(inputData));
      let instance = new Module.WaterAssessment();
      hoursPerYear = convertNullInputValueForObjectConstructor(hoursPerYear);
      suiteApiInputData.power = convertNullInputValueForObjectConstructor(suiteApiInputData.power);
      suiteApiInputData.loadFactor = convertNullInputValueForObjectConstructor(suiteApiInputData.loadFactor);
      suiteApiInputData.loadFactor = suiteApiInputData.loadFactor / 100;
      suiteApiInputData.steamPerPower = convertNullInputValueForObjectConstructor(suiteApiInputData.steamPerPower);
      suiteApiInputData.feedwaterConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.feedwaterConductivity);
      suiteApiInputData.makeupConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.makeupConductivity);
      suiteApiInputData.blowdownConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.blowdownConductivity);
      let output = instance.calculateBoilerWaterLosses(
        hoursPerYear,
        suiteApiInputData.power,
        suiteApiInputData.loadFactor,
        suiteApiInputData.steamPerPower,
        suiteApiInputData.feedwaterConductivity,
        suiteApiInputData.makeupConductivity,
        suiteApiInputData.blowdownConductivity,
      );
  
      let results: BoilerWaterResults = {
        cycleOfConcentration: output.cycleOfConcentration,
        grossWaterUse: output.grossWaterUse,
        makeupWater: output.makeupWater,
        steamLoss: output.steamLoss,
        blowdownLoss: output.blowdownLoss,
        condensateReturn: output.condensateReturn,
        rateOfRecirculation: output.rateOfRecirculation,
      }
  
      instance.delete();
      output.delete();
  
      return results;
    }

    export const calculateCoolingTowerResults = (inputData: CoolingTower, hoursPerYear: number): CoolingTowerResults => {
      const suiteApiInputData = JSON.parse(JSON.stringify(inputData));
      let instance = new Module.WaterAssessment();
      hoursPerYear = convertNullInputValueForObjectConstructor(hoursPerYear);
      suiteApiInputData.tonnage = convertNullInputValueForObjectConstructor(suiteApiInputData.tonnage);
      suiteApiInputData.loadFactor = convertNullInputValueForObjectConstructor(suiteApiInputData.loadFactor);
      suiteApiInputData.loadFactor = suiteApiInputData.loadFactor / 100;
      suiteApiInputData.evaporationRateDegree = convertNullInputValueForObjectConstructor(suiteApiInputData.evaporationRateDegree);
      suiteApiInputData.evaporationRateDegree = suiteApiInputData.evaporationRateDegree / 100;
      suiteApiInputData.temperatureDrop = convertNullInputValueForObjectConstructor(suiteApiInputData.temperatureDrop);
      suiteApiInputData.makeupConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.makeupConductivity);
      suiteApiInputData.blowdownConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.blowdownConductivity);
  
      let output = instance.calculateCoolingTowerLoss(
        hoursPerYear,
        suiteApiInputData.tonnage,
        suiteApiInputData.loadFactor,
        suiteApiInputData.evaporationRateDegree,
        suiteApiInputData.temperatureDrop,
        suiteApiInputData.makeupConductivity,
        suiteApiInputData.blowdownConductivity,
      );
  
      let results: CoolingTowerResults = {
        grossWaterUse: output.grossWaterUse,
        evaporationLoss: output.evaporationLoss,
        cycleOfConcentration: output.cycleOfConcentration,
        makeupWater: output.makeupWater,
        blowdownLoss: output.blowdownLoss,
      }
  
      instance.delete();
      output.delete();
  
      return results;
  
    }

    export const calculateKitchenRestroomResults = (inputData: KitchenRestroom): KitchenRestroomResults =>  {
      const suiteApiInputData = JSON.parse(JSON.stringify((inputData)));
      let instance = new Module.WaterAssessment();
      suiteApiInputData.employeeCount = convertNullInputValueForObjectConstructor(suiteApiInputData.employeeCount);
      suiteApiInputData.workdaysPerYear = convertNullInputValueForObjectConstructor(suiteApiInputData.workdaysPerYear);
      suiteApiInputData.dailyUsePerEmployee = convertNullInputValueForObjectConstructor(suiteApiInputData.dailyUsePerEmployee);
      let grossWaterUse = instance.calculateKitchenRestroomGrossWaterUse(
        suiteApiInputData.employeeCount,
        suiteApiInputData.workdaysPerYear,
        suiteApiInputData.dailyUsePerEmployee,
      );
  
      let results: KitchenRestroomResults = {
        grossWaterUse: grossWaterUse
      }
  
      instance.delete();
  
      return results;
    }

    export const convertLandscapingSuiteInput = (landscaping: Landscaping, unitsOfMeasure: string): Landscaping => {
      let convertedLandscaping: Landscaping = {
        areaIrrigated: landscaping.areaIrrigated,
        yearlyInchesIrrigated: landscaping.yearlyInchesIrrigated
      };
      if (unitsOfMeasure == 'Imperial') {
        // * return ft2 to in2
        convertedLandscaping.areaIrrigated = convertedLandscaping.areaIrrigated * 144;
      } else if (unitsOfMeasure == "Metric") {
        // * return m2 to cm2
        convertedLandscaping.areaIrrigated = convertedLandscaping.areaIrrigated * 10000;
      }
  
      return convertedLandscaping;
    }
  
  
    export const calculateLandscapingResults = (inputData: Landscaping): LandscapingResults => {
      const suiteApiInputData = JSON.parse(JSON.stringify((inputData)));
      let instance = new Module.WaterAssessment();
      suiteApiInputData.areaIrrigated = convertNullInputValueForObjectConstructor(suiteApiInputData.areaIrrigated);
      suiteApiInputData.yearlyInchesIrrigated = convertNullInputValueForObjectConstructor(suiteApiInputData.yearlyInchesIrrigated);

      let grossWaterUse = instance.calculateLandscapingGrossWaterUse(
        suiteApiInputData.areaIrrigated,
        suiteApiInputData.yearlyInchesIrrigated,
      );
  
      let results: LandscapingResults = {
        grossWaterUse: grossWaterUse
      }
  
      instance.delete();
      return results;
    }
  

  // todo This may not be correct for metric
// See convert water assessment service
  export const convertAnnualFlowResult = (flowValue: number, settings: DiagramSettings): number => {
    let annualFlowResult = flowValue / 1_000_000; // convert to Mgal/m3
    if (settings.unitsOfMeasure == 'Imperial') {
      return annualFlowResult;
    } else if (settings.unitsOfMeasure == 'Metric') {
      return annualFlowResult * 3785.4118;
    }
    return flowValue;
  }

  export const convertLandscapingResults =(results: LandscapingResults, unitsOfMeasure: string): LandscapingResults => {
    if (unitsOfMeasure == 'Imperial') {
      // * return in3 to gal 
      results.grossWaterUse = results.grossWaterUse * 0.004329;
    }
    return results;
  }


  export const getUnknownLossees = (totalSourceFlow: number, totalDischargeFlow: number, knownLosses: number, waterInProduct: number): number => {
    return totalSourceFlow - totalDischargeFlow - knownLosses - waterInProduct;
  }

