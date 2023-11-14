import { Component, ElementRef, HostListener, Input, OnInit, ViewChild, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { CoolingTowerBasinService } from './cooling-tower-basin.service';
import { WeatherBinsInput, WeatherBinsService, WeatherDataSourceView } from '../../utilities/weather-bins/weather-bins.service';
import { CoolingTowerBasinTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { CoolingTowerBasinInput } from '../../../shared/models/chillers';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-cooling-tower-basin',
  templateUrl: './cooling-tower-basin.component.html',
  styleUrls: ['./cooling-tower-basin.component.css']
})
export class CoolingTowerBasinComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<CoolingTowerBasinTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  helpPanelContainerHeight: number;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  
  coolingTowerBasinInputSub: Subscription;
  coolingTowerBasinInput: CoolingTowerBasinInput;
  weatherBinSub: Subscription;
  weatherData: WeatherBinsInput;
  
  containerHeight: number;
  headerHeight: number;
  tabSelect: string = 'results';
  smallScreenTab: string = 'form';

  displayWeatherTab: boolean = false;
  hasWeatherBinsDataSub: Subscription;
  hasWeatherBinsData: boolean = false;
  isShowingWeatherResults : boolean = false;
  weatherDataSourceView: WeatherDataSourceView;
  
  constructor(private coolingTowerBasinService: CoolingTowerBasinService, private weatherBinService: WeatherBinsService,
    private cd: ChangeDetectorRef, private settingsDbService: SettingsDbService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-PC-cooling-tower-basin');
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.weatherDataSourceView = this.weatherBinService.weatherDataSourceView.getValue();
    this.coolingTowerBasinInput = this.coolingTowerBasinService.coolingTowerBasinInput.getValue();
    if(!this.coolingTowerBasinInput) {
      this.coolingTowerBasinService.initDefaultEmptyInputs(this.settings);
      this.coolingTowerBasinService.initDefaultEmptyOutputs();
    } else {
      this.coolingTowerBasinService.setHasWeatherBinsData();
    }
    this.coolingTowerBasinService.setAsWeatherIntegratedCalculator();
    this.initSubscriptions();
  }

  ngOnDestroy() {
    if(!this.inTreasureHunt){
      this.coolingTowerBasinService.coolingTowerBasinInput.next(this.coolingTowerBasinInput);
    } else {
      this.coolingTowerBasinService.coolingTowerBasinInput.next(undefined);
    }
    this.coolingTowerBasinInputSub.unsubscribe();
    this.weatherBinSub.unsubscribe();
    this.hasWeatherBinsDataSub.unsubscribe();
    this.coolingTowerBasinService.resetWeatherIntegratedCalculator();
  }

  setWeatherDataSource(source: WeatherDataSourceView) {
    this.weatherDataSourceView = source;
    this.weatherBinService.weatherDataSourceView.next(this.weatherDataSourceView);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  initSubscriptions() {
    this.coolingTowerBasinInputSub = this.coolingTowerBasinService.coolingTowerBasinInput.subscribe(value => {
      this.coolingTowerBasinInput = value;
      if(value){
        this.calculate();
      }
    });
    this.hasWeatherBinsDataSub = this.coolingTowerBasinService.hasWeatherBinsData.subscribe(value => {
      this.hasWeatherBinsData = value;
      if(!this.hasWeatherBinsData){
        this.isShowingWeatherResults = false;
      }
    });
    this.weatherBinSub = this.weatherBinService.inputData.subscribe(value => {
      this.weatherData = value;
      let getCaseLength = this.weatherBinService.inputData.getValue().cases.length;
      if(getCaseLength < 1){
        this.isShowingWeatherResults = false;
        this.coolingTowerBasinService.isShowingWeatherResults.next(false);
        this.calculate();
      }
    })
  }

  setWeatherCalculatorActive(displayWeatherTab: boolean) {
    this.displayWeatherTab = displayWeatherTab;
    this.cd.detectChanges();
  }

  calculate() {
    if(this.inTreasureHunt === true){
      this.coolingTowerBasinService.isShowingWeatherResults.next(true);
    }
    this.coolingTowerBasinService.calculate(this.settings);
  }

  btnResetData() {
    this.coolingTowerBasinService.initDefaultEmptyInputs(this.settings);
    this.coolingTowerBasinService.resetData.next(true);
  }

  btnGenerateExample() {
    this.coolingTowerBasinService.generateExampleData(this.settings);
    this.coolingTowerBasinService.generateExample.next(true);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.helpPanelContainerHeight = this.contentContainer.nativeElement.offsetHeight - this.headerHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
      this.cd.detectChanges();
    }
  }  
 toggleWeatherResults(weatherResultsOn: boolean) {
    this.isShowingWeatherResults = weatherResultsOn;
    this.coolingTowerBasinService.isShowingWeatherResults.next(weatherResultsOn);
    this.coolingTowerBasinService.calculate(this.settings);
 }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

 save() {
  this.emitSave.emit({ coolingTowerBasinData: this.coolingTowerBasinInput, weatherData: this.weatherData, opportunityType: Treasure.coolingTowerBasin });
}

cancel() {
  this.emitCancel.emit(true);
}

}
