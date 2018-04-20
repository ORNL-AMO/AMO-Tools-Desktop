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
    let tmpDirectory: ImportDirectory = {
      id: data.directories[0].directory.parentDirectoryId,
      directoryItem: undefined,
      assessments: new Array(),
      subDirectories: new Array()
    };
    tmpDirectory = this.buildDir(tmpDirectory, true, workingDirectoryId);
    this.addDirectory(tmpDirectory);
  }

  buildDir(directory: ImportDirectory, first?: boolean, workingDirectoryId?: number): ImportDirectory {
    let tmpDirs: Array<ImportExportDirectory> = _.filter(this.directoryItems, (dir) => { return dir.directory.parentDirectoryId == directory.id });
    if(first){
      tmpDirs.forEach(dir => {
        dir.directory.parentDirectoryId = workingDirectoryId;
      })
    }
    let subDirs: Array<ImportDirectory> = new Array<ImportDirectory>();
    tmpDirs.forEach(dir => {
      let tmpSubDir: ImportDirectory = {
        id: dir.directory.id,
        directoryItem: dir,
        subDirectories: new Array(),
        assessments: new Array()
      }
      tmpSubDir = this.buildDir(tmpSubDir);
      subDirs.push(tmpSubDir);

    })
    let dirAssessments = _.filter(this.assessmentItems, (assessmentItem) => { return assessmentItem.assessment.directoryId == directory.id });
    directory.subDirectories = subDirs;
    directory.assessments = dirAssessments;
    return directory
  }

  addDirectory(importDir: ImportDirectory) {
    if (importDir.directoryItem) {
      delete importDir.directoryItem.directory.id;
      this.indexedDbService.addDirectory(importDir.directoryItem.directory).then(newId => {
        this.directoryDbService.setAll();
        importDir.directoryItem.settings.directoryId = newId;
        delete importDir.directoryItem.settings.id;
        this.indexedDbService.addSettings(importDir.directoryItem.settings).then(() => {
          this.settingsDbService.setAll();
        });

        if (importDir.directoryItem.calculator) {
          if (importDir.directoryItem.calculator.length != 0) {
            importDir.directoryItem.calculator[0].directoryId = newId;
            delete importDir.directoryItem.calculator[0].id;
            this.indexedDbService.addCalculator(importDir.directoryItem.calculator[0]).then(() => {
              this.calculatorDbService.setAll();
            });
          }
        }

        importDir.assessments.forEach(assessmentItem => {
          assessmentItem.assessment.directoryId = newId;
          delete assessmentItem.assessment.id;
          this.indexedDbService.addAssessment(assessmentItem.assessment).then(newAssessmentId => {
            this.assessmentDbService.setAll();
            assessmentItem.settings.assessmentId = newAssessmentId;
            delete assessmentItem.settings.id;
            this.indexedDbService.addSettings(assessmentItem.settings).then(() => {
              this.settingsDbService.setAll();
            });

            if (assessmentItem.calculator) {
              assessmentItem.calculator.directoryId = newId;
              delete assessmentItem.calculator.id;
              this.indexedDbService.addCalculator(assessmentItem.calculator).then(() => {
                this.calculatorDbService.setAll();
              });

            }
          })
        })

        importDir.subDirectories.forEach(subDir => {
          if (subDir.directoryItem.directory) {
            subDir.directoryItem.directory.parentDirectoryId = newId;
          }
          this.addDirectory(subDir);
        })

      })
    } else {
      importDir.subDirectories.forEach(subDir => { this.addDirectory(subDir) })
    }
  }
}


export interface ImportDirectory {
  id: number,
  directoryItem: ImportExportDirectory,
  subDirectories: Array<ImportDirectory>,
  assessments: Array<ImportExportAssessment>
}