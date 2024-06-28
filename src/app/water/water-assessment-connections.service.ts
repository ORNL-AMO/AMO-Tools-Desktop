import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { Assessment } from '../shared/models/assessment';
import { Diagram } from '../shared/models/diagram';
import { WaterAssessment, WaterProcessComponent, IntakeSource, ProcessUse } from '../shared/models/water-assessment';
import { WaterProcessDiagramService } from '../water-process-diagram/water-process-diagram.service';
import { Settings } from '../shared/models/settings';
import { Node } from 'reactflow';
import { Observable } from 'rxjs';

@Injectable()
export class WaterAssessmentConnectionsService {

  constructor(private diagramIdbService: DiagramIdbService,
    private waterDiagramService: WaterProcessDiagramService,
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
      await this.assessmentIdbService.updateWithObservable(assessment);
    }
  }

  updateAssessmentWithDiagram(diagram: Diagram, assessment: Assessment): Observable<Assessment> {
    this.updateAssessmentWaterComponents(diagram, assessment.water);
    console.log('=== updated assessment', assessment.water);
    return this.assessmentIdbService.updateWithObservable(assessment);
  }

  updateAssessmentWaterComponents(diagram: Diagram, waterAssessment: WaterAssessment) {
    let intakeSources = [];
    let processUses = [];

    diagram.waterDiagram.flowDiagramData.nodes.forEach((waterDiagramNode: Node) => {
      const waterProcessComponent = waterDiagramNode.data as WaterProcessComponent;
      if (waterProcessComponent.processComponentType === 'water-intake') {
        const intakeSource = waterProcessComponent as IntakeSource;
        intakeSources.push(intakeSource);
      }
      if (waterProcessComponent.processComponentType === 'process-use') {
        processUses.push(waterProcessComponent as ProcessUse)
      }
    });

    waterAssessment.intakeSources = intakeSources;
    waterAssessment.processUses = processUses;
  }

  async disconnectDiagram(diagramId: number) {
    let diagram = this.diagramIdbService.findById(diagramId);
    if (diagram && diagram.waterDiagram.assessmentId) {
      delete diagram.waterDiagram.assessmentId;
      await this.diagramIdbService.updateWithObservable(diagram);
    }
  }




}
