import { Component, Input, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { Diagram } from '../../../shared/models/diagram';
import { DiagramType, RecentlyAccessedService } from '../../../shared/recently-accessed/recently-accessed.service';

@Component({
  selector: 'app-diagram-item',
  standalone: false,
  templateUrl: './diagram-item.component.html',
  styleUrl: './diagram-item.component.css'
})
export class DiagramItemComponent implements OnInit {
  @Input()
  diagram: Diagram;

  constructor(private dashboardService: DashboardService, private recentlyAccessedService: RecentlyAccessedService) { }

  ngOnInit(): void {
  }

  goToDiagram() {
    if (this.diagram.type === 'Water') {
      const route = this.recentlyAccessedService.getRouteForDiagram('Water' as DiagramType, this.diagram.id);
      this.recentlyAccessedService.record({
        id: this.diagram.id,
        name: this.diagram.name,
        itemType: 'diagram',
        diagramType: 'Water',
        route
      });
      this.dashboardService.navigateWithSidebarOptions(route, { shouldCollapse: true });
    }
  }
}
