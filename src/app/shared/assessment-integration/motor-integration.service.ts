import { Injectable } from '@angular/core';
import { InventoryDbService } from '../../indexedDb/inventory-db.service';
import { firstValueFrom } from 'rxjs';
import { InventoryItem } from '../models/inventory/inventory';
import * as _ from 'lodash';
import { PumpInventoryData, PumpInventoryDepartment, PumpItem } from '../../pump-inventory/pump-inventory';
import { MotorInventoryData, MotorInventoryDepartment, MotorItem } from '../../motor-inventory/motor-inventory';
import { Settings } from '../models/settings';
import { ConnectedInventoryData, ConnectedItem, IntegrationState, InventoryOption } from './integrations';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { IntegrationStateService } from './integration-state.service';
import { ConvertMotorInventoryService } from '../../motor-inventory/convert-motor-inventory.service';

@Injectable()
export class MotorIntegrationService {
  constructor(private inventoryDbService: InventoryDbService, 
    private settingsDbService: SettingsDbService,
    private convertMotorInventoryService: ConvertMotorInventoryService,
    private integrationStateService: IntegrationStateService) { }

  async initInventoriesAndOptions(): Promise<Array<InventoryOption>> {
    let allInventories: Array<InventoryItem> = await firstValueFrom(this.inventoryDbService.getAllInventory());
    this.inventoryDbService.setAll(allInventories);
    let motorInventories: Array<InventoryItem> = allInventories.filter(inventory => inventory.motorInventoryData);
    motorInventories = (_.orderBy(motorInventories, 'modifiedDate'));
    let motorInventoryOptions: Array<InventoryOption> = motorInventories.map(inventory => {
      let catalogItemOptions = inventory.motorInventoryData.departments.map(department => {
        return {
          department: department.name,
          catalog: department.catalog
        }
      });
      return {
        display: inventory.name,
        id: inventory.id,
        catalogItemOptions: catalogItemOptions
      }
    });

    return motorInventoryOptions;
  }

  async setPumpConnectedItem(selectedPump: PumpItem, connectedInventoryData: ConnectedInventoryData, currentSettings: Settings) {
    let selectedMotorItem: MotorItem = this.getConnectedMotorItem(connectedInventoryData.connectedItem);
    let integrationState: IntegrationState = {
      status: 'success',
      msgHTML: undefined,
    }
    let motorInventory: InventoryItem = this.inventoryDbService.getById(connectedInventoryData.connectedItem.inventoryId);
    let motorInventorySettings: Settings = this.settingsDbService.getByInventoryId(motorInventory);

    if (motorInventorySettings.unitsOfMeasure !== currentSettings.unitsOfMeasure) {
      if (connectedInventoryData.shouldConvertItemUnits) {
        selectedMotorItem = _.cloneDeep(selectedMotorItem);
        selectedMotorItem.nameplateData = this.convertMotorInventoryService.convertNameplateData(selectedMotorItem.nameplateData, motorInventorySettings, currentSettings);
        connectedInventoryData.shouldConvertItemUnits = false;
        connectedInventoryData.canConnect = true;
      } else {
        integrationState.status = 'settings-differ';
        integrationState.msgHTML = `Selected units of measure for inventory <b>${motorInventory.name}</b> differ from the current inventory`;
        connectedInventoryData.canConnect = false;
      }
      this.integrationStateService.integrationState.next(integrationState);
    }

    if (connectedInventoryData.canConnect) {
      this.setPumpFieldsFromMotor(selectedPump, selectedMotorItem);
      connectedInventoryData.ownerItemId = selectedPump.id;
      connectedInventoryData.isConnected = true;
      connectedInventoryData.canConnect = false;
      selectedPump.connectedItem = connectedInventoryData.connectedItem;
      motorInventory.motorInventoryData.departments.forEach(dept => {
        dept.catalog.map(motorItem => {
          if (motorItem.id === connectedInventoryData.connectedItem.id) {
            let connectedItem: ConnectedItem = {
              id: selectedPump.id,
              name: selectedPump.name,
              inventoryId: connectedInventoryData.ownerInventoryId,
              departmentId: selectedPump.departmentId,
              inventoryType: 'pump',
            }
            if (motorItem.connectedItems) {
              motorItem.connectedItems.push(connectedItem);
            } else {
              motorItem.connectedItems =  [connectedItem];
            }
          }
        })
      });

      let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.updateWithObservable(motorInventory));
      this.inventoryDbService.setAll(updatedInventoryItems);
      this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
    }
  }

  setPumpFieldsFromMotor(selectedPump: PumpItem, selectedMotorItem: MotorItem) {
    selectedPump.pumpMotor.lineFrequency = selectedMotorItem.nameplateData.lineFrequency;
    selectedPump.pumpMotor.motorRatedPower = selectedMotorItem.nameplateData.ratedMotorPower;
    selectedPump.pumpMotor.motorEfficiencyClass = selectedMotorItem.nameplateData.efficiencyClass;
    selectedPump.pumpMotor.motorRatedVoltage = selectedMotorItem.nameplateData.ratedVoltage;
    selectedPump.pumpMotor.motorFullLoadAmps = selectedMotorItem.nameplateData.fullLoadAmps;
    selectedPump.pumpMotor.motorRPM = selectedMotorItem.nameplateData.fullLoadSpeed;
    selectedPump.pumpMotor.motorEfficiency = selectedMotorItem.nameplateData.nominalEfficiency;
  }

  getConnectedMotorItem(connectedItem: ConnectedItem) {
    let motorItem: MotorItem;
    let motorInventoryItem: InventoryItem = this.inventoryDbService.getById(connectedItem.inventoryId);
    if (motorInventoryItem) {
      let department: MotorInventoryDepartment = motorInventoryItem.motorInventoryData.departments.find(department => department.id === connectedItem.departmentId);
      if (department) {
        motorItem = department.catalog.find(motorItem => motorItem.id === connectedItem.id);
      }
    }
    return motorItem;
  }

  getConnectedPumpItem(connectedItem: ConnectedItem) {
    let pumpItem: PumpItem;
    let inventoryItem: InventoryItem = this.inventoryDbService.getById(connectedItem.inventoryId);
    if (inventoryItem) {
      let department: PumpInventoryDepartment = inventoryItem.pumpInventoryData.departments.find(department => department.id === connectedItem.departmentId);
      if (department) {
        pumpItem = department.catalog.find(pumpItem => pumpItem.id === connectedItem.id);
      }
    }
    return pumpItem;
  }


  setConnectedPumpItems(motorItem: MotorItem) {
    if (motorItem.connectedItems && motorItem.connectedItems.length > 0) {
      motorItem.connectedItems = motorItem.connectedItems.filter(connectedPump => {
        let existingPump = this.getConnectedPumpItem(connectedPump);
        return existingPump;
      });
      if (motorItem.connectedItems.length === 0) {
        motorItem.connectedItems = undefined;
      }
    }
  }
  

  setFromConnectedMotorItem(selectedPump: PumpItem, ownerInventoryId: number) {
    let motorItem = this.getConnectedMotorItem(selectedPump.connectedItem);
    let connectedInventoryData: ConnectedInventoryData = this.integrationStateService.getEmptyConnectedInventoryData();
    connectedInventoryData.connectedItem = selectedPump.connectedItem;
    connectedInventoryData.ownerItemId = selectedPump.id;
    connectedInventoryData.ownerInventoryId = ownerInventoryId;
    connectedInventoryData.isConnected = true;
    
    if (motorItem) {
      this.setPumpFieldsFromMotor(selectedPump, motorItem);
      this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
    } else {
      // item or inventory was deleted
      this.removePumpConnectedItem(selectedPump, connectedInventoryData)
    }
  }

  getHasConnectedPumpItems(inventoryItem: InventoryItem) {
    return inventoryItem.motorInventoryData.departments.some(department => {
      return department.catalog.some(item => item.connectedItems && item.connectedItems.length > 0);
    }
    );
  }

  getHasConnectedMotorItems(inventoryItem: InventoryItem) {
    return inventoryItem.pumpInventoryData.departments.some(department => {
      return department.catalog.some(item => item.connectedItem);
    }
    );
  }

  async removePumpConnectedItem(selectedPump: PumpItem, connectedInventoryData: ConnectedInventoryData) {
    this.removeMotorConnectedItem(selectedPump);
    delete selectedPump.connectedItem;
    let pumpInventory: InventoryItem = this.inventoryDbService.getById(connectedInventoryData.ownerInventoryId);
    if (pumpInventory.pumpInventoryData) {
      pumpInventory.pumpInventoryData.departments.forEach(dept => {
        dept.catalog.map(pumpItem => {
          if (pumpItem.id === connectedInventoryData.ownerItemId) {
            delete pumpItem.connectedItem;
          }
        })
      });
    }
    let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.updateWithObservable(pumpInventory));
    this.inventoryDbService.setAll(updatedInventoryItems);
    this.integrationStateService.connectedInventoryData.next(this.integrationStateService.getEmptyConnectedInventoryData());
  }
  
  async removeMotorConnectedItem(selectedPump: PumpItem) {
    let motorInventoryItem: InventoryItem = this.inventoryDbService.getById(selectedPump.connectedItem.inventoryId);
    if (motorInventoryItem) {
      motorInventoryItem.motorInventoryData.departments.find(department => {
        if (department.id === selectedPump.connectedItem.departmentId) {
          department.catalog.map(motorItem => {
            if (motorItem.id === selectedPump.connectedItem.id) {
              let connectedPumpIndex = motorItem.connectedItems.findIndex(item => item.id === selectedPump.id);
              motorItem.connectedItems.splice(connectedPumpIndex, 1);
              if (motorItem.connectedItems.length === 0) {
                motorItem.connectedItems = undefined;
              }
            }
          });
        }
      });
      let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.updateWithObservable(motorInventoryItem));
      this.inventoryDbService.setAll(updatedInventoryItems);
    }
  }

  removeDepartmentMotorConnections(pumpInventoryData: PumpInventoryData, deleteDepartmentIndex: number) {
    pumpInventoryData.departments[deleteDepartmentIndex].catalog.forEach(item => {
      if (item.connectedItem) {
        this.removeMotorConnectedItem(item);
      }
    });
  }

  removeAllPumpConnectedItems(inventory: InventoryItem) {
      inventory.pumpInventoryData.departments.forEach(dept => {
        dept.catalog.map(item => {
            delete item.connectedItem;
        })
      });
  }

  removeAllMotorConnectedItems(inventory: InventoryItem) {
    inventory.motorInventoryData.departments.forEach(dept => {
      dept.catalog.map(item => {
          delete item.connectedItems;
      })
    });
  }

}