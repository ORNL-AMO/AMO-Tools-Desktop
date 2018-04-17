import { Injectable } from '@angular/core';
import { Calculator } from '../shared/models/calculators';
import { IndexedDbService } from './indexed-db.service';
import * as _ from 'lodash';
@Injectable()
export class CalculatorDbService {
  allCalculators: Array<Calculator>;
  constructor(private indexedDbService: IndexedDbService) { 
    // this.indexedDbService.setAllCalcs.subscribe()
  }

  setAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indexedDbService.getAllCalculator().then(calculators => {
        this.allCalculators = calculators;
        console.log('got all');
        resolve(true)
      })
    })
  }

  getAll() {
    return this.allCalculators;
  }

  getById(id: number): Calculator {
    let selectedCalculator: Calculator = _.find(this.allCalculators, (calculator) => { return id == calculator.id })
    return selectedCalculator;
  }

  getByDirectoryId(id: number): Array<Calculator> {
    let selectedCalculator: Array<Calculator> = _.filter(this.allCalculators, (calculator) => { return calculator.directoryId == id });
    return selectedCalculator;
  }

  getByAssessmentId(id: number): Calculator {
    let selectedCalculator: Calculator = _.find(this.allCalculators, (calculator) => { return calculator.assessmentId == id });
    return selectedCalculator;
  }
}
