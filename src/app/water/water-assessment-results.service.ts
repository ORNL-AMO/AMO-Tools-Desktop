import { Injectable } from '@angular/core';
import { WaterSuiteApiService } from '../tools-suite-api/water-suite-api.service';
import { ConvertWaterAssessmentService } from './convert-water-assessment.service';
import { Settings } from '../shared/models/settings';
import { WaterUsingSystem, WaterAssessment, WaterSystemResults, WaterSystemTypeEnum, calculateProcessUseResults, calculateCoolingTowerResults, calculateBoilerWaterResults, calculateKitchenRestroomResults, calculateLandscapingResults, SystemBalanceResults, WaterBalanceResults, PlantSystemSummaryResults, TrueCostOfSystems, createGraphIndex, CustomEdgeData, SystemTrueCostContributions, ProcessFlowPart, getComponentTypeTotalCost, ExecutiveSummaryResults, getHeatEnergyCost, getMotorEnergyCost, getWaterTrueCost, HeatEnergy, MotorEnergy, DischargeOutlet, IntakeSource, WaterProcessComponent, getWaterUsingSystem, getComponentTypeTotalFlow, getPlantSummaryResults } from 'process-flow-lib';
import { UpdateDiagramFromAssessmentService } from '../water-process-diagram/update-diagram-from-assessment.service';
import { Assessment } from '../shared/models/assessment';
import { Edge, Node } from '@xyflow/react';

@Injectable({
  providedIn: 'root'
})
export class WaterAssessmentResultsService {

  constructor(private waterSuiteApiService: WaterSuiteApiService,
    private updateDiagramFromAssessmentService: UpdateDiagramFromAssessmentService,
    private convertWaterAssessmentService: ConvertWaterAssessmentService) {
  }

  getWaterSystemResults(waterSystem: WaterUsingSystem, waterAssessment: WaterAssessment, settings: Settings): WaterSystemResults {
    let waterSystemResults: WaterSystemResults = {
      grossWaterUse: undefined,
      processUseResults: undefined,
      coolingTowerResults: undefined,
      boilerWaterResults: undefined,
      kitchenRestroomResults: undefined,
      landscapingResults: undefined,
      motorEnergyResults: []
    }

    if (waterSystem.systemType === WaterSystemTypeEnum.PROCESS && waterSystem.processUse) {
      waterSystemResults.processUseResults = calculateProcessUseResults(waterSystem.processUse, waterSystem.hoursPerYear);
      waterSystemResults.processUseResults.incomingWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.incomingWater, settings.unitsOfMeasure);
      waterSystemResults.processUseResults.recirculatedWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.recirculatedWater, settings.unitsOfMeasure);
      waterSystemResults.processUseResults.wasteDischargedAndRecycledOther = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.wasteDischargedAndRecycledOther, settings.unitsOfMeasure);
      waterSystemResults.processUseResults.waterConsumed = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.waterConsumed, settings.unitsOfMeasure);
      waterSystemResults.processUseResults.waterLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.waterLoss, settings.unitsOfMeasure);
      waterSystemResults.processUseResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.processUseResults.grossWaterUse, settings.unitsOfMeasure);
      waterSystemResults.grossWaterUse = waterSystemResults.processUseResults.grossWaterUse;
    }
    if (waterSystem.systemType === WaterSystemTypeEnum.COOLINGTOWER && waterSystem.coolingTower) {
      waterSystemResults.coolingTowerResults = calculateCoolingTowerResults(waterSystem.coolingTower, waterSystem.hoursPerYear);
      waterSystemResults.coolingTowerResults.blowdownLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.blowdownLoss, settings.unitsOfMeasure);
      waterSystemResults.coolingTowerResults.evaporationLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.evaporationLoss, settings.unitsOfMeasure);
      waterSystemResults.coolingTowerResults.makeupWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.makeupWater, settings.unitsOfMeasure);
      waterSystemResults.coolingTowerResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.coolingTowerResults.grossWaterUse, settings.unitsOfMeasure);
      waterSystemResults.grossWaterUse = waterSystemResults.coolingTowerResults.grossWaterUse;
    }
    if (waterSystem.systemType === WaterSystemTypeEnum.BOILER && waterSystem.boilerWater) {
      waterSystemResults.boilerWaterResults = calculateBoilerWaterResults(waterSystem.boilerWater, waterSystem.hoursPerYear);
      waterSystemResults.boilerWaterResults.blowdownLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.blowdownLoss, settings.unitsOfMeasure);
      waterSystemResults.boilerWaterResults.condensateReturn = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.condensateReturn, settings.unitsOfMeasure);
      waterSystemResults.boilerWaterResults.makeupWater = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.makeupWater, settings.unitsOfMeasure);
      waterSystemResults.boilerWaterResults.steamLoss = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.steamLoss, settings.unitsOfMeasure);
      waterSystemResults.boilerWaterResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.boilerWaterResults.grossWaterUse, settings.unitsOfMeasure);
      waterSystemResults.grossWaterUse = waterSystemResults.boilerWaterResults.grossWaterUse;
    }
    if (waterSystem.systemType === WaterSystemTypeEnum.KITCHEN && waterSystem.kitchenRestroom) {
      waterSystemResults.kitchenRestroomResults = calculateKitchenRestroomResults(waterSystem.kitchenRestroom);
      waterSystemResults.kitchenRestroomResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.kitchenRestroomResults.grossWaterUse, settings.unitsOfMeasure);
      waterSystemResults.grossWaterUse = waterSystemResults.kitchenRestroomResults.grossWaterUse;
    }
    if (waterSystem.systemType === WaterSystemTypeEnum.LANDSCAPING && waterSystem.landscaping) {
      let landscapingInput = this.convertWaterAssessmentService.convertLandscapingSuiteInput(waterSystem.landscaping, settings.unitsOfMeasure);
      waterSystemResults.landscapingResults = calculateLandscapingResults(landscapingInput);
      waterSystemResults.landscapingResults = this.convertWaterAssessmentService.convertLandscapingResults(waterSystemResults.landscapingResults, settings.unitsOfMeasure);
      waterSystemResults.landscapingResults.grossWaterUse = this.convertWaterAssessmentService.convertAnnualFlowResult(waterSystemResults.landscapingResults.grossWaterUse, settings.unitsOfMeasure);
      console.log(waterSystemResults.landscapingResults);
      waterSystemResults.grossWaterUse = waterSystemResults.landscapingResults.grossWaterUse;
    }

    if (waterSystem.heatEnergy) {
      waterSystemResults.heatEnergyResults = this.waterSuiteApiService.calculateHeatEnergy(waterSystem.heatEnergy);
    }
    waterSystem.addedMotorEnergy.forEach(motorEnergy => {
      waterSystemResults.motorEnergyResults.push(this.waterSuiteApiService.calculateMotorEnergy(motorEnergy))
    });

    return waterSystemResults;
  }


  getPlantSummaryReport(assessment: Assessment, settings: Settings): PlantSystemSummaryResults {
    let diagram = this.updateDiagramFromAssessmentService.getDiagramFromAssessment(assessment);
    let graph = createGraphIndex(diagram.waterDiagram.flowDiagramData.nodes, diagram.waterDiagram.flowDiagramData.edges as Edge<CustomEdgeData>[]);
    let plantResults = getPlantSummaryResults(
      diagram.waterDiagram.flowDiagramData.nodes,
      diagram.waterDiagram.flowDiagramData.calculatedData,
      graph,
      settings.electricityCost
    )

    return plantResults.plantSystemSummaryResults;
  }

  getExecutiveSummaryReport(assessment: Assessment, settings: Settings): ExecutiveSummaryResults {
    let diagram = this.updateDiagramFromAssessmentService.getDiagramFromAssessment(assessment);

    let intakes: Node<ProcessFlowPart>[] = diagram.waterDiagram.flowDiagramData.nodes.filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'water-intake') as Node<ProcessFlowPart>[];
    let discharges: Node<ProcessFlowPart>[] = diagram.waterDiagram.flowDiagramData.nodes.filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'water-discharge') as Node<ProcessFlowPart>[];
    let waterTreatmentNodes: Node<ProcessFlowPart>[] = diagram.waterDiagram.flowDiagramData.nodes.filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'water-treatment') as Node<ProcessFlowPart>[];
    let wasteTreatmentNodes: Node<ProcessFlowPart>[] = diagram.waterDiagram.flowDiagramData.nodes.filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'waste-water-treatment') as Node<ProcessFlowPart>[];
    let waterUsingSystems: WaterUsingSystem[] = diagram.waterDiagram.flowDiagramData.nodes
      .filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'water-using-system')
      .map((node: Node<ProcessFlowPart>) => {
        const processFlowPart: WaterProcessComponent = node.data as WaterProcessComponent;
        return getWaterUsingSystem(processFlowPart);
      });

    // direct costs
    const intakeCost = getComponentTypeTotalCost(intakes, 'totalDischargeFlow');
    const totalSourceWaterIntake = getComponentTypeTotalFlow(intakes, 'totalDischargeFlow');

    // indirect costs
    const dischargeCost = getComponentTypeTotalCost(discharges, 'totalSourceFlow');
    const treatmentCost = getComponentTypeTotalCost(waterTreatmentNodes, 'totalSourceFlow');
    const wasteTreatmentCost = getComponentTypeTotalCost(wasteTreatmentNodes, 'totalSourceFlow');

    const systemMotorEnergyData: MotorEnergy[] = waterUsingSystems.map((system: WaterUsingSystem) => system.addedMotorEnergy || []).flat();
    const intakeMotorEnergy = intakes
      .map((intake: Node<ProcessFlowPart>) => {
        const intakeSource = intake.data as IntakeSource;
        return intakeSource.addedMotorEnergy || [];
      })
      .flat();

    const dischargeMotorEnergy = discharges.map((discharge: Node<ProcessFlowPart>) => {
      const dischargeSource = discharge.data as DischargeOutlet;
      return dischargeSource.addedMotorEnergy || [];
    }).flat();

    const allMotorEnergy: MotorEnergy[] = systemMotorEnergyData.concat(intakeMotorEnergy, dischargeMotorEnergy);
    const motorEnergyCosts = allMotorEnergy.reduce((total, motorEnergy) => {
      return total + getMotorEnergyCost(motorEnergy, settings.electricityCost);
    }, 0);

    const systemHeatEnergyData: HeatEnergy[] = waterUsingSystems.map((system: WaterUsingSystem) => system.heatEnergy).filter((heatEnergy: HeatEnergy) => heatEnergy !== undefined);
    const heatEnergyCosts = systemHeatEnergyData.reduce((total, heatEnergy) => {
      return total + getHeatEnergyCost(heatEnergy, 1);
    }, 0);
    const directCosts = intakeCost + dischargeCost;


    const trueCost = getWaterTrueCost(intakeCost, dischargeCost, motorEnergyCosts, heatEnergyCosts, treatmentCost, wasteTreatmentCost);

    let results: ExecutiveSummaryResults = {
      totalSourceWaterIntake: totalSourceWaterIntake,
      totalPerProductionUnit: undefined,
      directCost: directCosts,
      trueCost: trueCost,
      trueCostPerProductionUnit: undefined,
      trueOverDirectResult: trueCost / directCosts,
    }
    return results;
  }

  getTrueCostOfSystemsReport(assessment: Assessment, settings: Settings) {
    let diagram = this.updateDiagramFromAssessmentService.getDiagramFromAssessment(assessment);
    let graph = createGraphIndex(diagram.waterDiagram.flowDiagramData.nodes, diagram.waterDiagram.flowDiagramData.edges as Edge<CustomEdgeData>[]);

    let plantResults = getPlantSummaryResults(
      diagram.waterDiagram.flowDiagramData.nodes,
      diagram.waterDiagram.flowDiagramData.calculatedData,
      graph,
      assessment.water.systemBasics.electricityCost
    )

    let systemTrueCostReport = this.getTrueCostOfSystemsTableReportData(plantResults.trueCostOfSystems, diagram.waterDiagram.flowDiagramData.nodes);
    console.log('systemTrueCostReport', systemTrueCostReport);
    return systemTrueCostReport;
  }

  getTrueCostOfSystemsTableReportData(trueCostOfSystems: TrueCostOfSystems, nodes: Node[]): TrueCostTableData[] {
    let systemCosts = [];
    Object.entries(trueCostOfSystems).forEach(([key, systemCostContributions]: [key: string, systemCostContributions: SystemTrueCostContributions]) => {
      const systemKey = key as keyof TrueCostOfSystems;
      const component = nodes.find((node: Node<ProcessFlowPart>) => node.id === systemKey)?.data as WaterUsingSystem;
      const results = Object.values(systemCostContributions).map((value: number) => {
        if (value === 0) {
          return undefined;
        }
        return value;
      });
      systemCosts.push({
        label: component.name,
        results: results,
        unit: 'currency',
      });
    });
    return systemCosts;
  }

}

export interface TrueCostTableData {
  label: string,
  results: Array<string>,
  unit: string,
}


