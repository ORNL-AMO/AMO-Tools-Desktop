import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { MotorInventoryService } from './motor-inventory.service';
import { Subscription } from 'rxjs';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { MotorInventoryData } from './motor-inventory';
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
  mainTab: string;
  mainTabSub: Subscription;

  motorInventoryDataSub: Subscription;
  motorInventoryItem: InventoryItem;
  batchAnalysisSettingsSub: Subscription;
  constructor(private motorInventoryService: MotorInventoryService, private activatedRoute: ActivatedRoute,
    private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService, private inventoryDbService: InventoryDbService,
    private motorCatalogService: MotorCatalogService, private batchAnalysisService: BatchAnalysisService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      let tmpItemId = Number(params['id']);
      this.motorInventoryItem = this.inventoryDbService.getById(tmpItemId);
      let settings: Settings = this.settingsDbService.getByInventoryId(this.motorInventoryItem);
      this.motorInventoryService.settings.next(settings);
      this.motorInventoryService.motorInventoryData.next(this.motorInventoryItem.motorInventoryData);
      if(this.motorInventoryItem.batchAnalysisSettings){
        this.batchAnalysisService.batchAnalysisSettings.next(this.motorInventoryItem.batchAnalysisSettings);
      }
    });
    this.mainTabSub = this.motorInventoryService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    });
    this.setupTabSub = this.motorInventoryService.setupTab.subscribe(val => {
      this.getContainerHeight();
    });
    this.motorInventoryDataSub = this.motorInventoryService.motorInventoryData.subscribe(data => {
      this.saveDbData();
    });
    this.batchAnalysisSettingsSub = this.batchAnalysisService.batchAnalysisSettings.subscribe(batchSettings => {
      this.saveDbData();
    });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.motorInventoryDataSub.unsubscribe();
    this.batchAnalysisSettingsSub.unsubscribe();
    this.motorCatalogService.selectedMotorItem.next(undefined);
    this.motorCatalogService.selectedDepartmentId.next(undefined);
    this.motorCatalogService.filterMotorOptions.next(undefined);
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

  saveDbData() {
    let inventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    let batchAnalysisSettings: BatchAnalysisSettings = this.batchAnalysisService.batchAnalysisSettings.getValue();
    this.motorInventoryItem.modifiedDate = new Date();
    this.motorInventoryItem.appVersion = packageJson.version;
    this.motorInventoryItem.motorInventoryData = inventoryData;
    this.motorInventoryItem.batchAnalysisSettings = batchAnalysisSettings;
    this.indexedDbService.putInventoryItem(this.motorInventoryItem).then(() => {
      this.inventoryDbService.setAll();
    });
  }
}
