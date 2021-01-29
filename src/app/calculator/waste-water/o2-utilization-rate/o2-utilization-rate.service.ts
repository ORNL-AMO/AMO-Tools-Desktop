import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class O2UtilizationRateService {

  inputDataPoints: BehaviorSubject<Array<O2UtilizationDataPoints>>;

  constructor() {
    let initDataPoints: Array<O2UtilizationDataPoints> = this.getInitialDataPoints();
    this.inputDataPoints = new BehaviorSubject<Array<O2UtilizationDataPoints>>(initDataPoints);
  }

  getInitialDataPoints(): Array<O2UtilizationDataPoints>{
    return [
      {time: 0, dissolvedOxygen: 0},
      {time: 10, dissolvedOxygen: 0},
      {time: 20, dissolvedOxygen: 0},
      {time: 30, dissolvedOxygen: 0},
      {time: 40, dissolvedOxygen: 0},
      {time: 50, dissolvedOxygen: 0},
      {time: 60, dissolvedOxygen: 0}
    ]
  }

  getExampleData(): Array<O2UtilizationDataPoints>{
    return [
      {time: 0, dissolvedOxygen: 6.26},
      {time: 10, dissolvedOxygen: 5.97},
      {time: 20, dissolvedOxygen: 5.75},
      {time: 30, dissolvedOxygen: 5.53},
      {time: 40, dissolvedOxygen: 5.33},
      {time: 50, dissolvedOxygen: 5.16},
      {time: 60, dissolvedOxygen: 4.97}
    ];
  }
}


export interface O2UtilizationDataPoints{
  time: number,
  dissolvedOxygen: number
}
