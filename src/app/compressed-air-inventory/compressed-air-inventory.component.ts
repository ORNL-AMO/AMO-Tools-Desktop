import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Co2SavingsData } from '../calculator/utilities/co2-savings/co2-savings.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { CompressedAirInventoryService } from './compressed-air-inventory.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { ActivatedRoute } from '@angular/router';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { MotorIntegrationService } from '../shared/connected-inventory/motor-integration.service';
import { Settings } from '../shared/models/settings';
import { CompressedAirInventoryData } from './compressed-air-inventory';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-compressed-air-inventory',
  templateUrl: './compressed-air-inventory.component.html',
  styleUrl: './compressed-air-inventory.component.css'
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
    private inventoryDbService: InventoryDbService,) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      let tmpItemId = Number(params['id']);
      this.compressedAirInventoryItem = this.inventoryDbService.getById(tmpItemId);
      let settings: Settings = this.settingsDbService.getByInventoryId(this.compressedAirInventoryItem);
      this.compressedAirInventoryService.settings.next(settings);
      this.compressedAirInventoryService.setIsValidInventory(this.compressedAirInventoryItem.compressedAirInventoryData);
      this.compressedAirInventoryService.compressedAirInventoryData.next(this.compressedAirInventoryItem.compressedAirInventoryData);
      this.compressedAirInventoryService.currentInventoryId = tmpItemId;

      let departmentId = this.activatedRoute.snapshot.queryParamMap.get('departmentId');
      let itemId = this.activatedRoute.snapshot.queryParamMap.get('itemId');
      // if (departmentId && itemId) {
      //   this.redirectFromConnectedInventory(departmentId, itemId);
      // }
    });

    this.mainTabSub = this.compressedAirInventoryService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    });

    this.setupTabSub = this.compressedAirInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.getContainerHeight();
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
    //this.compressedAirInventoryItem.pumpInventoryData.hasConnectedInventoryItems = this.motorIntegrationService.getHasConnectedMotorItems(this.compressedAirInventoryItem);
    //this.compressedAirInventoryItem.pumpInventoryData.hasConnectedPsat = this.psatIntegrationService.getHasConnectedPSAT(this.compressedAirInventoryItem);
    await firstValueFrom(this.inventoryDbService.updateWithObservable(this.compressedAirInventoryItem));
    let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
    this.inventoryDbService.setAll(updatedInventoryItems);
  }


  continue() {
    if (this.setupTab == 'plant-setup') {
      this.compressedAirInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'department-setup') {
      this.compressedAirInventoryService.setupTab.next('pump-properties');
    } else if (this.setupTab == 'pump-properties') {
      this.compressedAirInventoryService.setupTab.next('pump-catalog');
    } else if (this.setupTab == 'pump-catalog') {
      this.compressedAirInventoryService.mainTab.next('summary');
    }
  }

  back() {
    if (this.setupTab == 'department-setup') {
      this.compressedAirInventoryService.setupTab.next('plant-setup');
    } else if (this.setupTab == 'pump-properties') {
      this.compressedAirInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'pump-catalog') {
      this.compressedAirInventoryService.setupTab.next('pump-properties');
    }
  }

  closeExportModal(input: boolean) {
    this.compressedAirInventoryService.showExportModal.next(input);
  }


  redirectFromConnectedInventory(departmentId: string, itemId: string) {
    // this.compressedAirInventoryService.selectedDepartmentId.next(departmentId)
    // let department: PumpInventoryDepartment = this.compressedAirInventoryItem.pumpInventoryData.departments.find(department => { return department.id == departmentId });
    // let selectedItem: PumpItem = department.catalog.find(pumpItem => { return pumpItem.id == itemId });
    // this.pumpCatalogService.selectedPumpItem.next(selectedItem);
    // this.pumpInventoryService.mainTab.next('setup');
    // this.pumpInventoryService.setupTab.next('pump-catalog');
  }

}
