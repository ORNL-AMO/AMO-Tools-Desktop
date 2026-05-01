import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { InventoryItem } from '../../shared/models/inventory/inventory';
import { PumpCatalogService } from '../pump-inventory-setup/pump-catalog/pump-catalog.service';
import { PumpInventoryData } from '../pump-inventory';
import { PumpInventoryService } from '../pump-inventory.service';
import { IntegrationStateService } from '../../shared/connected-inventory/integration-state.service';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import _ from 'lodash';
import { DashboardService } from '../../dashboard/dashboard.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';

@Component({
    selector: 'app-pump-inventory-banner',
    templateUrl: './pump-inventory-banner.component.html',
    styleUrls: ['./pump-inventory-banner.component.css'],
    standalone: false
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
  selectedTab: string;
  selectedDepartmentIdSub: Subscription;
  connectedInventoryDataSub: Subscription;
  showConnectedItemBadge: boolean;
  catalogClassStatus: string[];
  bannerCollapsed: boolean = true;
  isSelected: boolean = false;
  showPumpPropertiesSub: Subscription;

  constructor(private pumpInventoryService: PumpInventoryService, 
    private emailMeasurDataService: EmailMeasurDataService,
    private integrationStateService: IntegrationStateService, 
    private pumpCatalogService: PumpCatalogService, private securityAndPrivacyService: SecurityAndPrivacyService, 
    private dashboardService: DashboardService) { }

  ngOnInit(): void {
        // Subscribe to showPumpProperties to keep isSelected in sync
        this.showPumpPropertiesSub = this.pumpCatalogService.showPumpProperties.subscribe(val => {
          this.isSelected = val;
        });
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
      if (val && val !== 'pump-properties') {
        this.selectedTab = val;
      } else if (val === 'pump-properties') {
        this.selectedTab = 'pump-properties';
      }
    });

    this.summaryTabSub = this.pumpInventoryService.summaryTab.subscribe(val => {
      this.summaryTab = val;
    });

    this.connectedInventoryDataSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
      this.showConnectedItemBadge = connectedInventoryData.connectedItem !== undefined;
    });

    this.pumpInventoryService.setupTab.next('plant-setup');
    let nextID: string = this.pumpInventoryData.departments[0].id;
    this.pumpCatalogService.selectedDepartmentId.next(nextID);  
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.pumpInventoryDataSub.unsubscribe();
    this.selectedDepartmentIdSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.summaryTabSub.unsubscribe();
    this.connectedInventoryDataSub.unsubscribe();
    this.showPumpPropertiesSub.unsubscribe();
  }

  setSetupTab(str: string) {
    this.pumpInventoryService.setupTab.next(str);
  }

  selectTab(tabId: string) {
    this.selectedTab = tabId;
    if (tabId === 'pump-properties') {
      this.pumpCatalogService.showPumpProperties.next(true);
      this.pumpCatalogService.selectedDepartmentId.next('pump-properties');
    } else {
      this.pumpCatalogService.showPumpProperties.next(false);
      this.pumpCatalogService.selectedDepartmentId.next(tabId);
    }
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
      this.pumpInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'department-setup') {
      this.pumpInventoryService.setupTab.next('plant-setup');
    }
  }

  continueSetupTabs(){
    if (this.setupTab == 'plant-setup') {
      this.pumpInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'department-setup') {
      this.pumpInventoryService.setupTab.next('pump-catalog');
    }
  }

  continuePumpCatalogTabs(){
    if (!this.pumpInventoryData?.departments || this.pumpInventoryData.departments.length === 0) {
      return;
    }
    let currentIndex: number = _.findIndex(this.pumpInventoryData.departments, (department) => {return department.id == this.selectedTab});
    if (currentIndex != this.pumpInventoryData.departments.length - 1) {
      let nextID: string = this.pumpInventoryData.departments[currentIndex + 1].id;
      this.pumpCatalogService.selectedDepartmentId.next(nextID);      
    }
  }

  backPumpCatalogTabs(){
    if (!this.pumpInventoryData?.departments || this.pumpInventoryData.departments.length === 0) {
      return;
    }
    let currentIndex: number = _.findIndex(this.pumpInventoryData.departments, (department) => {return department.id == this.selectedTab});
    if (currentIndex != 0) {
      let nextID: string = this.pumpInventoryData.departments[currentIndex - 1].id;
      this.pumpCatalogService.selectedDepartmentId.next(nextID);      
    }
  }

  mobileBackPumpCatalogTabs() {
    if (this.selectedTab === this.pumpInventoryData.departments[0]?.id) {
      this.selectTab('pump-properties');
    } else if (this.selectedTab !== 'pump-properties') {
      this.backPumpCatalogTabs();
    }

  }

  mobileContinuePumpCatalogTabs() {
    if (this.selectedTab === 'pump-properties' && this.pumpInventoryData.departments.length > 0) {
      this.selectTab(this.pumpInventoryData.departments[0].id);
    } else if (this.selectedTab !== 'pump-properties') {
      this.continuePumpCatalogTabs();
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

  openExportModal(){
    this.pumpInventoryService.showExportModal.next(true);
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', {shouldCollapse: false});
  }

  emailTreasureHuntData() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'inventory',
      itemName: this.pumpInventoryItem.name,
      itemData: this.pumpInventoryItem
    }
    this.emailMeasurDataService.emailItemType.next('PUMP-inventory');
    this.emailMeasurDataService.showEmailMeasurDataModal.next(true);
  }
}
