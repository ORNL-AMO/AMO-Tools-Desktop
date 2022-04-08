import { Injectable } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import * as _ from 'lodash';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom, Observable } from 'rxjs';
import { AssessmentStoreMeta } from './dbConfig';

@Injectable()
export class AssessmentDbService {

  allAssessments: Array<Assessment>;
  storeName: string = AssessmentStoreMeta.store;

  constructor(
    private dbService: NgxIndexedDBService) {
  }
  
  async setAll(assessments?: Array<Assessment>) {
    if (assessments) {
      this.allAssessments = assessments;
    } else {
      this.allAssessments = await firstValueFrom(this.getAllAssessments());
    }
  }

  getAll(): Array<Assessment> {
    return this.allAssessments;
  }

  getAllAssessments(): Observable<any> {
    return this.dbService.getAll(this.storeName);
  }

  findById(id: number): Assessment {
    let selectedAssessment: Assessment = _.find(this.allAssessments, (assessment) => { return assessment.id === id; });
    return selectedAssessment;
  }

  getById(assessmentId: number): Observable<Assessment> {
    return this.dbService.getByKey(this.storeName, assessmentId);
  }

  getByDirectoryId(id: number): Array<Assessment> {
    let selectedAssessments: Array<Assessment> = _.filter(this.allAssessments, (assessment) => { return assessment.directoryId === id; });
    return selectedAssessments;
  }

  getExample(exampleType: string): Assessment {
    let example: Assessment = this.allAssessments.find(assessment => {
      return assessment.isExample == true && assessment.type == exampleType;
    });
    return example;
  }


  add(assessment: Assessment) {
    assessment.createdDate = new Date();
    assessment.modifiedDate = new Date();
    this.dbService.add(this.storeName, assessment);
  }

  addWithObservable(assessment: Assessment): Observable<any> {
    assessment.createdDate = new Date();
    assessment.modifiedDate = new Date();
    return this.dbService.add(this.storeName, assessment);
  }

  deleteById(assessmentId: number) {
    this.dbService.delete(this.storeName, assessmentId);
  }

  deleteByIdWithObservable(assessmentId: number): Observable<any> {
    return this.dbService.delete(this.storeName, assessmentId);
  }

  bulkDeleteWithObservable(assessmentIds: Array<number>): Observable<any> {
    return this.dbService.bulkDelete(this.storeName, assessmentIds);
  }

  updateWithObservable(assessment: Assessment): Observable<any> {
    assessment.modifiedDate = new Date();
    return this.dbService.update(this.storeName, assessment);
  }


}
