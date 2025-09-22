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
        this.initSelectedCompressor(selectedCompressedAir);
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

  async save() {
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

  initSelectedCompressor(selectedCompressor: CompressedAirItem) {
    if (selectedCompressor.connectedItem) {
      this.compressedAirMotorIntegrationService.setFromConnectedMotorItem(selectedCompressor, this.compressedAirInventoryService.currentInventoryId, this.settings);
      this.form = this.compressedAirMotorCatalogService.getFormFromMotorProperties(selectedCompressor.compressedAirMotor);
      if (this.integrationStateService.connectedInventoryData.getValue()?.isConnected) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    } else {
      this.form = this.compressedAirMotorCatalogService.getFormFromMotorProperties(selectedCompressor.compressedAirMotor);
      this.integrationStateService.connectedInventoryData.next(this.integrationStateService.getEmptyConnectedInventoryData());
    }
    //this.motorWarnings = this.pumpCatalogService.checkMotorWarnings(selectedCompressor, this.settings);
    this.integrationStateService.integrationState.next(this.integrationStateService.getEmptyIntegrationState());
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
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    if (!connectedInventoryData.isConnected) {
      if (connectedInventoryData.canConnect || connectedInventoryData.shouldConvertItemUnits) {
        this.connectInventoryItem(connectedInventoryData);
        this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressor);
      }
    }
    if (connectedInventoryData.shouldDisconnect) {
      this.compressedAirMotorIntegrationService.removeCompressorConnectedItem(selectedCompressor, connectedInventoryData);
      this.form.enable();
      this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressor);
    }
  }

  connectInventoryItem(connectedInventoryData: ConnectedInventoryData) {
    let selectedCompressor: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressor.compressedAirMotor = this.compressedAirMotorCatalogService.updateMotorPropertiesFromForm(this.form, selectedCompressor.compressedAirMotor);
    connectedInventoryData.ownerInventoryId = this.compressedAirInventoryService.currentInventoryId;
    this.compressedAirMotorIntegrationService.setCompressedAirMotorConnectedItem(selectedCompressor, connectedInventoryData, this.settings);

    this.form = this.compressedAirMotorCatalogService.getFormFromMotorProperties(selectedCompressor.compressedAirMotor);
    if (connectedInventoryData.isConnected) {
      this.form.disable();
    }
  }

}
