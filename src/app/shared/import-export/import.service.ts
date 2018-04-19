import { Injectable } from '@angular/core';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ImportExportData, ImportExportAssessment, ImportExportDirectory } from './importExportModel';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { Directory } from '../models/directory';
import { Assessment } from '../models/assessment';
import * as _ from 'lodash';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';

@Injectable()
export class ImportService {

  directoryItems: Array<ImportExportDirectory>;
  assessmentItems: Array<ImportExportAssessment>;

  constructor(private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService, private calculatorDbService: CalculatorDbService,
    private assessmentDbService: AssessmentDbService) { }

  importData(data: ImportExportData, workingDirectoryId: number) {
    this.assessmentItems = data.assessments;
    this.directoryItems = data.directories;
    let tmpAssessmentArr: Array<ImportExportAssessment> = data.assessments;
    // data.directories.forEach(dir => {
    //   tmpAssessmentArr = _.remove(tmpAssessmentArr, (assessmentItem) => {
    //     return dir.directory.id == assessmentItem.assessment.directoryId;
    //   })
    // })
    this.addDirectory(data.directories[0], this.assessmentItems, this.directoryItems, workingDirectoryId);
    // tmpAssessmentArr.forEach(assessmentItem => {
    //   assessmentItem.assessment.directoryId = workingDirectoryId;
    //   this.addAssessment(assessmentItem);
    // })
  }

  addDirectory(directoryItem: ImportExportDirectory, assessments: Array<ImportExportAssessment>, directories: Array<ImportExportDirectory>, workingDirectoryId: number) {
    let dirAssessments = _.filter(assessments, (assessmentItem) => { return assessmentItem.assessment.directoryId == directoryItem.directory.id });
    let subDirs = _.filter(directories, (dir) => { return dir.directory.parentDirectoryId == directoryItem.directory.id });
    let parentDir = _.find(directories, (dir) => { return dir.directory.id == directoryItem.directory.parentDirectoryId });
    if (!parentDir) {
      directoryItem.directory.parentDirectoryId = workingDirectoryId;
    }
    delete directoryItem.directory.id;
    this.indexedDbService.addDirectory(directoryItem.directory).then(newDirId => {
      this.directoryDbService.setAll();
      console.log('dir added: ')
      directoryItem.settings.directoryId = newDirId;
      delete directoryItem.settings.id;
      this.indexedDbService.addSettings(directoryItem.settings).then(() => {
        this.settingsDbService.setAll();
        console.log('dir settings added')
      });
      if (directoryItem.calculator) {
        directoryItem.calculator.forEach(calc => {
          delete calc.id;
          calc.directoryId = newDirId;
          this.indexedDbService.addCalculator(calc).then(() => {
            this.calculatorDbService.setAll();
            console.log('dir calc added')
          })
        })
      }
      dirAssessments.forEach(assessment => {
        assessment.assessment.directoryId = newDirId;
        this.addAssessment(assessment);
      })
      subDirs.forEach(dir => {
        dir.directory.parentDirectoryId = newDirId;
        this.addDirectory(dir, this.assessmentItems, this.directoryItems, workingDirectoryId);
      })
    })
  }

  addAssessment(assessmentItem: ImportExportAssessment) {
    delete assessmentItem.assessment.id;
    this.indexedDbService.addAssessment(assessmentItem.assessment).then(newAssessmentId => {
      this.assessmentDbService.setAll();
      console.log('assessment added');
      assessmentItem.settings.assessmentId = newAssessmentId;
      delete assessmentItem.settings.id;
      this.indexedDbService.addSettings(assessmentItem.settings).then(() => {
        this.settingsDbService.setAll();
        console.log('assessment settings added')
      });
      if (assessmentItem.calculator) {
        assessmentItem.calculator.assessmentId = newAssessmentId;
        delete assessmentItem.calculator.id;
        this.indexedDbService.addCalculator(assessmentItem.calculator).then(() => {
          this.calculatorDbService.setAll();
          console.log('assessment calc added')
        });
      }
    })
  }

}
