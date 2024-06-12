import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { FlowDiagramData, ParentContainerDimensions, ProcessFlowDiagramState, ProcessFlowParentState } from '../../../process-flow-types/process-flow-types';
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

  getNewDiagram(): FlowDiagramData {
    return {
      nodes: [],
      edges: [],
      
    }
  }

  async updateFlowDiagramData(diagramState: ProcessFlowDiagramState) {
    if (diagramState && diagramState.context === 'water') {
      let waterDiagram = this.waterProcessDiagramService.selectedWaterDiagram.getValue();
      waterDiagram.flowDiagramData = diagramState.flowDiagramData;
      // todo need to update selected waterdiagram bS?
      await this.waterProcessDiagramService.updateWaterDiagram(waterDiagram);
    }

  }

}
