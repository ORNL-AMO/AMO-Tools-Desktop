import { Injectable } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { IndexedDbService } from './indexed-db.service';
import * as _ from 'lodash';


@Injectable()
export class AssessmentDbService {

  allAssessments: Array<Assessment>;
  constructor(private indexedDbService: IndexedDbService) { }

  setAll() {
    this.indexedDbService.getAllAssessments().then(assessments => {
      this.allAssessments = assessments;
    })
  }

  getAll(): Array<Assessment> {
    return this.allAssessments;
  }

  getById(id: number): Assessment {
    let selectedAssessment: Assessment = _.find(this.allAssessments, (assessment) => { return assessment.id == id })
    return selectedAssessment;
  }

  getByDirectoryId(id: number): Array<Assessment> {
    let selectedAssessments: Array<Assessment> = _.filter(this.allAssessments, (assessment) => { return assessment.directoryId == id });
    return selectedAssessments;
  }

}
