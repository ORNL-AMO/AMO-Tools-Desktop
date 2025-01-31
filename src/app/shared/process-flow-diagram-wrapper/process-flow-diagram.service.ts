import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlowDiagramData, ProcessFlowDiagramState, ProcessFlowParentState } from '../../../process-flow-types/shared-process-flow-types';
import { WaterProcessDiagramService } from '../../water-process-diagram/water-process-diagram.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessFlowDiagramService {
  processFlowParentState: BehaviorSubject<ProcessFlowParentState>;
  flowDiagramData: BehaviorSubject<FlowDiagramData>;

  constructor(
    private waterProcessDiagramService: WaterProcessDiagramService) { 
    this.processFlowParentState = new BehaviorSubject<ProcessFlowParentState>(undefined);
    this.flowDiagramData = new BehaviorSubject<FlowDiagramData>(undefined);
  }

  updateFlowDiagramData(diagramState: ProcessFlowDiagramState) {
    if (diagramState && diagramState.context === 'water') {
      let waterDiagram = this.waterProcessDiagramService.waterDiagram.getValue();
      waterDiagram.flowDiagramData = diagramState.flowDiagramData;
      this.waterProcessDiagramService.updateWaterDiagram(waterDiagram);
    }

  }

}
