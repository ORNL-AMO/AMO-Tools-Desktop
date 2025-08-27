import { Injectable } from '@angular/core';
import { InventoryDbService } from '../../indexedDb/inventory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { ConvertMotorInventoryService } from '../../motor-inventory/convert-motor-inventory.service';
import { IntegrationStateService } from './integration-state.service';
import { InventoryOption } from './integrations';
import { InventoryItem } from '../models/inventory/inventory';
import { firstValueFrom } from 'rxjs';
import _ from 'lodash';

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
}
