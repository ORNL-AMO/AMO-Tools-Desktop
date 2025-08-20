import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirField, CompressedAirInventorySummaryService } from '../compressed-air-inventory-summary.service';
import { CompressedAirInventoryData, CompressedAirItem, CompressorTypeOptions, ControlTypes } from '../../compressed-air-inventory';
import _ from 'lodash';

@Injectable()
export class CompressedAirInventorySummaryGraphsService {
  selectedField: BehaviorSubject<CompressedAirField>;
  graphType: BehaviorSubject<string>;
  constructor(private compressedAirInventorySummaryService: CompressedAirInventorySummaryService) {
    this.selectedField = new BehaviorSubject(undefined);
    this.graphType = new BehaviorSubject<string>('bar');
  }
  getBinData(compressedAirInventoryData: CompressedAirInventoryData, compressedAirField: CompressedAirField): { xData: Array<any>, yData: Array<number> } {
    let compressors: Array<CompressedAirItem> = this.compressedAirInventorySummaryService.getAllCompressors(compressedAirInventoryData);
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
    if (compressedAirField.value == 'controlType') {
      let controlType = ControlTypes.find(constant => { return constant.value == Number(key) });
      if (controlType) {
        label = controlType.label;
      } else {
        label = 'N/A';
      }
    }
    else if (compressedAirField.value == 'compressorType') {
      let compressorType = CompressorTypeOptions.find(constant => { return constant.value == Number(key) });
      if (compressorType) {
        label = compressorType.label;
      } else {
        label = 'N/A';
      }
    }
    return label;
  }

}
