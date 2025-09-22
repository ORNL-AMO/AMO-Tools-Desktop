import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Co2SavingsData } from '../calculator/utilities/co2-savings/co2-savings.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { CompressedAirInventoryService } from './compressed-air-inventory.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { ActivatedRoute } from '@angular/router';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { Settings } from '../shared/models/settings';
import { CompressedAirInventoryData, CompressedAirInventorySystem, CompressedAirItem } from './compressed-air-inventory';
import { environment } from '../../environments/environment';
import { ExistingCompressorDbService } from './existing-compressor-db.service';
import { CompressedAirMotorIntegrationService } from '../shared/connected-inventory/compressed-air-motor-integration.service';
import { ConnectedInventoryData } from '../shared/connected-inventory/integrations';
import { CompressedAirCatalogService } from './compressed-air-inventory-setup/compressed-air-catalog/compressed-air-catalog.service';
import { IntegrationStateService } from '../shared/connected-inventory/integration-state.service';

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
    private settingsDbService: SettingsDbService,
    private inventoryDbService: InventoryDbService,
    private existingCompressorDbService: ExistingCompressorDbService,
    private compressedAirMotorIntegrationService: CompressedAirMotorIntegrationService,
    private compressedAirCatalogService: CompressedAirCatalogService,
    private integrationStateService: IntegrationStateService) { }

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
      this.existingCompressorDbService.getAllCompressors(settings);

      let systemId = this.activatedRoute.snapshot.queryParamMap.get('systemId');
      let itemId = this.activatedRoute.snapshot.queryParamMap.get('itemId');
      if (systemId && itemId) {
        this.redirectFromConnectedInventory(systemId, itemId);
      }
    });

    this.mainTabSub = this.compressedAirInventoryService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    });

    this.setupTabSub = this.compressedAirInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.getContainerHeight();
    });

    this.integrationStateSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
      if (connectedInventoryData.shouldRestoreConnectedValues) {
        this.restoreConnectedInventoryValues(connectedInventoryData);
      }
    });

    this.compressedAirInventoryDataSub = this.compressedAirInventoryService.compressedAirInventoryData.subscribe(data => {
      //TODO: CA Assessment integration 
      //this.handleConnectedItemChanges();
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
    this.setupTabSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.modalOpenSub.unsubscribe();
    this.showExportModalSub.unsubscribe();
    this.compressedAirInventoryDataSub.unsubscribe();
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
    //TODO CA Assessment integration
    //this.compressedAirInventoryItem.compressedAirInventoryData.hasConnectedPsat = this.psatIntegrationService.getHasConnectedPSAT(this.compressedAirInventoryItem);
    await firstValueFrom(this.inventoryDbService.updateWithObservable(this.compressedAirInventoryItem));
    let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
    this.inventoryDbService.setAll(updatedInventoryItems);
  }


  continue() {
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

  back() {
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

  closeExportModal(input: boolean) {
    this.compressedAirInventoryService.showExportModal.next(input);
  }

  restoreConnectedInventoryValues(connectedInventoryData: ConnectedInventoryData) {
    let selectedCompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    //TODO CA Assessment integration
    //this.compressedAirMotorIntegrationService.restoreConnectedInventoryValues(selectedCompressedAirItem, connectedInventoryData);
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedCompressedAirItem);
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressedAirItem);
  }

  handleConnectedItemChanges() {
    //TODO: CA Assessment integration 
    // let selectedPump = this.pumpCatalogService.selectedPumpItem.getValue();
    // if (selectedPump && selectedPump.connectedAssessments) {
    //   this.psatIntegrationService.checkConnectedAssessmentDiffers(selectedPump);
    // }
  }


  redirectFromConnectedInventory(systemId: string, itemId: string) {
    this.compressedAirCatalogService.selectedSystemId.next(systemId)
    let system: CompressedAirInventorySystem = this.compressedAirInventoryItem.compressedAirInventoryData.systems.find(system => { return system.id == systemId });
    let selectedItem: CompressedAirItem = system.catalog.find(compressedAirItem => { return compressedAirItem.id == itemId });
    this.compressedAirCatalogService.selectedCompressedAirItem.next(selectedItem);
    this.compressedAirInventoryService.mainTab.next('setup');
    this.compressedAirInventoryService.setupTab.next('compressed-air-catalog');
  }

}
