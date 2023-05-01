import { Injectable } from '@angular/core';
import { PumpField, PumpInventorySummaryService } from '../pump-inventory-summary.service';
import { BehaviorSubject } from 'rxjs';
import { PumpInventoryData, PumpItem } from '../../pump-inventory';
import * as _ from 'lodash';
import { motorEfficiencyConstants, priorityTypes, pumpTypesConstant, statusTypes } from '../../../psat/psatConstants';
import { pumpInventoryDriveConstants, pumpInventoryShaftOrientations, pumpInventoryShaftSealTypes } from '../../pump-inventory.service';

@Injectable()
export class PumpSummaryGraphsService {
  selectedField: BehaviorSubject<PumpField>;
  graphType: BehaviorSubject<string>;
  constructor(private pumpInventorySummaryService: PumpInventorySummaryService) {
    this.selectedField = new BehaviorSubject(undefined);
    this.graphType = new BehaviorSubject<string>('bar');
  }

  getBinData(pumpInventoryData: PumpInventoryData, pumpField: PumpField): { xData: Array<any>, yData: Array<number> } {
    let pumps: Array<PumpItem> = this.pumpInventorySummaryService.getAllPumps(pumpInventoryData);
    let fieldCount: _.Dictionary<number> = _.countBy(pumps, (pump) => { return pump[pumpField.group][pumpField.value] });
    let xData: Array<any> = new Array();
    let yData: Array<any> = new Array();
    Object.keys(fieldCount).forEach((fieldValue: string, index: number) => {
      let label: string = this.getLabel(fieldValue, pumpField);
      xData.push(label);
      yData.push(fieldCount[fieldValue]);
    });
    return { xData: xData, yData: yData };
  }

  getLabel(key: string, pumpField: PumpField): string {
    let label = key;
    if (pumpField.value == 'motorEfficiencyClass') {
      let motorEfficiencyClass = motorEfficiencyConstants.find(constant => { return constant.value == Number(key) });
      if (motorEfficiencyClass) {
        label = motorEfficiencyClass.display;
      } else {
        label = 'N/A';
      }
    } else if (pumpField.value == 'driveType') {
      let driveType = pumpInventoryDriveConstants.find(constant => { return constant.value == Number(key) });
      if (driveType) {
        label = driveType.display;
      } else {
        label = 'N/A';
      }
    } else if (pumpField.value == 'pumpType') {
      let pumpType = pumpTypesConstant.find(constant => { return constant.value == Number(key) });
      if (pumpType) {
        label = pumpType.display;
      } else {
        label = 'N/A';
      }
    }
    else if (pumpField.value == 'shaftOrientation') {
      let shaftOrientation = pumpInventoryShaftOrientations.find(constant => { return constant.value == Number(key) });
      if (shaftOrientation) {
        label = shaftOrientation.display;
      } else {
        label = 'N/A';
      }
    }
    else if (pumpField.value == 'shaftSealType') {
      let shaftSealType = pumpInventoryShaftSealTypes.find(constant => { return constant.value == Number(key) });
      if (shaftSealType) {
        label = shaftSealType.display;
      } else {
        label = 'N/A';
      }
    }
    else if (pumpField.value == 'priority') {
      let priority = priorityTypes.find(constant => { return constant.value == Number(key) });
      if (priority) {
        label = priority.display;
      } else {
        label = 'N/A';
      }
    }
    else if (pumpField.value == 'status') {
      let status = statusTypes.find(constant => { return constant.value == Number(key) });
      if (status) {
        label = status.display;
      } else {
        label = 'N/A';
      }
    }
      else if (key == 'null') {
        label = 'N/A';
      } else if (key == 'true') {
        label = 'Yes';
      } else if (key == 'false') {
        label = 'No';
      }
    return label;
  }
}