import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { InventoryItem } from '../../shared/models/inventory/inventory';
import { PumpCatalogService } from '../pump-inventory-setup/pump-catalog/pump-catalog.service';
import { PumpInventoryData } from '../pump-inventory';
import { PumpInventoryService } from '../pump-inventory.service';
import { IntegrationStateService } from '../../shared/connected-inventory/integration-state.service';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import _ from 'lodash';

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
  catalogClassStatus: string[];
  bannerCollapsed: boolean = true;
  // hasInvalidPumpItem: boolean;
    constructor(private pumpInventoryService: PumpInventoryService, private integrationStateService: IntegrationStateService, 
      private pumpCatalogService: PumpCatalogService, private securityAndPrivacyService: SecurityAndPrivacyService) { }

  ngOnInit(): void {
    this.mainTabSub = this.pumpInventoryService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.setupTabSub = this.pumpInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
    });

    this.pumpInventoryDataSub = this.pumpInventoryService.pumpInventoryData.subscribe(val => {
      this.pumpInventoryData = val;
      // if (!this.pumpInventoryData.isValid) {
      //   this.hasInvalidPumpItem = true;
      // } else {
      //   this.hasInvalidPumpItem = false;
      // }
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
    this.connectedInventoryDataSub.unsubscribe();
  }

  setSetupTab(str: string) {
    this.pumpInventoryService.setupTab.next(str);
  }

  selectedDepartment(departmentId: string) {
    this.pumpCatalogService.selectedDepartmentId.next(departmentId);
  }

  setMainTab(str: string) {
    this.pumpInventoryService.mainTab.next(str);
    this.collapseBanner();
  }

  setSummaryTab(str: string) {
    this.pumpInventoryService.summaryTab.next(str);
  }

  showSecurityAndPrivacyModal() {
    this.securityAndPrivacyService.modalOpen.next(true);
    this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(true);
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  back(){
    if (this.mainTab == 'summary') {
      this.pumpInventoryService.mainTab.next('setup');    
    } 
  }

  continue(){
    if (this.mainTab == 'setup') {
      this.pumpInventoryService.mainTab.next('summary');    
    } 
  }

  backSetupTabs(){
    if (this.setupTab == 'pump-catalog') {
      this.pumpInventoryService.setupTab.next('pump-properties');
    } else if (this.setupTab == 'pump-properties') {
      this.pumpInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'department-setup') {
      this.pumpInventoryService.setupTab.next('plant-setup');
    } 
  }

  continueSetupTabs(){
    if (this.setupTab == 'plant-setup') {
      this.pumpInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'department-setup') {
      this.pumpInventoryService.setupTab.next('pump-properties');
    } else if (this.setupTab == 'pump-properties') {
      this.pumpInventoryService.setupTab.next('pump-catalog');
    } 
  }

  continuePumpCatalogTabs(){
    let currentIndex: number = _.findIndex(this.pumpInventoryData.departments, (department) => {return department.id == this.selectedDepartmentId});
    if (currentIndex != this.pumpInventoryData.departments.length - 1) {
      let nextID: string = this.pumpInventoryData.departments[currentIndex + 1].id;
      this.pumpCatalogService.selectedDepartmentId.next(nextID);      
    }
  }

  backPumpCatalogTabs(){
    let currentIndex: number = _.findIndex(this.pumpInventoryData.departments, (department) => {return department.id == this.selectedDepartmentId});
    if (currentIndex != 0) {
      let nextID: string = this.pumpInventoryData.departments[currentIndex - 1].id;
      this.pumpCatalogService.selectedDepartmentId.next(nextID);      
    }
  }

  continueSummaryTabs(){
    if (this.summaryTab == 'overview') {
      this.pumpInventoryService.summaryTab.next('graphs');
    } else if (this.summaryTab == 'graphs') {
      this.pumpInventoryService.summaryTab.next('table');
    } 
  }

  backSummaryTabs(){
    if (this.summaryTab == 'table') {
      this.pumpInventoryService.summaryTab.next('graphs');
    } else if (this.summaryTab == 'graphs') {
      this.pumpInventoryService.summaryTab.next('overview');
    }
  }
}
