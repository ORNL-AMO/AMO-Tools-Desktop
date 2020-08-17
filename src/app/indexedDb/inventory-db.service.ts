import { Injectable } from '@angular/core';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { IndexedDbService } from './indexed-db.service';
import * as _ from 'lodash';

@Injectable()
export class InventoryDbService {

  allInventoryItems: Array<InventoryItem>;
  constructor(private indexedDbService: IndexedDbService) { }
  setAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.indexedDbService.db) {
        this.indexedDbService.getAllInventoryItems().then(inventoryItems => {
          this.allInventoryItems = inventoryItems;
          resolve(true);
        });
      } else {
        this.allInventoryItems = [];
        resolve(false);
      }
    });
  }

  getAll(): Array<InventoryItem> {
    return this.allInventoryItems;
  }

  getById(id: number): InventoryItem {
    let selectedInventoryItem: InventoryItem = _.find(this.allInventoryItems, (inventoryItem) => { return inventoryItem.id === id; });
    return selectedInventoryItem;
  }

  getByDirectoryId(id: number): Array<InventoryItem> {
    let selectedInventoryItem: Array<InventoryItem> = _.filter(this.allInventoryItems, (inventoryItem) => { return inventoryItem.directoryId === id; });
    return selectedInventoryItem;
  }
}
