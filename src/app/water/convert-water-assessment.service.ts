import { Injectable } from '@angular/core';
import { BoilerWater, CoolingTower, DischargeOutlet, HeatEnergy, HeatEnergyResults, IntakeSource, KitchenRestroom, Landscaping, LandscapingResults, Modification, MotorEnergy, ProcessUse, WasteWaterTreatment, WaterAssessment, WaterSystemFlows, WaterTreatment, WaterUsingSystem } from '../shared/models/water-assessment';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

@Injectable({
  providedIn: 'root'
})
export class ConvertWaterAssessmentService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertWaterAssessment(waterAssessment: WaterAssessment, oldSettings: Settings, newSettings: Settings): WaterAssessment {
    waterAssessment = this.convertWaterAssessmentData(waterAssessment, oldSettings, newSettings);
    if (waterAssessment.modifications) {
      waterAssessment.modifications.forEach(modification => {
        modification = this.convertModification(modification, oldSettings, newSettings);
      });
    }
    return waterAssessment;
  }

  convertWaterAssessmentData(waterAssessment: WaterAssessment, oldSettings: Settings, newSettings: Settings): WaterAssessment {
    waterAssessment.intakeSources = this.convertIntakeSources(waterAssessment.intakeSources, oldSettings, newSettings);
    waterAssessment.dischargeOutlets = this.convertDischargeOutlets(waterAssessment.dischargeOutlets, oldSettings, newSettings);
    waterAssessment.waterUsingSystems = this.convertWaterUsingSystems(waterAssessment.waterUsingSystems, oldSettings, newSettings);
    waterAssessment.waterTreatments = this.convertWaterTreatments(waterAssessment.waterTreatments, oldSettings, newSettings);
    waterAssessment.wasteWaterTreatments = this.convertWasteWaterTreatments(waterAssessment.wasteWaterTreatments, oldSettings, newSettings);
    return waterAssessment;
  }

  convertIntakeSources(intakeSources: IntakeSource[], oldSettings: Settings, newSettings: Settings): IntakeSource[] {
    intakeSources.forEach((intakeSource: IntakeSource) => {      
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        intakeSource.annualUse = this.convertUnitsService.value(intakeSource.annualUse).from('Mgal').to('m3');
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        intakeSource.annualUse = this.convertUnitsService.value(intakeSource.annualUse).from('m3').to('Mgal');
  
      }
      intakeSource.annualUse = this.convertUnitsService.roundVal(intakeSource.annualUse, 2);
    });
    return intakeSources;
  }

  convertDischargeOutlets(dischargeOutlet: DischargeOutlet[], oldSettings: Settings, newSettings: Settings): DischargeOutlet[] {
    dischargeOutlet.forEach((dischargeOutlet: DischargeOutlet) => {      
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        dischargeOutlet.annualUse = this.convertUnitsService.value(dischargeOutlet.annualUse).from('Mgal').to('m3');
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        dischargeOutlet.annualUse = this.convertUnitsService.value(dischargeOutlet.annualUse).from('m3').to('Mgal');
  
      }
      dischargeOutlet.annualUse = this.convertUnitsService.roundVal(dischargeOutlet.annualUse, 2);
    });
    return dischargeOutlet;
  }

  convertWaterUsingSystems(waterUsingSystems: WaterUsingSystem[], oldSettings: Settings, newSettings: Settings): WaterUsingSystem[] {
    waterUsingSystems.forEach((waterUsingSystem: WaterUsingSystem) => {      
      waterUsingSystem.waterFlows = this.convertWaterFlows(waterUsingSystem.waterFlows, oldSettings, newSettings);
      waterUsingSystem.userDiagramFlowOverrides = this.convertWaterFlows(waterUsingSystem.userDiagramFlowOverrides, oldSettings, newSettings);
      
      waterUsingSystem.processUse = this.convertProcessUse(waterUsingSystem.processUse, newSettings, oldSettings);
      waterUsingSystem.coolingTower = this.convertCoolingTower(waterUsingSystem.coolingTower, newSettings, oldSettings);
      waterUsingSystem.boilerWater = this.convertBoilerWater(waterUsingSystem.boilerWater, newSettings, oldSettings);
      waterUsingSystem.kitchenRestroom = this.convertKitchenRestroom(waterUsingSystem.kitchenRestroom, newSettings, oldSettings);
      waterUsingSystem.landscaping = this.convertLandscaping(waterUsingSystem.landscaping, newSettings, oldSettings);
      
      waterUsingSystem.heatEnergy = this.convertHeatEnergy(waterUsingSystem.heatEnergy, newSettings, oldSettings);
      waterUsingSystem.addedMotorEnergy.map(motorEnergy => {
        return this.convertMotorEnergy(motorEnergy, newSettings, oldSettings);
      });

    });
    return waterUsingSystems;
  }

  convertWaterFlows(waterFlows: WaterSystemFlows, oldSettings: Settings, newSettings: Settings) {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      waterFlows.sourceWater = this.convertUnitsService.value(waterFlows.sourceWater).from('Mgal').to('m3');
      waterFlows.recycledSourceWater = this.convertUnitsService.value(waterFlows.recycledSourceWater).from('Mgal').to('m3');
      waterFlows.recirculatedWater = this.convertUnitsService.value(waterFlows.recirculatedWater).from('Mgal').to('m3');
      waterFlows.dischargeWater = this.convertUnitsService.value(waterFlows.dischargeWater).from('Mgal').to('m3');
      waterFlows.dischargeWaterRecycled = this.convertUnitsService.value(waterFlows.dischargeWaterRecycled).from('Mgal').to('m3');
      waterFlows.knownLosses = this.convertUnitsService.value(waterFlows.knownLosses).from('Mgal').to('m3');
      waterFlows.waterInProduct = this.convertUnitsService.value(waterFlows.waterInProduct).from('Mgal').to('m3');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      waterFlows.sourceWater = this.convertUnitsService.value(waterFlows.sourceWater).from('m3').to('Mgal');
      waterFlows.recycledSourceWater = this.convertUnitsService.value(waterFlows.recycledSourceWater).from('m3').to('Mgal');
      waterFlows.recirculatedWater = this.convertUnitsService.value(waterFlows.recirculatedWater).from('m3').to('Mgal');
      waterFlows.dischargeWater = this.convertUnitsService.value(waterFlows.dischargeWater).from('m3').to('Mgal');
      waterFlows.dischargeWaterRecycled = this.convertUnitsService.value(waterFlows.dischargeWaterRecycled).from('m3').to('Mgal');
      waterFlows.knownLosses = this.convertUnitsService.value(waterFlows.knownLosses).from('m3').to('Mgal');
      waterFlows.waterInProduct = this.convertUnitsService.value(waterFlows.waterInProduct).from('m3').to('Mgal');
      
    }
    waterFlows.sourceWater = this.convertUnitsService.roundVal(waterFlows.sourceWater, 2);
    waterFlows.recycledSourceWater = this.convertUnitsService.roundVal(waterFlows.recycledSourceWater, 2);
    waterFlows.recirculatedWater = this.convertUnitsService.roundVal(waterFlows.recirculatedWater, 2);
    waterFlows.dischargeWater = this.convertUnitsService.roundVal(waterFlows.dischargeWater, 2);
    waterFlows.dischargeWaterRecycled = this.convertUnitsService.roundVal(waterFlows.dischargeWaterRecycled, 2);
    waterFlows.knownLosses = this.convertUnitsService.roundVal(waterFlows.knownLosses, 2);
    waterFlows.waterInProduct = this.convertUnitsService.roundVal(waterFlows.waterInProduct, 2);

    return waterFlows;
  }

  // todo 6907, see processUse WaterUseUnits dependant on metric selected
  convertProcessUse(processUse: ProcessUse, oldSettings: Settings, newSettings: Settings) {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      processUse.waterRequiredMetricValue = this.convertUnitsService.value(processUse.waterRequiredMetricValue).from('Mgal').to('m3');
      processUse.waterConsumedMetricValue = this.convertUnitsService.value(processUse.waterConsumedMetricValue).from('Mgal').to('m3');
      processUse.waterLossMetricValue = this.convertUnitsService.value(processUse.waterLossMetricValue).from('Mgal').to('m3');

    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      processUse.waterRequiredMetricValue = this.convertUnitsService.value(processUse.waterRequiredMetricValue).from('m3').to('Mgal');
      processUse.waterConsumedMetricValue = this.convertUnitsService.value(processUse.waterConsumedMetricValue).from('m3').to('Mgal');
      processUse.waterLossMetricValue = this.convertUnitsService.value(processUse.waterLossMetricValue).from('m3').to('Mgal');
    }

    processUse.waterRequiredMetricValue = this.convertUnitsService.roundVal(processUse.waterRequiredMetricValue, 2);
    processUse.waterConsumedMetricValue = this.convertUnitsService.roundVal(processUse.waterConsumedMetricValue, 2);
    processUse.waterLossMetricValue = this.convertUnitsService.roundVal(processUse.waterLossMetricValue, 2);

    return processUse;
  }

  convertCoolingTower(coolingTower: CoolingTower, oldSettings: Settings, newSettings: Settings) {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      coolingTower.tonnage = this.convertUnitsService.value(coolingTower.tonnage).from('Mgal').to('m3');
      coolingTower.temperatureDrop = this.convertUnitsService.value(coolingTower.temperatureDrop).from('F').to('C');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      coolingTower.tonnage = this.convertUnitsService.value(coolingTower.tonnage).from('m3').to('Mgal');
      coolingTower.temperatureDrop = this.convertUnitsService.value(coolingTower.temperatureDrop).from('C').to('F');
    }

    coolingTower.tonnage = this.convertUnitsService.roundVal(coolingTower.tonnage, 2);
    coolingTower.loadFactor = this.convertUnitsService.roundVal(coolingTower.loadFactor, 2);
    coolingTower.temperatureDrop = this.convertUnitsService.roundVal(coolingTower.temperatureDrop, 2);
    coolingTower.makeupConductivity = this.convertUnitsService.roundVal(coolingTower.makeupConductivity, 2);
    coolingTower.blowdownConductivity = this.convertUnitsService.roundVal(coolingTower.blowdownConductivity, 2);

    return coolingTower;
  }

  convertBoilerWater(boilerWater: BoilerWater, oldSettings: Settings, newSettings: Settings) {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      boilerWater.power = this.convertUnitsService.value(boilerWater.power).from('hp').to('MW');
      boilerWater.loadFactor = this.convertUnitsService.value(boilerWater.loadFactor).from('hp').to('kW');
      // * lb/hr/BHP
      // boilerWater.steamPerPower = this.convertUnitsService.value(boilerWater.steamPerPower).from('F').to('C');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      boilerWater.power = this.convertUnitsService.value(boilerWater.power).from('F').to('C');
      boilerWater.loadFactor = this.convertUnitsService.value(boilerWater.loadFactor).from('F').to('C');
      // boilerWater.steamPerPower = this.convertUnitsService.value(boilerWater.steamPerPower).from('F').to('C');
    }

    boilerWater.power = this.convertUnitsService.roundVal(boilerWater.power, 2); 
    boilerWater.loadFactor = this.convertUnitsService.roundVal(boilerWater.loadFactor, 2); 
    boilerWater.steamPerPower = this.convertUnitsService.roundVal(boilerWater.steamPerPower, 2); 
    boilerWater.feedwaterConductivity = this.convertUnitsService.roundVal(boilerWater.feedwaterConductivity, 2); 
    boilerWater.makeupConductivity = this.convertUnitsService.roundVal(boilerWater.makeupConductivity, 2); 
    boilerWater.blowdownConductivity = this.convertUnitsService.roundVal(boilerWater.blowdownConductivity, 2); 

    return boilerWater;
  }

  convertKitchenRestroom(kitchenRestroom: KitchenRestroom, oldSettings: Settings, newSettings: Settings) {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      kitchenRestroom.dailyUsePerEmployee = this.convertUnitsService.value(kitchenRestroom.dailyUsePerEmployee).from('Mgal').to('m3');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      kitchenRestroom.dailyUsePerEmployee = this.convertUnitsService.value(kitchenRestroom.dailyUsePerEmployee).from('m3').to('Mgal');
    }

    kitchenRestroom.dailyUsePerEmployee = this.convertUnitsService.roundVal(kitchenRestroom.dailyUsePerEmployee, 2); 

    return kitchenRestroom;
  }

  convertLandscaping(landscaping: Landscaping, oldSettings: Settings, newSettings: Settings) {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      landscaping.areaIrrigated = this.convertUnitsService.value(landscaping.areaIrrigated).from('ft2').to('m2');
      landscaping.yearlyInchesIrrigated = this.convertUnitsService.value(landscaping.yearlyInchesIrrigated).from('in').to('cm');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      landscaping.areaIrrigated = this.convertUnitsService.value(landscaping.areaIrrigated).from('m2').to('ft2');
      landscaping.yearlyInchesIrrigated = this.convertUnitsService.value(landscaping.yearlyInchesIrrigated).from('cm').to('in');
    }

    landscaping.areaIrrigated = this.convertUnitsService.roundVal(landscaping.areaIrrigated, 2); 
    landscaping.yearlyInchesIrrigated = this.convertUnitsService.roundVal(landscaping.yearlyInchesIrrigated, 2); 

    return landscaping;
  }

  convertHeatEnergy(heatEnergy: HeatEnergy, oldSettings: Settings, newSettings: Settings) {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      heatEnergy.incomingTemp = this.convertUnitsService.value(heatEnergy.incomingTemp).from('F').to('C'); 
      heatEnergy.outgoingTemp = this.convertUnitsService.value(heatEnergy.outgoingTemp).from('F').to('C'); 
      heatEnergy.wasteWaterDischarge = this.convertUnitsService.value(heatEnergy.wasteWaterDischarge).from('Mgal').to('m3'); 
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      heatEnergy.incomingTemp = this.convertUnitsService.value(heatEnergy.incomingTemp).from('C').to('F'); 
      heatEnergy.outgoingTemp = this.convertUnitsService.value(heatEnergy.outgoingTemp).from('C').to('F'); 
      heatEnergy.wasteWaterDischarge = this.convertUnitsService.value(heatEnergy.wasteWaterDischarge).from('m3').to('Mgal'); 
    }

    heatEnergy.incomingTemp = this.convertUnitsService.roundVal(heatEnergy.incomingTemp, 2); 
    heatEnergy.outgoingTemp = this.convertUnitsService.roundVal(heatEnergy.outgoingTemp, 2); 
    heatEnergy.wasteWaterDischarge = this.convertUnitsService.roundVal(heatEnergy.wasteWaterDischarge, 2); 
    return heatEnergy;
  }

  convertMotorEnergy(motorEnergy: MotorEnergy, oldSettings: Settings, newSettings: Settings) {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      motorEnergy.ratedPower = this.convertUnitsService.value(motorEnergy.ratedPower).from('hp').to('kW');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      motorEnergy.ratedPower = this.convertUnitsService.value(motorEnergy.ratedPower).from('kW').to('hp');
    }
    motorEnergy.ratedPower = this.convertUnitsService.roundVal(motorEnergy.ratedPower, 2); 
    return motorEnergy;
  }

  convertWaterTreatments(waterTreatments: WaterTreatment[], oldSettings: Settings, newSettings: Settings): WaterTreatment[] {
    waterTreatments.forEach((waterTreatment: WaterTreatment) => {      
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        waterTreatment.flowValue = this.convertUnitsService.value(waterTreatment.flowValue).from('Mgal').to('m3');
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        waterTreatment.flowValue = this.convertUnitsService.value(waterTreatment.flowValue).from('m3').to('Mgal');
  
      }
      waterTreatment.flowValue = this.convertUnitsService.roundVal(waterTreatment.flowValue, 2);
    });
    return waterTreatments;
  }

  convertWasteWaterTreatments(wasteWaterTreatment: WasteWaterTreatment[], oldSettings: Settings, newSettings: Settings): WasteWaterTreatment[] {
    wasteWaterTreatment.forEach((wasteWaterTreatment: WasteWaterTreatment) => {      
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        wasteWaterTreatment.flowValue = this.convertUnitsService.value(wasteWaterTreatment.flowValue).from('Mgal').to('m3');
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        wasteWaterTreatment.flowValue = this.convertUnitsService.value(wasteWaterTreatment.flowValue).from('m3').to('Mgal');
      }
      wasteWaterTreatment.flowValue = this.convertUnitsService.roundVal(wasteWaterTreatment.flowValue, 2);
    });
    return wasteWaterTreatment;
  }

  convertLandscapingSuiteInput(landscaping: Landscaping, settings: Settings): Landscaping {
    let convertedLandscaping: Landscaping = {
      areaIrrigated: landscaping.areaIrrigated,
      yearlyInchesIrrigated: landscaping.yearlyInchesIrrigated
    };
    if (settings.unitsOfMeasure == 'Imperial') {
      convertedLandscaping.yearlyInchesIrrigated = this.convertUnitsService.value(landscaping.yearlyInchesIrrigated).from('in').to('ft');
    } else if (settings.unitsOfMeasure == "Metric") {
      convertedLandscaping.yearlyInchesIrrigated = this.convertUnitsService.value(landscaping.yearlyInchesIrrigated).from('cm').to('m');
    }

    return convertedLandscaping;
  }

  convertLandscapingResults(results: LandscapingResults, settings: Settings): LandscapingResults {
    if (settings.unitsOfMeasure == 'Imperial') {
      results.grossWaterUse = this.convertUnitsService.value(results.grossWaterUse).from('ft3').to('gal');
    } 
    return results;
  }

  convertHeatEnergyResults(results: HeatEnergyResults, settings: Settings): HeatEnergyResults {
    // todo convert from MMBtu for anything besides metric?
    if (settings.unitsOfMeasure == 'Metric') {
      results.heatEnergy = this.convertUnitsService.value(results.heatEnergy).from('MMBtu').to('GJ');
    } 
    return results;
  }

  convertAnnualFlowResult(flowValue: number, settings: Settings) {
    let annualFlowResult = this.convertUnitsService.value(flowValue).from('gal').to('Mgal');
    if (settings.unitsOfMeasure == 'Imperial') {
      return annualFlowResult
    } else if (settings.unitsOfMeasure == 'Metric') {
      return this.convertUnitsService.value(annualFlowResult).from('Mgal').to('m3');
    }
  }


  convertModification(waterAssessment: Modification, oldSettings: Settings, newSettings: Settings): Modification {
    return waterAssessment;
  }
}
