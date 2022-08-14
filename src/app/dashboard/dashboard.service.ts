import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DashboardService {

  moveItems: BehaviorSubject<boolean>;
  newAssessmentType: string;
  updateDashboardData: BehaviorSubject<boolean>;
  createAssessment: BehaviorSubject<boolean>;
  dashboardToastMessage: BehaviorSubject<string>;
  sidebarX: BehaviorSubject<number>;
  createInventory:BehaviorSubject<boolean>;
  copyItems: BehaviorSubject<boolean>;
  totalScreenWidth: BehaviorSubject<number>;
  collapseSidebar: BehaviorSubject<boolean>;
  constructor(private router: Router) {
    this.moveItems = new BehaviorSubject<boolean>(false);
    this.updateDashboardData = new BehaviorSubject<boolean>(false);
    this.dashboardToastMessage = new BehaviorSubject<string>(undefined);
    this.createAssessment = new BehaviorSubject<boolean>(false);
    this.sidebarX = new BehaviorSubject<number>(300);
    this.createInventory = new BehaviorSubject<boolean>(false);
    this.collapseSidebar = new BehaviorSubject<boolean>(false);
    this.copyItems = new BehaviorSubject<boolean>(false);
    this.totalScreenWidth = new BehaviorSubject<number>(undefined);
  }

  navigateSidebarLink(routeURL: string) {
    if (this.totalScreenWidth.getValue() < 1024) {
      this.collapseSidebar.next(true);
    }
    this.router.navigateByUrl(routeURL);
  }
}
