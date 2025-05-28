import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Settings } from '../../shared/models/settings';
import { WasteWaterService } from '../waste-water.service';

@Component({
    selector: 'app-results-panel',
    templateUrl: './results-panel.component.html',
    styleUrls: ['./results-panel.component.css'],
    standalone: false
})
export class ResultsPanelComponent implements OnInit {


  setupTab: string;
  setupTabSub: Subscription;
  mainTab: string;
  mainTabSub: Subscription;
  tabSelect: string;
  displayTabs: boolean;
  constructor(private wasteWaterService: WasteWaterService, private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    let globalSettings: Settings = this.settingsDbService.globalSettings;
    if (globalSettings.defaultPanelTab) {
      this.tabSelect = globalSettings.defaultPanelTab;
    } else {
      this.tabSelect = 'results';
    }

    this.setupTabSub = this.wasteWaterService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.checkDisplayTabs();
    });

    this.mainTabSub = this.wasteWaterService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.checkDisplayTabs();
    });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.mainTabSub.unsubscribe();
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  checkDisplayTabs() {
    this.displayTabs = ((this.setupTab == 'aerator-performance' && this.mainTab == 'baseline') || this.mainTab == 'assessment')
  }

}
