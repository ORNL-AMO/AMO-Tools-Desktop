import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { WeatherBinsService, WeatherDataSourceView } from './weather-bins.service';

@Component({
  selector: 'app-weather-bins',
  templateUrl: './weather-bins.component.html',
  styleUrls: ['./weather-bins.component.css']
})
export class WeatherBinsComponent implements OnInit {
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  
  smallScreenTab: string = 'form';
  containerHeight: number;
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

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
