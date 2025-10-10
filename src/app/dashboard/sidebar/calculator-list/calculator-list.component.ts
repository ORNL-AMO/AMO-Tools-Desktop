import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
@Component({
    selector: 'app-calculator-list',
    templateUrl: './calculator-list.component.html',
    styleUrls: ['./calculator-list.component.css'],
    standalone: false
})
export class CalculatorListComponent implements OnInit {
  @ViewChild('sidebarWrapper', { static: true }) sidebarWrapper!: ElementRef;
 totalScreenWidth: BehaviorSubject<number>;

  constructor(private dashboardService: DashboardService, private router: Router) {
    this.totalScreenWidth = new BehaviorSubject<number>(undefined);
  }

  ngOnInit() {}
}
