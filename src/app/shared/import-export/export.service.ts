import { Injectable } from '@angular/core';
import { ImportExportAssessment, ImportExportDirectory, ImportExportData } from './importExportModel';
import { Directory } from '../models/directory';
import { Assessment } from '../models/assessment';
import * as _ from 'lodash';
import { Calculator } from '../models/calculators';
import { Settings } from '../models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';
import { BehaviorSubject } from 'rxjs';
import { SSMT } from '../models/steam/ssmt';

@Injectable()
export class ExportService {

  exportAllClick: BehaviorSubject<boolean>;
  exportData: ImportExportData;
  exportDirectories: Array<ImportExportDirectory>;
  exportAssessments: Array<ImportExportAssessment>;
  workingDirId: number;
  selectAllFolder: boolean;
  constructor(private settingsDbService: SettingsDbService, private assessmentDbService: AssessmentDbService, private directoryDbService: DirectoryDbService, private calculatorDbService: CalculatorDbService) {
    this.exportAllClick = new BehaviorSubject<boolean>(false);
  }


  getSelected(dir: Directory, workingDirId: number) {
    this.workingDirId = workingDirId;
    this.exportAssessments = new Array<ImportExportAssessment>();
    this.exportDirectories = new Array<ImportExportDirectory>();
    let assessments: Array<Assessment>;
    let subDirs: Array<Directory>;
    let calculators: Array<Calculator>;
    if (!this.selectAllFolder) {
      assessments = _.filter(dir.assessments, (assessment) => { return assessment.selected === true; });
      subDirs = _.filter(dir.subDirectory, (subDir) => { return subDir.selected === true; });
      calculators = _.filter(dir.calculators, (calc) => { return calc.selected === true; });
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
        let objs = this.getSubDirData(dir, this.exportAssessments);
        this.exportAssessments.concat(objs);
      });
    }
    this.exportData = {
      directories: this.exportDirectories,
      assessments: this.exportAssessments,
      calculators: calculators
    };
    return this.exportData;
  }

  getAssessmentObj(assessment: Assessment): ImportExportAssessment {
    if (assessment.ssmt) {
      assessment = this.removeSsmtResults(assessment);
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
      });
    }
    let subDirs = this.directoryDbService.getSubDirectoriesById(dir.id);
    if (subDirs) {
      subDirs.forEach(subDir => {
        this.addDirectoryObj(subDir);
        let objs = this.getSubDirSelected(subDir, assessmentObjs);
        assessmentObjs.concat(objs);
      });
    }
    return assessmentObjs;
  }

}
