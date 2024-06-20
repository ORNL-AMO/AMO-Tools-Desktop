import { Component } from '@angular/core';
import { ProcessFlowDiagramService } from '../../shared/process-flow-diagram-wrapper/process-flow-diagram.service';
import { Subscription } from 'rxjs';
import { WaterProcessDiagramService } from '../water-process-diagram.service';
import { WaterDiagram } from '../../../process-flow-types/shared-process-flow-types';

@Component({
  selector: 'app-water-diagram',
  templateUrl: './water-diagram.component.html',
  styleUrl: './water-diagram.component.css'
})
export class WaterDiagramComponent {
  parentContainerSub: Subscription;
  waterDiagram: WaterDiagram;
  constructor(private processFlowDiagramService: ProcessFlowDiagramService, private waterProcessDiagramService: WaterProcessDiagramService) {}

  ngOnInit() {
    this.waterDiagram = this.waterProcessDiagramService.waterDiagram.getValue();
  }
  
  ngAfterViewInit() {
    this.parentContainerSub = this.waterProcessDiagramService.parentContainer.subscribe(parentContainerDimensions => {
        this.processFlowDiagramService.processFlowParentState.next({
          context: 'water', 
          parentContainer: this.waterProcessDiagramService.parentContainer.getValue(), 
          waterDiagram: this.waterDiagram
        });
    });
  }

  ngOnDestroy() {
    this.parentContainerSub.unsubscribe();
  }

}
