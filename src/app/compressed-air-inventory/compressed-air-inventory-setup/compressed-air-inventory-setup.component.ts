import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CompressedAirInventoryService } from '../compressed-air-inventory.service';
import { EGridService } from '../../shared/helper-services/e-grid.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
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
  initPlantSetup: boolean = false;
  smallScreenTab: string = 'form';

  constructor(private compressedAirInventoryService: CompressedAirInventoryService, private egridService: EGridService,
    private cd: ChangeDetectorRef, private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    this.egridService.processCSVData().then(result => {
      this.initPlantSetup = true;
    }).catch(err => {
      this.initPlantSetup = false;
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
    })
  }

  ngOnDestroy() {
    this.setupTabSubscription.unsubscribe();
    this.modalOpenSub.unsubscribe();
    this.helpPanelTabSub.unsubscribe();
  }

  setTab(str: string) {
    this.compressedAirInventoryService.helpPanelTab.next(str);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}
