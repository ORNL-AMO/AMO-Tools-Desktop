import { Component, ElementRef, HostListener, Input, OnInit, ViewChild, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { CoolingTowerBasinService } from './cooling-tower-basin.service';
import { WeatherBinsService, WeatherDataSourceView } from '../../utilities/weather-bins/weather-bins.service';

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
  //emitSave = new EventEmitter<ChillerStagingTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  helpPanelContainerHeight: number;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  
  coolingTowerBasinInputSub: Subscription;
  weatherBinSub: Subscription;
  
  headerHeight: number;
  containerHeight: number;
  tabSelect: string = 'results';

  displayWeatherTab: boolean = false;
  hasWeatherBinsDataSub: Subscription;
  hasWeatherBinsData: boolean = false;
  isShowingWeatherResults : boolean = false;
  weatherDataSourceView: WeatherDataSourceView;
  
  constructor(private coolingTowerBasinService: CoolingTowerBasinService, private weatherBinService: WeatherBinsService,
    private cd: ChangeDetectorRef, private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.weatherDataSourceView = this.weatherBinService.weatherDataSourceView.getValue();
    let existingInputs = this.coolingTowerBasinService.coolingTowerBasinInput.getValue();
    if(!existingInputs) {
      this.coolingTowerBasinService.initDefaultEmptyInputs(this.settings);
      this.coolingTowerBasinService.initDefaultEmptyOutputs();
    } else {
      this.coolingTowerBasinService.setHasWeatherBinsData();
    }
    this.coolingTowerBasinService.setAsWeatherIntegratedCalculator();
    this.initSubscriptions();
  }

  ngOnDestroy() {
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
      this.calculate();
    });
    this.hasWeatherBinsDataSub = this.coolingTowerBasinService.hasWeatherBinsData.subscribe(value => {
      this.hasWeatherBinsData = value;
      if(!this.hasWeatherBinsData){
        this.isShowingWeatherResults = false;
      }
    });
    this.weatherBinSub = this.weatherBinService.inputData.subscribe(value => {
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
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      this.helpPanelContainerHeight = this.contentContainer.nativeElement.offsetHeight - this.headerHeight;
      this.cd.detectChanges();
    }
  }  
 toggleWeatherResults(weatherResultsOn: boolean) {
    this.isShowingWeatherResults = weatherResultsOn;
    this.coolingTowerBasinService.isShowingWeatherResults.next(weatherResultsOn);
    this.coolingTowerBasinService.calculate(this.settings);
 }

 save() {
  //this.emitSave.emit({ chillerStagingData: this.chillerPerformanceInput, opportunityType: Treasure.chillerStaging });
}

cancel() {
  this.emitCancel.emit(true);
}

}
