import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirItem } from '../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';

@Injectable()
export class CompressedAirCatalogService {

  selectedSystemId: BehaviorSubject<string>;
  selectedCompressedAirItem: BehaviorSubject<CompressedAirItem>;
  constructor(private compressedAirInventoryService: CompressedAirInventoryService) {
    this.selectedSystemId = new BehaviorSubject<string>(undefined);
    this.selectedCompressedAirItem = new BehaviorSubject<CompressedAirItem>(undefined);
  }

  getUpdatedSelectedCompressedAirItem(): CompressedAirItem {
    let compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue()
    let selectedCompressedAirItem = this.selectedCompressedAirItem.getValue();
    let system = compressedAirInventoryData.systems.find(system => { return system.id == selectedCompressedAirItem.systemId });
    selectedCompressedAirItem = system.catalog.find(compressedAirItem => { return compressedAirItem.id == selectedCompressedAirItem.id });
    return selectedCompressedAirItem;
  }

}
