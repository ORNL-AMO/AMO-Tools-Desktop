import { Component, Input } from '@angular/core';
import { ProcessFlowDiagramService } from '../../shared/process-flow-diagram-wrapper/process-flow-diagram.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-water-diagram',
  templateUrl: './water-diagram.component.html',
  styleUrl: './water-diagram.component.css'
})
export class WaterDiagramComponent {
  parentContainerSub: Subscription;
  constructor(private processFlowDiagramService: ProcessFlowDiagramService) {}

  ngOnInit() {}
  
  ngAfterViewInit() {
    this.parentContainerSub = this.processFlowDiagramService.parentContainer.subscribe(parentContainerDimensions => {
      this.initWaterDiagram();
    });
  }

  ngOnDestroy() {
    this.parentContainerSub.unsubscribe();
  }

  initWaterDiagram() {
    this.processFlowDiagramService.processFlowParentState.next({
      context: 'water', 
      parentContainer: this.processFlowDiagramService.parentContainer.getValue(), 
      waterProcess: undefined
    })
  }
}
