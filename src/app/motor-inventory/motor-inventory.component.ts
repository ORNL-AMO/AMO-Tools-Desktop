import { Component, OnInit, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MotorInventoryService } from './motor-inventory.service';
import { firstValueFrom, Subscription } from 'rxjs';
 
import { MotorInventoryData, MotorInventoryDepartment, MotorItem } from './motor-inventory';
import { Settings } from '../shared/models/settings';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { ActivatedRoute } from '@angular/router';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { MotorCatalogService } from './motor-inventory-setup/motor-catalog/motor-catalog.service';
import { BatchAnalysisService, BatchAnalysisSettings } from './batch-analysis/batch-analysis.service';

declare const packageJson;

@Component({
  selector: 'app-motor-inventory',
  templateUrl: './motor-inventory.component.html',
  styleUrls: ['./motor-inventory.component.css']
})
export class MotorInventoryComponent implements OnInit {
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

  motorInventoryDataSub: Subscription;
  motorInventoryItem: InventoryItem;
  batchAnalysisSettingsSub: Subscription;
  showWelcomeScreen: boolean = false;
  constructor(private motorInventoryService: MotorInventoryService, private activatedRoute: ActivatedRoute,
       private settingsDbService: SettingsDbService, private inventoryDbService: InventoryDbService,
    private motorCatalogService: MotorCatalogService, private batchAnalysisService: BatchAnalysisService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      let tmpItemId = Number(params['id']);
      this.motorInventoryItem = this.inventoryDbService.getById(tmpItemId);
      let settings: Settings = this.settingsDbService.getByInventoryId(this.motorInventoryItem);
      this.motorInventoryService.settings.next(settings);
      this.motorInventoryService.motorInventoryData.next(this.motorInventoryItem.motorInventoryData);
      if (this.motorInventoryItem.batchAnalysisSettings) {
        this.batchAnalysisService.batchAnalysisSettings.next(this.motorInventoryItem.batchAnalysisSettings);
      }
      let departmentId = this.activatedRoute.snapshot.queryParamMap.get('departmentId');
      let itemId = this.activatedRoute.snapshot.queryParamMap.get('itemId');
      if (departmentId && itemId) {
        this.redirectFromConnectedInventory(departmentId, itemId);
      }
    });


    this.mainTabSub = this.motorInventoryService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    });
    this.setupTabSub = this.motorInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.getContainerHeight();
    });
    this.motorInventoryDataSub = this.motorInventoryService.motorInventoryData.subscribe(data => {
      this.saveDbData();
    });
    this.batchAnalysisSettingsSub = this.batchAnalysisService.batchAnalysisSettings.subscribe(batchSettings => {
      this.saveDbData();
    });
    this.modalOpenSub = this.motorInventoryService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
      this.cd.detectChanges();
    });
    this.checkShowWelcomeScreen();
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.motorInventoryDataSub.unsubscribe();
    this.batchAnalysisSettingsSub.unsubscribe();
    this.motorCatalogService.selectedMotorItem.next(undefined);
    this.motorCatalogService.selectedDepartmentId.next(undefined);
    this.motorCatalogService.filterMotorOptions.next(undefined);
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
    let inventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    let batchAnalysisSettings: BatchAnalysisSettings = this.batchAnalysisService.batchAnalysisSettings.getValue();
    this.motorInventoryItem.modifiedDate = new Date();
    this.motorInventoryItem.appVersion = packageJson.version;
    this.motorInventoryItem.motorInventoryData = inventoryData;
    this.motorInventoryItem.batchAnalysisSettings = batchAnalysisSettings;
    let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.updateWithObservable(this.motorInventoryItem));
    this.inventoryDbService.setAll(updatedInventoryItems);
  }

  continue() {
    if (this.setupTab == 'plant-setup') {
      this.motorInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'department-setup') {
      this.motorInventoryService.setupTab.next('motor-properties');
    } else if (this.setupTab == 'motor-properties') {
      this.motorInventoryService.setupTab.next('motor-catalog');
    } else if (this.setupTab == 'motor-catalog') {
      this.motorInventoryService.mainTab.next('summary');
    }
  }

  back(){
    if (this.setupTab == 'department-setup') {
      this.motorInventoryService.setupTab.next('plant-setup');
    } else if (this.setupTab == 'motor-properties') {
      this.motorInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'motor-catalog') {
      this.motorInventoryService.setupTab.next('motor-properties');
    }
  }

  checkShowWelcomeScreen() {
    if (!this.settingsDbService.globalSettings.disableMotorInventoryTutorial) {
      this.showWelcomeScreen = true;
      this.motorInventoryService.modalOpen.next(true);
    }
  }

  redirectFromConnectedInventory(departmentId: string, itemId: string) {
    this.motorCatalogService.selectedDepartmentId.next(departmentId)
    let department: MotorInventoryDepartment = this.motorInventoryItem.motorInventoryData.departments.find(department => { return department.id == departmentId });
    let selectedItem: MotorItem = department.catalog.find(motorItem => { return motorItem.id ==  itemId});
    this.motorCatalogService.selectedMotorItem.next(selectedItem);
    this.motorInventoryService.setupTab.next('motor-catalog');
  }

  async closeWelcomeScreen() {
    this.settingsDbService.globalSettings.disableMotorInventoryTutorial = true;
    let settings: Settings[] = await firstValueFrom(this.settingsDbService.updateWithObservable(this.settingsDbService.globalSettings))
    this.settingsDbService.setAll(settings);
    this.showWelcomeScreen = false;
    this.motorInventoryService.modalOpen.next(false);
  }
}
