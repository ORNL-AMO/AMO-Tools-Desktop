import { Injectable } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { CalculatorDbService } from './calculator-db.service';
import { AssessmentDbService } from './assessment-db.service';
import { DirectoryDbService } from './directory-db.service';
import { SettingsDbService } from './settings-db.service';
import { Directory } from '../shared/models/directory';
import { Assessment } from '../shared/models/assessment';
import * as _ from 'lodash';
import { Settings } from '../shared/models/settings';
import { Calculator } from '../shared/models/calculators';
@Injectable()
export class DeleteDataService {

  constructor(private indexedDbService: IndexedDbService, private calculatorDbService: CalculatorDbService, private assessmentDbService: AssessmentDbService, private directoryDbService: DirectoryDbService, private settingsDbService: SettingsDbService) { }

  deleteDirectory(directory: Directory, isWorkingDir?: boolean) {
    let assessments: Array<Assessment>;
    if (!isWorkingDir) {
      assessments = this.assessmentDbService.getByDirectoryId(directory.id);
    } else if (directory.assessments) {
      assessments = _.filter(directory.assessments, (assessment) => { return assessment.selected == true });
    }
    if (assessments) {
      assessments.forEach(assessment => {
        this.deleteAssessment(assessment);
      })
    }
    let dirSettings: Settings = this.settingsDbService.getByDirectoryId(directory.id);
    if (dirSettings) {
      this.indexedDbService.deleteSettings(dirSettings.id);
    }
    let calculators: Array<Calculator> = this.calculatorDbService.getByDirectoryId(directory.id);
    if (calculators) {
      calculators.forEach(calculator => {
        this.indexedDbService.deleteCalculator(calculator.id);
      })
    }

    let subDirectories: Array<Directory>
    if (!isWorkingDir) {
      subDirectories = this.directoryDbService.getSubDirectoriesById(directory.id);
    } else {
      subDirectories = directory.subDirectory;
    }
    if (subDirectories) {
      subDirectories.forEach(dir => {
        this.deleteDirectory(dir);
      })
    }
  }

  deleteAssessment(assessment: Assessment) {
    let settings: Settings = this.settingsDbService.getByAssessmentId(assessment.id);
    if (settings) {
      this.indexedDbService.deleteSettings(settings.id);
    }
    let calculator: Calculator = this.calculatorDbService.getByAssessmentId(assessment.id);
    if (calculator) {
      this.indexedDbService.deleteCalculator(calculator.id);
    }
  }

}
