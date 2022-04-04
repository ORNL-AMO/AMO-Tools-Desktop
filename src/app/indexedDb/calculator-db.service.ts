import { Injectable } from '@angular/core';
import { Calculator } from '../shared/models/calculators';
import * as _ from 'lodash';
import { firstValueFrom, Observable } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CalculatorStoreMeta } from './dbConfig';
import { Assessment } from '../shared/models/assessment';

@Injectable()
export class CalculatorDbService {
  allCalculators: Array<Calculator>;
  isSaving: boolean = false;
  storeName: string = CalculatorStoreMeta.store;
  constructor(private dbService: NgxIndexedDBService) {}

  async setAll(calculators?: Array<Calculator>) {
    if (calculators) {
      this.allCalculators = calculators;
    } else {
      this.allCalculators = await firstValueFrom(this.getAllCalculators());
    }
  }

  async setAllWithObservable() {
    let allCalculators$ = this.getAllCalculators();
    this.allCalculators = await firstValueFrom(allCalculators$);
    return this.getAllCalculators();
  }


  getAll() {
    return this.allCalculators;
  }

  getAllCalculators(): Observable<Array<Calculator>> {
    return this.dbService.getAll(this.storeName);
  }

  getById(id: number): Calculator {
    let selectedCalculator: Calculator = _.find(this.allCalculators, (calculator) => { return id === calculator.id; });
    return selectedCalculator;
  }

  getByDirectoryId(id: number): Array<Calculator> {
    let selectedCalculator: Array<Calculator> = _.filter(this.allCalculators, (calculator) => { return calculator.directoryId === id; });
    return selectedCalculator;
  }

  getByAssessmentId(id: number): Calculator {
    let selectedCalculator: Calculator = _.find(this.allCalculators, (calculator) => { return calculator.assessmentId === id; });
    return selectedCalculator;
  }

  add(calculator: Calculator): void {
    calculator.createdDate = new Date();
    calculator.modifiedDate = new Date();
    this.dbService.add(this.storeName, calculator);
  }

  addWithObservable(calculator: Calculator): Observable<any> {
    calculator.createdDate = new Date();
    calculator.modifiedDate = new Date();
    return this.dbService.add(this.storeName, calculator);
  }

  updateWithObservable(calculator: Calculator): Observable<any> {
    calculator.modifiedDate = new Date(new Date().toLocaleDateString());
    return this.dbService.update(this.storeName, calculator);
  }
  
  deleteById(calculatorId: number) {
    this.dbService.delete(this.storeName, calculatorId);
  }

  deleteByIdWithObservable(calculatorId: number) {
    return this.dbService.delete(this.storeName, calculatorId);
  }

  bulkDeleteWithObservable(calculatorIds: Array<number>): Observable<any> {
    return this.dbService.bulkDelete(this.storeName, calculatorIds);
  }

  async saveAssessmentCalculator(assessment: Assessment, assessmentCalculator: Calculator){
    if (!this.isSaving) {
      if (assessmentCalculator.id) {
        let calculators: Calculator[] = await firstValueFrom(this.updateWithObservable(assessmentCalculator));
        this.setAll(calculators);
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
}
