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
      if (this.indexedDbService.db) {
        this.indexedDbService.getAllAssessments().then(assessments => {
          this.allAssessments = assessments;
          console.log(this.allAssessments);
          resolve(true)
        })
      } else {
        this.allAssessments = [];
        resolve(false);
      }
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

  getPhastExample(): Assessment {
    let examples: Array<Assessment> = _.filter(JSON.parse(JSON.stringify(this.allAssessments)), (assessment) => { return assessment.isExample == true });
    let tmpExample: Assessment;
    if (examples) {
      examples.forEach(example => {
        if (example.type == 'PHAST') {
          tmpExample = example
        }
      })
    }
    return tmpExample;
  }

  getFsatExample(): Assessment {
    let examples: Array<Assessment> = _.filter(JSON.parse(JSON.stringify(this.allAssessments)), (assessment) => { return assessment.isExample == true });
    let tmpExample: Assessment;
    if (examples) {
      examples.forEach(example => {
        if (example.type == 'FSAT') {
          tmpExample = example
        }
      })
    }
    return tmpExample;
  }
  getPsatExample(): Assessment {
    let examples: Array<Assessment> = _.filter(JSON.parse(JSON.stringify(this.allAssessments)), (assessment: Assessment) => {
      return (assessment.isExample == true);
    });
    let tmpExample: Assessment;
    if (examples) {
      examples.forEach(example => {
        if (example.type == 'PSAT') {
          tmpExample = example
        }
      })
    }
    return tmpExample;
  }

}
