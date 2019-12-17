import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { ToolsService } from '../tools.service';

@Component({
  selector: 'app-tools-menu',
  templateUrl: './tools-menu.component.html',
  styleUrls: ['./tools-menu.component.css']
})
export class ToolsMenuComponent implements OnInit {

  constructor(private dashboardService: DashboardService, private toolsService: ToolsService) { }

  ngOnInit() {
  }


  showCreateAssessment() {
    this.dashboardService.createToolAssessment.next(true);
  }

  showAddDataSet() {
    this.toolsService.showAddDataSet.next(true);
  }
}
