import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { Assessment } from '../shared/models/assessment';
import { Diagram } from '../shared/models/diagram';
import { WaterProcessDiagramService } from '../water-process-diagram/water-process-diagram.service';
import { Settings } from '../shared/models/settings';
import { WaterAssessmentService } from './water-assessment.service';
import { WaterUsingSystemService } from './water-using-system/water-using-system.service';
import { WaterSystemComponentService } from './water-system-component.service';
import { Edge, Node } from '@xyflow/react';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { WaterAssessment, WaterUsingSystem, KnownLoss, WaterProcessComponent, IntakeSource, DischargeOutlet, WaterTreatment, WasteWaterTreatment, getWaterUsingSystem, setWaterUsingSystemFlows, getIntakeSource, getDischargeOutlet, EdgeFlowData, getWasteWaterTreatmentComponent, getWaterTreatmentComponent, DiagramCalculatedData } from 'process-flow-lib';

@Injectable()
export class UpdateAssessmentFromDiagramService {

  constructor(private diagramIdbService: DiagramIdbService,
    private waterDiagramService: WaterProcessDiagramService,
    private waterAssessmentService: WaterAssessmentService,
    private waterComponentService: WaterSystemComponentService,
    private waterUsingSystemService: WaterUsingSystemService,
    private settingsDbService: SettingsDbService,
    private assessmentIdbService: AssessmentDbService) { }

  async createAssesmentDiagram(assessment: Assessment, settings: Settings) {
    let newDiagram = this.diagramIdbService.getNewDiagram('Water');
    newDiagram.name = `${assessment.name} Diagram`;
    newDiagram.directoryId = assessment.directoryId;
    newDiagram.waterDiagram = this.waterDiagramService.getDefaultWaterDiagram(settings);
    newDiagram.assessmentId = assessment.id;
    let createdDiagram: Diagram = await firstValueFrom(this.diagramIdbService.addWithObservable(newDiagram));
    assessment.diagramId = createdDiagram.id;
    this.diagramIdbService.setAll();
  }

  async syncAssessmentToDiagram(assessment: Assessment, assessmentSettings: Settings) {
    let integratedDiagram = this.diagramIdbService.findById(assessment.diagramId);
    if (integratedDiagram && assessment.modifiedDate < integratedDiagram.modifiedDate) {
      // console.log('=== ASSESSMENT STALE -> syncing to diagram')
      this.updateAssessmentWithDiagram(integratedDiagram, assessment, assessmentSettings);
      await firstValueFrom(this.assessmentIdbService.updateWithObservable(assessment));
    }
  }

  async updateAssessmentWithDiagram(diagram: Diagram, assessment: Assessment, assessmentSettings: Settings) {
    this.updateAssessmentWaterComponents(diagram, assessment.water, diagram.waterDiagram.flowDiagramData.calculatedData);
    assessment.water.diagramWaterSystemFlows = setWaterUsingSystemFlows(assessment.water.waterUsingSystems, diagram.waterDiagram.flowDiagramData.edges);
    assessment.water.calculatedData = diagram.waterDiagram.flowDiagramData.calculatedData;
    
    this.setAssessmentSettingsFromDiagram(assessment, assessmentSettings, diagram);
    await firstValueFrom(this.settingsDbService.updateWithObservable(assessmentSettings));
    this.waterAssessmentService.settings.next(assessmentSettings);
    let allSettings = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(allSettings);
  }
  
  setAssessmentSettingsFromDiagram(assessment: Assessment, settings: Settings, diagram: Diagram) {
    settings.unitsOfMeasure = diagram.waterDiagram.flowDiagramData.settings.unitsOfMeasure;
    settings.flowDecimalPrecision = diagram.waterDiagram.flowDiagramData.settings.flowDecimalPrecision;
    assessment.water.systemBasics.electricityCost = diagram.waterDiagram.flowDiagramData.settings.electricityCost;
    assessment.water.systemBasics.conductivityUnit = diagram.waterDiagram.flowDiagramData.settings.conductivityUnit;
  }

  getTotalFlowValue(flows: Array<EdgeFlowData>) {
    return flows.reduce((total, flow) => total + flow.flowValue, 0);
  }

  isRecycledFlow(sourceOrTargetId: string, waterUsingSystems: WaterUsingSystem[]) {
    return waterUsingSystems.some((system: WaterUsingSystem) => system.diagramNodeId === sourceOrTargetId);
  } 

  isRecycledTarget(edge: Edge, currentComponentId: string, waterUsingSystems: WaterUsingSystem[]) {
    return edge.target === currentComponentId && this.isWaterSystemDischarge(waterUsingSystems, edge.source);
  } 

  isRecycledSource(edge: Edge, currentComponentId: string, waterUsingSystems: WaterUsingSystem[]) {
    return edge.source === currentComponentId && this.isWaterSystemDischarge(waterUsingSystems, edge.target);
  } 

  isWaterSystemDischarge(waterUsingSystems: WaterUsingSystem[], edgeSourceId: string) {
    return waterUsingSystems.some((system: WaterUsingSystem) => system.diagramNodeId === edgeSourceId);
  }


  updateAssessmentWaterComponents(diagram: Diagram, waterAssessment: WaterAssessment, calculatedData: DiagramCalculatedData) {
    let intakeSources = [];
    let dischargeOutlets = [];
    let waterUsingSystems = [];
    let waterTreatments = [];
    let wasteWaterTreatments = [];
    let knownLosses = []

    diagram.waterDiagram.flowDiagramData.nodes.forEach((waterDiagramNode: Node) => {
      const waterProcessComponent = waterDiagramNode.data as WaterProcessComponent;
      const diagramCalculatedData = calculatedData.nodes[waterProcessComponent.diagramNodeId];

      if (diagramCalculatedData && waterProcessComponent.userEnteredData) {
        waterProcessComponent.userEnteredData = {
          totalSourceFlow: waterProcessComponent.userEnteredData.totalSourceFlow !== undefined? waterProcessComponent.userEnteredData.totalSourceFlow : diagramCalculatedData.totalSourceFlow,
          totalDischargeFlow: waterProcessComponent.userEnteredData.totalDischargeFlow !== undefined? waterProcessComponent.userEnteredData.totalDischargeFlow : diagramCalculatedData.totalDischargeFlow,
          totalKnownLosses: waterProcessComponent.userEnteredData.totalKnownLosses !== undefined? waterProcessComponent.userEnteredData.totalKnownLosses : diagramCalculatedData.totalKnownLosses,
          waterInProduct: waterProcessComponent.userEnteredData.waterInProduct !== undefined? waterProcessComponent.userEnteredData.waterInProduct : diagramCalculatedData.waterInProduct,
        };
      }
      if (waterProcessComponent.processComponentType === 'water-intake') {
        let intakeSource: IntakeSource;
        if (!waterProcessComponent.createdByAssessment) {
          intakeSource = getIntakeSource(waterProcessComponent);
        } else {
          intakeSource = waterProcessComponent as IntakeSource;
        }
        intakeSources.push(intakeSource);
      }
      if (waterProcessComponent.processComponentType === 'water-discharge') {
        let dischargeOutlet: DischargeOutlet;
        if (!waterProcessComponent.createdByAssessment) {
          dischargeOutlet = getDischargeOutlet(waterProcessComponent);
        } else {
          dischargeOutlet = waterProcessComponent as DischargeOutlet;
        }
        dischargeOutlets.push(dischargeOutlet);
      }
      if (waterProcessComponent.processComponentType === 'water-using-system') {
        let waterUsingSystem: WaterUsingSystem;
        if (!waterProcessComponent.createdByAssessment) {
          waterUsingSystem = getWaterUsingSystem(waterProcessComponent);
        } else {
          waterUsingSystem = waterProcessComponent as WaterUsingSystem;
        }
        waterUsingSystems.push(waterUsingSystem);
      }
      if (waterProcessComponent.processComponentType === 'water-treatment') {
        let waterTreatment: WaterTreatment;
        if (!waterProcessComponent.createdByAssessment) {
          waterTreatment = getWaterTreatmentComponent(waterProcessComponent as WaterTreatment);
        } else {
          waterTreatment = waterProcessComponent as WaterTreatment;
        }
        waterTreatments.push(waterTreatment);
      }
      if (waterProcessComponent.processComponentType === 'waste-water-treatment') {
        let wasteWaterTreatment: WasteWaterTreatment;
        if (!waterProcessComponent.createdByAssessment) {
          wasteWaterTreatment = getWasteWaterTreatmentComponent(waterProcessComponent);
        } else {
          wasteWaterTreatment = waterProcessComponent as WasteWaterTreatment;
        }
        wasteWaterTreatments.push(wasteWaterTreatment);
      }
      if (waterProcessComponent.processComponentType === 'known-loss') {
        let knownLoss: KnownLoss;
        if (!waterProcessComponent.createdByAssessment) {
          knownLoss = this.waterUsingSystemService.addKnownLoss(waterProcessComponent);
        } else {
          knownLoss = waterProcessComponent as KnownLoss;
        }
        knownLosses.push(knownLoss);
      }
    });

    waterAssessment.intakeSources = intakeSources;
    waterAssessment.dischargeOutlets = dischargeOutlets;
    waterAssessment.waterUsingSystems = waterUsingSystems;
    waterAssessment.waterTreatments = waterTreatments;
    waterAssessment.wasteWaterTreatments = wasteWaterTreatments;
    waterAssessment.knownLosses = knownLosses;
  }

  async disconnectDiagram(diagramId: number) {
    let diagram = this.diagramIdbService.findById(diagramId);
    if (diagram && diagram.assessmentId) {
      delete diagram.assessmentId;
      await firstValueFrom(this.diagramIdbService.updateWithObservable(diagram));
    }
  }

}
