import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { PumpItem, PumpMotorPropertiesOptions } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';
import { PumpCatalogService } from '../pump-catalog.service';
import { PumpMotorCatalogService } from './pump-motor-catalog.service';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';
import { MotorIntegrationService } from '../../../../shared/assessment-integration/motor-integration.service';
import { InventoryOption, InventorySelectOptions, ConnectedInventoryData } from '../../../../shared/assessment-integration/integrations';
import { IntegrationStateService } from '../../../../shared/assessment-integration/integration-state.service';

@Component({
  selector: 'app-pump-motor-catalog',
  templateUrl: './pump-motor-catalog.component.html',
  styleUrls: ['./pump-motor-catalog.component.css']
})
export class PumpMotorCatalogComponent implements OnInit {

  settingsSub: Subscription;
  settings: Settings;
  
  form: FormGroup;
  selectedPumpItemSub: Subscription;
  displayOptions: PumpMotorPropertiesOptions;
  displayForm: boolean = true;

  statusTypes: Array<{value: number, display: string}>;
  priorityTypes: Array<{value: number, display: string}>;
  lineFrequencies: Array<{value: number, display: string}> = [
    {value: 50, display: '50Hz'},
    {value: 60, display: '60Hz'},
  ];
  motorEfficiencyClasses: Array<{ value: number, display: string }>;

  inventorySelectOptions: InventorySelectOptions;
  connectedInventoryDataSub: Subscription;

  constructor(private pumpCatalogService: PumpCatalogService, 
    private pumpInventoryService: PumpInventoryService,
    private integrationStateService: IntegrationStateService,
    private motorIntegrationService: MotorIntegrationService,
    private pumpMotorCatalogService: PumpMotorCatalogService) { }

  ngOnInit(): void {
    this.setInventorySelectOptions();
    this.motorEfficiencyClasses = motorEfficiencyConstants;
    this.settingsSub = this.pumpInventoryService.settings.subscribe(val => {
      this.settings = val;
    });

    this.connectedInventoryDataSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
      this.handleConnectedInventoryEvents(connectedInventoryData);
    });

    this.selectedPumpItemSub = this.pumpCatalogService.selectedPumpItem.subscribe(selectedPump => {
      if (selectedPump) {
        if (selectedPump.connectedItem) {
          this.motorIntegrationService.setFromConnectedMotorItem(selectedPump, this.pumpInventoryService.currentInventoryId);
          this.form = this.pumpMotorCatalogService.getFormFromPumpMotor(selectedPump.pumpMotor);
          this.form.disable();
        } else {
          this.form = this.pumpMotorCatalogService.getFormFromPumpMotor(selectedPump.pumpMotor);
          this.integrationStateService.connectedInventoryData.next(this.integrationStateService.getEmptyConnectedInventoryData());
        }
        this.integrationStateService.integrationState.next(this.integrationStateService.getEmptyIntegrationState());
      }
    });
    this.displayOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.pumpMotorPropertiesOptions;
  }

  ngOnDestroy() {
    this.selectedPumpItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
    this.connectedInventoryDataSub.unsubscribe();
    this.integrationStateService.connectedInventoryData.next(this.integrationStateService.getEmptyConnectedInventoryData())
  }

  async setInventorySelectOptions() {
    let motorInventoryOptions: Array<InventoryOption> = await this.motorIntegrationService.initInventoriesAndOptions();
    this.inventorySelectOptions = {
      label: 'Connect an Existing Motor Inventory',
      itemName: 'Motor',
      inventoryOptions: motorInventoryOptions,
      shouldResetForm: false
    }
  }

  handleConnectedInventoryEvents(connectedInventoryData: ConnectedInventoryData) {
    let selectedPump: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    if (!connectedInventoryData.isConnected) {
      if (connectedInventoryData.canConnect || connectedInventoryData.shouldConvertItemUnits) {
        this.connectInventoryItem(connectedInventoryData);
      }
    } 
    if (connectedInventoryData.shouldDisconnect) {
      this.motorIntegrationService.removePumpConnectedItem(selectedPump, connectedInventoryData);
      this.form.enable();
    }

    this.pumpInventoryService.updatePumpItem(selectedPump);
  }

  connectInventoryItem(connectedInventoryData: ConnectedInventoryData) {
    let selectedPumpItem: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    selectedPumpItem.pumpMotor = this.pumpMotorCatalogService.updatePumpMotorFromForm(this.form, selectedPumpItem.pumpMotor);
    connectedInventoryData.ownerInventoryId = this.pumpInventoryService.currentInventoryId;
    this.motorIntegrationService.setPumpConnectedItem(selectedPumpItem, connectedInventoryData, this.settings);
    
    this.form = this.pumpMotorCatalogService.getFormFromPumpMotor(selectedPumpItem.pumpMotor);
    this.form.disable();
  }

  async save() {
    let selectedPump: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    selectedPump.pumpMotor = this.pumpMotorCatalogService.updatePumpMotorFromForm(this.form, selectedPump.pumpMotor);
    this.pumpInventoryService.updatePumpItem(selectedPump);
  }



  focusField(str: string, integrationDataGroup?: boolean) {
    let focusedDataGroup: string = 'pump-motor';
    if (integrationDataGroup) {
      focusedDataGroup = 'motor-integration';
    }
    this.pumpInventoryService.focusedDataGroup.next(focusedDataGroup);
    this.pumpInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

}
