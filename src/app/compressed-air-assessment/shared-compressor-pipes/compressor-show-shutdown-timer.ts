import { Pipe, PipeTransform } from '@angular/core';
import { CompressorInventoryItem } from '../../shared/models/compressed-air-assessment';
import { InventoryService } from '../inventory/inventory.service';

@Pipe({
  name: 'compressorShowShutdownTimer',
  standalone: false
})
export class CompressorShowShutdownTimerPipe implements PipeTransform {

  constructor(private inventoryService: InventoryService) { }

  transform(compressorId: string, compressorInventoryItems: Array<CompressorInventoryItem>): boolean {
    let compressor: CompressorInventoryItem = compressorInventoryItems.find(item => { return item.itemId == compressorId });
    if (compressor) {
      return this.inventoryService.checkDisplayAutomaticShutdown(compressor.compressorControls.controlType);
    } else {
      return false;
    }
  }

}
