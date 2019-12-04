import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DashboardService {

  updateSidebarData: BehaviorSubject<boolean>;
  dashboardToastMessage: BehaviorSubject<string>;
  constructor() {
    this.updateSidebarData = new BehaviorSubject<boolean>(false);
    this.dashboardToastMessage = new BehaviorSubject<string>(undefined);
  }
}
