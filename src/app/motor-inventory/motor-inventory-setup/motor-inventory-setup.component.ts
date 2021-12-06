import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { MotorInventoryService } from '../motor-inventory.service';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

@Component({
  selector: 'app-motor-inventory-setup',
  templateUrl: './motor-inventory-setup.component.html',
  styleUrls: ['./motor-inventory-setup.component.css']
})
export class MotorInventorySetupComponent implements OnInit {

  @Input()
  containerHeight: number;
  setupTab: string;
  setupTabSubscription: Subscription;
  tabSelect: string;
  modalOpenSub: Subscription;
  isModalOpen: boolean;
  helpPanelTabSub: Subscription;
  constructor(private motorInventoryService: MotorInventoryService, private cd: ChangeDetectorRef, private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    this.helpPanelTabSub = this.motorInventoryService.helpPanelTab.subscribe(val => {
      if (val) {
        this.tabSelect = val;
      } else {
        this.setTab(this.settingsDbService.globalSettings.defaultPanelTab);
      }
    });
    this.setupTabSubscription = this.motorInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
    });
    this.modalOpenSub = this.motorInventoryService.modalOpen.subscribe(val => {
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
    this.motorInventoryService.helpPanelTab.next(str);
  }
}
