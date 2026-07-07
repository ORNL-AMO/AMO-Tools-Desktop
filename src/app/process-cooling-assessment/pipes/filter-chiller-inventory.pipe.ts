import { Pipe, PipeTransform } from '@angular/core';
import { ChillerInventoryItem, CompressorChillerTypeEnum } from '../../shared/models/process-cooling-assessment';

@Pipe({
  name: 'filterChillerInventory',
  standalone: false
})
export class FilterChillerInventoryPipe implements PipeTransform {
  transform(inventory: ChillerInventoryItem[], params: FilterChillerInventoryParams): ChillerInventoryItem[] {
    if (!params || params.chillerType === null) {
        return inventory;
    }

    return inventory.filter(item => item.chillerType === params.chillerType);
  }
}


export interface FilterChillerInventoryParams {
    chillerType: CompressorChillerTypeEnum | null;
  };