import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DirectoryDashboardService {

  selectAll: BehaviorSubject<boolean>;
  dashboardView: BehaviorSubject<string>;
  createAssessment: BehaviorSubject<boolean>;
  createFolder: BehaviorSubject<boolean>;
  selectedDirectoryId: BehaviorSubject<number>;
  constructor() { 
    this.selectAll = new BehaviorSubject<boolean>(false);
    this.dashboardView = new BehaviorSubject<string>('grid');
    this.createAssessment = new BehaviorSubject<boolean>(false);
    this.createFolder = new BehaviorSubject<boolean>(false);
    this.selectedDirectoryId = new BehaviorSubject<number>(1);
  }
}
