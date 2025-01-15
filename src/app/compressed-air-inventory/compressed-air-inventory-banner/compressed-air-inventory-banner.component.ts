import { Component, Input, OnInit } from '@angular/core';
import { InventoryItem } from '../../shared/models/inventory/inventory';
import { Subscription } from 'rxjs';
import { CompressedAirInventoryData } from '../compressed-air-inventory';
import { CompressedAirInventoryService } from '../compressed-air-inventory.service';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { IntegrationStateService } from '../../shared/connected-inventory/integration-state.service';

@Component({
  selector: 'app-compressed-air-inventory-banner',
  templateUrl: './compressed-air-inventory-banner.component.html',
  styleUrl: './compressed-air-inventory-banner.component.css'
})
export class CompressedAirInventoryBannerComponent implements OnInit {

  @Input()
  compressedAirInventoryItem: InventoryItem;

  setupTab: string;
  setupTabSub: Subscription;
  summaryTab: string;
  summaryTabSub: Subscription;
  mainTab: string;
  mainTabSub: Subscription;
  compressedAirInventoryData: CompressedAirInventoryData;
  compressedAirInventoryDataSub: Subscription;
  selectedDepartmentId: string;
  selectedDepartmentIdSub: Subscription;
  connectedInventoryDataSub: Subscription;
  showConnectedItemBadge: boolean;
  catalogClassStatus: string[];
  bannerCollapsed: boolean = true;

  constructor(private compressedAirInventoryService: CompressedAirInventoryService, 
    private securityAndPrivacyService: SecurityAndPrivacyService, 
    private emailMeasurDataService: EmailMeasurDataService, 
    private dashboardService: DashboardService, 
    private integrationStateService: IntegrationStateService) { }


  ngOnInit(): void {
    this.mainTabSub = this.compressedAirInventoryService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.setupTabSub = this.compressedAirInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
    });

    this.compressedAirInventoryDataSub = this.compressedAirInventoryService.compressedAirInventoryData.subscribe(val => {
      this.compressedAirInventoryData = val;
      // if (!this.pumpInventoryData.isValid) {
      //   this.hasInvalidPumpItem = true;
      // } else {
      //   this.hasInvalidPumpItem = false;
      // }
    });

    // this.selectedDepartmentIdSub = this.pumpCatalogService.selectedDepartmentId.subscribe(val => {
    //   this.selectedDepartmentId = val;
    // });

    this.summaryTabSub = this.compressedAirInventoryService.summaryTab.subscribe(val => {
      this.summaryTab = val;
    });

    // this.connectedInventoryDataSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
    //   this.showConnectedItemBadge = connectedInventoryData.connectedItem !== undefined;
    // });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.compressedAirInventoryDataSub.unsubscribe();
    //this.selectedDepartmentIdSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.summaryTabSub.unsubscribe();
    //this.connectedInventoryDataSub.unsubscribe();
  }

  setSetupTab(str: string) {
    this.compressedAirInventoryService.setupTab.next(str);
  }

  selectedDepartment(departmentId: string) {
    //this.pumpCatalogService.selectedDepartmentId.next(departmentId);
  }

  setMainTab(str: string) {
    this.compressedAirInventoryService.mainTab.next(str);
    this.collapseBanner();
  }

  setSummaryTab(str: string) {
    this.compressedAirInventoryService.summaryTab.next(str);
  }

  showSecurityAndPrivacyModal() {
    this.securityAndPrivacyService.modalOpen.next(true);
    this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(true);
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  back() {
    if (this.mainTab == 'summary') {
      this.compressedAirInventoryService.mainTab.next('setup');
    }
  }

  continue() {
    if (this.mainTab == 'setup') {
      this.compressedAirInventoryService.mainTab.next('summary');
    }
  }

  backSetupTabs() {
    if (this.setupTab == 'pump-catalog') {
      this.compressedAirInventoryService.setupTab.next('pump-properties');
    } else if (this.setupTab == 'pump-properties') {
      this.compressedAirInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'department-setup') {
      this.compressedAirInventoryService.setupTab.next('plant-setup');
    }
  }

  continueSetupTabs() {
    if (this.setupTab == 'plant-setup') {
      this.compressedAirInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'department-setup') {
      this.compressedAirInventoryService.setupTab.next('pump-properties');
    } else if (this.setupTab == 'pump-properties') {
      this.compressedAirInventoryService.setupTab.next('pump-catalog');
    }
  }

  continuePumpCatalogTabs() {
    // let currentIndex: number = _.findIndex(this.pumpInventoryData.departments, (department) => { return department.id == this.selectedDepartmentId });
    // if (currentIndex != this.pumpInventoryData.departments.length - 1) {
    //   let nextID: string = this.pumpInventoryData.departments[currentIndex + 1].id;
    //   this.pumpCatalogService.selectedDepartmentId.next(nextID);
    // }
  }

  backPumpCatalogTabs() {
    // let currentIndex: number = _.findIndex(this.pumpInventoryData.departments, (department) => { return department.id == this.selectedDepartmentId });
    // if (currentIndex != 0) {
    //   let nextID: string = this.pumpInventoryData.departments[currentIndex - 1].id;
    //   this.pumpCatalogService.selectedDepartmentId.next(nextID);
    // }
  }

  continueSummaryTabs() {
    if (this.summaryTab == 'overview') {
      this.compressedAirInventoryService.summaryTab.next('graphs');
    } else if (this.summaryTab == 'graphs') {
      this.compressedAirInventoryService.summaryTab.next('table');
    }
  }

  backSummaryTabs() {
    if (this.summaryTab == 'table') {
      this.compressedAirInventoryService.summaryTab.next('graphs');
    } else if (this.summaryTab == 'graphs') {
      this.compressedAirInventoryService.summaryTab.next('overview');
    }
  }

  openExportModal() {
    this.compressedAirInventoryService.showExportModal.next(true);
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', { shouldCollapse: false });
  }

  emailTreasureHuntData() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'inventory',
      itemName: this.compressedAirInventoryItem.name,
      itemData: this.compressedAirInventoryItem
    }
    this.emailMeasurDataService.emailItemType.next('PUMP-inventory');
    this.emailMeasurDataService.showEmailMeasurDataModal.next(true);
  }


}
