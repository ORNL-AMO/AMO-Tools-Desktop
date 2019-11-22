import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DirectoryDashboardService {

  selectAll: BehaviorSubject<boolean>;
  dashboardView: BehaviorSubject<string>;
  constructor() { 
    this.selectAll = new BehaviorSubject<boolean>(false);
    this.dashboardView = new BehaviorSubject<string>('grid');
  }
}
