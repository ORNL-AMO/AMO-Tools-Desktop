import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { Assessment } from '../shared/models/assessment';
import { Diagram } from '../shared/models/diagram';
import { WaterAssessment, WaterProcessComponent, IntakeSource, WaterUsingSystem, DischargeOutlet } from '../shared/models/water-assessment';
import { WaterProcessDiagramService } from '../water-process-diagram/water-process-diagram.service';
import { Settings } from '../shared/models/settings';
import { Node } from 'reactflow';
import { WaterDiagram } from '../../process-flow-types/shared-process-flow-types';
import { WaterAssessmentService } from './water-assessment.service';
import { WaterUsingSystemService } from './water-using-system/water-using-system.service';
import { WaterProcessComponentService } from './water-system-component.service';

@Injectable()
export class WaterAssessmentConnectionsService {

  constructor(private diagramIdbService: DiagramIdbService,
    private waterDiagramService: WaterProcessDiagramService,
    private waterAssessmentService: WaterAssessmentService,
    private waterComponentService: WaterProcessComponentService,
    private waterUsingSystemService: WaterUsingSystemService,
    private assessmentIdbService: AssessmentDbService) { }

  async createAssesmentDiagram(assessment: Assessment, settings: Settings) {
    let newDiagram = this.diagramIdbService.getNewDiagram('Water');
    newDiagram.name = `${assessment.name} Diagram`;
    newDiagram.directoryId = assessment.directoryId;
    newDiagram.waterDiagram = this.waterDiagramService.getDefaultWaterDiagram(settings);
    newDiagram.waterDiagram.assessmentId = assessment.id;
    let createdDiagram: Diagram = await firstValueFrom(this.diagramIdbService.addWithObservable(newDiagram));
    assessment.diagramId = createdDiagram.id;
    this.diagramIdbService.setAll();
  }

  async syncAssessmentToDiagram(assessment: Assessment) {
    let integratedDiagram = this.diagramIdbService.findById(assessment.diagramId);
    if (integratedDiagram && assessment.modifiedDate < integratedDiagram.modifiedDate) {
      console.log('=== ASSESSMENT STALE -> syncing to diagram')
      this.updateAssessmentWithDiagram(integratedDiagram, assessment);
      await firstValueFrom(this.assessmentIdbService.updateWithObservable(assessment));
    }
  }

  updateAssessmentWithDiagram(diagram: Diagram, assessment: Assessment) {
    this.updateAssessmentWaterComponents(diagram, assessment.water);
    console.log('=== updated assessment', assessment.water);
  }

  updateAssessmentWaterComponents(diagram: Diagram, waterAssessment: WaterAssessment, settings?: Settings) {
    let intakeSources = [];
    let dischargeOutlets = [];
    let waterUsingSystems = [];

    // todo 6771 for nodes added in diagram, set null or defaults
    diagram.waterDiagram.flowDiagramData.nodes.forEach((waterDiagramNode: Node) => {
      const waterProcessComponent = waterDiagramNode.data as WaterProcessComponent;
      if (waterProcessComponent.processComponentType === 'water-intake') {
        let intakeSource: IntakeSource;
        if (!waterProcessComponent.hasAssessmentData) {
          intakeSource = this.waterComponentService.addIntakeSource(waterProcessComponent);
        } else {
          intakeSource = waterProcessComponent as IntakeSource;
        }
        intakeSources.push(intakeSource);
      }
      if (waterProcessComponent.processComponentType === 'water-discharge') {
        let dischargeOutlet: DischargeOutlet;
        if (!waterProcessComponent.hasAssessmentData) {
          dischargeOutlet = this.waterComponentService.addDischargeOutlet(waterProcessComponent);
        } else {
          dischargeOutlet = waterProcessComponent as DischargeOutlet
        }
        dischargeOutlets.push(dischargeOutlet);
      }
      if (waterProcessComponent.processComponentType === 'water-using-system') {
        let waterUsingSystem: WaterUsingSystem;
        if (!waterProcessComponent.hasAssessmentData) {
          waterUsingSystem = this.waterUsingSystemService.addWaterUsingSystem(waterProcessComponent);
        } else {
          waterUsingSystem = waterProcessComponent as WaterUsingSystem;
        }
        waterUsingSystems.push(waterUsingSystem);
      }
    });

    waterAssessment.intakeSources = intakeSources;
    waterAssessment.dischargeOutlets = dischargeOutlets;
    waterAssessment.waterUsingSystems = waterUsingSystems;
  }

  async disconnectDiagram(diagramId: number) {
    let diagram = this.diagramIdbService.findById(diagramId);
    if (diagram && diagram.waterDiagram.assessmentId) {
      delete diagram.waterDiagram.assessmentId;
      await firstValueFrom(this.diagramIdbService.updateWithObservable(diagram));
    }
  }




}
