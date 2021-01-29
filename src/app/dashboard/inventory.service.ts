import { Injectable } from '@angular/core';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { MotorInventoryService } from '../motor-inventory/motor-inventory.service';
declare const packageJson;
@Injectable()
export class InventoryService {

  constructor(private motorInventoryService: MotorInventoryService) { }


  getNewMotorInventoryItem(): InventoryItem{
    return {
      motorInventoryData: this.motorInventoryService.initInventoryData(),
      createdDate: new Date(),
      modifiedDate: new Date(),
      type: 'motorInventory',
      name: null,
      appVersion:  packageJson.version,
      isExample: false
    }
  }
}
