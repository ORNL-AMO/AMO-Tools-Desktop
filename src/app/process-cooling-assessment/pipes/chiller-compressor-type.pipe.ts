import { Pipe, PipeTransform } from '@angular/core';
import { CompressorChillerTypeEnum } from '../../shared/models/process-cooling-assessment';
import { CompressorChillerTypes } from '../process-cooling-constants';

@Pipe({
  name: 'chillerCompressorType',
  standalone: false
})
export class ChillerCompressorTypePipe implements PipeTransform {
  transform(value: number): string {
    const compressorType = value as CompressorChillerTypeEnum;
    const label: string = CompressorChillerTypes[compressorType];
    if (label) {
      return label;
    } else {
      return '';
    }
  }
}
