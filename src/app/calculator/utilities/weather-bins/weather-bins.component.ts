import { Component, Input, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { WeatherBinsService } from './weather-bins.service';

@Component({
  selector: 'app-weather-bins',
  templateUrl: './weather-bins.component.html',
  styleUrls: ['./weather-bins.component.css']
})
export class WeatherBinsComponent implements OnInit {
  settings: Settings;
  tabSelect: string = 'results';
  headerHeight: number;
  constructor(private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    this.settings = this.settingsDbService.globalSettings;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
}
