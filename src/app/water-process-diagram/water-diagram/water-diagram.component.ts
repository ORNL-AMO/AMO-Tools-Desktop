import { Component } from '@angular/core';
import { ProcessFlowDiagramService } from '../../shared/process-flow-diagram-wrapper/process-flow-diagram.service';
import { Subscription } from 'rxjs';
import { WaterProcessDiagramService } from '../water-process-diagram.service';

@Component({
  selector: 'app-water-diagram',
  templateUrl: './water-diagram.component.html',
  styleUrl: './water-diagram.component.css'
})
export class WaterDiagramComponent {
  parentContainerSub: Subscription;
  constructor(private processFlowDiagramService: ProcessFlowDiagramService, private waterProcessDiagramService: WaterProcessDiagramService) {}

  ngOnInit() {}
  
  ngAfterViewInit() {
    this.parentContainerSub = this.waterProcessDiagramService.parentContainer.subscribe(parentContainerDimensions => {
      this.setDiagramParentData();
    });
  }

  ngOnDestroy() {
    this.parentContainerSub.unsubscribe();
  }

  setDiagramParentData() {
    this.processFlowDiagramService.processFlowParentState.next({
      context: 'water', 
      parentContainer: this.waterProcessDiagramService.parentContainer.getValue(), 
      waterDiagram: this.waterProcessDiagramService.selectedWaterDiagram.getValue()
    });
  }
}
