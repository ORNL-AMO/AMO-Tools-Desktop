import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { InventoryItem } from '../../shared/models/inventory/inventory';
import { PumpCatalogService } from '../pump-inventory-setup/pump-catalog/pump-catalog.service';
import { PumpInventoryData } from '../pump-inventory';
import { PumpInventoryService } from '../pump-inventory.service';
import { IntegrationStateService } from '../../shared/assessment-integration/integration-state.service';

@Component({
  selector: 'app-pump-inventory-banner',
  templateUrl: './pump-inventory-banner.component.html',
  styleUrls: ['./pump-inventory-banner.component.css']
})
export class PumpInventoryBannerComponent implements OnInit {
  @Input()
  pumpInventoryItem: InventoryItem;
  
  setupTab: string;
  setupTabSub: Subscription;
  summaryTab: string;
  summaryTabSub: Subscription;
  mainTab: string;
  mainTabSub: Subscription;
  pumpInventoryData: PumpInventoryData;
  pumpInventoryDataSub: Subscription;
  selectedDepartmentId: string;
  selectedDepartmentIdSub: Subscription;
  connectedInventoryDataSub: Subscription;
  showConnectedItemBadge: boolean;
    constructor(private pumpInventoryService: PumpInventoryService, private integrationStateService: IntegrationStateService, private pumpCatalogService: PumpCatalogService) { }

  ngOnInit(): void {
    this.mainTabSub = this.pumpInventoryService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.setupTabSub = this.pumpInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
    });

    this.pumpInventoryDataSub = this.pumpInventoryService.pumpInventoryData.subscribe(val => {
      this.pumpInventoryData = val;
    });

    this.selectedDepartmentIdSub = this.pumpCatalogService.selectedDepartmentId.subscribe(val => {
      this.selectedDepartmentId = val;
    });

    this.summaryTabSub = this.pumpInventoryService.summaryTab.subscribe(val => {
      this.summaryTab = val;
    });

    this.connectedInventoryDataSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
      this.showConnectedItemBadge = connectedInventoryData.connectedItem !== undefined;
    });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.pumpInventoryDataSub.unsubscribe();
    this.selectedDepartmentIdSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.summaryTabSub.unsubscribe();
  }

  setSetupTab(str: string) {
    this.pumpInventoryService.setupTab.next(str);
  }

  selectedDepartment(departmentId: string) {
    this.pumpCatalogService.selectedDepartmentId.next(departmentId);
  }

  setMainTab(str: string) {
    this.pumpInventoryService.mainTab.next(str);
  }

  setSummaryTab(str: string) {
    this.pumpInventoryService.summaryTab.next(str);
  }
}
