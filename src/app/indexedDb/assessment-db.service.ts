import { Injectable } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { IndexedDbService } from './indexed-db.service';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class AssessmentDbService {

  allAssessments: Array<Assessment>;
  constructor(private indexedDbService: IndexedDbService) {
  }

  setAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indexedDbService.getAllAssessments().then(assessments => {
        this.allAssessments = assessments;
        resolve(true)
      })
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
