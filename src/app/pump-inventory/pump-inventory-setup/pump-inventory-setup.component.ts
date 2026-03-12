import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { PumpInventoryService } from '../pump-inventory.service';

@Component({
    selector: 'app-pump-inventory-setup',
    templateUrl: './pump-inventory-setup.component.html',
    styleUrls: ['./pump-inventory-setup.component.css'],
    standalone: false
})
export class PumpInventorySetupComponent implements OnInit {

  @Input()
  containerHeight: number;
  setupTab: string;
  setupTabSubscription: Subscription;
  tabSelect: string;
  modalOpenSub: Subscription;
  isModalOpen: boolean;
  helpPanelTabSub: Subscription;
  smallScreenTab: string = 'form';
  constructor(private pumpInventoryService: PumpInventoryService,
    private cd: ChangeDetectorRef, private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    this.helpPanelTabSub = this.pumpInventoryService.helpPanelTab.subscribe(val => {
      if (val) {
        this.tabSelect = val;
      } else {
        this.setTab(this.settingsDbService.globalSettings.defaultPanelTab);
      }
    });
    this.setupTabSubscription = this.pumpInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
    });
    this.modalOpenSub = this.pumpInventoryService.modalOpen.subscribe(val => {
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
    this.pumpInventoryService.helpPanelTab.next(str);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
