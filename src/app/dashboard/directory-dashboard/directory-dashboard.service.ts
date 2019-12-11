import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FilterDashboardBy, DirectoryItem } from '../../shared/models/directory-dashboard';
import * as _ from 'lodash';

@Injectable()
export class DirectoryDashboardService {

  dashboardView: BehaviorSubject<string>;
  createFolder: BehaviorSubject<boolean>;
  selectedDirectoryId: BehaviorSubject<number>;
  showDeleteItemsModal: BehaviorSubject<boolean>;
  showImportModal: BehaviorSubject<boolean>;
  showExportModal: BehaviorSubject<boolean>;
  showPreAssessmentModalIndex: BehaviorSubject<{ index: number, isNew: boolean }>;
  filterDashboardBy: BehaviorSubject<FilterDashboardBy>;
  sortBy: BehaviorSubject<{ value: string, direction: string }>;
  constructor() {
    this.dashboardView = new BehaviorSubject<string>('grid');
    this.createFolder = new BehaviorSubject<boolean>(false);
    this.selectedDirectoryId = new BehaviorSubject<number>(1);
    this.showDeleteItemsModal = new BehaviorSubject<boolean>(false);
    this.showImportModal = new BehaviorSubject<boolean>(false);
    this.showExportModal = new BehaviorSubject<boolean>(false);
    this.showPreAssessmentModalIndex = new BehaviorSubject<{ index: number, isNew: boolean }>(undefined);
    this.filterDashboardBy = new BehaviorSubject<FilterDashboardBy>({
      showPumps: true,
      showFans: true,
      showSteam: true,
      showTreasureHunt: true,
      showSubFolders: true,
      showPreAssessments: true,
      showPhast: true,
      showAll: true
    });

    this.sortBy = new BehaviorSubject<{ value: string, direction: string }>({ value: 'modifiedDate', direction: 'asc' });
  }


  filterDirectoryItems(directoryItems: Array<DirectoryItem>, filterDashboardBy: FilterDashboardBy): Array<DirectoryItem> {
    let assessmentItems: Array<DirectoryItem> = _.filter(directoryItems, (item) => { return item.type == 'assessment' });
    let preAssessmentItems: Array<DirectoryItem> = _.filter(directoryItems, (item) => { return item.type == 'calculator' });
    let subDirectoryItems: Array<DirectoryItem> = _.filter(directoryItems, (item) => { return item.type == 'directory' });
    assessmentItems.forEach(item => {
      if (item.assessment.type == 'PSAT' && filterDashboardBy.showPumps == false && filterDashboardBy.showAll == false) {
        item.isShown = false;
      } else if (item.assessment.type == 'FSAT' && filterDashboardBy.showFans == false && filterDashboardBy.showAll == false) {
        item.isShown = false;
      } else if (item.assessment.type == 'SSMT' && filterDashboardBy.showSteam == false && filterDashboardBy.showAll == false) {
        item.isShown = false;
      } else if (item.assessment.type == 'TreasureHunt' && filterDashboardBy.showTreasureHunt == false && filterDashboardBy.showAll == false) {
        item.isShown = false;
      } else if (item.assessment.type == 'PHAST' && filterDashboardBy.showPhast == false && filterDashboardBy.showAll == false) {
        item.isShown = false;
      } else if (item.isShown == false) {
        item.isShown = true;
      }
    })
    if (filterDashboardBy.showSubFolders == false && filterDashboardBy.showAll == false) {
      subDirectoryItems.forEach(item => { item.isShown = false; });
    } else {
      subDirectoryItems.forEach(item => { item.isShown = true });
    }
    if (filterDashboardBy.showPreAssessments == false && filterDashboardBy.showAll == false) {
      preAssessmentItems.forEach(item => { item.isShown = false });
    } else {
      preAssessmentItems.forEach(item => { item.isShown = true });
    }
    return directoryItems;
  }

  sortDirectoryItems(directoryItems: Array<DirectoryItem>, sortStr: { value: string, direction: string }): Array<DirectoryItem> {
    directoryItems = _.orderBy(directoryItems, [sortStr.value], sortStr.direction);
    return directoryItems;
  }


}