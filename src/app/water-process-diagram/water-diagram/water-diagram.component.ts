import { Component, Input } from '@angular/core';
import { ProcessFlowDiagramService } from '../../shared/process-flow-diagram-wrapper/process-flow-diagram.service';

@Component({
  selector: 'app-water-diagram',
  templateUrl: './water-diagram.component.html',
  styleUrl: './water-diagram.component.css'
})
export class WaterDiagramComponent {
  constructor(private processFlowDiagramService: ProcessFlowDiagramService) {}

  ngOnInit() {
    console.log('in water diagram')
  }
  
  ngAfterViewInit() {
    this.processFlowDiagramService.processFlowDiagramData.next({context: 'water', parentHeight: 0,  waterProcess: undefined})
  }
}
