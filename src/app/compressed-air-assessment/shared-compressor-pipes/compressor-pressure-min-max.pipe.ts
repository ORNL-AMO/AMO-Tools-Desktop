import { Pipe, PipeTransform } from '@angular/core';
import { CompressorInventoryItem } from '../../shared/models/compressed-air-assessment';
import { getCompressorPressureMinMax } from '../calculations/caCalculationHelpers';
import { Settings } from '../../shared/models/settings';

@Pipe({
  name: 'compressorPressureMinMax',
  standalone: false
})
export class CompressorPressureMinMaxPipe implements PipeTransform {

  transform(compressorInventoryItem: CompressorInventoryItem, settings: Settings): string  {
    let minMax: { min: number, max: number } = getCompressorPressureMinMax(compressorInventoryItem.compressorControls.controlType, compressorInventoryItem.performancePoints);
    let unit: string = ' psig';
    if (settings.unitsOfMeasure == 'Metric') {
      unit = ' barg';
    }
    return minMax.min + ' - ' + minMax.max + unit;
  }
}
