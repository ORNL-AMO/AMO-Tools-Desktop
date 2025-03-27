import { Injectable } from '@angular/core';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { copyObject } from '../shared/helperFunctions';
import { CoolingTower, CoolingTowerResults, BoilerWater, BoilerWaterResults, KitchenRestroom, KitchenRestroomResults, Landscaping, LandscapingResults, HeatEnergy, HeatEnergyResults, MotorEnergy, MotorEnergyResults } from '../../process-flow-types/shared-process-flow-types';

declare var Module: any;

/**
 * Water system estimation methods are defined in shared-process-flow-logic.ts
 */
@Injectable()
export class WaterSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService) { }

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
