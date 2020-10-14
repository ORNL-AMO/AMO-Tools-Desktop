import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Settings } from '../../shared/models/settings';
import { WasteWaterService } from '../waste-water.service';

@Component({
  selector: 'app-results-panel',
  templateUrl: './results-panel.component.html',
  styleUrls: ['./results-panel.component.css']
})
export class ResultsPanelComponent implements OnInit {


  setupTab: string;
  setupTabSub: Subscription;
  tabSelect: string;
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
    });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

}
