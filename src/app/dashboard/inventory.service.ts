import { Injectable } from '@angular/core';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { MotorInventoryService } from '../motor-inventory/motor-inventory.service';
import { environment } from '../../environments/environment';

import { PumpInventoryService } from '../pump-inventory/pump-inventory.service';
import { CompressedAirInventoryService } from '../compressed-air-inventory/compressed-air-inventory.service';
@Injectable()
export class InventoryService {

  constructor(private motorInventoryService: MotorInventoryService, private pumpInventoryService: PumpInventoryService, private compressedAirInventoryService: CompressedAirInventoryService) { }


  getNewMotorInventoryItem(): InventoryItem{
    return {
      motorInventoryData: this.motorInventoryService.initInventoryData(),
      createdDate: new Date(),
      modifiedDate: new Date(),
      type: 'motorInventory',
      name: null,
      appVersion:  environment.version,
      isExample: false
    }
  }

  getNewPumpInventoryItem(): InventoryItem {
    return {
      pumpInventoryData: this.pumpInventoryService.initInventoryData(),
      createdDate: new Date(),
      modifiedDate: new Date(),
      type: 'pumpInventory',
      name: null,
      appVersion:  environment.version,
      isExample: false
    }
  }

  getNewCompressedAirInventoryItem(): InventoryItem {
    return {
      compressedAirInventoryData: this.compressedAirInventoryService.initInventoryData(),
      createdDate: new Date(),
      modifiedDate: new Date(),
      type: 'compressedAirInventory',
      name: null,
      appVersion:  environment.version,
      isExample: false
    }
  }
}
