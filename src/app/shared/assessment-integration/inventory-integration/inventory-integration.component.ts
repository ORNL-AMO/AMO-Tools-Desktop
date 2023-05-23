import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { InventorySelectOptions, ConnectedInventoryData, ConnectedItem, InventoryType } from '../integrations';
import { IntegrationStateService } from '../integration-state.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MotorItem } from '../../../motor-inventory/motor-inventory';
import { PumpItem } from '../../../pump-inventory/pump-inventory';
import * as _ from 'lodash';


@Component({
  selector: 'app-inventory-integration',
  templateUrl: './inventory-integration.component.html',
  styleUrls: ['./inventory-integration.component.css']
})
export class InventoryIntegrationComponent {
  @Input()
  selectOptions: InventorySelectOptions;
  @Input()
  connectedItems: Array<ConnectedItem>;
  @Input()
  connectedInventoryType: InventoryType;

  @Output('focusedField')
  focusedField = new EventEmitter();

  connectedInventoryData: ConnectedInventoryData;
  inventoryIntegrationForm: FormGroup;
  integrationStateSub: Subscription;
  connectedInventoryDataSub: Subscription;
  constructor(private integrationStateService: IntegrationStateService, private router: Router) { }

  ngOnInit() {
    this.setInventoryOptions();
    this.integrationStateSub = this.integrationStateService.integrationState.subscribe(integrationState => {
      if (!integrationState.status) {
        this.resetForm();
      }
    });

    this.connectedInventoryDataSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
      if (connectedInventoryData.shouldDisconnect) {
        this.resetForm();
      } else if (connectedInventoryData.isConnected) {
        this.connectedInventoryData = connectedInventoryData;
        this.resetForm();
      } else {
        this.connectedInventoryData = connectedInventoryData;
      }
    });
  }

  ngOnDestroy() {
    this.integrationStateSub.unsubscribe();
    this.connectedInventoryDataSub.unsubscribe();
  }

  setInventoryOptions() {
    this.inventoryIntegrationForm = new FormGroup({
      selectedInventoryId: new FormControl<number>(undefined),
      selectedCatalogItem: new FormControl<any>({ value: undefined, disabled: true })
    });
    if (this.selectOptions && this.selectOptions.inventoryOptions) {
      this.selectOptions.inventoryOptions.unshift({display: 'Select Inventory', id: null, catalogItemOptions: null});
    }
  }

  goToInventory(connectedItem: ConnectedItem) {
    if (connectedItem.inventoryId) {
      let url: string;
      switch(connectedItem.inventoryType) {
        case 'motor':
          url = `/motor-inventory/${connectedItem.inventoryId}`;
          break;
        case 'pump':
          url = `/pump-inventory/${connectedItem.inventoryId}`;
          break;
        default:
          url = undefined;
      }
      if (url) {
        this.router.navigate([url], {
          queryParams: {
            departmentId: connectedItem.departmentId,
            itemId: connectedItem.id
          }
        }
        );
      }
    }
  }

  disconnectInventory() {
    this.connectedInventoryData.shouldDisconnect = true;
    this.integrationStateService.connectedInventoryData.next(this.connectedInventoryData);
  }

  focusField(focusedField: string) {
    this.focusedField.emit(focusedField);
  }

  resetForm() {
    this.inventoryIntegrationForm.controls.selectedInventoryId.patchValue(null);
    this.inventoryIntegrationForm.controls.selectedCatalogItem.patchValue(null);
    this.inventoryIntegrationForm.controls.selectedCatalogItem.disable();
    this.inventoryIntegrationForm.controls.selectedCatalogItem.updateValueAndValidity();
  }

  setCatalogItemOptionsFromInventory() {
    let selectedInventoryId = this.inventoryIntegrationForm.controls.selectedInventoryId.value;
    if (selectedInventoryId) {
      this.inventoryIntegrationForm.controls.selectedCatalogItem.enable();
      this.selectOptions.catalogItemOptions = this.selectOptions.inventoryOptions.find(option => option.id === selectedInventoryId).catalogItemOptions;
      this.inventoryIntegrationForm.controls.selectedCatalogItem.patchValue(null);
    }
  }

  setSelectedCatalogItem() {
    let selectedCatalogItem: MotorItem | PumpItem = this.inventoryIntegrationForm.controls.selectedCatalogItem.value;
    let selectedInventoryId: number = this.inventoryIntegrationForm.controls.selectedInventoryId.value;
    
    let connectedInventoryData: ConnectedInventoryData = {
      connectedItem: {
        id: selectedCatalogItem.id,
        name: selectedCatalogItem.name,
        inventoryType: this.connectedInventoryType,
        inventoryId: this.inventoryIntegrationForm.controls.selectedInventoryId.value,
        departmentId: selectedCatalogItem.departmentId,
        inventoryName: this.selectOptions.inventoryOptions.find(option => option.id === selectedInventoryId).display,
      },
      canConnect: true,
      isConnected: false,
    }
    this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
  }

}


