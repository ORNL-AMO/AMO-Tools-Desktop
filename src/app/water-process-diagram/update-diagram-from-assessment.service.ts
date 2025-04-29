import { Injectable } from '@angular/core';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { Connection, Edge, Node } from '@xyflow/react';
import { firstValueFrom } from 'rxjs';
import * as _ from 'lodash';
import { Settings } from '../shared/models/settings';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { WaterAssessment, WaterDiagram, WaterProcessComponent, WaterProcessComponentType, ProcessFlowPart, getNewNode, DiagramWaterSystemFlows, UserDiagramOptions, getEdgeFromConnection, EdgeFlowData, getAssessmentWaterSystemFlowEdges } from 'process-flow-lib';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { Diagram, IntegratedAssessmentDiagram } from '../shared/models/diagram';
import { Assessment } from '../shared/models/assessment';

@Injectable()
export class UpdateDiagramFromAssessmentService {

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

    // this.updateDiagramEdgesFromAssessment(diagram.waterDiagram, waterAssessment);
    // todo since water sources UI is not fully supported
    this.filterDeletedEdges(diagram.waterDiagram, waterAssessment, assessmentNodes);

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
  * Update and filter out edges related to deleted nodes or edges deleted in assessment.
  */
    filterDeletedEdges(waterDiagram: WaterDiagram, waterAssessment: WaterAssessment, assessmentNodes: Node[]) {
      const nodeIds = new Set();
      assessmentNodes.forEach((node) => {
        nodeIds.add(node.id);
      });
    
      let updatedEdges = waterDiagram.flowDiagramData.edges.filter((edge) => {
        return nodeIds.has(edge.source) && nodeIds.has(edge.target);
      });
      waterDiagram.flowDiagramData.edges = updatedEdges;
    }
    
    getHasAssessmentEdgeFlow(waterSystemFlowEdges: { source: string, target: string }[], edge: Edge) {
      // todo Map  
      const hasAssessmentEdge = waterSystemFlowEdges.find((systemFlowEdge) => {
        return systemFlowEdge.source === edge.source && systemFlowEdge.target === edge.target;
      });
      return hasAssessmentEdge;
    }

  updateDiagramEdgesFromAssessment(waterDiagram: WaterDiagram, waterAssessment: WaterAssessment) {
    waterAssessment.diagramWaterSystemFlows.forEach((systemFlow: DiagramWaterSystemFlows) => {
      systemFlow.sourceWater.flows.forEach((edgeFlow: EdgeFlowData) => this.updateDiagramEdge(waterDiagram, edgeFlow, waterAssessment.diagramWaterSystemFlows));
      // systemFlow.dischargeWater.flows.forEach((edgeFlow: EdgeFlowData) => this.updateDiagramEdge(waterDiagram, edgeFlow, waterAssessment.diagramWaterSystemFlows));
    });
  }

  updateDiagramEdge(waterDiagram: WaterDiagram, edgeFlow: EdgeFlowData, diagramWaterSystemFlows: DiagramWaterSystemFlows[]) {
    let edgeIndex = waterDiagram.flowDiagramData.edges.findIndex((edge: Edge) => edge.id === edgeFlow.diagramEdgeId);
    let diagramEdge: Edge = this.getDiagramEdge(edgeFlow, waterDiagram.flowDiagramData.userDiagramOptions);
    // let existsInAssesment: boolean = diagramWaterSystemFlows.sourceWater.flows.some((edgeFlow: EdgeFlowData) => edgeFlow.diagramEdgeId === diagramEdge.id);
    console.log('adding/updating edge from assessment', diagramEdge);
    if (edgeIndex !== -1) {
      waterDiagram.flowDiagramData.edges[edgeIndex] = diagramEdge;
    } else {
      waterDiagram.flowDiagramData.edges.push(diagramEdge);

    }
  }

  getDiagramEdge(edgeFlow: EdgeFlowData, userDiagramOptions: UserDiagramOptions) {
    // todo 6906 check handle restrictions
    let connectedParams: Connection = {
      source: edgeFlow.source,
      sourceHandle: "e",
      target: edgeFlow.target,
      targetHandle: "a",
    }

    let newEdge: Edge = getEdgeFromConnection(connectedParams, userDiagramOptions, true);
    newEdge.data.flowValue = edgeFlow.flowValue;

    return newEdge;
  }

  async disconnectAssessment(assessmentId: number) {
    let assessment = this.assessmentIdbService.findById(assessmentId);
    if (assessment && assessment.diagramId) {
      delete assessment.diagramId;
      await firstValueFrom(this.assessmentIdbService.updateWithObservable(assessment));
    }
  }




}
