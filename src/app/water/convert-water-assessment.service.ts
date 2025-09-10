import { Injectable } from '@angular/core';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { Assessment } from '../shared/models/assessment';
import { BoilerWater, ConnectedFlowType, convertCalculatedData, convertFlowDiagramData, CoolingTower, DiagramCalculatedData, DiagramWaterSystemFlows, DischargeOutlet, EdgeFlowData, HeatEnergy, HeatEnergyResults, IntakeSource, KitchenRestroom, KnownLoss, Landscaping, LandscapingResults, MAX_FLOW_DECIMALS, Modification, MotorEnergy, NodeFlowData, ProcessUse, WasteWaterTreatment, WaterAssessment, WaterSystemFlowsTotals, WaterTreatment, WaterUsingSystem } from 'process-flow-lib';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConvertWaterAssessmentService {
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
    await firstValueFrom(this.diagramIdbService.updateWithObservable(diagram));
  }

  convertWaterAssessmentData(waterAssessment: WaterAssessment, oldSettings: Settings, newSettings: Settings): WaterAssessment {
    waterAssessment.calculatedData = convertCalculatedData(waterAssessment.calculatedData, newSettings.unitsOfMeasure);
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
      systemFlow.recirculatedWater = this.convertWaterSystemFlowData(systemFlow.recirculatedWater, oldSettings, newSettings);
      systemFlow.dischargeWater = this.convertWaterSystemFlowData(systemFlow.dischargeWater, oldSettings, newSettings);
      systemFlow.knownLosses = this.convertWaterSystemFlowData(systemFlow.knownLosses, oldSettings, newSettings);
      systemFlow.waterInProduct = this.convertWaterSystemFlowData(systemFlow.waterInProduct, oldSettings, newSettings);
    });
    
    return systemFlows;
  }

  convertWaterSystemFlowData(systemFlowData: {
    total: number,
    flows: EdgeFlowData[]
  }, oldSettings: Settings, newSettings: Settings) {

    systemFlowData.total = this.convertFlowValue(systemFlowData.total, oldSettings, newSettings);
    systemFlowData.total = this.convertUnitsService.roundVal(systemFlowData.total, newSettings.flowDecimalPrecision);
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
      intakeSource.annualUse = this.convertUnitsService.roundVal(intakeSource.annualUse, newSettings.flowDecimalPrecision);
      intakeSource.userEnteredData = this.convertUserEnteredFlowData(intakeSource.userEnteredData, oldSettings, newSettings);
      intakeSource.cost = this.convertUnitCost(intakeSource.cost, oldSettings, newSettings);
    });
    return intakeSources;
  }

  convertUserEnteredFlowData(userEnteredData: NodeFlowData, oldSettings: Settings, newSettings: Settings) {
    const convertedUserEnteredData: NodeFlowData = {
      name: userEnteredData.name,
      totalSourceFlow: this.convertFlowValue(userEnteredData.totalSourceFlow, oldSettings, newSettings),
      totalDischargeFlow: this.convertFlowValue(userEnteredData.totalDischargeFlow, oldSettings, newSettings),
      totalKnownLosses: this.convertFlowValue(userEnteredData.totalKnownLosses, oldSettings, newSettings),
      waterInProduct: this.convertFlowValue(userEnteredData.waterInProduct, oldSettings, newSettings),
    };

    convertedUserEnteredData.totalSourceFlow = convertedUserEnteredData.totalSourceFlow? this.convertUnitsService.roundVal(convertedUserEnteredData.totalSourceFlow, newSettings.flowDecimalPrecision) : 0;
    convertedUserEnteredData.totalDischargeFlow = convertedUserEnteredData.totalDischargeFlow? this.convertUnitsService.roundVal(convertedUserEnteredData.totalDischargeFlow, newSettings.flowDecimalPrecision) : 0;
    convertedUserEnteredData.totalKnownLosses = convertedUserEnteredData.totalKnownLosses? this.convertUnitsService.roundVal(convertedUserEnteredData.totalKnownLosses, newSettings.flowDecimalPrecision) : 0;
    convertedUserEnteredData.waterInProduct = convertedUserEnteredData.waterInProduct? this.convertUnitsService.roundVal(convertedUserEnteredData.waterInProduct, newSettings.flowDecimalPrecision) : 0;
    return convertedUserEnteredData;
  }

  convertDischargeOutlets(dischargeOutlet: DischargeOutlet[], oldSettings: Settings, newSettings: Settings): DischargeOutlet[] {
    dischargeOutlet.forEach((dischargeOutlet: DischargeOutlet) => {      
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        dischargeOutlet.annualUse = this.convertUnitsService.value(dischargeOutlet.annualUse).from('Mgal').to('m3');
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        dischargeOutlet.annualUse = this.convertUnitsService.value(dischargeOutlet.annualUse).from('m3').to('Mgal');
  
      }
      dischargeOutlet.annualUse = this.convertUnitsService.roundVal(dischargeOutlet.annualUse, newSettings.flowDecimalPrecision);
      dischargeOutlet.userEnteredData = this.convertUserEnteredFlowData(dischargeOutlet.userEnteredData, oldSettings, newSettings);
      dischargeOutlet.cost = this.convertUnitCost(dischargeOutlet.cost, oldSettings, newSettings);

    });
    return dischargeOutlet;
  }

  convertWaterUsingSystems(waterUsingSystems: WaterUsingSystem[], oldSettings: Settings, newSettings: Settings): WaterUsingSystem[] {
    waterUsingSystems.forEach((waterUsingSystem: WaterUsingSystem) => {     
      waterUsingSystem.systemFlowTotals = this.convertWaterFlows(waterUsingSystem.systemFlowTotals, oldSettings, newSettings);

      Object.keys(waterUsingSystem.userDiagramFlowOverrides).forEach((key: ConnectedFlowType) => {
          if (waterUsingSystem.userDiagramFlowOverrides[key] !== undefined && waterUsingSystem.userDiagramFlowOverrides[key] !== null) {
            console.log('converting userDiagramFlowOverrides', key, waterUsingSystem.userDiagramFlowOverrides[key]);
            let converted = this.convertFlowValue(waterUsingSystem.userDiagramFlowOverrides[key], oldSettings, newSettings);
            converted = this.convertUnitsService.roundVal(converted, newSettings.flowDecimalPrecision);
            waterUsingSystem.userDiagramFlowOverrides[key] = converted;
          };
        });
      
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
      waterTreatment.flowValue = this.convertUnitsService.roundVal(waterTreatment.flowValue, newSettings.flowDecimalPrecision);
      waterTreatment.userEnteredData = this.convertUserEnteredFlowData(waterTreatment.userEnteredData, oldSettings, newSettings);
      waterTreatment.cost = this.convertUnitCost(waterTreatment.cost, oldSettings, newSettings);

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
      wasteWaterTreatment.flowValue = this.convertUnitsService.roundVal(wasteWaterTreatment.flowValue, newSettings.flowDecimalPrecision);
      wasteWaterTreatment.userEnteredData = this.convertUserEnteredFlowData(wasteWaterTreatment.userEnteredData, oldSettings, newSettings);
      wasteWaterTreatment.cost = this.convertUnitCost(wasteWaterTreatment.cost, oldSettings, newSettings);

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
      knownLoss.flowValue = this.convertUnitsService.roundVal(knownLoss.flowValue, newSettings.flowDecimalPrecision);
      knownLoss.userEnteredData = this.convertUserEnteredFlowData(knownLoss.userEnteredData, oldSettings, newSettings);
      knownLoss.cost = this.convertUnitCost(knownLoss.cost, oldSettings, newSettings);
    });
    return knownLoss;
  }

  convertWaterFlows(systemFlowTotals: WaterSystemFlowsTotals, oldSettings: Settings, newSettings: Settings) {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      systemFlowTotals.sourceWater = this.convertUnitsService.value(systemFlowTotals.sourceWater).from('Mgal').to('m3');
      systemFlowTotals.recirculatedWater = this.convertUnitsService.value(systemFlowTotals.recirculatedWater).from('Mgal').to('m3');
      systemFlowTotals.dischargeWater = this.convertUnitsService.value(systemFlowTotals.dischargeWater).from('Mgal').to('m3');
      systemFlowTotals.knownLosses = this.convertUnitsService.value(systemFlowTotals.knownLosses).from('Mgal').to('m3');
      systemFlowTotals.waterInProduct = this.convertUnitsService.value(systemFlowTotals.waterInProduct).from('Mgal').to('m3');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      systemFlowTotals.sourceWater = this.convertUnitsService.value(systemFlowTotals.sourceWater).from('m3').to('Mgal');
      systemFlowTotals.recirculatedWater = this.convertUnitsService.value(systemFlowTotals.recirculatedWater).from('m3').to('Mgal');
      systemFlowTotals.dischargeWater = this.convertUnitsService.value(systemFlowTotals.dischargeWater).from('m3').to('Mgal');
      systemFlowTotals.knownLosses = this.convertUnitsService.value(systemFlowTotals.knownLosses).from('m3').to('Mgal');
      systemFlowTotals.waterInProduct = this.convertUnitsService.value(systemFlowTotals.waterInProduct).from('m3').to('Mgal');
      
    }
    systemFlowTotals.sourceWater = this.convertUnitsService.roundVal(systemFlowTotals.sourceWater, newSettings.flowDecimalPrecision);
    systemFlowTotals.recirculatedWater = this.convertUnitsService.roundVal(systemFlowTotals.recirculatedWater, newSettings.flowDecimalPrecision);
    systemFlowTotals.dischargeWater = this.convertUnitsService.roundVal(systemFlowTotals.dischargeWater, newSettings.flowDecimalPrecision);
    systemFlowTotals.knownLosses = this.convertUnitsService.roundVal(systemFlowTotals.knownLosses, newSettings.flowDecimalPrecision);
    systemFlowTotals.waterInProduct = this.convertUnitsService.roundVal(systemFlowTotals.waterInProduct, newSettings.flowDecimalPrecision);
    return systemFlowTotals;
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

    processUse.waterRequiredMetricValue = this.convertUnitsService.roundVal(processUse.waterRequiredMetricValue, newSettings.flowDecimalPrecision);
    processUse.waterConsumedMetricValue = this.convertUnitsService.roundVal(processUse.waterConsumedMetricValue, newSettings.flowDecimalPrecision);
    processUse.waterLossMetricValue = this.convertUnitsService.roundVal(processUse.waterLossMetricValue, newSettings.flowDecimalPrecision);

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

    coolingTower.tonnage = this.convertUnitsService.roundVal(coolingTower.tonnage, newSettings.flowDecimalPrecision);
    coolingTower.loadFactor = this.convertUnitsService.roundVal(coolingTower.loadFactor, newSettings.flowDecimalPrecision);
    coolingTower.temperatureDrop = this.convertUnitsService.roundVal(coolingTower.temperatureDrop, newSettings.flowDecimalPrecision);
    coolingTower.makeupConductivity = this.convertUnitsService.roundVal(coolingTower.makeupConductivity, newSettings.flowDecimalPrecision);
    coolingTower.blowdownConductivity = this.convertUnitsService.roundVal(coolingTower.blowdownConductivity, newSettings.flowDecimalPrecision);

    return coolingTower;
  }

  // todo these are ot longer persistent fields, conversion may not be needed
  convertBoilerWater(boilerWater: BoilerWater, oldSettings: Settings, newSettings: Settings) {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      boilerWater.power = this.convertUnitsService.value(boilerWater.power).from('hp').to('MW');
      boilerWater.loadFactor = this.convertUnitsService.value(boilerWater.loadFactor).from('hp').to('kW');
      // * lb/hr/BHP
      // boilerWater.steamPerPower = this.convertUnitsService.value(boilerWater.steamPerPower).from('F').to('C');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      boilerWater.power = this.convertUnitsService.value(boilerWater.power).from('C').to('F');
      boilerWater.loadFactor = this.convertUnitsService.value(boilerWater.loadFactor).from('C').to('F');
      // boilerWater.steamPerPower = this.convertUnitsService.value(boilerWater.steamPerPower).from('F').to('C');
    }

    boilerWater.power = this.convertUnitsService.roundVal(boilerWater.power, newSettings.flowDecimalPrecision); 
    boilerWater.loadFactor = this.convertUnitsService.roundVal(boilerWater.loadFactor, newSettings.flowDecimalPrecision); 
    boilerWater.steamPerPower = this.convertUnitsService.roundVal(boilerWater.steamPerPower, newSettings.flowDecimalPrecision); 
    boilerWater.feedwaterConductivity = this.convertUnitsService.roundVal(boilerWater.feedwaterConductivity, newSettings.flowDecimalPrecision); 
    boilerWater.makeupConductivity = this.convertUnitsService.roundVal(boilerWater.makeupConductivity, newSettings.flowDecimalPrecision); 
    boilerWater.blowdownConductivity = this.convertUnitsService.roundVal(boilerWater.blowdownConductivity, newSettings.flowDecimalPrecision); 

    return boilerWater;
  }

  convertKitchenRestroom(kitchenRestroom: KitchenRestroom, oldSettings: Settings, newSettings: Settings) {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      kitchenRestroom.dailyUsePerEmployee = this.convertUnitsService.value(kitchenRestroom.dailyUsePerEmployee).from('Mgal').to('m3');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      kitchenRestroom.dailyUsePerEmployee = this.convertUnitsService.value(kitchenRestroom.dailyUsePerEmployee).from('m3').to('Mgal');
    }

    kitchenRestroom.dailyUsePerEmployee = this.convertUnitsService.roundVal(kitchenRestroom.dailyUsePerEmployee, newSettings.flowDecimalPrecision); 

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

    landscaping.areaIrrigated = this.convertUnitsService.roundVal(landscaping.areaIrrigated, newSettings.flowDecimalPrecision); 
    landscaping.yearlyInchesIrrigated = this.convertUnitsService.roundVal(landscaping.yearlyInchesIrrigated, newSettings.flowDecimalPrecision); 

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

    heatEnergy.incomingTemp = this.convertUnitsService.roundVal(heatEnergy.incomingTemp, newSettings.flowDecimalPrecision); 
    heatEnergy.outgoingTemp = this.convertUnitsService.roundVal(heatEnergy.outgoingTemp, newSettings.flowDecimalPrecision); 
    heatEnergy.wasteWaterDischarge = this.convertUnitsService.roundVal(heatEnergy.wasteWaterDischarge, newSettings.flowDecimalPrecision); 
    return heatEnergy;
  }

  convertMotorEnergy(motorEnergy: MotorEnergy, oldSettings: Settings, newSettings: Settings) {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      motorEnergy.ratedPower = this.convertUnitsService.value(motorEnergy.ratedPower).from('hp').to('kW');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      motorEnergy.ratedPower = this.convertUnitsService.value(motorEnergy.ratedPower).from('kW').to('hp');
    }
    motorEnergy.ratedPower = this.convertUnitsService.roundVal(motorEnergy.ratedPower, newSettings.flowDecimalPrecision); 
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

  // * this method is duplicated in the process-flow-lib
  convertFlowValue(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (val) {
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        val = this.convertUnitsService.value(val).from('Mgal').to('m3');
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        val = this.convertUnitsService.value(val).from('m3').to('Mgal');
      }
    }
    return val;
  }

   convertUnitCost(val: number, oldSettings: Settings, newSettings: Settings): number {
    if (val) {
      if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
        val = val / 3785.41;
      } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
        val = val * 3785.41;
      }
    }
    return val;
  }

  convertModification(waterAssessment: Modification, oldSettings: Settings, newSettings: Settings): Modification {
    return waterAssessment;
  }
}
