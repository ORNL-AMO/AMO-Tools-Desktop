import { Pipe, PipeTransform } from '@angular/core';
import { CompressorInventoryItem } from '../../shared/models/compressed-air-assessment';

@Pipe({
    name: 'compressorItem',
    standalone: false
})
export class CompressorItemPipe implements PipeTransform {

  transform(compressorId: string, compressorInventoryItems: Array<CompressorInventoryItem>): CompressorInventoryItem {
    let compressor: CompressorInventoryItem = compressorInventoryItems.find(item => {return item.itemId == compressorId});
    if(compressor){
      return compressor
    }else{
      return null;
    }
  }

}
