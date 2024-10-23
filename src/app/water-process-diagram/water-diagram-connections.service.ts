import { Injectable } from '@angular/core';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { ProcessFlowPart, WaterDiagram, WaterProcessComponentType, getNewNode } from '../../process-flow-types/shared-process-flow-types';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { Assessment } from '../shared/models/assessment';
import { Diagram, IntegratedAssessmentDiagram } from '../shared/models/diagram';
import { WaterAssessment, WaterProcessComponent } from '../shared/models/water-assessment';
import { Edge, Node } from '@xyflow/react';
import { firstValueFrom } from 'rxjs';
import * as _ from 'lodash';

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
        // console.log('=== DIAGRAM STALE -> syncing to assessment')
        this.updateDiagramFromAssessment(diagram, integratedAssessment.water);
        await firstValueFrom(this.diagramIdbService.updateWithObservable(diagram));
      }
    }
  }

  updateDiagramFromAssessment(diagram: Diagram, waterAssessment: WaterAssessment) {
    let assessmentNodes: Node[] = [];
    assessmentNodes = assessmentNodes.concat(
      this.setSplitterNodes(diagram.waterDiagram.flowDiagramData.nodes),
      this.buildNodesFromWaterComponents(diagram.waterDiagram, waterAssessment.intakeSources, 'water-intake'),
      this.buildNodesFromWaterComponents(diagram.waterDiagram, waterAssessment.dischargeOutlets, 'water-discharge'),
      this.buildNodesFromWaterComponents(diagram.waterDiagram, waterAssessment.waterUsingSystems, 'water-using-system'),
      this.buildNodesFromWaterComponents(diagram.waterDiagram, waterAssessment.waterTreatments, 'water-treatment'),
      this.buildNodesFromWaterComponents(diagram.waterDiagram, waterAssessment.wasteWaterTreatments, 'waste-water-treatment'),
    );
    this.updateEdgesFromAssessment(diagram.waterDiagram, assessmentNodes);

    diagram.waterDiagram.flowDiagramData.nodes = assessmentNodes;
  }

  setSplitterNodes(nodes) {
    let splitterNodes: Node[] = nodes.filter((node: Node) => node.type.includes('splitterNode')); 
    return splitterNodes;
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
    components.forEach((component: WaterProcessComponent) => {
      let existingComponentIndex: number = componentTypeNodes.findIndex(node => node.data.diagramNodeId === component.diagramNodeId);
      if (existingComponentIndex === -1) {
        // * Assert as ProcessFlowPart (ignores type WaterUsingSystem-->IntakeSource)
        let processFlowPart = component as ProcessFlowPart;
        let newNode = getNewNode(component.processComponentType, processFlowPart);
        updatedNodes.push(newNode);
      }
    });

    // console.log(`***Assessment Synced ${componentType} nodes`, updatedNodes);
    return updatedNodes;
  }

  // Throw away edges that relate to deleted nodes (this is handled automatically by diagram)
  updateEdgesFromAssessment(waterDiagram: WaterDiagram, assessmentNodes: Node[]) {
    const nodeIds = new Set();
    assessmentNodes.forEach((node) => {
      nodeIds.add(node.id);
    });
  
    let updatedEdges = waterDiagram.flowDiagramData.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
    waterDiagram.flowDiagramData.edges = updatedEdges;
  }

  async disconnectAssessment(assessmentId: number) {
    let assessment = this.assessmentIdbService.findById(assessmentId);
    if (assessment && assessment.diagramId) {
      delete assessment.diagramId;
      await firstValueFrom(this.assessmentIdbService.updateWithObservable(assessment));
    }
  }




}
