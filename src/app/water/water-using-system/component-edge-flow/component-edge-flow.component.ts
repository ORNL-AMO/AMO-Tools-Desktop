import { Component, Input } from '@angular/core';
import { WaterAssessment, ComponentFlowType, EdgeFlowData } from 'process-flow-lib';
import { WaterAssessmentService } from '../../water-assessment.service';
import { ComponentEdgeFlowService } from '../component-edge-flow.service';
import { Settings } from '../../../shared/models/settings';
import { sys } from 'typescript';

@Component({
  selector: 'app-component-edge-flow',
  standalone: false,
  templateUrl: './component-edge-flow.component.html',
  styleUrl: './component-edge-flow.component.css'
})
export class ComponentEdgeFlowComponent {
  @Input()
  waterAssessment: WaterAssessment;
  @Input()
  diagramNodeId: string;
  @Input() 
  settings: Settings;
  @Input()
  flowType: ComponentFlowType;

  flowTypeLabel: string;

  connectionOptions: {value: string, display: string}[] = []
  flows: EdgeFlowData[] = [];

  constructor(private waterAssessmentService: WaterAssessmentService, 
    private componentEdgeFlowService: ComponentEdgeFlowService) { }

  ngOnInit() {
    this.waterAssessmentService.waterAssessment.subscribe((assessment) => {
      this.waterAssessment = assessment;
      // todo get assessmentEdges
    }
    );
  }

  ngOnDestroy() {
    this.waterAssessmentService.waterAssessment.unsubscribe();
  }
  ngOnChanges() {
    console.log('current node id', this.diagramNodeId);
    this.flowTypeLabel = this.componentEdgeFlowService.getFlowTypeLabel(this.flowType);
    if (this.flowTypeLabel) {
      debugger;
      this.connectionOptions = this.componentEdgeFlowService.getConnectionOptions(this.waterAssessment, this.flowType, this.diagramNodeId);
      this.flows = this.componentEdgeFlowService.getComponentFlows(this.waterAssessment, this.flowType, this.diagramNodeId);
      if (this.flows.length === 0 && this.connectionOptions.length > 0) {
        this.addNewFlowConnection();
      }
    }
  }

  saveWaterConnection(systemFlowData: EdgeFlowData, flowsIndex?: number) {
    const updatedFlows = this.flows.map((flow, index) => {
      if (flowsIndex !== undefined && flowsIndex >= 0) {
        return systemFlowData;
      } else {
        return flow;
      }
    });
    this.componentEdgeFlowService.updateAssessmentComponentFlowData(this.waterAssessment, updatedFlows, this.flowType, this.diagramNodeId);
    this.waterAssessmentService.updateWaterAssessment(this.waterAssessment);
  }

  addNewFlowConnection() {
    let newFlow = this.componentEdgeFlowService.getNewFlowConnection(this.connectionOptions, this.flows, this.diagramNodeId, this.flowType === 'sourceWater');
    // todo get edge and add edge to assessmentEdges
    this.flows.push(newFlow);
    this.saveWaterConnection(newFlow);
  }

  deleteConnection(systemFlowData: EdgeFlowData, selfFlowIndex: number) {
    this.waterAssessmentService.updateWaterAssessment(this.waterAssessment);
    if (selfFlowIndex !== 0) {
      this.flows = this.componentEdgeFlowService.deleteSelfAndRelation(this.waterAssessment, systemFlowData, this.flowType, this.diagramNodeId);
      this.waterAssessmentService.updateWaterAssessment(this.waterAssessment);
    }
  }

}

