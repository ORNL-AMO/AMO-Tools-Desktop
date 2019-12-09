import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DirectoryDashboardService {

  dashboardView: BehaviorSubject<string>;
  createFolder: BehaviorSubject<boolean>;
  selectedDirectoryId: BehaviorSubject<number>;
  showDeleteItemsModal: BehaviorSubject<boolean>;
  showImportModal: BehaviorSubject<boolean>;
  showExportModal: BehaviorSubject<boolean>;
  showPreAssessmentModalIndex: BehaviorSubject<{index: number, isNew: boolean}>;
  constructor() {
    this.dashboardView = new BehaviorSubject<string>('grid');
    this.createFolder = new BehaviorSubject<boolean>(false);
    this.selectedDirectoryId = new BehaviorSubject<number>(1);
    this.showDeleteItemsModal = new BehaviorSubject<boolean>(false);
    this.showImportModal = new BehaviorSubject<boolean>(false);
    this.showExportModal = new BehaviorSubject<boolean>(false);
    this.showPreAssessmentModalIndex = new BehaviorSubject<{index: number, isNew: boolean}>(undefined);
  }
}
