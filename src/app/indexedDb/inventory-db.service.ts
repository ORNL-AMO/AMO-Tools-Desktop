import { Injectable } from '@angular/core';
import { InventoryItem } from '../shared/models/inventory/inventory';
import * as _ from 'lodash';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom, Observable } from 'rxjs';
import { InventoryStoreMeta } from './dbConfig';

@Injectable()
export class InventoryDbService {

  allInventoryItems: Array<InventoryItem>;
  storeName: string = InventoryStoreMeta.store;
  constructor(private dbService: NgxIndexedDBService) { }

  async setAll(inventoryItems?: Array<InventoryItem>) {
    if (inventoryItems) {
      this.allInventoryItems = inventoryItems;
    } else {
      this.allInventoryItems = await firstValueFrom(this.getAllInventory());
    }
  }

  async setAllWithObservable(): Promise<any> {
    let allInventoryItems$: Observable<any> = this.getAllInventory();
    this.allInventoryItems = await firstValueFrom(allInventoryItems$);
    return allInventoryItems$;
  }


  getAll(): Array<InventoryItem> {
    return this.allInventoryItems;
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

  deleteById(inventoryId: number) {
    this.dbService.delete(this.storeName, inventoryId);
  }

  deleteByIdWithObservable(inventoryId: number): Observable<any> {
    return this.dbService.delete(this.storeName, inventoryId);
  }

  add(inventory: InventoryItem) {
    inventory.createdDate = new Date();
    inventory.modifiedDate = new Date();
    this.dbService.add(this.storeName, inventory);
  }

  updateWithObservable(inventory: InventoryItem): Observable<any> {
    inventory.modifiedDate = new Date();
    return this.dbService.update(this.storeName, inventory);
  }

  addWithObservable(inventory: InventoryItem): Observable<any> {
    inventory.createdDate = new Date();
    inventory.modifiedDate = new Date();
    return this.dbService.add(this.storeName, inventory);
  }
}
