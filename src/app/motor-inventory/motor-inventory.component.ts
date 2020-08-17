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
import { SettingsService } from '../settings/settings.service';

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
  constructor(private motorInventoryService: MotorInventoryService, private activatedRoute: ActivatedRoute,
    private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService, private inventoryDbService: InventoryDbService,
    private settingsService: SettingsService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      let tmpItemId = Number(params['id']);
      this.motorInventoryItem = this.inventoryDbService.getById(tmpItemId);
      let settings: Settings = this.settingsDbService.getByInventoryId(this.motorInventoryItem);
      console.log(settings);
      this.motorInventoryService.settings.next(settings);
      this.motorInventoryService.motorInventoryData.next(this.motorInventoryItem.motorInventoryData);
    });
    this.mainTabSub = this.motorInventoryService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    });
    this.setupTabSub = this.motorInventoryService.setupTab.subscribe(val => {
      this.getContainerHeight();
    });
    this.motorInventoryDataSub = this.motorInventoryService.motorInventoryData.subscribe(data => {
      this.saveDbData(data);
    });

  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.motorInventoryDataSub.unsubscribe();
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

  saveDbData(inventoryData: MotorInventoryData) {
    this.motorInventoryItem.modifiedDate = new Date();
    this.motorInventoryItem.appVersion = packageJson.version;
    this.motorInventoryItem.motorInventoryData = inventoryData;
    this.indexedDbService.putInventoryItem(this.motorInventoryItem).then(() => {
      this.inventoryDbService.setAll();
    });
  }
}
