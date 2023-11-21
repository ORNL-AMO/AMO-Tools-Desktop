import { Injectable } from '@angular/core';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { MotorInventoryService } from '../motor-inventory/motor-inventory.service';
import { environment } from '../../environments/environment';

import { PumpInventoryService } from '../pump-inventory/pump-inventory.service';
@Injectable()
export class InventoryService {

  constructor(private motorInventoryService: MotorInventoryService, private pumpInventoryService: PumpInventoryService) { }


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
}
