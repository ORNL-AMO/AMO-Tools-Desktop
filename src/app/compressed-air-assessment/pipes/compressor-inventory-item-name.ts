import { Pipe, PipeTransform } from '@angular/core';
import { CompressorInventoryItem } from '../../shared/models/compressed-air-assessment';

@Pipe({
    name: 'compressorInventoryItemName',
    standalone: false
})
export class CompressorInventoryItemNamePipe implements PipeTransform {

  transform(itemId: string, compressorInventoryItems: Array<CompressorInventoryItem>): string { 
    return compressorInventoryItems.find(item => { return item.itemId == itemId})?.name;
  }
}
