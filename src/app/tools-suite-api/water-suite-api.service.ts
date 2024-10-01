import { Injectable } from '@angular/core';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { BoilerWater, BoilerWaterResults, CoolingTower, CoolingTowerResults, HeatEnergy, HeatEnergyResults, KitchenRestroom, KitchenRestroomResults, Landscaping, LandscapingResults, MotorEnergy, MotorEnergyResults, ProcessUse, ProcessUseResults } from '../shared/models/water-assessment';
import { copyObject } from '../shared/helperFunctions';

declare var Module: any;
@Injectable()
export class WaterSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService) { }

  calculateCoolingTowerResults(inputData: CoolingTower, hoursPerYear: number): CoolingTowerResults {
    inputData = copyObject(inputData)
    let instance = new Module.WaterAssessment();
    hoursPerYear = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(hoursPerYear);
    inputData.tonnage = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.tonnage);
    inputData.loadFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.loadFactor);
    inputData.loadFactor = inputData.loadFactor / 100;
    inputData.evaporationRateDegree = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.evaporationRateDegree);
    inputData.evaporationRateDegree = inputData.evaporationRateDegree / 100;
    inputData.temperatureDrop = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.temperatureDrop);
    inputData.makeupConductivity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.makeupConductivity);
    inputData.blowdownConductivity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.blowdownConductivity);

    let output = instance.calculateCoolingTowerLoss(
      hoursPerYear,
      inputData.tonnage,
      inputData.loadFactor,
      inputData.evaporationRateDegree,
      inputData.temperatureDrop,
      inputData.makeupConductivity,
      inputData.blowdownConductivity,
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

  calculateBoilerWaterResults(inputData: BoilerWater, hoursPerYear: number): BoilerWaterResults {
    inputData = copyObject(inputData)
    let instance = new Module.WaterAssessment();
    hoursPerYear = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(hoursPerYear);
    inputData.power = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.power);
    inputData.loadFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.loadFactor);
    inputData.loadFactor = inputData.loadFactor / 100;
    inputData.steamPerPower = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.steamPerPower);
    inputData.feedwaterConductivity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.feedwaterConductivity);
    inputData.makeupConductivity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.makeupConductivity);
    inputData.blowdownConductivity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.blowdownConductivity);
    let output = instance.calculateBoilerWaterLosses(
      hoursPerYear,
      inputData.power,
      inputData.loadFactor,
      inputData.steamPerPower,
      inputData.feedwaterConductivity,
      inputData.makeupConductivity,
      inputData.blowdownConductivity,
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

  calculateKitchenRestroomResults(inputData: KitchenRestroom): KitchenRestroomResults {
    inputData = copyObject(inputData)
    let instance = new Module.WaterAssessment();
    inputData.employeeCount = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.employeeCount);
    inputData.workdaysPerYear = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.workdaysPerYear);
    inputData.dailyUsePerEmployee = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.dailyUsePerEmployee);
    let grossWaterUse = instance.calculateKitchenRestroomGrossWaterUse(
      inputData.employeeCount,
      inputData.workdaysPerYear,
      inputData.dailyUsePerEmployee,
    );

    let results: KitchenRestroomResults = {
      grossWaterUse: grossWaterUse
    }

    instance.delete();

    return results;
  }

  calculateLandscapingResults(inputData: Landscaping): LandscapingResults {
    inputData = copyObject(inputData)
    let instance = new Module.WaterAssessment();
    inputData.areaIrrigated = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.areaIrrigated);
    inputData.yearlyInchesIrrigated = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.yearlyInchesIrrigated);
    let grossWaterUse = instance.calculateLandscapingGrossWaterUse(
      inputData.areaIrrigated,
      inputData.yearlyInchesIrrigated,
    );

    let results: LandscapingResults = {
      grossWaterUse: grossWaterUse
    }

    instance.delete();

    return results;
  }

  calculateHeatEnergy(inputData: HeatEnergy): HeatEnergyResults {
    inputData = copyObject(inputData)
    let instance = new Module.WaterAssessment();
    inputData.incomingTemp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.incomingTemp); 
    inputData.outgoingTemp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.outgoingTemp); 
    inputData.heaterEfficiency = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.heaterEfficiency); 
    inputData.wasteWaterDischarge = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.wasteWaterDischarge); 
    let heatEnergy = instance.calculateHeatEnergyInDischarge(
      inputData.incomingTemp,
      inputData.outgoingTemp,
      inputData.heaterEfficiency,
      inputData.wasteWaterDischarge,
    );

    let results: HeatEnergyResults = {
      heatEnergy: heatEnergy
    }

    instance.delete();
    return results;
  }

  calculateMotorEnergy(inputData: MotorEnergy): MotorEnergyResults {
    inputData = copyObject(inputData)
    let instance = new Module.WaterAssessment();
    inputData.numberUnits = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.numberUnits);
    inputData.hoursPerYear = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.hoursPerYear);
    inputData.ratedPower = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.ratedPower);
    inputData.loadFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.loadFactor);
    inputData.systemEfficiency = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.systemEfficiency);
    let motorEnergy = instance.calculateAddedMotorEnergyUse(
      inputData.numberUnits,
      inputData.hoursPerYear,
      inputData.ratedPower,
      inputData.loadFactor,
      inputData.systemEfficiency
    );

    let results: MotorEnergyResults = {
      energyUse: motorEnergy
    }

    instance.delete();
    return results;
  }

}
