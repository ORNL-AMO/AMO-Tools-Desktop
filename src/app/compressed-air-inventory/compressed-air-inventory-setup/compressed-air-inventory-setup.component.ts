import { ChangeDetectorRef, Component, Input, OnInit, NgZone } from '@angular/core';
import { CompressedAirInventoryService } from '../compressed-air-inventory.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { CompressedAirCatalogService } from './compressed-air-catalog/compressed-air-catalog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-compressed-air-inventory-setup',
  templateUrl: './compressed-air-inventory-setup.component.html',
  styleUrl: './compressed-air-inventory-setup.component.css',
  standalone: false
})
export class CompressedAirInventorySetupComponent implements OnInit {

  @Input()
  containerHeight: number;
  setupTab: string;
  setupTabSubscription: Subscription;
  tabSelect: string;
  modalOpenSub: Subscription;
  isModalOpen: boolean;
  helpPanelTabSub: Subscription;
  smallScreenTab: string = 'form';
  showCompressorProperties: boolean = false;
  showCompressorPropertiesSub: Subscription;

  constructor(private compressedAirInventoryService: CompressedAirInventoryService,
    private cd: ChangeDetectorRef, private settingsDbService: SettingsDbService, private compressedAirCatalogService: CompressedAirCatalogService) { }

  ngOnInit(): void {
    this.showCompressorPropertiesSub = this.compressedAirCatalogService.showCompressorProperties.subscribe(val => {
      this.showCompressorProperties = val;
      this.cd.detectChanges();
    });

    this.helpPanelTabSub = this.compressedAirInventoryService.helpPanelTab.subscribe(val => {
      if (val) {
        this.tabSelect = val;
      } else {
        this.setTab(this.settingsDbService.globalSettings.defaultPanelTab);
      }
    });
    this.setupTabSubscription = this.compressedAirInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
    });
    this.modalOpenSub = this.compressedAirInventoryService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.setupTabSubscription.unsubscribe();
    this.modalOpenSub.unsubscribe();
    this.helpPanelTabSub.unsubscribe();
    this.showCompressorPropertiesSub.unsubscribe();
  }

  setTab(str: string) {
    this.compressedAirInventoryService.helpPanelTab.next(str);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}
