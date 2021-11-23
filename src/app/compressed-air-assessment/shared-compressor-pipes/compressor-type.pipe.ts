import { Pipe, PipeTransform } from '@angular/core';
import { GenericCompressorDbService } from '../generic-compressor-db.service';

@Pipe({
  name: 'compressorType'
})
export class CompressorTypePipe implements PipeTransform {

  constructor(private genericCompressorDbService: GenericCompressorDbService) { }

  transform(value: number): string {
    let label: string = this.genericCompressorDbService.getCompressorTypeLabel(value);
    if (label) {
      return label;
    } else {
      return '';
    }
  }

}
