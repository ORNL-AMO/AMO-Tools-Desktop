import { Component, Input } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { Diagram } from '../../../shared/models/diagram';

@Component({
  selector: 'app-diagram-item',
  templateUrl: './diagram-item.component.html',
  styleUrl: './diagram-item.component.css'
})
export class DiagramItemComponent {
  @Input()
  diagram: Diagram;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
  }

  goToDiagram() {
    if (this.diagram.type === 'Water') {
      this.dashboardService.navigateWithSidebarOptions('/process-flow-diagram/' + this.diagram.id, {shouldCollapse: true})
    }
  }
}
