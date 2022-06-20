import { Component, Input, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { WeatherBinsService, WeatherDataSourceView } from './weather-bins.service';

@Component({
  selector: 'app-weather-bins',
  templateUrl: './weather-bins.component.html',
  styleUrls: ['./weather-bins.component.css']
})
export class WeatherBinsComponent implements OnInit {
  settings: Settings;
  tabSelect: string = 'results';
  headerHeight: number;
  weatherDataSourceView: WeatherDataSourceView;
  constructor(private settingsDbService: SettingsDbService, private weatherBinsService: WeatherBinsService) { }

  ngOnInit(): void {
    this.settings = this.settingsDbService.globalSettings;
    this.weatherDataSourceView = this.weatherBinsService.weatherDataSourceView.getValue();
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setWeatherDataSource(source: WeatherDataSourceView) {
    this.weatherDataSourceView = source;
    this.weatherBinsService.weatherDataSourceView.next(this.weatherDataSourceView);
  }
}
