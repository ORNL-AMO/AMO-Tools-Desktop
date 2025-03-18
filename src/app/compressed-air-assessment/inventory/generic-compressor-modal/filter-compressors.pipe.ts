import { Pipe, PipeTransform } from '@angular/core';
import { GenericCompressor } from '../../generic-compressor-db.service';
import * as _ from 'lodash';

@Pipe({
    name: 'filterCompressors',
    pure: false,
    standalone: false
})
export class FilterCompressorsPipe implements PipeTransform {

  transform(compressorOptions: Array<GenericCompressor>, filterCompressorOptions: FilterCompressorOptions): Array<GenericCompressor> {
    let compressorOptionsCopy: Array<GenericCompressor> = JSON.parse(JSON.stringify(compressorOptions));
    if (filterCompressorOptions) {
      compressorOptionsCopy = _.filter(compressorOptionsCopy, (compressorOption) => {
        return this.checkFilterCompressorOption(compressorOption, filterCompressorOptions);
      });
    }
    return compressorOptionsCopy;
  }

  checkFilterCompressorOption(compressorOption: GenericCompressor, filterCompressorOptions: FilterCompressorOptions): boolean {
    let isInRange: boolean = true;
    //IDCompType
    if (filterCompressorOptions.IDCompType != undefined && compressorOption.IDCompType != filterCompressorOptions.IDCompType) {
      isInRange = false;
    }
    //IDControlType
    if (filterCompressorOptions.IDControlType != undefined && compressorOption.IDControlType != filterCompressorOptions.IDControlType) {
      isInRange = false;
    }
    //HP
    if (filterCompressorOptions.HP != undefined && compressorOption.HP != filterCompressorOptions.HP) {
      isInRange = false;
    }
    //RatedCapacity
    if (filterCompressorOptions.ratedCapacityMin > compressorOption.RatedCapacity || filterCompressorOptions.ratedCapacityMax < compressorOption.RatedCapacity) {
      isInRange = false;
    }
    //Rated Pressure
    if (filterCompressorOptions.ratedPressureMin > compressorOption.RatedPressure || filterCompressorOptions.ratedPressureMax < compressorOption.RatedPressure) {
      isInRange = false;
    }
    //Max Full Flow
    if (filterCompressorOptions.maxFullFlowMin > compressorOption.MaxFullFlowPressure || filterCompressorOptions.maxFullFlowMax < compressorOption.MaxFullFlowPressure) {
      isInRange = false;
    }
    return isInRange;
  }

}


export interface FilterCompressorOptions {
  IDCompType: number,
  IDControlType: number,
  HP: number,
  ratedCapacityMin: number,
  ratedCapacityMax: number,
  ratedPressureMin: number,
  ratedPressureMax: number,
  maxFullFlowMin: number,
  maxFullFlowMax: number,
  unitsOfMeasure: string
}