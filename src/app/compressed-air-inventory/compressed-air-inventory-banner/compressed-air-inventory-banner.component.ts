import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { InventoryItem } from '../../shared/models/inventory/inventory';
import { Subscription } from 'rxjs';
import { CompressedAirInventoryData } from '../compressed-air-inventory';
import { CompressedAirInventoryService } from '../compressed-air-inventory.service';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { IntegrationStateService } from '../../shared/connected-inventory/integration-state.service';
import { CompressedAirCatalogService } from '../compressed-air-inventory-setup/compressed-air-catalog/compressed-air-catalog.service';
import _ from 'lodash';

@Component({
  selector: 'app-compressed-air-inventory-banner',
  templateUrl: './compressed-air-inventory-banner.component.html',
  styleUrl: './compressed-air-inventory-banner.component.css',
  standalone: false
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
  selectedTab: string = 'compressor-properties';
  selectedSystemIdSub: Subscription;
  connectedInventoryDataSub: Subscription;
  showConnectedItemBadge: boolean;
  catalogClassStatus: string[];
  bannerCollapsed: boolean = true;
  isSelected: boolean = false;

  constructor(private compressedAirInventoryService: CompressedAirInventoryService, 
    private securityAndPrivacyService: SecurityAndPrivacyService, 
    private emailMeasurDataService: EmailMeasurDataService, 
    private dashboardService: DashboardService, 
    private compressedAirCatalogService: CompressedAirCatalogService,
    private integrationStateService: IntegrationStateService,
    private cd: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.mainTabSub = this.compressedAirInventoryService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.setupTabSub = this.compressedAirInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
    });

    this.compressedAirInventoryDataSub = this.compressedAirInventoryService.compressedAirInventoryData.subscribe(val => {
      this.compressedAirInventoryData = val;
    });

    this.selectedSystemIdSub = this.compressedAirCatalogService.selectedSystemId.subscribe(val => {
      if (val && val !== '') {
        this.selectedTab = val;
      } else if (val === '') {
        this.selectedTab = 'compressor-properties';
      }
    });

    this.summaryTabSub = this.compressedAirInventoryService.summaryTab.subscribe(val => {
      this.summaryTab = val;
    });

    this.connectedInventoryDataSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
      this.showConnectedItemBadge = connectedInventoryData.connectedItem !== undefined;
    });
  }


  selectTab(tabId: string) {
    this.selectedTab = tabId;
    if (tabId === 'compressor-properties') {
      this.isSelected = true;
      this.compressedAirCatalogService.showCompressorProperties.next(true);
      this.compressedAirCatalogService.selectedSystemId.next('');
    } else {
      this.isSelected = false;
      this.compressedAirCatalogService.showCompressorProperties.next(false);
      this.compressedAirCatalogService.selectedSystemId.next(tabId);
    }
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.compressedAirInventoryDataSub.unsubscribe();
    this.selectedSystemIdSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.summaryTabSub.unsubscribe();
    this.connectedInventoryDataSub.unsubscribe();
  }

  setSetupTab(str: string) {
    this.compressedAirInventoryService.setupTab.next(str);
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
    if (this.setupTab == 'end-uses') {
      this.compressedAirInventoryService.setupTab.next('compressed-air-catalog');
    } else if (this.setupTab == 'compressed-air-catalog') {
      this.compressedAirInventoryService.setupTab.next('compressor-properties');
    } else if (this.setupTab == 'compressor-properties') {
      this.compressedAirInventoryService.setupTab.next('system-setup');
    } else if (this.setupTab == 'system-setup') {
      this.compressedAirInventoryService.setupTab.next('plant-setup');
    }
  }

  continueSetupTabs() {
    if (this.setupTab == 'plant-setup') {
      this.compressedAirInventoryService.setupTab.next('system-setup');
    } else if (this.setupTab == 'system-setup') {
      this.compressedAirInventoryService.setupTab.next('compressor-properties');
    } else if (this.setupTab == 'compressor-properties') {
      this.compressedAirInventoryService.setupTab.next('compressed-air-catalog');
    } else if (this.setupTab == 'compressed-air-catalog') {
      this.compressedAirInventoryService.setupTab.next('end-uses');
    }
  }

  continueCompressedAirCatalogTabs() {
    if (!this.compressedAirInventoryData?.systems || this.compressedAirInventoryData.systems.length === 0) {
      return;
    }
    let currentIndex: number = _.findIndex(this.compressedAirInventoryData.systems, (system) => { return system.id == this.selectedTab });
    if (currentIndex != this.compressedAirInventoryData.systems.length - 1) {
      let nextID: string = this.compressedAirInventoryData.systems[currentIndex + 1].id;
      this.compressedAirCatalogService.selectedSystemId.next(nextID);
    }
  }

  backCompressedAirCatalogTabs() {
    if (!this.compressedAirInventoryData?.systems || this.compressedAirInventoryData.systems.length === 0) {
      return;
    }
    let currentIndex: number = _.findIndex(this.compressedAirInventoryData.systems, (system) => { return system.id == this.selectedTab });
    if (currentIndex != 0) {
      let nextID: string = this.compressedAirInventoryData.systems[currentIndex - 1].id;
      this.compressedAirCatalogService.selectedSystemId.next(nextID);
    }
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
    this.emailMeasurDataService.emailItemType.next('compresses-air-inventory');
    this.emailMeasurDataService.showEmailMeasurDataModal.next(true);
  }


}
