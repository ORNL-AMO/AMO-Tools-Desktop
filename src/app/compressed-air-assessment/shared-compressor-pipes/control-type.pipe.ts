import { Pipe, PipeTransform } from '@angular/core';
import { GenericCompressorDbService } from '../generic-compressor-db.service';

@Pipe({
    name: 'controlType',
    standalone: false
})
export class ControlTypePipe implements PipeTransform {
  
  constructor(private genericCompressorDbService: GenericCompressorDbService) { }

  transform(value: number): string {
    let label: string = this.genericCompressorDbService.getControlTypeLabel(value);
    if (label) {
      return label;
    } else {
      return '';
    }
  }

}
