import { Injectable } from '@angular/core';
import { ImportExportAssessment, ImportExportDirectory, ImportExportData, ImportExportInventory } from './importExportModel';
import { Directory } from '../../shared/models/directory';
import { Assessment } from '../../shared/models/assessment';
import * as _ from 'lodash';
import { Calculator } from '../../shared/models/calculators';
import { Settings } from '../../shared/models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';
import { SSMT } from '../../shared/models/steam/ssmt';
import { InventoryItem } from '../../shared/models/inventory/inventory';
import { InventoryDbService } from '../../indexedDb/inventory-db.service';

@Injectable()
export class ExportService {

  exportAll: boolean = false;
  exportData: ImportExportData;
  exportDirectories: Array<ImportExportDirectory>;
  exportAssessments: Array<ImportExportAssessment>;
  exportInventories: Array<ImportExportInventory>;
  constructor(private settingsDbService: SettingsDbService, private assessmentDbService: AssessmentDbService, private directoryDbService: DirectoryDbService, private calculatorDbService: CalculatorDbService,
    private inventoryDbService: InventoryDbService) {
  }


  getSelected(dir: Directory, isSelectAll: boolean): ImportExportData {
    this.exportAssessments = new Array<ImportExportAssessment>();
    this.exportDirectories = new Array<ImportExportDirectory>();
    this.exportInventories = new Array<ImportExportInventory>();
    let assessments: Array<Assessment>;
    let subDirs: Array<Directory>;
    let calculators: Array<Calculator> = new Array<Calculator>();
    let inventories: Array<InventoryItem> = new Array<InventoryItem>();
    if (!isSelectAll) {
      assessments = _.filter(dir.assessments, (assessment) => { return assessment.selected === true; });
      subDirs = _.filter(dir.subDirectory, (subDir) => { return subDir.selected === true; });
      calculators = _.filter(dir.calculators, (calc) => { return calc.selected === true; });
      inventories = _.filter(dir.inventories, (inventory) => { return inventory.selected === true });
    } else {
      subDirs = [dir];
    }
    //ToDo: make sure these calcs are exported
    //  need to add multiple calcs functionality
    if (assessments) {
      assessments.forEach(assessment => {
        let obj = this.getAssessmentObj(assessment);
        this.exportAssessments.push(obj);
      });
    }
    if (subDirs) {
      subDirs.forEach(dir => {
        this.addDirectoryObj(dir);
        let objs = this.getSubDirAssessmentData(dir, this.exportAssessments);
        this.exportAssessments.concat(objs);
        let inventoryObjs = this.getSubDirInventoryData(dir, this.exportInventories);
        this.exportInventories.concat(inventoryObjs);
      });
    }
    if (inventories) {
      inventories.forEach(inventory => {
        let obj = this.getInventoryObj(inventory);
        this.exportInventories.push(obj);
      });
    }
    this.exportData = {
      directories: this.exportDirectories,
      assessments: this.exportAssessments,
      calculators: calculators,
      inventories: this.exportInventories
    };
    return this.exportData;
  }

  getAssessmentObj(assessment: Assessment): ImportExportAssessment {
    if (assessment.ssmt) {
      assessment = this.removeSsmtResults(assessment);
    }
    if (assessment.compressedAirAssessment) {
      assessment = this.removeDataExplorerData(assessment);
    }
    let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
    let calculator: Calculator = this.calculatorDbService.getByAssessmentId(assessment.id);
    let model: ImportExportAssessment = {
      assessment: assessment,
      settings: settings,
      calculator: calculator
    };
    return model;
  }

  removeSsmtResults(assessment: Assessment): Assessment {
    assessment.ssmt = this.deleteSsmtResults(assessment.ssmt);
    if (assessment.ssmt.modifications) {
      assessment.ssmt.modifications.forEach(mod => {
        mod.ssmt = this.deleteSsmtResults(mod.ssmt);
        if (mod.ssmt.modifications) {
          delete mod.ssmt.modifications;
        }
      })
    }
    return assessment;
  }

  deleteSsmtResults(ssmt: SSMT): SSMT {
    if (ssmt.outputData) {
      delete ssmt.outputData;
    }
    return ssmt;
  }


  removeDataExplorerData(assessment: Assessment): Assessment {
    if (assessment.compressedAirAssessment.logToolData) {
      delete assessment.compressedAirAssessment.logToolData;
    }
    if (assessment.compressedAirAssessment.systemProfile) {
      assessment.compressedAirAssessment.systemProfile.profileSummary.forEach(profile => {
        profile.logToolFieldId = undefined;
        profile.logToolFieldIdAmps = undefined;
        profile.logToolFieldIdPowerFactor = undefined;
        profile.logToolFieldIdVolts = undefined;
      });
    }
    return assessment;
  }

  addDirectoryObj(directory: Directory) {
    let testDirAdded = _.find(this.exportDirectories, (item) => { return item.directory.id === directory.id; });
    if (!testDirAdded) {
      let settings: Settings = this.settingsDbService.getByDirectoryId(directory.id);
      let calculators: Array<Calculator> = this.calculatorDbService.getByDirectoryId(directory.id);
      let dirItem: ImportExportDirectory = {
        settings: settings,
        calculator: calculators,
        directory: directory
      };
      this.exportDirectories.push(dirItem);
    }
  }

  getSubDirAssessmentData(subDir: Directory, assessmentObjs: Array<ImportExportAssessment>): Array<ImportExportAssessment> {
    this.addDirectoryObj(subDir);
    let subDirAssessments: Array<ImportExportAssessment> = this.getSubDirSelectedAssessments(subDir, assessmentObjs);
    return subDirAssessments;
  }

  getSubDirSelectedAssessments(dir: Directory, assessmentObjs: Array<ImportExportAssessment>): Array<ImportExportAssessment> {
    let assessments = this.assessmentDbService.getByDirectoryId(dir.id);
    if (assessments) {
      assessments.forEach(assessment => {
        let obj = this.getAssessmentObj(assessment);
        assessmentObjs.push(obj);
      });
    }
    let subDirs = this.directoryDbService.getSubDirectoriesById(dir.id);
    if (subDirs) {
      subDirs.forEach(subDir => {
        this.addDirectoryObj(subDir);
        let objs = this.getSubDirSelectedAssessments(subDir, assessmentObjs);
        assessmentObjs.concat(objs);
      });
    }
    return assessmentObjs;
  }

  getSubDirInventoryData(subDir: Directory, inventoryObjs: Array<ImportExportInventory>): Array<ImportExportInventory> {
    this.addDirectoryObj(subDir);
    let subDirInventories: Array<ImportExportInventory> = this.getSubDirSelectedInventory(subDir, inventoryObjs);
    return subDirInventories;
  }

  getSubDirSelectedInventory(dir: Directory, inventoryObjs: Array<ImportExportInventory>): Array<ImportExportInventory> {
    let inventories = this.inventoryDbService.getByDirectoryId(dir.id);
    if (inventories) {
      inventories.forEach(inventory => {
        let obj = this.getInventoryObj(inventory);
        inventoryObjs.push(obj);
      });
    }
    let subDirs = this.directoryDbService.getSubDirectoriesById(dir.id);
    if (subDirs) {
      subDirs.forEach(subDir => {
        this.addDirectoryObj(subDir);
        let objs = this.getSubDirSelectedInventory(subDir, inventoryObjs);
        inventoryObjs.concat(objs);
      });
    }
    return inventoryObjs;
  }


  getInventoryObj(inventory: InventoryItem): ImportExportInventory {
    return {
      inventoryItem: inventory,
      settings: this.settingsDbService.getByInventoryId(inventory)
    }
  }
}
