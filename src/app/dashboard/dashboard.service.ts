import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DashboardService {

  moveItems: BehaviorSubject<boolean>;
  newAssessmentType: string;
  updateDashboardData: BehaviorSubject<boolean>;
  createAssessment: BehaviorSubject<boolean>;
  dashboardToastMessage: BehaviorSubject<string>;
  sidebarX: BehaviorSubject<number>;
  totalScreenWidth: BehaviorSubject<number>;
  createInventory:BehaviorSubject<boolean>;
  copyItems: BehaviorSubject<boolean>;
  constructor() {
    this.moveItems = new BehaviorSubject<boolean>(false);
    this.updateDashboardData = new BehaviorSubject<boolean>(false);
    this.dashboardToastMessage = new BehaviorSubject<string>(undefined);
    this.createAssessment = new BehaviorSubject<boolean>(false);
    this.sidebarX = new BehaviorSubject<number>(undefined);
    this.createInventory = new BehaviorSubject<boolean>(false);
    this.copyItems = new BehaviorSubject<boolean>(false);
    this.totalScreenWidth = new BehaviorSubject<number>(undefined);
  }
}
