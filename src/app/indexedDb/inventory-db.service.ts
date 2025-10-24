import { Injectable } from '@angular/core';
import { InventoryItem } from '../shared/models/inventory/inventory';
import * as _ from 'lodash';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { InventoryStoreMeta } from './dbConfig';

@Injectable()
export class InventoryDbService {

  allInventoryItems: Array<InventoryItem>;
  dbInventories: BehaviorSubject<Array<InventoryItem>>;
  storeName: string = InventoryStoreMeta.store;
  constructor(private dbService: NgxIndexedDBService) { 
    this.dbInventories = new BehaviorSubject<Array<InventoryItem>>([]);
  }

  async setAll(inventoryItems?: Array<InventoryItem>) {
    if (inventoryItems) {
      this.allInventoryItems = inventoryItems;
    } else {
      this.allInventoryItems = await firstValueFrom(this.getAllInventory());
    }
    this.dbInventories.next(this.allInventoryItems);
  }

  getAllInventory(): Observable<any> {
    return this.dbService.getAll(this.storeName);
  }

  getById(id: number): InventoryItem {
    let selectedInventoryItem: InventoryItem = _.find(this.allInventoryItems, (inventoryItem) => { return inventoryItem.id == id; });
    return selectedInventoryItem;
  }

  getByDirectoryId(id: number): Array<InventoryItem> {
    let selectedInventoryItem: Array<InventoryItem> = _.filter(this.allInventoryItems, (inventoryItem) => { return inventoryItem.directoryId == id; });
    return selectedInventoryItem;
  }

  getMotorInventoryExample(): InventoryItem {
    let examples: Array<InventoryItem> = _.filter(JSON.parse(JSON.stringify(this.allInventoryItems)), (inventoryItem: InventoryItem) => {
      return inventoryItem.isExample
    });
    let tmpExample: InventoryItem;
    if (examples) {
      examples.forEach(example => {
        if (example.type == 'motorInventory') {
          tmpExample = example;
        }
      })
    }
    return tmpExample;
  }

  getPumpInventoryExample(): InventoryItem {
    let examples: Array<InventoryItem> = _.filter(JSON.parse(JSON.stringify(this.allInventoryItems)), (inventoryItem: InventoryItem) => {
      return inventoryItem.isExample
    });
    let tmpExample: InventoryItem;
    if (examples) {
      examples.forEach(example => {
        if (example.type == 'pumpInventory') {
          tmpExample = example;
        }
      })
    }
    return tmpExample;
  }

  getCompressedAirInventoryExample(): InventoryItem {
    let examples: Array<InventoryItem> = _.filter(JSON.parse(JSON.stringify(this.allInventoryItems)), (inventoryItem: InventoryItem) => {
      return inventoryItem.isExample
    });
    let tmpExample: InventoryItem;
    if (examples) {
      examples.forEach(example => {
        if (example.type == 'compressedAirInventory') {
          tmpExample = example;
        }
      })
    }
    return tmpExample;
  }

  deleteByIdWithObservable(inventoryId: number): Observable<any> {
    return this.dbService.delete(this.storeName, inventoryId);
  }

  updateWithObservable(inventory: InventoryItem): Observable<InventoryItem> {
    inventory.modifiedDate = new Date();
    return this.dbService.update(this.storeName, inventory);
  }

  addWithObservable(inventory: InventoryItem): Observable<any> {
    inventory.createdDate = new Date();
    inventory.modifiedDate = new Date();
    return this.dbService.add(this.storeName, inventory);
  }

  bulkDeleteWithObservable(inventoryIds: Array<number>): Observable<any> {
    // ngx-indexed-db returns Array<Array<T>>
    return this.dbService.bulkDelete(this.storeName, inventoryIds);
  }


  clearAllWithObservable(): Observable<any> {
    // ngx-indexed-db returns Array<Array<T>>
    return this.dbService.clear(this.storeName);
  }
}
