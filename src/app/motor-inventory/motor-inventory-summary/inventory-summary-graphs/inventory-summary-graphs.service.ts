import { Injectable } from '@angular/core';
import { MotorInventoryData, MotorItem } from '../../motor-inventory';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { MotorField } from '../inventory-summary-table/inventory-summary-table.service';
import { motorEfficiencyConstants, driveConstants } from '../../../psat/psatConstants';
import { MotorInventorySummaryService } from '../motor-inventory-summary.service';

@Injectable()
export class InventorySummaryGraphsService {

  selectedField: BehaviorSubject<MotorField>
  graphType: BehaviorSubject<string>;
  constructor(private motorInventorySummaryService: MotorInventorySummaryService) {
    this.selectedField = new BehaviorSubject(undefined);
    this.graphType = new BehaviorSubject<string>('bar');
  }

  getBinData(motorInventoryData: MotorInventoryData, motorField: MotorField): { xData: Array<any>, yData: Array<any> } {
    let motors: Array<MotorItem> = this.motorInventorySummaryService.getAllMotors(motorInventoryData);
    // let sorted = _.sortBy(motors, [(motor) => { return motor[motorField.group][motorField.value] }]);
    // sorted.forEach(item => {
    //   console.log(item[motorField.group][motorField.value])
    // });
    let count = _.countBy(motors, (motor) => { return motor[motorField.group][motorField.value] });
    let xData: Array<any> = new Array();
    let yData: Array<any> = new Array();
    Object.keys(count).forEach((key, index) => {
      let label: string = this.getLabel(key, motorField);
      xData.push(label);
      yData.push(count[key]);
    });
    return { xData: xData, yData: yData };
  }

  getLabel(key: string, motorField: MotorField): string {
    let label = key;
    if (motorField.value == 'efficiencyClass') {
      let efficiencyClass = motorEfficiencyConstants.find(constant => { return constant.value == Number(key) });
      if (efficiencyClass) {
        label = efficiencyClass.display;
      } else {
        label = 'N/A';
      }
    } else if (motorField.value == 'driveType') {
      let driveType = driveConstants.find(constant => { return constant.value == Number(key) });
      if (driveType) {
        label = driveType.display;
      } else {
        label = 'N/A';
      }
    }
    // else if (motorField.unit && key != 'null' && key != 'true' && key != 'false') {
    //   label = label + ' ' + motorField.unit;
    //   console.log(label);
    // 
    else if (key == 'null' || key == 'undefined') {
      label = 'N/A';
    } else if (key == 'true') {
      label = 'Yes';
    } else if (key == 'false') {
      label = 'No';
    }
    return label;
  }
}