import { Pipe, PipeTransform } from '@angular/core';
import { CompressorInventoryItem } from '../../shared/models/compressed-air-assessment';
import { InventoryFormService } from '../baseline-tab-content/inventory-setup/inventory/inventory-form.service';

@Pipe({
  name: 'compressorShowShutdownTimer',
  standalone: false
})
export class CompressorShowShutdownTimerPipe implements PipeTransform {

  constructor(private inventoryFormService: InventoryFormService) { }

  transform(compressorId: string, compressorInventoryItems: Array<CompressorInventoryItem>): boolean {
    let compressor: CompressorInventoryItem = compressorInventoryItems.find(item => { return item.itemId == compressorId });
    if (compressor) {
      return this.inventoryFormService.checkDisplayAutomaticShutdown(compressor.compressorControls.controlType);
    } else {
      return false;
    }
  }

}
