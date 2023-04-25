import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
// import { BatchAnalysisService, BatchAnalysisSettings } from '../motor-inventory/batch-analysis/batch-analysis.service';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { Settings } from '../shared/models/settings';
import { PumpCatalogService } from './pump-inventory-setup/pump-catalog/pump-catalog.service';
import { PumpInventoryData } from './pump-inventory';
import { PumpInventoryService } from './pump-inventory.service';

declare const packageJson;

@Component({
  selector: 'app-pump-inventory',
  templateUrl: './pump-inventory.component.html',
  styleUrls: ['./pump-inventory.component.css']
})
export class PumpInventoryComponent implements OnInit {
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

  pumpInventoryDataSub: Subscription;
  pumpInventoryItem: InventoryItem;
  // batchAnalysisSettingsSub: Subscription;
  constructor(private pumpInventoryService: PumpInventoryService, 
    private activatedRoute: ActivatedRoute,
    private settingsDbService: SettingsDbService, 
    private inventoryDbService: InventoryDbService,
    private pumpCatalogService: PumpCatalogService, 
    // private batchAnalysisService: BatchAnalysisService, 
    private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      let tmpItemId = Number(params['id']);
      this.pumpInventoryItem = this.inventoryDbService.getById(tmpItemId);
      let settings: Settings = this.settingsDbService.getByInventoryId(this.pumpInventoryItem);
      this.pumpInventoryService.settings.next(settings);
      this.pumpInventoryService.pumpInventoryData.next(this.pumpInventoryItem.pumpInventoryData);
      // if (this.pumpInventoryItem.batchAnalysisSettings) {
      //   this.batchAnalysisService.batchAnalysisSettings.next(this.pumpInventoryItem.batchAnalysisSettings);
      // }
    });
    this.mainTabSub = this.pumpInventoryService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    });
    this.setupTabSub = this.pumpInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.getContainerHeight();
    });
    this.pumpInventoryDataSub = this.pumpInventoryService.pumpInventoryData.subscribe(data => {
      this.saveDbData();
    });
    // this.batchAnalysisSettingsSub = this.batchAnalysisService.batchAnalysisSettings.subscribe(batchSettings => {
    //   this.saveDbData();
    // });
    this.modalOpenSub = this.pumpInventoryService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.pumpInventoryDataSub.unsubscribe();
    // this.batchAnalysisSettingsSub.unsubscribe();
    this.pumpCatalogService.selectedPumpItem.next(undefined);
    this.pumpCatalogService.selectedDepartmentId.next(undefined);
    this.modalOpenSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.getContainerHeight();
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
    let inventoryData: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
    // let batchAnalysisSettings: BatchAnalysisSettings = this.batchAnalysisService.batchAnalysisSettings.getValue();
    this.pumpInventoryItem.modifiedDate = new Date();
    this.pumpInventoryItem.appVersion = packageJson.version;
    this.pumpInventoryItem.pumpInventoryData = inventoryData;
    // this.pumpInventoryItem.batchAnalysisSettings = batchAnalysisSettings;
    let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.updateWithObservable(this.pumpInventoryItem));
    this.inventoryDbService.setAll(updatedInventoryItems);
  }

  continue() {
    // PUMP TODO
    if (this.setupTab == 'plant-setup') {
      this.pumpInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'department-setup') {
      this.pumpInventoryService.setupTab.next('pump-properties');
    } else if (this.setupTab == 'pump-properties') {
      this.pumpInventoryService.setupTab.next('pump-catalog');
    } else if (this.setupTab == 'pump-catalog') {
      this.pumpInventoryService.mainTab.next('summary');
    }
  }

  back(){
    // PUMP TODO
    if (this.setupTab == 'department-setup') {
      this.pumpInventoryService.setupTab.next('plant-setup');
    } else if (this.setupTab == 'pump-properties') {
      this.pumpInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'pump-catalog') {
      this.pumpInventoryService.setupTab.next('pump-properties');
    }
  }
}
