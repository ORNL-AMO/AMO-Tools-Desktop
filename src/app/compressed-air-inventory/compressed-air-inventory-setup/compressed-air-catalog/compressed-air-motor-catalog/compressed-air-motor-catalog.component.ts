import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirItem, CompressedAirMotorPropertiesOptions } from '../../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../compressed-air-catalog.service';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirMotorCatalogService } from './compressed-air-motor-catalog.service';
import { ConnectedInventoryData, InventoryOption, InventorySelectOptions } from '../../../../shared/connected-inventory/integrations';
import { IntegrationStateService } from '../../../../shared/connected-inventory/integration-state.service';
import { CompressedAirMotorIntegrationService } from '../../../../shared/connected-inventory/compressed-air-motor-integration.service';

@Component({
  selector: 'app-compressed-air-motor-catalog',
  templateUrl: './compressed-air-motor-catalog.component.html',
  styleUrl: './compressed-air-motor-catalog.component.css',
  standalone: false
})
export class CompressedAirMotorCatalogComponent implements OnInit {
  settingsSub: Subscription;
  settings: Settings;

  form: FormGroup;
  selectedCompressedAirItemSub: Subscription;
  displayOptions: CompressedAirMotorPropertiesOptions;
  displayForm: boolean = true;
  inventorySelectOptions: InventorySelectOptions;
  connectedInventoryDataSub: Subscription;

  constructor(private compressedAirCatalogService: CompressedAirCatalogService,
    private compressedAirInventoryService: CompressedAirInventoryService,
    private compressedAirMotorCatalogService: CompressedAirMotorCatalogService,
    private integrationStateService: IntegrationStateService,
    private compressedAirMotorIntegrationService: CompressedAirMotorIntegrationService
  ) { }

  async ngOnInit() {
    this.settingsSub = this.compressedAirInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedCompressedAirItemSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(selectedCompressedAir => {
      if (selectedCompressedAir) {
        this.form = this.compressedAirMotorCatalogService.getFormFromMotorProperties(selectedCompressedAir.compressedAirMotor);
      }
    });
    this.displayOptions = this.compressedAirInventoryService.compressedAirInventoryData.getValue().displayOptions.compressedAirMotorPropertiesOptions;
    await this.initConnectedInventory();
  }

  ngOnDestroy() {
    this.selectedCompressedAirItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
    this.connectedInventoryDataSub.unsubscribe();
  }

  save() {
    let selectedCompressedAir: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressedAir.compressedAirMotor = this.compressedAirMotorCatalogService.updateMotorPropertiesFromForm(this.form, selectedCompressedAir.compressedAirMotor);
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressedAir);
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedDataGroup.next('compressed-air-motor');
    this.compressedAirInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  async initConnectedInventory() {
    await this.setInventorySelectOptions();
    this.connectedInventoryDataSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
      this.handleConnectedInventoryEvents(connectedInventoryData);
    });
  }

  async setInventorySelectOptions() {
    let motorInventoryOptions: Array<InventoryOption> = await this.compressedAirMotorIntegrationService.initInventoriesAndOptions();
    this.inventorySelectOptions = {
      label: 'Connect an Existing Motor Inventory',
      itemName: 'Motor',
      inventoryOptions: motorInventoryOptions,
      shouldResetForm: false
    }
  }

  handleConnectedInventoryEvents(connectedInventoryData: ConnectedInventoryData) {
    // let selectedPump: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    // if (!connectedInventoryData.isConnected) {
    //   if (connectedInventoryData.canConnect || connectedInventoryData.shouldConvertItemUnits) {
    //     this.connectInventoryItem(connectedInventoryData);
    //     this.pumpInventoryService.updatePumpItem(selectedPump);
    //   }
    // }
    // if (connectedInventoryData.shouldDisconnect) {
    //   this.compressedAirMotorIntegrationService.removePumpConnectedItem(selectedPump, connectedInventoryData);
    //   this.form.enable();
    //   this.pumpInventoryService.updatePumpItem(selectedPump);
    // }
  }

}
