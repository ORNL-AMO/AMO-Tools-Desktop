import { Injectable } from '@angular/core';
import { InventoryDbService } from '../../indexedDb/inventory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { ConvertMotorInventoryService } from '../../motor-inventory/convert-motor-inventory.service';
import { IntegrationStateService } from './integration-state.service';
import { ConnectedInventoryData, ConnectedItem, IntegrationState, InventoryOption } from './integrations';
import { InventoryItem } from '../models/inventory/inventory';
import { firstValueFrom } from 'rxjs';
import _ from 'lodash';
import { CompressedAirInventoryData, CompressedAirInventorySystem, CompressedAirItem, CompressedAirMotorProperties } from '../../compressed-air-inventory/compressed-air-inventory';
import { Settings } from '../models/settings';
import { MotorInventoryDepartment, MotorItem } from '../../motor-inventory/motor-inventory';
import { copyObject } from '../helperFunctions';
import { CompressedAirAssessment } from '../models/compressed-air-assessment';

@Injectable()
export class CompressedAirMotorIntegrationService {

  constructor(
    private inventoryDbService: InventoryDbService,
    private settingsDbService: SettingsDbService,
    private assessmentDbService: AssessmentDbService,
    private convertMotorInventoryService: ConvertMotorInventoryService,
    private integrationStateService: IntegrationStateService
  ) { }

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

  async setCompressedAirMotorConnectedItem(selectedCompressor: CompressedAirItem, connectedInventoryData: ConnectedInventoryData, currentSettings: Settings) {
    let selectedMotorItem: MotorItem = this.getConnectedMotorItem(connectedInventoryData.connectedItem, currentSettings);
    let integrationState: IntegrationState = {
      status: undefined,
      msgHTML: undefined,
    }
    let motorInventory: InventoryItem = this.inventoryDbService.getById(connectedInventoryData.connectedItem.inventoryId);
    let motorInventorySettings: Settings = this.settingsDbService.getByInventoryId(motorInventory);

    if (motorInventorySettings.unitsOfMeasure !== currentSettings.unitsOfMeasure) {
      if (connectedInventoryData.shouldConvertItemUnits) {
        // resolve warning, conversion handled in setFromConnectedMotorItem-> getConnectedMotorIcon
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
      selectedCompressor.compressedAirMotor = this.setCompressorFieldsFromMotor(selectedCompressor.compressedAirMotor, selectedMotorItem);
      connectedInventoryData.ownerItemId = selectedCompressor.id;
      connectedInventoryData.isConnected = true;
      connectedInventoryData.canConnect = false;
      selectedCompressor.connectedItem = connectedInventoryData.connectedItem;

      if (selectedCompressor.connectedAssessments && selectedCompressor.connectedAssessments.length > 0) {
        selectedCompressor.connectedAssessments.map(connectedAssessment => {
          let newConnectedFromState: MotorItem = copyObject(selectedMotorItem);
          connectedAssessment.connectedCompressorFromState.compressorMotor = this.setCompressorFieldsFromMotor(connectedAssessment.connectedCompressorFromState.compressorMotor, newConnectedFromState);
        });
      }
      motorInventory.motorInventoryData.departments.forEach(dept => {
        dept.catalog.map(motorItem => {
          if (motorItem.id === connectedInventoryData.connectedItem.id) {
            let connectedItem: ConnectedItem = {
              id: selectedCompressor.id,
              name: selectedCompressor.name,
              inventoryId: connectedInventoryData.ownerInventoryId,
              departmentId: selectedCompressor.systemId,
              inventoryType: 'compressed-air',
            }
            if (motorItem.connectedItems) {
              motorItem.connectedItems.push(connectedItem);
            } else {
              motorItem.connectedItems = [connectedItem];
            }
          }
        })
      });

      await firstValueFrom(this.inventoryDbService.updateWithObservable(motorInventory));
      let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
      this.inventoryDbService.setAll(updatedInventoryItems);
      this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
    }
  }

  setCompressorFieldsFromMotor(compressorMotor: CompressedAirMotorProperties, selectedMotorItem: MotorItem): CompressedAirMotorProperties {
    compressorMotor.motorFullLoadAmps = selectedMotorItem.nameplateData.fullLoadAmps;
    compressorMotor.motorPower = selectedMotorItem.nameplateData.ratedMotorPower;
    return compressorMotor;
  }

  getConnectedMotorItem(connectedItem: ConnectedItem, currentSettings: Settings) {
    let motorItem: MotorItem;
    let motorInventoryItem: InventoryItem = this.inventoryDbService.getById(connectedItem.inventoryId);

    if (motorInventoryItem) {
      let department: MotorInventoryDepartment = motorInventoryItem.motorInventoryData.departments.find(department => department.id === connectedItem.departmentId);
      if (department) {
        motorItem = department.catalog.find(motorItem => motorItem.id === connectedItem.id);
        if (motorItem) {
          let motorInventorySettings: Settings = this.settingsDbService.getByInventoryId(motorInventoryItem);
          if (motorInventorySettings.unitsOfMeasure !== currentSettings.unitsOfMeasure) {
            motorItem = copyObject(motorItem);
            motorItem.nameplateData = this.convertMotorInventoryService.convertNameplateData(motorItem.nameplateData, motorInventorySettings, currentSettings);
          }
        }
      }
    }
    return motorItem;
  }

  getConnectedCompressedAirItem(connectedItem: ConnectedItem) {
    let compressedAirItem: CompressedAirItem;
    let inventoryItem: InventoryItem = this.inventoryDbService.getById(connectedItem.inventoryId);
    if (inventoryItem) {
      let system: CompressedAirInventorySystem = inventoryItem.compressedAirInventoryData.systems.find(system => system.id === connectedItem.departmentId);
      if (system) {
        compressedAirItem = system.catalog.find(compressedAirItem => compressedAirItem.id === connectedItem.id);
      }
    }
    return compressedAirItem;
  }

  getConnectedCAAssessmentItem(connectedItem: ConnectedItem) {
    let existingAssessment = this.assessmentDbService.findById(connectedItem.assessmentId);
    return existingAssessment;
  }

  setConnectedItems(motorItem: MotorItem) {
    if (motorItem.connectedItems && motorItem.connectedItems.length > 0) {
      motorItem.connectedItems = motorItem.connectedItems.filter(connectedItem => {
        let existingItem: CompressedAirItem | CompressedAirAssessment;
        if (connectedItem.inventoryType === 'compressed-air' && connectedItem.inventoryId) {
          existingItem = this.getConnectedCompressedAirItem(connectedItem);
        } else if (connectedItem.inventoryType === 'motor' && connectedItem.assessmentId) {
          //existingItem = this.getConnectedCAAssessmentItem(connectedItem);
        }
        return existingItem;
      });
      if (motorItem.connectedItems.length === 0) {
        motorItem.connectedItems = undefined;
      }
    }
  }

  setFromConnectedMotorItem(selectedCompressor: CompressedAirItem, ownerInventoryId: number, settings: Settings) {
    let motorItem = this.getConnectedMotorItem(selectedCompressor.connectedItem, settings);
    let connectedInventoryData: ConnectedInventoryData = this.integrationStateService.getEmptyConnectedInventoryData();
    connectedInventoryData.connectedItem = selectedCompressor.connectedItem;
    connectedInventoryData.ownerItemId = selectedCompressor.id;
    connectedInventoryData.ownerInventoryId = ownerInventoryId;
    connectedInventoryData.isConnected = true;

    if (motorItem) {
      selectedCompressor.compressedAirMotor = this.setCompressorFieldsFromMotor(selectedCompressor.compressedAirMotor, motorItem);
      if (selectedCompressor.connectedAssessments) {
        this.updateConnectedFromState(selectedCompressor, motorItem);
      }
      this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
    } else {
      // item or inventory was deleted
      this.removeCompressorConnectedItem(selectedCompressor, connectedInventoryData)
    }
  }

  // updated connectedFromState (values at assessmnet to inventory connection)
  updateConnectedFromState(selectedCompressor: CompressedAirItem, connectedMotorItem: MotorItem) {
    selectedCompressor.connectedAssessments.map(connectedAssessment => {
      let newConnectedFromState: MotorItem = copyObject(connectedMotorItem);
      connectedAssessment.connectedCompressorFromState.compressorMotor = this.setCompressorFieldsFromMotor(connectedAssessment.connectedCompressorFromState.compressorMotor, newConnectedFromState);
    });
  }

  getHasConnectedCompressedAirItems(inventoryItem: InventoryItem) {
    return inventoryItem.compressedAirInventoryData.systems.some(system => {
      return system.catalog.some(item => item.connectedItems && item.connectedItems.length > 0);
    });
  }

  getHasConnectedMotorItems(inventoryItem: InventoryItem) {
    return inventoryItem.compressedAirInventoryData.systems.some(system => {
      let compressedAirItem = system.catalog.find(item => item.connectedItem);
      if (compressedAirItem) {
        let motorInventory: InventoryItem = this.inventoryDbService.getById(compressedAirItem.connectedItem.inventoryId);
        if (motorInventory) {
          let system = motorInventory.motorInventoryData.departments.find(dept => compressedAirItem.connectedItem.departmentId === dept.id);
          if (system) {
            let motorItem = system.catalog.find(item => item.id === compressedAirItem.connectedItem.id);
            return Boolean(motorItem);
          }
        }
      }
    });
  }

  async removeCompressorConnectedItem(selectedCompressor: CompressedAirItem, connectedInventoryData: ConnectedInventoryData) {
    this.removeMotorConnectedItem(selectedCompressor);
    delete selectedCompressor.connectedItem;
    let compressedAirInventory: InventoryItem = this.inventoryDbService.getById(connectedInventoryData.ownerInventoryId);
    if (compressedAirInventory.compressedAirInventoryData) {
      compressedAirInventory.compressedAirInventoryData.systems.forEach(system => {
        system.catalog.map(compressedAirItem => {
          if (compressedAirItem.id === connectedInventoryData.ownerItemId) {
            delete compressedAirItem.connectedItem;
          }
        })
      });
    }
    await firstValueFrom(this.inventoryDbService.updateWithObservable(compressedAirInventory));
    let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
    this.inventoryDbService.setAll(updatedInventoryItems);
    this.integrationStateService.connectedInventoryData.next(this.integrationStateService.getEmptyConnectedInventoryData());
  }

  async removeMotorConnectedItem(selectedCompressor: CompressedAirItem) {
    let motorInventoryItem: InventoryItem = this.inventoryDbService.getById(selectedCompressor.connectedItem.inventoryId);
    if (motorInventoryItem) {
      motorInventoryItem.motorInventoryData.departments.find(department => {
        if (department.id === selectedCompressor.connectedItem.departmentId) {
          department.catalog.map(motorItem => {
            if (motorItem.id === selectedCompressor.connectedItem.id) {
              let connectedPumpIndex = motorItem.connectedItems.findIndex(item => item.id === selectedCompressor.id);
              motorItem.connectedItems.splice(connectedPumpIndex, 1);
              if (motorItem.connectedItems.length === 0) {
                motorItem.connectedItems = undefined;
              }
            }
          });
        }
      });
      await firstValueFrom(this.inventoryDbService.updateWithObservable(motorInventoryItem));
      let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
      this.inventoryDbService.setAll(updatedInventoryItems);
    }
  }

  removeDepartmentMotorConnections(pumpInventoryData: CompressedAirInventoryData, deleteSystemIndex: number) {
    pumpInventoryData.systems[deleteSystemIndex].catalog.forEach(item => {
      if (item.connectedItem) {
        this.removeMotorConnectedItem(item);
      }
    });
  }

  removeAllCompressedAirConnectedItems(inventory: InventoryItem) {
    inventory.compressedAirInventoryData.systems.forEach(system => {
      system.catalog.map(item => {
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
