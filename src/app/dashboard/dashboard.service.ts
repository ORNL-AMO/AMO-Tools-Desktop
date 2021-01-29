import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DashboardService {

  newAssessmentType: string;
  updateDashboardData: BehaviorSubject<boolean>;
  createAssessment: BehaviorSubject<boolean>;
  dashboardToastMessage: BehaviorSubject<string>;
  sidebarX: BehaviorSubject<number>;
  createInventory:BehaviorSubject<boolean>;
  constructor() {
    this.updateDashboardData = new BehaviorSubject<boolean>(false);
    this.dashboardToastMessage = new BehaviorSubject<string>(undefined);
    this.createAssessment = new BehaviorSubject<boolean>(false);
    this.sidebarX = new BehaviorSubject<number>(undefined);
    this.createInventory = new BehaviorSubject<boolean>(false);
  }
}
