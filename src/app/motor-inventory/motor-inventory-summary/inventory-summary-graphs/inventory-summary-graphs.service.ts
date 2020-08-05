import { Injectable } from '@angular/core';
import { MotorInventoryData, MotorItem } from '../../motor-inventory';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { MotorField } from '../inventory-summary-table/inventory-summary-table.service';

@Injectable()
export class InventorySummaryGraphsService {

  selectedField: BehaviorSubject<MotorField>
  graphType: BehaviorSubject<string>;
  constructor() {
    this.selectedField = new BehaviorSubject(undefined);
    this.graphType = new BehaviorSubject<string>('bar');
  }

  getBinData(motorInventoryData: MotorInventoryData, motorField :MotorField): { xData: Array<any>, yData: Array<any> } {
    console.log(motorField);
    let motors: Array<MotorItem> = new Array();
    motorInventoryData.departments.forEach(department => {
      department.catalog.forEach(motor => {
        motors.push(motor);
      })
    });
    // let sorted = _.sortBy(motors, [(motor) => { return motor[motorField.group][motorField.value] }]);
    // sorted.forEach(item => {
    //   console.log(item[motorField.group][motorField.value])
    // });
    let count = _.countBy(motors, (motor) => { return motor[motorField.group][motorField.value] });
    let xData: Array<any> = new Array();
    let yData: Array<any> = new Array();
    Object.keys(count).forEach((key, index) => {
      let label = key;
      if(motorField.unit){
        label = label + ' ' + motorField.unit;
      } else if(key == null){
        label = 'N/A';
      } else {
        label = label + ' ';
      }
      xData.push(label);
      yData.push(count[key]);
    });
    return { xData: xData, yData: yData };
  }
}