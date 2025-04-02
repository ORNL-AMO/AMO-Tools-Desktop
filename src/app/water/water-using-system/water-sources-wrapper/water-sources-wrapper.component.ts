import { Component, Input } from '@angular/core';
import { EdgeFlowData, WaterAssessment } from '../../../shared/models/water-assessment';
import { WaterAssessmentService } from '../../water-assessment.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-water-sources-wrapper',
  standalone: false,
  templateUrl: './water-sources-wrapper.component.html',
  styleUrl: './water-sources-wrapper.component.css'
})
export class WaterSourcesWrapperComponent {
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
    if (this.sourceFlows.length === 0) {
      this.addNewFlowConnection();
    }
  }

  saveWaterSource(systemFlowData: EdgeFlowData) {
    this.waterAssessmentService.updateSystemSourceFlowData(this.waterAssessment, systemFlowData);
    this.waterAssessmentService.updateWaterAssessment(this.waterAssessment);
  }

  addNewFlowConnection() {
    let newSourceFlow: EdgeFlowData = {
      diagramEdgeId: undefined,
      source: undefined,
      target: this.diagramNodeId,
      flowValue: 0,
    }
    this.sourceFlows.push(newSourceFlow);
  }

  deleteConnection(systemFlowData: EdgeFlowData, index: number) {
    if (index !== 0) {
      let componentWaterFlows = this.waterAssessment.diagramWaterSystemFlows.find(systemFlows => systemFlows.id === this.diagramNodeId);
      let deleteIndex = componentWaterFlows.sourceWater.flows.findIndex(systemFlow => systemFlow.diagramEdgeId = systemFlowData.diagramEdgeId);
      componentWaterFlows.sourceWater.flows.splice(deleteIndex, 1);
      this.sourceFlows = componentWaterFlows.sourceWater.flows.map(flow => flow);
      this.waterAssessmentService.updateWaterAssessment(this.waterAssessment);
    }
  }

}
