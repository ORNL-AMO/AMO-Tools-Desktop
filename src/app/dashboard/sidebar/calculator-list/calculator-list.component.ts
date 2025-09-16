import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';

@Component({
    selector: 'app-calculator-list',
    templateUrl: './calculator-list.component.html',
    styleUrls: ['./calculator-list.component.css'],
    standalone: false
})
export class CalculatorListComponent implements OnInit {
  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
  }

  navigateWithSidebarOptions(url: string) {
    this.dashboardService.navigateWithSidebarOptions(url)
  }


}
