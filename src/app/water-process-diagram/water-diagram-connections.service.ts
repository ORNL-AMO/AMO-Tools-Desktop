import { Injectable } from '@angular/core';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { WaterDiagram, WaterProcessComponentType, getNewNode } from '../../process-flow-types/shared-process-flow-types';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { Assessment } from '../shared/models/assessment';
import { Diagram, IntegratedAssessmentDiagram } from '../shared/models/diagram';
import { WaterAssessment, WaterProcessComponent } from '../shared/models/water-assessment';
import { Node } from 'reactflow';

@Injectable()
export class WaterDiagramConnectionsService {

  constructor(private diagramIdbService: DiagramIdbService,
    private assessmentIdbService: AssessmentDbService) { }

  async syncDiagramToAssessment(diagram: Diagram, integratedDiagram: IntegratedAssessmentDiagram) {
    if (diagram.waterDiagram.assessmentId !== undefined) {
      let integratedAssessment: Assessment;
      if (integratedDiagram) {
        integratedAssessment = integratedDiagram.assessment;
      } else {
        integratedAssessment = this.assessmentIdbService.findById(diagram.waterDiagram.assessmentId);
      }

      if (integratedAssessment && diagram.modifiedDate < integratedAssessment.modifiedDate) {
        console.log('=== DIAGRAM STALE -> syncing to assessment')
        this.updateDiagramFromAssessment(diagram, integratedAssessment.water);
        await this.diagramIdbService.updateWithObservable(diagram);
      }
    }
  }

  updateDiagramFromAssessment(diagram: Diagram, waterAssessment: WaterAssessment) {
    let assessmentNodes: Node[] = [];
    assessmentNodes = assessmentNodes.concat(
      this.buildNodesFromWaterComponents(diagram.waterDiagram, waterAssessment.intakeSources, 'water-intake'),
      this.buildNodesFromWaterComponents(diagram.waterDiagram, waterAssessment.processUses, 'process-use')
    );

    diagram.waterDiagram.flowDiagramData.nodes = assessmentNodes;
  }

  buildNodesFromWaterComponents(waterDiagram: WaterDiagram, components: WaterProcessComponent[], componentType: WaterProcessComponentType) {
    let componentTypeNodes: Node[] = waterDiagram.flowDiagramData.nodes.filter(node => node.data.processComponentType === componentType); 
    let updatedNodes: Node[] = componentTypeNodes.filter((node: Node) => {
      // * update existing, ignore deleted
      let existingComponentIndex: number = components.findIndex(component =>  component.diagramNodeId === node.data.diagramNodeId);
      if (existingComponentIndex !== -1) {
        node.data = components[existingComponentIndex];
        return node;
      }
    });
    // * add new nodes
    components.forEach(component => {
      let existingComponentIndex: number = componentTypeNodes.findIndex(node => node.data.diagramNodeId === component.diagramNodeId);
      if (existingComponentIndex === -1) {
        let newNode = getNewNode(component.processComponentType, component);
        updatedNodes.push(newNode);
      }
    });

    console.log(`***Assessment Synced ${componentType} nodes`, updatedNodes);
    return updatedNodes;
  }

  async disconnectAssessment(assessmentId: number) {
    let assessment = this.assessmentIdbService.findById(assessmentId);
    if (assessment && assessment.diagramId) {
      delete assessment.diagramId;
      await this.assessmentIdbService.updateWithObservable(assessment);
    }
  }




}
