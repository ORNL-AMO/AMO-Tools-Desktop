import { Component, Input } from '@angular/core';
import { WaterAssessment, EdgeFlowData } from 'process-flow-lib';
import { WaterAssessmentService } from '../../water-assessment.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-system-sources',
  standalone: false,
  templateUrl: './system-sources.component.html',
  styleUrl: './system-sources.component.css'
})
export class SystemSourcesComponent {
  @Input()
  waterAssessment: WaterAssessment;
  @Input()
  diagramNodeId: string;
  @Input() 
  settings: Settings;

  connectionOptions: {value: string, display: string}[] = []
  sourceFlows: EdgeFlowData[] = [];

  constructor(private waterAssessmentService: WaterAssessmentService) { }

  ngOnChanges() {
    this.connectionOptions = this.waterAssessmentService.getSourceConnectionOptions(this.waterAssessment, this.diagramNodeId);
    this.sourceFlows = this.waterAssessmentService.getSystemSourceFlows(this.waterAssessment, this.diagramNodeId);
    if (this.sourceFlows.length === 0 && this.connectionOptions.length > 0) {
      this.addNewFlowConnection();
    }
  }

  saveWaterSource(systemFlowData: EdgeFlowData) {
    this.waterAssessmentService.updateSystemSourceFlowData(this.waterAssessment, systemFlowData);
    this.waterAssessmentService.updateWaterAssessment(this.waterAssessment);
  }

  addNewFlowConnection() {
    let availableOptions = this.connectionOptions.filter(option => !this.sourceFlows.map(flow => flow.source).includes(option.value));
    let newSourceFlow: EdgeFlowData = {
      diagramEdgeId: undefined,
      source: availableOptions[0].value,
      target: this.diagramNodeId,
      flowValue: 0,
    }
    this.sourceFlows.push(newSourceFlow);
    this.saveWaterSource(newSourceFlow);
  }

  deleteConnection(systemFlowData: EdgeFlowData, sourceFlowIndex: number) {
    if (sourceFlowIndex !== 0) {
      let componentWaterFlows = this.waterAssessment.componentEdgeFlowData.find(systemFlows => systemFlows.id === this.diagramNodeId);
      let deleteIndex = componentWaterFlows.sourceWater.flows.findIndex(systemFlow => systemFlow.diagramEdgeId === systemFlowData.diagramEdgeId);
      componentWaterFlows.sourceWater.flows.splice(deleteIndex, 1);
      // delete this.waterAssessment.connectedNodesMap[systemFlowData.source]
      this.deleteConnectedSystemDischarge(systemFlowData, sourceFlowIndex);
      this.sourceFlows = componentWaterFlows.sourceWater.flows.map(flow => flow);
      this.waterAssessmentService.updateWaterAssessment(this.waterAssessment);
    }
  }

  deleteConnectedSystemDischarge(systemFlowData: EdgeFlowData, sourceFlowIndex: number) {
    let connectedSystemFlows = this.waterAssessment.componentEdgeFlowData.find(systemFlows => systemFlows.id === systemFlowData.source);
    if (connectedSystemFlows) {
      let deleteIndex = connectedSystemFlows.dischargeWater.flows.findIndex(systemFlow => systemFlow.diagramEdgeId === systemFlowData.diagramEdgeId);
      connectedSystemFlows.dischargeWater.flows.splice(deleteIndex, 1);
    }
  }
}
