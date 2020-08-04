import { Injectable } from '@angular/core';
import { MotorInventoryData, MotorItem } from '../../motor-inventory';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class InventorySummaryGraphsService {

  selectedField: BehaviorSubject<{
    display: string, value: string, group: string
  }>
  constructor() {
    this.selectedField = new BehaviorSubject({
      group: 'nameplateData',
      value: 'ratedMotorPower',
      display: 'Rated Motor Power'
    });
  }

  getBinData(motorInventoryData: MotorInventoryData, group: string, field: string): { xData: Array<any>, yData: Array<any> } {
    let motors: Array<MotorItem> = new Array();
    motorInventoryData.departments.forEach(department => {
      department.catalog.forEach(motor => {
        motors.push(motor);
      })
    });
    let count = _.countBy(motors, (motor) => { return motor[group][field] });
    let xData: Array<any> = new Array();
    let yData: Array<any> = new Array();
    Object.keys(count).forEach((key, index) => {
      xData.push(key + ' hp');
      yData.push(count[key]);
    });
    return { xData: xData, yData: yData };
  }
}