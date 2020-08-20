import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MotorInventoryService } from '../motor-inventory.service';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

@Component({
  selector: 'app-motor-inventory-setup',
  templateUrl: './motor-inventory-setup.component.html',
  styleUrls: ['./motor-inventory-setup.component.css']
})
export class MotorInventorySetupComponent implements OnInit {

  setupTab: string;
  setupTabSubscription: Subscription;
  tabSelect: string = 'department-catalog';
  modalOpenSub: Subscription;
  isModalOpen: boolean;
  constructor(private motorInventoryService: MotorInventoryService, private cd: ChangeDetectorRef, private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
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
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
}
