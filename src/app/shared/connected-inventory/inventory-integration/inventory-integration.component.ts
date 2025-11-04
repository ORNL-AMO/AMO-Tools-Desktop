import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { InventorySelectOptions, ConnectedInventoryData, ConnectedItem, InventoryType } from '../integrations';
import { IntegrationStateService } from '../integration-state.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MotorItem } from '../../../motor-inventory/motor-inventory';
import { PumpItem } from '../../../pump-inventory/pump-inventory';
import * as _ from 'lodash';
import { CompressedAirInventorySystem, CompressedAirItem } from '../../../compressed-air-inventory/compressed-air-inventory';


@Component({
    selector: 'app-inventory-integration',
    templateUrl: './inventory-integration.component.html',
    styleUrls: ['./inventory-integration.component.css'],
    standalone: false
})
export class InventoryIntegrationComponent {
  @Input()
  selectOptions: InventorySelectOptions;
  @Input()
  connectedItems: Array<ConnectedItem>;
  @Input()
  connectedInventoryType: InventoryType;
  @Input()
  allowChanges: boolean = true;
  @Input() 
  inPsat: boolean;
  @Input() 
  inCompressedAir: boolean;

  @Output('focusedField')
  focusedField = new EventEmitter();
  @ViewChild('integrationContainer', { static: false }) integrationContainer: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.setIntegrationOffsetHeight();
    }, 50);
  }

  connectedInventoryData: ConnectedInventoryData;
  inventoryIntegrationForm: FormGroup;
  integrationStateSub: Subscription;
  connectedInventoryDataSub: Subscription;
  isCollapsed: boolean = false;
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

  ngAfterViewInit() {
    this.setIntegrationOffsetHeight();
  }

  ngOnDestroy() {
    this.integrationStateSub.unsubscribe();
    this.connectedInventoryDataSub.unsubscribe();
    this.integrationStateService.integrationContainerOffsetHeight.next(undefined);

  }

  setInventoryOptions() {
    this.inventoryIntegrationForm = new FormGroup({
      selectedInventoryId: new FormControl<number>(undefined),
      selectedCatalogItem: new FormControl<any>({ value: undefined, disabled: true })
    });
    this.setPlaceholderOption();
  }

  setPlaceholderOption() {
    if (this.selectOptions && this.selectOptions.inventoryOptions) {
      let hasPlaceholder: boolean = Boolean(this.selectOptions.inventoryOptions.find(option => option.id === null));
      if (!hasPlaceholder) {
        this.selectOptions.inventoryOptions.unshift({ display: 'Select Inventory', id: null, catalogItemOptions: null });
      }
    }
  }

  goToConnectedItem(connectedItem: ConnectedItem) {
    if (connectedItem.inventoryType && connectedItem.inventoryId) {
      let url: string;
      switch(connectedItem.inventoryType) {
        case 'motor':
          url = `/motor-inventory/${connectedItem.inventoryId}`;
          break;
        case 'pump':
          url = `/pump-inventory/${connectedItem.inventoryId}`;
          break;
        case 'compressed-air':
          url = `/compressed-air-inventory/${connectedItem.inventoryId}`;
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
    } else if (connectedItem.assessmentType && connectedItem.assessmentId) {
      let url: string;
      switch(connectedItem.assessmentType) {
        case 'PSAT':
          url = `/psat/${connectedItem.assessmentId}`;
          break;
        case 'CompressedAir':
          url = `/compressed-air-assessment/${connectedItem.assessmentId}`;
          break;
        default:
          url = undefined;
      }
      
      if (url) {
        this.router.navigate([url], {
          queryParams: {
            fromConnectedItem: 'motor',
          }
        });
      }
    }
  }

  disconnectInventory() {
    this.connectedInventoryData.shouldDisconnect = true;
    this.integrationStateService.connectedInventoryData.next(this.connectedInventoryData);
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    setTimeout(() => {
      this.setIntegrationOffsetHeight();
    }, 100);
  }

  focusField(focusedField: string) {
    this.focusedField.emit(focusedField);
  }

  resetForm() {
    this.inventoryIntegrationForm.controls.selectedInventoryId.patchValue(null);
    this.inventoryIntegrationForm.controls.selectedCatalogItem.patchValue(null);
    this.inventoryIntegrationForm.controls.selectedCatalogItem.disable();
    this.inventoryIntegrationForm.controls.selectedCatalogItem.updateValueAndValidity();
    this.setPlaceholderOption();
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
    let selectedCatalogItem: MotorItem | PumpItem | CompressedAirInventorySystem = this.inventoryIntegrationForm.controls.selectedCatalogItem.value;
    let selectedInventoryId: number = this.inventoryIntegrationForm.controls.selectedInventoryId.value;
    let departmentId: string;
    if ('departmentId' in selectedCatalogItem) {
      departmentId = selectedCatalogItem.departmentId;
    } else if ('id' in selectedCatalogItem) {
      departmentId = selectedCatalogItem.id;
    }

    let connectedInventoryData: ConnectedInventoryData = {
      connectedItem: {
        id: selectedCatalogItem.id,
        name: selectedCatalogItem.name,
        inventoryType: this.connectedInventoryType,
        inventoryId: this.inventoryIntegrationForm.controls.selectedInventoryId.value,
        departmentId: departmentId,
        inventoryName: this.selectOptions.inventoryOptions.find(option => option.id === selectedInventoryId).display,
      },
      canConnect: true,
      isConnected: false,
    }
    this.integrationStateService.connectedInventoryData.next(connectedInventoryData);
  }

  setIntegrationOffsetHeight() {
    if (this.integrationContainer) {
      let integrationContainerYMargin: number = 16;
      this.integrationStateService.integrationContainerOffsetHeight.next(this.integrationContainer.nativeElement.offsetHeight + integrationContainerYMargin);
    }
  }

}


