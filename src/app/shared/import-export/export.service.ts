import { Injectable } from '@angular/core';
import { ImportExportAssessment, ImportExportDirectory, ImportExportData } from './importExportModel';
import { Directory } from '../models/directory';
import { Assessment } from '../models/assessment';
import * as _ from 'lodash';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Calculator } from '../models/calculators';
import { Settings } from '../models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ExportService {

  exportAllClick: BehaviorSubject<boolean>;
  exportData: ImportExportData;
  exportDirectories: Array<ImportExportDirectory>;
  exportAssessments: Array<ImportExportAssessment>;
  workingDirId: number;
  constructor(private settingsDbService: SettingsDbService, private assessmentDbService: AssessmentDbService, private directoryDbService: DirectoryDbService, private calculatorDbService: CalculatorDbService) {
    this.exportAllClick = new BehaviorSubject<boolean>(false);
   }


  getSelected(dir: Directory, workingDirId: number) {
    this.workingDirId = workingDirId;
    this.exportAssessments = new Array<ImportExportAssessment>();
    this.exportDirectories = new Array<ImportExportDirectory>();
    let assessments: Array<Assessment> = _.filter(dir.assessments, (assessment) => { return assessment.selected == true });
    let subDirs: Array<Directory> = _.filter(dir.subDirectory, (subDir) => { return subDir.selected == true });
    let calculators: Array<Calculator> = _.filter(dir.calculators, (calc) => { return calc.selected == true });
    console.log(calculators);
    //ToDo: make sure these calcs are exported
    //  need to add multiple calcs functionality
    if (assessments) {
      assessments.forEach(assessment => {
        let obj = this.getAssessmentObj(assessment);
        this.exportAssessments.push(obj);
      })
    }
    if (subDirs) {
      subDirs.forEach(dir => {
        this.addDirectoryObj(dir);
        let objs = this.getSubDirData(dir, this.exportAssessments);
        this.exportAssessments.concat(objs);
      })
    }
    this.exportData = {
      directories: this.exportDirectories,
      assessments: this.exportAssessments,
      calculators: calculators
    }
    return this.exportData;
  }

  getAssessmentObj(assessment: Assessment): ImportExportAssessment {
    let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
    let calculator: Calculator = this.calculatorDbService.getByAssessmentId(assessment.id);
    let model: ImportExportAssessment = {
      assessment: assessment,
      settings: settings,
      calculator: calculator
    }
    return model;
  }

  addDirectoryObj(directory: Directory) {
    let testDirAdded = _.find(this.exportDirectories, (item) => { return item.directory.id == directory.id });
    if (!testDirAdded) {
      let settings: Settings = this.settingsDbService.getByDirectoryId(directory.id);
      let calculators: Array<Calculator> = this.calculatorDbService.getByDirectoryId(directory.id);
      let dirItem: ImportExportDirectory = {
        settings: settings,
        calculator: calculators,
        directory: directory
      }
      this.exportDirectories.push(dirItem);
    }
  }

  getSubDirData(subDir: Directory, assessmentObjs: Array<ImportExportAssessment>) {
    this.addDirectoryObj(subDir);
    let subDirAssessments = this.getSubDirSelected(subDir, assessmentObjs);
    return subDirAssessments;
  }

  getSubDirSelected(dir: Directory, assessmentObjs: Array<ImportExportAssessment>) {
    let assessments = this.assessmentDbService.getByDirectoryId(dir.id);
    if (assessments) {
      assessments.forEach(assessment => {
        let obj = this.getAssessmentObj(assessment);
        assessmentObjs.push(obj);
      })
    }
    let subDirs = this.directoryDbService.getSubDirectoriesById(dir.id);
    if (subDirs) {
      subDirs.forEach(subDir => {
        this.addDirectoryObj(subDir);
        let objs = this.getSubDirSelected(subDir, assessmentObjs);
        assessmentObjs.concat(objs);
      })
    }
    return assessmentObjs;
  }

}
