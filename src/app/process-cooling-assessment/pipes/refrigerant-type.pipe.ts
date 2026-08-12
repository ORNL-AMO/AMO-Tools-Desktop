import { Pipe, PipeTransform } from '@angular/core';
import { RefrigerantType } from '../../shared/models/process-cooling-assessment';
import { Refrigerants } from '../constants/process-cooling-constants';

@Pipe({
  name: 'refrigerantType',
  standalone: false
})
export class RefrigerantTypePipe implements PipeTransform {
  transform(value: number): string {
    const refrigerantType = value as RefrigerantType;
    const label: string = Refrigerants[refrigerantType];
    if (label) {
      return label;
    } else {
      return '';
    }
  }
}
