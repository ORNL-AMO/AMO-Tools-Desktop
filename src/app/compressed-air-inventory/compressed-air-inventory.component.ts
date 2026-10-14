import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Co2SavingsData } from '../calculator/utilities/co2-savings/co2-savings.service';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { CompressedAirInventoryService } from './compressed-air-inventory.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { Settings } from '../shared/models/settings';
import { CompressedAirInventoryData, CompressedAirInventorySystem, CompressedAirItem } from './compressed-air-inventory';
import { environment } from '../../environments/environment';
import { CompressedAirMotorIntegrationService } from '../shared/connected-inventory/compressed-air-motor-integration.service';
import { ConnectedInventoryData } from '../shared/connected-inventory/integrations';
import { CompressedAirCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/compressed-air-catalog.service';
import { IntegrationStateService } from '../shared/connected-inventory/integration-state.service';
import { CompressedAirAssessmentIntegrationService } from '../shared/connected-inventory/compressed-air-assessment-integration.service';
import { GenericCompressorDbService } from '../shared/generic-compressor-db.service';
import { COMPRESSED_AIR_INVENTORY_MAIN_VIEWS, COMPRESSED_AIR_INVENTORY_SETUP_GATED_VIEWS } from './compressed-air-inventory.routing';
import { getMergedRouteData, isMainTabAllowed } from '../shared/main-tab-routing/main-tab-routing';

@Component({
  selector: 'app-compressed-air-inventory',
  templateUrl: './compressed-air-inventory.component.html',
  styleUrl: './compressed-air-inventory.component.css',
  standalone: false
})
export class CompressedAirInventoryComponent implements OnInit {

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  containerHeight: number;

  setupTabSub: Subscription;
  setupTab: string;
  mainTab: string;
  mainTabSub: Subscription;
  routerEventsSub: Subscription;

  modalOpenSub: Subscription;
  isModalOpen: boolean;

  compressedAirInventoryDataSub: Subscription;
  compressedAirInventoryItem: InventoryItem;
  integrationStateSub: Subscription;
  showExportModal: boolean = false;
  showExportModalSub: Subscription;

  constructor(private compressedAirInventoryService: CompressedAirInventoryService,
    private cd: ChangeDetectorRef,
    private analyticsService: AnalyticsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private settingsDbService: SettingsDbService,
    private inventoryDbService: InventoryDbService,
    private genericCompressorDbService: GenericCompressorDbService,
    private compressedAirMotorIntegrationService: CompressedAirMotorIntegrationService,
    private compressedAirCatalogService: CompressedAirCatalogService,
    private integrationStateService: IntegrationStateService,
    private compressedAirAssessmentIntegrationService: CompressedAirAssessmentIntegrationService
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      let tmpItemId = Number(params['id']);
      this.compressedAirInventoryItem = this.inventoryDbService.getById(tmpItemId);
      let settings: Settings = this.settingsDbService.getByInventoryId(this.compressedAirInventoryItem);
      this.compressedAirInventoryService.settings.next(settings);
      this.compressedAirInventoryItem.compressedAirInventoryData.hasConnectedInventoryItems = this.compressedAirMotorIntegrationService.getHasConnectedMotorItems(this.compressedAirInventoryItem);
      this.compressedAirInventoryService.setIsValidInventory(this.compressedAirInventoryItem.compressedAirInventoryData);
      this.compressedAirInventoryService.compressedAirInventoryData.next(this.compressedAirInventoryItem.compressedAirInventoryData);
      this.compressedAirInventoryService.currentInventoryId = tmpItemId;
      this.syncTabsFromRoute();
      this.genericCompressorDbService.getAllCompressors(settings);

      let systemId = this.activatedRoute.snapshot.queryParamMap.get('systemId');
      if (!systemId) {
        // * department will be changed to 'system' in all inventories 
        systemId = this.activatedRoute.snapshot.queryParamMap.get('departmentId');
      }
      let itemId = this.activatedRoute.snapshot.queryParamMap.get('itemId');

      if (systemId) {
        this.compressedAirCatalogService.selectedSystemId.next(systemId)
        if (itemId) {
          // * we know it's a connected item nav. These id's would otherwise be set elsewhere
          this.redirectFromConnectedInventory(systemId, itemId);
        }
      } else {
        this.compressedAirCatalogService.selectedSystemId.next(this.compressedAirInventoryItem.compressedAirInventoryData.systems[0].id);
      }
    });

    this.routerEventsSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.syncTabsFromRoute();
    });

    this.mainTabSub = this.compressedAirInventoryService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    });

    this.setupTabSub = this.compressedAirInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.handleConnectedItemChanges();
      this.getContainerHeight();
    });

    this.integrationStateSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
      if (connectedInventoryData.shouldRestoreConnectedValues) {
        this.restoreConnectedInventoryValues(connectedInventoryData);
      }
    });

    this.compressedAirInventoryDataSub = this.compressedAirInventoryService.compressedAirInventoryData.subscribe(data => {
      this.handleConnectedItemChanges();
      this.saveDbData();
    });

    this.modalOpenSub = this.compressedAirInventoryService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
      this.cd.detectChanges();
    });

    this.showExportModalSub = this.compressedAirInventoryService.showExportModal.subscribe(val => {
      this.showExportModal = val;
    });
  }

  gAfterViewInit() {
    this.getContainerHeight();
  }

  ngOnDestroy() {
    this.routerEventsSub.unsubscribe();
    this.compressedAirInventoryService.currentInventoryId = undefined;
    this.setupTabSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.modalOpenSub.unsubscribe();
    this.showExportModalSub.unsubscribe();
    this.compressedAirInventoryDataSub.unsubscribe();
    this.compressedAirCatalogService.showCompressorProperties.next(false);
    this.integrationStateSub.unsubscribe();
  }



  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.clientHeight;
        let headerHeight = this.header.nativeElement.clientHeight;
        let footerHeight = 0;
        if (this.footer) {
          footerHeight = this.footer.nativeElement.clientHeight;
        }
        this.containerHeight = contentHeight - headerHeight - footerHeight;
      }, 100);
    }
  }

  async saveDbData() {
    let inventoryData: CompressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
    this.compressedAirInventoryItem.modifiedDate = new Date();
    this.compressedAirInventoryItem.appVersion = environment.version;
    this.compressedAirInventoryItem.compressedAirInventoryData = inventoryData;
    this.compressedAirInventoryItem.compressedAirInventoryData.hasConnectedInventoryItems = this.compressedAirMotorIntegrationService.getHasConnectedMotorItems(this.compressedAirInventoryItem);
    this.compressedAirInventoryItem.compressedAirInventoryData.hasConnectedCompressedAirAssessment = this.compressedAirAssessmentIntegrationService.getHasConnectedCompressedAirAssessment(this.compressedAirInventoryItem);
    await firstValueFrom(this.inventoryDbService.updateWithObservable(this.compressedAirInventoryItem));
    let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
    this.inventoryDbService.setAll(updatedInventoryItems);
  }


  /**
   * Pushes the main, setup and summary tab values found in the route data into the tab subjects.
   * Replaces a gated main tab with the first main tab while the inventory is invalid.
   */
  syncTabsFromRoute() {
    const routeData = getMergedRouteData(this.activatedRoute.snapshot);

    const isValid: boolean = this.compressedAirInventoryService.compressedAirInventoryData.getValue().isValid;
    if (routeData.mainView && !isMainTabAllowed(COMPRESSED_AIR_INVENTORY_SETUP_GATED_VIEWS, routeData.mainView, isValid)) {
      if (this.compressedAirInventoryService.mainTab.getValue() !== COMPRESSED_AIR_INVENTORY_MAIN_VIEWS[0]) {
        this.compressedAirInventoryService.mainTab.next(COMPRESSED_AIR_INVENTORY_MAIN_VIEWS[0]);
      }
      this.router.navigate(['/compressed-air-inventory', this.compressedAirInventoryService.currentInventoryId, COMPRESSED_AIR_INVENTORY_MAIN_VIEWS[0]], { replaceUrl: true });
      return;
    }
    if (routeData.mainView && routeData.mainView !== this.compressedAirInventoryService.mainTab.getValue()) {
      this.compressedAirInventoryService.mainTab.next(routeData.mainView);
    }
    if (routeData.setupView && routeData.setupView !== this.compressedAirInventoryService.setupTab.getValue()) {
      this.compressedAirInventoryService.setupTab.next(routeData.setupView);
    }
    if (routeData.summaryView && routeData.summaryView !== this.compressedAirInventoryService.summaryTab.getValue()) {
      this.compressedAirInventoryService.summaryTab.next(routeData.summaryView);
    }
  }

  continue() {
    if (this.setupTab == 'end-uses') {
      this.compressedAirInventoryService.goToMainTab('summary');
    } else {
      this.compressedAirInventoryService.continueSetupTab();
    }
  }

  back() {
    this.compressedAirInventoryService.backSetupTab();
  }

  closeExportModal(input: boolean) {
    this.compressedAirInventoryService.showExportModal.next(input);
  }

  restoreConnectedInventoryValues(connectedInventoryData: ConnectedInventoryData) {
    let selectedCompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    let selectedCompressedAirSystemId = this.compressedAirCatalogService.selectedSystemId.getValue();
    let system: CompressedAirInventorySystem = this.compressedAirInventoryItem.compressedAirInventoryData.systems.find(system => { return system.id == selectedCompressedAirSystemId });
    this.compressedAirAssessmentIntegrationService.restoreConnectedInventoryValues(selectedCompressedAirItem, system, connectedInventoryData);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressedAirItem);
    this.compressedAirInventoryService.updateCompressedAirInventoryData(selectedCompressedAirItem);
  }

  handleConnectedItemChanges() {
    const selectedCompressedAir: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    const selectedSystemId = this.compressedAirCatalogService.selectedSystemId.getValue();
    let currentSystem = this.compressedAirInventoryItem.compressedAirInventoryData.systems.find(system => { return system.id == selectedSystemId });
    if (selectedCompressedAir && currentSystem?.connectedAssessments) {
      this.compressedAirAssessmentIntegrationService.checkConnectedAssessmentDiffers(selectedCompressedAir, currentSystem);
    }
  }


  redirectFromConnectedInventory(systemId: string, itemId: string) {
    this.compressedAirCatalogService.selectedSystemId.next(systemId)
    let system: CompressedAirInventorySystem = this.compressedAirInventoryItem.compressedAirInventoryData.systems.find(system => { return system.id == systemId });
    let selectedItem: CompressedAirItem = system.catalog.find(compressedAirItem => { return compressedAirItem.id == itemId });
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedItem);
  }

}
