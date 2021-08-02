import { Pipe, PipeTransform } from '@angular/core';
import { CompressorInventoryItem } from '../shared/models/compressed-air-assessment';

@Pipe({
  name: 'compressorName'
})
export class CompressorNamePipe implements PipeTransform {

  transform(compressorId: string, compressorInventoryItems: Array<CompressorInventoryItem>): string {
    let compressor: CompressorInventoryItem = compressorInventoryItems.find(item => {return item.itemId == compressorId});
    if(compressor){
      return compressor.name
    }else{
      return '';
    }
  }

}
