import { Injectable } from '@angular/core';
import { DiagramWaterSystemFlows, DischargeOutlet, FlowData, IntakeSource, KnownLoss, Modification, WasteWaterTreatment, WaterAssessment, WaterSystemFlows, WaterTreatment, WaterUsingSystem } from '../shared/models/water-assessment';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { Assessment } from '../shared/models/assessment';
import { BoilerWater, convertFlowDiagramData, CoolingTower, HeatEnergy, HeatEnergyResults, KitchenRestroom, Landscaping, LandscapingResults, MotorEnergy, NodeFlowData, ProcessUse } from '../../process-flow-types/shared-process-flow-types';
import { MAX_FLOW_DECIMALS } from '../../process-flow-types/shared-process-flow-constants';

@Injectable({
  providedIn: 'root'
})
export class ConvertWaterAssessmentService {
  MAX_FLOW_DECIMALS: number = MAX_FLOW_DECIMALS;
  constructor(private convertUnitsService: ConvertUnitsService, private diagramIdbService: DiagramIdbService) { }

  convertWaterAssessment(waterAssessment: WaterAssessment, oldSettings: Settings, newSettings: Settings): WaterAssessment {
    waterAssessment = this.convertWaterAssessmentData(waterAssessment, oldSettings, newSettings);
    if (waterAssessment.modifications) {
      waterAssessment.modifications.forEach(modification => {
        modification = this.convertModification(modification, oldSettings, newSettings);
      });
    }
    return waterAssessment;
  }

  async convertWaterAssessmentDiagram(assessment: Assessment, newSettings: Settings) {
    let diagram = this.diagramIdbService.findById(assessment.diagramId);
    diagram.waterDiagram.flowDiagramData.settings.unitsOfMeasure = newSettings.unitsOfMeasure;
    convertFlowDiagramData(diagram.waterDiagram.flowDiagramData, newSettings.unitsOfMeasure);
  }

  convertWaterAssessmentData(waterAssessment: WaterAssessment, oldSettings: Settings, newSettings: Settings): WaterAssessment {
    waterAssessment.intakeSources = this.convertIntakeSources(waterAssessment.intakeSources, oldSettings, newSettings);
    waterAssessment.dischargeOutlets = this.convertDischargeOutlets(waterAssessment.dischargeOutlets, oldSettings, newSettings);
    waterAssessment.waterUsingSystems = this.convertWaterUsingSystems(waterAssessment.waterUsingSystems, oldSettings, newSettings);
    waterAssessment.waterTreatments = this.convertWaterTreatments(waterAssessment.waterTreatments, oldSettings, newSettings);
    waterAssessment.wasteWaterTreatments = this.convertWasteWaterTreatments(waterAssessment.wasteWaterTreatments, oldSettings, newSettings);
    waterAssessment.knownLosses = this.convertKnownLosses(waterAssessment.knownLosses, oldSettings, newSettings);
    waterAssessment.diagramWaterSystemFlows = this.convertDiagramWaterSystemFlows(waterAssessment.diagramWaterSystemFlows, oldSettings, newSettings);
    return waterAssessment;
  }

  convertDiagramWaterSystemFlows(systemFlows: DiagramWaterSystemFlows[], oldSettings: Settings, newSettings: Settings): DiagramWaterSystemFlows[] {
    systemFlows.forEach(systemFlow => {
      systemFlow.sourceWater = this.convertWaterSystemFlowData(systemFlow.sourceWater, oldSettings, newSettings);
      systemFlow.recycledSourceWater = this.convertWaterSystemFlowData(systemFlow.recycledSourceWater, oldSettings, newSettings);
      systemFlow.recirculatedWater = this.convertWaterSystemFlowData(systemFlow.recirculatedWater, oldSettings, newSettings);
      systemFlow.dischargeWater = this.convertWaterSystemFlowData(systemFlow.dischargeWater, oldSettings, newSettings);
      systemFlow.dischargeWaterRecycled = this.convertWaterSystemFlowData(systemFlow.dischargeWaterRecycled, oldSettings, newSettings);
      systemFlow.knownLosses = this.convertWaterSystemFlowData(systemFlow.knownLosses, oldSettings, newSettings);
      systemFlow.waterInProduct = this.convertWaterSystemFlowData(systemFlow.waterInProduct, oldSettings, newSettings);
    });
    
    return systemFlows;
  }

  convertWaterSystemFlowData(systemFlowData: {
    total: number,
    flows: FlowData[]
  }, oldSettings: Settings, newSettings: Settings) {

    systemFlowData.total = this.convertFlowValue(systemFlowData.total, oldSettings, newSettings);
    systemFlowData.total = this.convertUnitsService.roundVal(systemFlowData.total, this.MAX_FLOW_DECIMALS);
    systemFlowData.flows.forEach(flow => {
      flow.flowValue = this.convertFlowValue(flow.flowValue, oldSettings, newSettings);
    });
    return systemFlowData;
  }


  convertIntakeSources(intakeSources: IntakeSource[], oldSettings: Settings, newSettings: Settings): IntakeSource[] {
    intakeSources.forEach((intakeSource: IntakeSource) => {      
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        intakeSource.annualUse = this.convertUnitsService.value(intakeSource.annualUse).from('Mgal').to('m3');
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        intakeSource.annualUse = this.convertUnitsService.value(intakeSource.annualUse).from('m3').to('Mgal');
      }
      intakeSource.annualUse = this.convertUnitsService.roundVal(intakeSource.annualUse, this.MAX_FLOW_DECIMALS);
      intakeSource.userEnteredData = this.convertUserEnteredFlowData(intakeSource.userEnteredData, oldSettings, newSettings);
    });
    return intakeSources;
  }

  convertUserEnteredFlowData(userEnteredData: NodeFlowData, oldSettings: Settings, newSettings: Settings) {
    if (userEnteredData.totalSourceFlow) {
      userEnteredData.totalSourceFlow = this.convertFlowValue(userEnteredData.totalSourceFlow, oldSettings, newSettings);
    }
    if (userEnteredData.totalDischargeFlow) {
      userEnteredData.totalDischargeFlow = this.convertFlowValue(userEnteredData.totalDischargeFlow, oldSettings, newSettings);
    }
    return userEnteredData;
  }

  convertDischargeOutlets(dischargeOutlet: DischargeOutlet[], oldSettings: Settings, newSettings: Settings): DischargeOutlet[] {
    dischargeOutlet.forEach((dischargeOutlet: DischargeOutlet) => {      
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        dischargeOutlet.annualUse = this.convertUnitsService.value(dischargeOutlet.annualUse).from('Mgal').to('m3');
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        dischargeOutlet.annualUse = this.convertUnitsService.value(dischargeOutlet.annualUse).from('m3').to('Mgal');
  
      }
      dischargeOutlet.annualUse = this.convertUnitsService.roundVal(dischargeOutlet.annualUse, this.MAX_FLOW_DECIMALS);
      dischargeOutlet.userEnteredData = this.convertUserEnteredFlowData(dischargeOutlet.userEnteredData, oldSettings, newSettings);
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

      waterUsingSystem.userEnteredData = this.convertUserEnteredFlowData(waterUsingSystem.userEnteredData, oldSettings, newSettings);
    });
    return waterUsingSystems;
  }

  convertWaterTreatments(waterTreatments: WaterTreatment[], oldSettings: Settings, newSettings: Settings): WaterTreatment[] {
    waterTreatments.forEach((waterTreatment: WaterTreatment) => {      
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        waterTreatment.flowValue = this.convertUnitsService.value(waterTreatment.flowValue).from('Mgal').to('m3');
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        waterTreatment.flowValue = this.convertUnitsService.value(waterTreatment.flowValue).from('m3').to('Mgal');
  
      }
      waterTreatment.flowValue = this.convertUnitsService.roundVal(waterTreatment.flowValue, this.MAX_FLOW_DECIMALS);
      waterTreatment.userEnteredData = this.convertUserEnteredFlowData(waterTreatment.userEnteredData, oldSettings, newSettings);

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
      wasteWaterTreatment.flowValue = this.convertUnitsService.roundVal(wasteWaterTreatment.flowValue, this.MAX_FLOW_DECIMALS);
      wasteWaterTreatment.userEnteredData = this.convertUserEnteredFlowData(wasteWaterTreatment.userEnteredData, oldSettings, newSettings);

    });
    return wasteWaterTreatment;
  }

  convertKnownLosses(knownLoss: KnownLoss[], oldSettings: Settings, newSettings: Settings): KnownLoss[] {
    knownLoss.forEach((knownLoss: KnownLoss) => {      
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        knownLoss.flowValue = this.convertUnitsService.value(knownLoss.flowValue).from('Mgal').to('m3');
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        knownLoss.flowValue = this.convertUnitsService.value(knownLoss.flowValue).from('m3').to('Mgal');
      }
      knownLoss.flowValue = this.convertUnitsService.roundVal(knownLoss.flowValue, this.MAX_FLOW_DECIMALS);
      knownLoss.userEnteredData = this.convertUserEnteredFlowData(knownLoss.userEnteredData, oldSettings, newSettings);

    });
    return knownLoss;
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
    waterFlows.sourceWater = this.convertUnitsService.roundVal(waterFlows.sourceWater, this.MAX_FLOW_DECIMALS);
    waterFlows.recycledSourceWater = this.convertUnitsService.roundVal(waterFlows.recycledSourceWater, this.MAX_FLOW_DECIMALS);
    waterFlows.recirculatedWater = this.convertUnitsService.roundVal(waterFlows.recirculatedWater, this.MAX_FLOW_DECIMALS);
    waterFlows.dischargeWater = this.convertUnitsService.roundVal(waterFlows.dischargeWater, this.MAX_FLOW_DECIMALS);
    waterFlows.dischargeWaterRecycled = this.convertUnitsService.roundVal(waterFlows.dischargeWaterRecycled, this.MAX_FLOW_DECIMALS);
    waterFlows.knownLosses = this.convertUnitsService.roundVal(waterFlows.knownLosses, this.MAX_FLOW_DECIMALS);
    waterFlows.waterInProduct = this.convertUnitsService.roundVal(waterFlows.waterInProduct, this.MAX_FLOW_DECIMALS);
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

    processUse.waterRequiredMetricValue = this.convertUnitsService.roundVal(processUse.waterRequiredMetricValue, this.MAX_FLOW_DECIMALS);
    processUse.waterConsumedMetricValue = this.convertUnitsService.roundVal(processUse.waterConsumedMetricValue, this.MAX_FLOW_DECIMALS);
    processUse.waterLossMetricValue = this.convertUnitsService.roundVal(processUse.waterLossMetricValue, this.MAX_FLOW_DECIMALS);

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

    coolingTower.tonnage = this.convertUnitsService.roundVal(coolingTower.tonnage, this.MAX_FLOW_DECIMALS);
    coolingTower.loadFactor = this.convertUnitsService.roundVal(coolingTower.loadFactor, this.MAX_FLOW_DECIMALS);
    coolingTower.temperatureDrop = this.convertUnitsService.roundVal(coolingTower.temperatureDrop, this.MAX_FLOW_DECIMALS);
    coolingTower.makeupConductivity = this.convertUnitsService.roundVal(coolingTower.makeupConductivity, this.MAX_FLOW_DECIMALS);
    coolingTower.blowdownConductivity = this.convertUnitsService.roundVal(coolingTower.blowdownConductivity, this.MAX_FLOW_DECIMALS);

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

    boilerWater.power = this.convertUnitsService.roundVal(boilerWater.power, this.MAX_FLOW_DECIMALS); 
    boilerWater.loadFactor = this.convertUnitsService.roundVal(boilerWater.loadFactor, this.MAX_FLOW_DECIMALS); 
    boilerWater.steamPerPower = this.convertUnitsService.roundVal(boilerWater.steamPerPower, this.MAX_FLOW_DECIMALS); 
    boilerWater.feedwaterConductivity = this.convertUnitsService.roundVal(boilerWater.feedwaterConductivity, this.MAX_FLOW_DECIMALS); 
    boilerWater.makeupConductivity = this.convertUnitsService.roundVal(boilerWater.makeupConductivity, this.MAX_FLOW_DECIMALS); 
    boilerWater.blowdownConductivity = this.convertUnitsService.roundVal(boilerWater.blowdownConductivity, this.MAX_FLOW_DECIMALS); 

    return boilerWater;
  }

  convertKitchenRestroom(kitchenRestroom: KitchenRestroom, oldSettings: Settings, newSettings: Settings) {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      kitchenRestroom.dailyUsePerEmployee = this.convertUnitsService.value(kitchenRestroom.dailyUsePerEmployee).from('Mgal').to('m3');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      kitchenRestroom.dailyUsePerEmployee = this.convertUnitsService.value(kitchenRestroom.dailyUsePerEmployee).from('m3').to('Mgal');
    }

    kitchenRestroom.dailyUsePerEmployee = this.convertUnitsService.roundVal(kitchenRestroom.dailyUsePerEmployee, this.MAX_FLOW_DECIMALS); 

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

    landscaping.areaIrrigated = this.convertUnitsService.roundVal(landscaping.areaIrrigated, this.MAX_FLOW_DECIMALS); 
    landscaping.yearlyInchesIrrigated = this.convertUnitsService.roundVal(landscaping.yearlyInchesIrrigated, this.MAX_FLOW_DECIMALS); 

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

    heatEnergy.incomingTemp = this.convertUnitsService.roundVal(heatEnergy.incomingTemp, this.MAX_FLOW_DECIMALS); 
    heatEnergy.outgoingTemp = this.convertUnitsService.roundVal(heatEnergy.outgoingTemp, this.MAX_FLOW_DECIMALS); 
    heatEnergy.wasteWaterDischarge = this.convertUnitsService.roundVal(heatEnergy.wasteWaterDischarge, this.MAX_FLOW_DECIMALS); 
    return heatEnergy;
  }

  convertMotorEnergy(motorEnergy: MotorEnergy, oldSettings: Settings, newSettings: Settings) {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      motorEnergy.ratedPower = this.convertUnitsService.value(motorEnergy.ratedPower).from('hp').to('kW');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      motorEnergy.ratedPower = this.convertUnitsService.value(motorEnergy.ratedPower).from('kW').to('hp');
    }
    motorEnergy.ratedPower = this.convertUnitsService.roundVal(motorEnergy.ratedPower, this.MAX_FLOW_DECIMALS); 
    return motorEnergy;
  }

  convertLandscapingSuiteInput(landscaping: Landscaping, unitsOfMeasure: string): Landscaping {
    let convertedLandscaping: Landscaping = {
      areaIrrigated: landscaping.areaIrrigated,
      yearlyInchesIrrigated: landscaping.yearlyInchesIrrigated
    };
    if (unitsOfMeasure == 'Imperial') {
      convertedLandscaping.yearlyInchesIrrigated = this.convertUnitsService.value(landscaping.yearlyInchesIrrigated).from('ft2').to('in2');
    } else if (unitsOfMeasure == "Metric") {
      convertedLandscaping.yearlyInchesIrrigated = this.convertUnitsService.value(landscaping.yearlyInchesIrrigated).from('m2').to('cm2');
    }

    return convertedLandscaping;
  }

  convertLandscapingResults(results: LandscapingResults, unitsOfMeasure: string): LandscapingResults {
    if (unitsOfMeasure == 'Imperial') {
      results.grossWaterUse = this.convertUnitsService.value(results.grossWaterUse).from('in3').to('gal');
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

  // todo This may not be correct for metric
  convertAnnualFlowResult(flowValue: number, unitsOfMeasure: string): number {
    let annualFlowResult = this.convertUnitsService.value(flowValue).from('gal').to('Mgal');
    if (unitsOfMeasure == 'Imperial') {
      return annualFlowResult
    } else if (unitsOfMeasure == 'Metric') {
      return this.convertUnitsService.value(annualFlowResult).from('Mgal').to('m3');
    }
  }

  convertFlowValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      val = this.convertUnitsService.value(val).from('Mgal').to('m3');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      val = this.convertUnitsService.value(val).from('m3').to('Mgal');
    }
    return val;
  }

  convertModification(waterAssessment: Modification, oldSettings: Settings, newSettings: Settings): Modification {
    return waterAssessment;
  }
}
