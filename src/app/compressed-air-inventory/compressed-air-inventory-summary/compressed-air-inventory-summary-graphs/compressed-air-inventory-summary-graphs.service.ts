import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirField, CompressedAirSummaryService } from '../compressed-air-inventory-summary.service';
import { CompressedAirInventoryData, CompressedAirItem } from '../../compressed-air-inventory';
import _ from 'lodash';

@Injectable()
export class CompressedAirInventorySummaryGraphsService {
  selectedField: BehaviorSubject<CompressedAirField>;
  graphType: BehaviorSubject<string>;
  constructor(private compressedAirSummaryService: CompressedAirSummaryService) {
    this.selectedField = new BehaviorSubject(undefined);
    this.graphType = new BehaviorSubject<string>('bar');
  }
  getBinData(compressedAirInventoryData: CompressedAirInventoryData, compressedAirField: CompressedAirField): { xData: Array<any>, yData: Array<number> } {
    let compressors: Array<CompressedAirItem> = this.compressedAirSummaryService.getAllCompressors(compressedAirInventoryData);
    let fieldCount: _.Dictionary<number> = _.countBy(compressors, (compresser) => { return compresser[compressedAirField.group][compressedAirField.value] });
    let xData: Array<any> = new Array();
    let yData: Array<any> = new Array();
    Object.keys(fieldCount).forEach((fieldValue: string, index: number) => {
      let label: string = this.getLabel(fieldValue, compressedAirField);
      xData.push(label);
      yData.push(fieldCount[fieldValue]);
    });
    return { xData: xData, yData: yData };
  }


  getLabel(key: string, compressedAirField: CompressedAirField): string {
    let label = key;
    // if (compressedAirField.value == 'motorEfficiencyClass') {
    //   let motorEfficiencyClass = motorEfficiencyConstants.find(constant => { return constant.value == Number(key) });
    //   if (motorEfficiencyClass) {
    //     label = motorEfficiencyClass.display;
    //   } else {
    //     label = 'N/A';
    //   }
    // } else if (compressedAirField.value == 'driveType') {
    //   let driveType = pumpInventoryDriveConstants.find(constant => { return constant.value == Number(key) });
    //   if (driveType) {
    //     label = driveType.display;
    //   } else {
    //     label = 'N/A';
    //   }
    // } else if (compressedAirField.value == 'pumpType') {
    //   let pumpType = pumpTypesConstant.find(constant => { return constant.value == Number(key) });
    //   if (pumpType) {
    //     label = pumpType.display;
    //   } else {
    //     label = 'N/A';
    //   }
    // }
    // else if (compressedAirField.value == 'shaftOrientation') {
    //   let shaftOrientation = pumpInventoryShaftOrientations.find(constant => { return constant.value == Number(key) });
    //   if (shaftOrientation) {
    //     label = shaftOrientation.display;
    //   } else {
    //     label = 'N/A';
    //   }
    // }
    // else if (compressedAirField.value == 'shaftSealType') {
    //   let shaftSealType = pumpInventoryShaftSealTypes.find(constant => { return constant.value == Number(key) });
    //   if (shaftSealType) {
    //     label = shaftSealType.display;
    //   } else {
    //     label = 'N/A';
    //   }
    // }
    // else if (compressedAirField.value == 'priority') {
    //   let priority = priorityTypes.find(constant => { return constant.value == Number(key) });
    //   if (priority) {
    //     label = priority.display;
    //   } else {
    //     label = 'N/A';
    //   }
    // }
    // else if (compressedAirField.value == 'status') {
    //   let status = statusTypes.find(constant => { return constant.value == Number(key) });
    //   if (status) {
    //     label = status.display;
    //   } else {
    //     label = 'N/A';
    //   }
    // }
    // else if (key == 'null' || key == 'undefined') {
    //   label = 'N/A';
    // } else if (key == 'true') {
    //   label = 'Yes';
    // } else if (key == 'false') {
    //   label = 'No';
    // }
    return label;
  }

}
