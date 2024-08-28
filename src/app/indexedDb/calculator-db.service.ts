import { Injectable } from '@angular/core';
import { Calculator } from '../shared/models/calculators';
import * as _ from 'lodash';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CalculatorStoreMeta } from './dbConfig';
import { Assessment } from '../shared/models/assessment';

@Injectable()
export class CalculatorDbService {
  allCalculators: Array<Calculator>;
  isSaving: boolean = false;
  storeName: string = CalculatorStoreMeta.store;
  dbCalculators: BehaviorSubject<Array<Calculator>>;

  constructor(private dbService: NgxIndexedDBService) {
    this.dbCalculators = new BehaviorSubject<Array<Calculator>>([]);
  }

  async setAll(calculators?: Array<Calculator>) {
    if (calculators) {
      this.allCalculators = calculators;
    } else {
      this.allCalculators = await firstValueFrom(this.getAllCalculators());
    }
    this.dbCalculators.next(this.allCalculators);
  }

  getAllCalculators(): Observable<Array<Calculator>> {
    return this.dbService.getAll(this.storeName);
  }

  getByDirectoryId(id: number): Array<Calculator> {
    let selectedCalculator: Array<Calculator> = _.filter(this.allCalculators, (calculator) => { return calculator.directoryId === id; });
    return selectedCalculator;
  }

  getByAssessmentId(id: number): Calculator {
    let selectedCalculator: Calculator = _.find(this.allCalculators, (calculator) => { return calculator.assessmentId === id; });
    return selectedCalculator;
  }

  addWithObservable(calculator: Calculator): Observable<any> {
    calculator.createdDate = new Date();
    calculator.modifiedDate = new Date();
    return this.dbService.add(this.storeName, calculator);
  }

  updateWithObservable(calculator: Calculator): Observable<Calculator> {
    calculator.modifiedDate = new Date(new Date().toLocaleDateString());
    return this.dbService.update(this.storeName, calculator);
  }
  
  deleteByIdWithObservable(calculatorId: number) {
    return this.dbService.delete(this.storeName, calculatorId);
  }

  bulkDeleteWithObservable(calculatorIds: Array<number>): Observable<any> {
    // ngx-indexed-db returns Array<Array<T>>
    return this.dbService.bulkDelete(this.storeName, calculatorIds);
  }

  async saveAssessmentCalculator(assessment: Assessment, assessmentCalculator: Calculator){
    if (!this.isSaving) {
      if (assessmentCalculator.id) {
        await firstValueFrom(this.updateWithObservable(assessmentCalculator));
        let allCalculators: Calculator[] = await firstValueFrom(this.getAllCalculators());
        this.setAll(allCalculators);
      } else {
        this.isSaving = true;
        assessmentCalculator.assessmentId = assessment.id;
        let addedCalculator: Calculator = await firstValueFrom(this.addWithObservable(assessmentCalculator));
        this.setAll();
        assessmentCalculator.id = addedCalculator.id;
        this.isSaving = false;
      }
    }
  }

  clearAllWithObservable(): Observable<any> {
    // ngx-indexed-db returns Array<Array<T>>
    return this.dbService.clear(this.storeName);
  }
}
