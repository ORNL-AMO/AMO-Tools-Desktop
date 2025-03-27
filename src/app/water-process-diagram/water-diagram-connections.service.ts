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
import { Settings } from '../shared/models/settings';
import { SettingsDbService } from '../indexedDb/settings-db.service';

@Injectable()
export class WaterDiagramConnectionsService {

  constructor(private diagramIdbService: DiagramIdbService,
    private settingsDbService: SettingsDbService,
    private assessmentIdbService: AssessmentDbService) { }

  async syncDiagramToAssessment(diagram: Diagram, 
    integratedDiagram: IntegratedAssessmentDiagram) {
    if (diagram.assessmentId !== undefined) {
      let integratedAssessment: Assessment;
      if (integratedDiagram) {
        integratedAssessment = integratedDiagram.assessment;
      } else {
        integratedAssessment = this.assessmentIdbService.findById(diagram.assessmentId);
      }

      if (integratedAssessment && diagram.modifiedDate < integratedAssessment.modifiedDate) {
        this.updateDiagramFromAssessment(diagram, integratedAssessment.water);
        let assessmentSettings: Settings = this.settingsDbService.getByAssessmentId(integratedAssessment);
        this.setDiagramSettingsFromAssessment(integratedAssessment, assessmentSettings, diagram);
        await firstValueFrom(this.diagramIdbService.updateWithObservable(diagram));
      }
    }
  }

  updateDiagramFromAssessment(diagram: Diagram, waterAssessment: WaterAssessment) {
    let assessmentNodes: Node[] = [];
    assessmentNodes = assessmentNodes.concat(
      this.setSummingNodes(diagram.waterDiagram.flowDiagramData.nodes),
      this.buildNodesFromWaterComponents(diagram.waterDiagram, waterAssessment.intakeSources, 'water-intake'),
      this.buildNodesFromWaterComponents(diagram.waterDiagram, waterAssessment.dischargeOutlets, 'water-discharge'),
      this.buildNodesFromWaterComponents(diagram.waterDiagram, waterAssessment.waterUsingSystems, 'water-using-system'),
      this.buildNodesFromWaterComponents(diagram.waterDiagram, waterAssessment.waterTreatments, 'water-treatment'),
      this.buildNodesFromWaterComponents(diagram.waterDiagram, waterAssessment.wasteWaterTreatments, 'waste-water-treatment'),
      this.buildNodesFromWaterComponents(diagram.waterDiagram, waterAssessment.knownLosses, 'known-loss'),
    );
    this.updateEdgesFromAssessment(diagram.waterDiagram, assessmentNodes);

    diagram.waterDiagram.flowDiagramData.nodes = assessmentNodes;
  }

  setDiagramSettingsFromAssessment(integratedAssessment: Assessment, settings: Settings, diagram: Diagram) {
      diagram.waterDiagram.flowDiagramData.settings.unitsOfMeasure = settings.unitsOfMeasure;
      diagram.waterDiagram.flowDiagramData.settings.flowDecimalPrecision = settings.flowDecimalPrecision;
      diagram.waterDiagram.flowDiagramData.settings.conductivityUnit = integratedAssessment.water.systemBasics.conductivityUnit;
    }

  setSummingNodes(nodes) {
    let summingNodes: Node[] = nodes.filter((node: Node) => node.type.includes('summingNode')); 
    return summingNodes;
  }

  buildNodesFromWaterComponents(waterDiagram: WaterDiagram, assessmentComponents: WaterProcessComponent[], componentType: WaterProcessComponentType) {
    let componentTypeNodes: Node[] = waterDiagram.flowDiagramData.nodes.filter(node => node.data.processComponentType === componentType); 
    let diagramNodes: Node[] = this.updateExistingDiagramNodes(componentTypeNodes, assessmentComponents);
    this.addNewDiagramNodes(componentTypeNodes, assessmentComponents, diagramNodes);
    // console.log(`***Assessment Synced ${componentType} nodes`, diagramNodes);
    return diagramNodes;
  }

  /**
  * Update diagram node.data from existing assessment components and drop any deleted nodes
  */
  updateExistingDiagramNodes(componentTypeNodes: Node[], assessmentComponents: WaterProcessComponent[]) {
    return componentTypeNodes.filter((node: Node) => {
      let existingComponentIndex: number = assessmentComponents.findIndex(component =>  component.diagramNodeId === node.data.diagramNodeId);
      if (existingComponentIndex !== -1) {
        node.data = assessmentComponents[existingComponentIndex];
        return node;
      }
    });
  }

  addNewDiagramNodes(componentTypeNodes: Node[], assessmentComponents: WaterProcessComponent[], diagramNodes: Node[]) {
    assessmentComponents.forEach((component: WaterProcessComponent) => {
      let existingComponentIndex: number = componentTypeNodes.findIndex(node => node.data.diagramNodeId === component.diagramNodeId);
      if (existingComponentIndex === -1) {
        // * Assert as ProcessFlowPart (ignores type WaterUsingSystem-->IntakeSource)
        let processFlowPart = component as ProcessFlowPart;
        let newNode = getNewNode(component.processComponentType, processFlowPart);
        diagramNodes.push(newNode);
      }
    });
  }

  /**
  * Update and filter out edges related to deleted nodes. This is mimicking xy-flow lib utils
  */
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
