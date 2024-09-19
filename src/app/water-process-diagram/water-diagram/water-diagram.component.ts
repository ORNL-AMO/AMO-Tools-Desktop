import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { WaterProcessDiagramService } from '../water-process-diagram.service';
import { ProcessFlowParentState, WaterDiagram } from '../../../process-flow-types/shared-process-flow-types';

@Component({
  selector: 'app-water-diagram',
  templateUrl: './water-diagram.component.html',
  styleUrl: './water-diagram.component.css'
})
export class WaterDiagramComponent {
  parentContainerSub: Subscription;
  waterDiagram: WaterDiagram;
  processFlowParentState: ProcessFlowParentState;
  processFlowDiagramDataSub: Subscription;
  constructor(private waterProcessDiagramService: WaterProcessDiagramService) {}

  ngOnInit() {
    this.waterDiagram = this.waterProcessDiagramService.waterDiagram.getValue();
    this.parentContainerSub = this.waterProcessDiagramService.parentContainer.subscribe(parentContainerDimensions => {
      this.processFlowParentState = {
        context: 'water', 
        parentContainer: parentContainerDimensions, 
        waterDiagram: this.waterDiagram
      };
    });
  }

  ngOnDestroy() {
    this.parentContainerSub.unsubscribe();
  }

}
