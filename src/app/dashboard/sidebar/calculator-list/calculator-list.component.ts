import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../dashboard.service';

@Component({
  selector: 'app-calculator-list',
  templateUrl: './calculator-list.component.html',
  styleUrls: ['./calculator-list.component.css']
})
export class CalculatorListComponent implements OnInit {
  totalScreenWidth: number;
  totalScreenWidthSub: Subscription;
  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
  }

  navigateSidebarLink(url: string) {
    this.dashboardService.navigateSidebarLink(url)
  }


}
