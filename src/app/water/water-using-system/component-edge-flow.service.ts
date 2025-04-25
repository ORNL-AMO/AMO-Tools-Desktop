import { Injectable } from '@angular/core';
import { ComponentEdgeFlowData, ComponentFlowType, EdgeFlowData, getAssessmentEdgeId, getNewEdgeId, WaterAssessment } from 'process-flow-lib';

@Injectable()
export class ComponentEdgeFlowService {

  constructor() { }


  getFlowTypeLabel(flowType: ComponentFlowType): string {
    switch (flowType) {
      case 'sourceWater':
        return 'Source Water';
      case 'dischargeWater':
        return 'Discharge Water';
      default:
        return undefined;
    }
  }

  // todo needs rules for connections. pass in by type?
  getConnectionOptions(waterAssessment: WaterAssessment, flowType: ComponentFlowType, diagramNodeId: string): { value: string, display: string }[] {
    let allowedConnections = [];
    if (flowType === 'sourceWater') {
      allowedConnections = [
        waterAssessment.intakeSources,
        waterAssessment.waterUsingSystems,
        waterAssessment.waterTreatments
      ];
    } else if (flowType === 'dischargeWater') {
      allowedConnections = [
        waterAssessment.dischargeOutlets,
        waterAssessment.waterUsingSystems,
        waterAssessment.waterTreatments,
        waterAssessment.wasteWaterTreatments
      ];
    }

    let connectionOptions = allowedConnections.flat().filter(component => component.diagramNodeId !== diagramNodeId).map(component => {
        return {
          value: component.diagramNodeId,
          display: component.name,
        };
    });

    return connectionOptions;
  }

  getComponentFlows(waterAssessment: WaterAssessment, flowType: ComponentFlowType, diagramNodeId: string): EdgeFlowData[] {
    let componentWaterFlows: ComponentEdgeFlowData = waterAssessment.componentEdgeFlowData?.find(componentFlows => componentFlows.id === diagramNodeId);
    if (!componentWaterFlows) {
      return [];
    }
    return componentWaterFlows[flowType].flows.map(flow => flow);
  }

  /**
 *
 * @param selfIsTarget - A boolean indicating whether the current diagram node is the target of the flow
 */
  getNewFlowConnection(connectionOptions: { value: string, display: string }[], flows: EdgeFlowData[], diagramNodeId: string, selfIsTarget: boolean): EdgeFlowData {
    let availableOptions = connectionOptions.filter(option => !flows.map(flow => {
      return selfIsTarget? flow.source : flow.target;
    }).includes(option.value));

    let defaultSelection = availableOptions[0].value;
    
    let newFlow: EdgeFlowData;
    
    if (selfIsTarget) {
      newFlow = {
        // diagramEdgeId: undefined,
        diagramEdgeId: getAssessmentEdgeId(defaultSelection, diagramNodeId, []),
        source: defaultSelection,
        target: diagramNodeId,
        flowValue: 0,
      };
    } else {
      
      newFlow = {
        // diagramEdgeId: undefined,
        diagramEdgeId: getAssessmentEdgeId(diagramNodeId, defaultSelection, []),
        source: diagramNodeId,
        target: defaultSelection,
        flowValue: 0,
      };
    }
    return newFlow;
  }


  updateAssessmentComponentFlowData(waterAssessment: WaterAssessment, flows: EdgeFlowData[], flowType: ComponentFlowType, currentComponentId: string): void {
    waterAssessment.componentEdgeFlowData = waterAssessment.componentEdgeFlowData.map(componentFlows => {
      if (componentFlows.id === currentComponentId) {
        componentFlows[flowType].flows = flows;
      }
      debugger;
      return componentFlows;
    });

    // todo update all assessmentEdges
  }


  deleteSelfAndRelation(waterAssessment: WaterAssessment,
    systemFlowData: EdgeFlowData,
    flowType: ComponentFlowType,
    diagramNodeId: string) {
    let componentWaterFlows = waterAssessment.componentEdgeFlowData.find(systemFlows => systemFlows.id === diagramNodeId);
    let deleteIndex = componentWaterFlows[flowType].flows.findIndex(systemFlow => systemFlow.diagramEdgeId === systemFlowData.diagramEdgeId);
    componentWaterFlows[flowType].flows.splice(deleteIndex, 1);

    // todo work to do decide whether to pass source or target id or other
    if (flowType === 'sourceWater') {
      this.deleteRelatedConnection(waterAssessment, 'dischargeWater', systemFlowData.source, systemFlowData.diagramEdgeId);
    } else if (flowType === 'dischargeWater') {
      this.deleteRelatedConnection(waterAssessment, 'sourceWater', systemFlowData.target, systemFlowData.diagramEdgeId);
    }

    return componentWaterFlows[flowType].flows.map(flow => flow);
  }

  deleteRelatedConnection(waterAssessment: WaterAssessment, relatedType: ComponentFlowType, nodeSelfId: string, selfAndRelationEdgeId: string) {
    let connectedSystemFlows = waterAssessment.componentEdgeFlowData.find(systemFlows => systemFlows.id === nodeSelfId);
    if (connectedSystemFlows) {
      let deleteIndex = connectedSystemFlows[relatedType].flows.findIndex(systemFlow => systemFlow.diagramEdgeId === selfAndRelationEdgeId);
      connectedSystemFlows[relatedType].flows.splice(deleteIndex, 1);
    }
  }

}
