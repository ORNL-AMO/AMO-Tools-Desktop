import { Injectable } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import * as _ from 'lodash';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, firstValueFrom, map, mergeMap, Observable } from 'rxjs';
import { AssessmentStoreMeta } from './dbConfig';
import { UpdateDataService } from '../shared/helper-services/update-data.service';
import { environment } from '../../environments/environment';
import { CalculatorDbService } from './calculator-db.service';
import { Calculator } from '../shared/models/calculators';
declare const packageJson;

@Injectable()
export class AssessmentDbService {

  allAssessments: Array<Assessment>;
  dbAssessments: BehaviorSubject<Array<Assessment>>;
  storeName: string = AssessmentStoreMeta.store;

  constructor(
    private dbService: NgxIndexedDBService, private updateDataService: UpdateDataService, private calculatorDbService: CalculatorDbService) {
      this.dbAssessments = new BehaviorSubject<Array<Assessment>>([]);
  }
  
  async setAll(assessments?: Array<Assessment>) {
    if (assessments) {
      this.allAssessments = assessments;
    } else {
      this.allAssessments = await firstValueFrom(this.getAllAssessments());
    }
    this.dbAssessments.next(this.allAssessments);
  }

  getAllAssessments(): Observable<Assessment[]> {
    return this.dbService.getAll(this.storeName).pipe(
      mergeMap(async (assessments: Array<Assessment>) => {
        for await (let assessment of assessments) {
          if (assessment.appVersion !== environment.version) {
            this.updateDataService.updateAssessmentVersion(assessment);
            await firstValueFrom(this.updateWithObservable(assessment));
            let assessmentCalculators: Calculator = this.calculatorDbService.getByAssessmentId(assessment.id);
            let updatedAssessmentCalculators = this.updateDataService.updateAssessmentCalculatorVersion(assessmentCalculators);
            if (updatedAssessmentCalculators) {
              this.calculatorDbService.saveAssessmentCalculator(assessment, updatedAssessmentCalculators);
            }
          }
        }
        return assessments;
      }));
  }

  findById(id: number): Assessment {
    let selectedAssessment: Assessment = _.find(this.allAssessments, (assessment) => { return assessment.id === id; });
    return selectedAssessment;
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

  addWithObservable(assessment: Assessment): Observable<any> {
    assessment.createdDate = new Date();
    assessment.modifiedDate = new Date();
    return this.dbService.add(this.storeName, assessment);
  }

  deleteByIdWithObservable(assessmentId: number): Observable<any> {
    return this.dbService.delete(this.storeName, assessmentId);
  }

  bulkDeleteWithObservable(assessmentIds: Array<number>): Observable<any> {
    // ngx-indexed-db returns Array<Array<T>>
    return this.dbService.bulkDelete(this.storeName, assessmentIds);
  }

  
  clearAllWithObservable(): Observable<any> {
    // ngx-indexed-db returns Array<Array<T>>
    return this.dbService.clear(this.storeName);
  }

  updateWithObservable(assessment: Assessment): Observable<Assessment> {
    assessment.modifiedDate = new Date();
    return this.dbService.update(this.storeName, assessment);
  }


}
