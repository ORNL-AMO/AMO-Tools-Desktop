import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DashboardService {

  newAssessmentType: string;
  updateDashboardData: BehaviorSubject<boolean>;
  createAssessment: BehaviorSubject<boolean>;
  dashboardToastMessage: BehaviorSubject<string>;
  constructor() {
    this.updateDashboardData = new BehaviorSubject<boolean>(false);
    this.dashboardToastMessage = new BehaviorSubject<string>(undefined);
    this.createAssessment = new BehaviorSubject<boolean>(false);
  }
}
