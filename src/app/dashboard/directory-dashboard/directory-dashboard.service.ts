import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { FilterDashboardBy, DirectoryItem } from '../../shared/models/directory-dashboard';
import * as _ from 'lodash';
import { Directory } from '../../shared/models/directory';
import { UntypedFormGroup } from '@angular/forms';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { Settings } from '../../shared/models/settings';

@Injectable()
export class DirectoryDashboardService {

  dashboardView: BehaviorSubject<string>;
  updateSelectedStatus: BehaviorSubject<boolean>;
  createFolder: BehaviorSubject<boolean>;
  selectedDirectoryId: BehaviorSubject<number>;
  showDeleteItemsModal: BehaviorSubject<boolean>;
  showImportModal: BehaviorSubject<boolean>;
  showExportModal: BehaviorSubject<boolean>;
  showPreAssessmentModalIndex: BehaviorSubject<{ index: number, isNew: boolean }>;
  filterDashboardBy: BehaviorSubject<FilterDashboardBy>;
  sortBy: BehaviorSubject<{ value: string, direction: string }>;
  constructor(private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService) {
    this.dashboardView = new BehaviorSubject<string>('grid');
    this.createFolder = new BehaviorSubject<boolean>(false);
    this.updateSelectedStatus = new BehaviorSubject<boolean>(true);
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
      showAll: true,
      showMotorInventory: true,
      showWasteWater: true,
      showCompressedAir: true
    });

    this.sortBy = new BehaviorSubject<{ value: string, direction: string }>({ value: 'modifiedDate', direction: 'desc' });
  }

  getDirectoryItems(directory: Directory): Array<DirectoryItem> {
    let directoryItems = new Array<DirectoryItem>();
    let calculatorIndex: number = 0;
    if(directory){
        directory.calculators.forEach(calculator => {
        directoryItems.push({
          type: 'calculator',
          calculator: calculator,
          calculatorIndex: calculatorIndex,
          isShown: true,
          createdDate: calculator.createdDate,
          modifiedDate: calculator.modifiedDate,
          name: calculator.name
        });
        calculatorIndex++;
      });
      
      directory.assessments.forEach(assessment => {
        directoryItems.push({
          type: 'assessment',
          assessment: assessment,
          isShown: true,
          createdDate: assessment.createdDate,
          modifiedDate: assessment.modifiedDate,
          name: assessment.name,
          assessmentType: assessment.type
        })
      });
      
      directory.subDirectory.forEach(subDirectory => {
        directoryItems.push({
          type: 'directory',
          subDirectory: subDirectory,
          isShown: true,
          createdDate: subDirectory.createdDate,
          modifiedDate: subDirectory.modifiedDate,
          name: subDirectory.name
        });
      });
      
      directory.inventories.forEach(inventoryItem => {
        directoryItems.push({
          type: 'inventory',
          inventoryItem: inventoryItem,
          isShown: true,
          createdDate: inventoryItem.createdDate,
          modifiedDate: inventoryItem.modifiedDate,
          name: inventoryItem.name
        });
      });
    }
    
    return directoryItems;
  }

  async addDirectoryAndSettings(form: UntypedFormGroup): Promise<number> {
    let newDirectory: Directory = {
      name: form.controls.folderName.value,
      parentDirectoryId: form.controls.directoryId.value,
      selected: false
    };
    let newSettings: Settings = this.settingsDbService.getByDirectoryId(form.controls.directoryId.value);
    delete newSettings.facilityInfo;
    delete newSettings.id;
    if (form.controls.companyName.value || form.controls.facilityName.value) {
      newSettings.facilityInfo = {
        companyName: form.controls.companyName.value,
        facilityName: form.controls.facilityName.value,
        date: new Date().toLocaleDateString()
      };
    }

    let addedDirectory: Directory = await firstValueFrom(this.directoryDbService.addWithObservable(newDirectory));
    let allDirectories: Directory[] = await firstValueFrom(this.directoryDbService.getAllDirectories());
    this.directoryDbService.setAll(allDirectories);

    newSettings.directoryId = addedDirectory.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(newSettings));
    let allSettings: Settings[] =  await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(allSettings);

    return addedDirectory.id;
  }

  filterDirectoryItems(directoryItems: Array<DirectoryItem>, filterDashboardBy: FilterDashboardBy): Array<DirectoryItem> {
    let assessmentItems: Array<DirectoryItem> = _.filter(directoryItems, (item) => { return item.type == 'assessment' });
    let preAssessmentItems: Array<DirectoryItem> = _.filter(directoryItems, (item) => { return item.type == 'calculator' });
    let inventoryItems: Array<DirectoryItem> = _.filter(directoryItems, (item) => { return item.type == 'inventory' });
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
      } else if (item.assessment.type == 'WasteWater' && filterDashboardBy.showWasteWater == false && filterDashboardBy.showAll == false) {
        item.isShown = false;
      } else if (item.assessment.type == 'CompressedAir' && filterDashboardBy.showCompressedAir == false && filterDashboardBy.showAll == false) {
        item.isShown = false;
      }
      else if (item.isShown == false) {
        item.isShown = true;
      }
    });
    if (filterDashboardBy.showPreAssessments == false && filterDashboardBy.showAll == false) {
      preAssessmentItems.forEach(item => { item.isShown = false });
    } else {
      preAssessmentItems.forEach(item => { item.isShown = true });
    }

    if (filterDashboardBy.showMotorInventory == false && filterDashboardBy.showAll == false) {
      inventoryItems.forEach(item => { item.isShown = false });
    } else {
      inventoryItems.forEach(item => { item.isShown = true });
    }
    return directoryItems;
  }

  sortDirectoryItems(directoryItems: Array<DirectoryItem>, sortStr: { value: string, direction: string }): Array<DirectoryItem> {
    let orderBy: Array<string> = [sortStr.value]
    if (sortStr.value == 'type') {
      orderBy = [sortStr.value, 'assessmentType', 'name'];
    }
    directoryItems = _.orderBy(directoryItems, orderBy, sortStr.direction);
    return directoryItems;
  }


}