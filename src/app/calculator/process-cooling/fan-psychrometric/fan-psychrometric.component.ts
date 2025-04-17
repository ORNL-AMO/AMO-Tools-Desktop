import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FanPsychrometricService } from './fan-psychrometric.service';
import { Subscription } from 'rxjs';
import { BaseGasDensity, PsychrometricResults } from '../../../shared/models/fans';
import { SettingsService } from '../../../settings/settings.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { TraceData } from '../../../shared/models/plotting';

@Component({
    selector: 'app-fan-psychrometric',
    templateUrl: './fan-psychrometric.component.html',
    styleUrls: ['./fan-psychrometric.component.css'],
    standalone: false
})
export class FanPsychrometricComponent implements OnInit {

  @Input()
  settings: Settings;
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  tabSelect: string = 'results';
  headerHeight: any;
  containerHeight: number;
  smallScreenTab: string = 'form';

  baseGasDensityDataSub: Subscription;
  
  resultData: Array<PsychrometricResults>;
  resetFormSubscription: Subscription;
  calculatedBaseGasDensitySubscription: Subscription;
  psychrometricResults: PsychrometricResults;  
  selectedDataPoints: Array<TraceData>;
  selectedDataPointsSubscription: Subscription;

  disabledChartTab: boolean;
  disabledChartTabSubscription: Subscription;

  constructor(private settingsDbService: SettingsDbService,
    private fanPsychrometricService: FanPsychrometricService,
    private settingsService: SettingsService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-PC-psychrometric');
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    //set the settings so fan settings are metric/imperial
    this.settings = this.settingsService.setFanUnits(this.settings);

    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    let defaultData: BaseGasDensity = this.fanPsychrometricService.getDefaultData(this.settings);
    this.fanPsychrometricService.baseGasDensityData.next(defaultData);
    this.initSubscriptions();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.baseGasDensityDataSub.unsubscribe();
    this.resetFormSubscription.unsubscribe();
    this.calculatedBaseGasDensitySubscription.unsubscribe();
    this.selectedDataPointsSubscription.unsubscribe();
  }

  initSubscriptions() {
    this.baseGasDensityDataSub = this.fanPsychrometricService.baseGasDensityData.subscribe(value => {
      this.fanPsychrometricService.calculateBaseGasDensity(this.settings);
    });
    this.resetFormSubscription = this.fanPsychrometricService.resetData.subscribe(val => {
      this.resultData = [];
      this.psychrometricResults = undefined;
      this.selectedDataPoints = new Array<TraceData>();
    });
    this.calculatedBaseGasDensitySubscription = this.fanPsychrometricService.calculatedBaseGasDensity.subscribe(results => {
      if (results) {
        this.psychrometricResults = results;
        let inputData: BaseGasDensity = this.fanPsychrometricService.baseGasDensityData.getValue();
        this.psychrometricResults.barometricPressure = inputData.barometricPressure;
        this.psychrometricResults.dryBulbTemp = inputData.dryBulbTemp;
      }
    });
    this.selectedDataPointsSubscription = this.fanPsychrometricService.selectedDataPoints.subscribe(value => {
      this.selectedDataPoints = value;
    });
    this.disabledChartTabSubscription = this.fanPsychrometricService.disabledChartTab.subscribe(val => {
      this.disabledChartTab = val;
    });
  }

  btnGenerateExample() {
    let exampleData: BaseGasDensity = this.fanPsychrometricService.getExampleData(this.settings);
    this.fanPsychrometricService.baseGasDensityData.next(exampleData);
    this.fanPsychrometricService.generateExample.next(true);
    this.fanPsychrometricService.disabledChartTab.next(false);
    this.setTab('results');
  }

  btnResetData() {
    let defaultData: BaseGasDensity = this.fanPsychrometricService.getDefaultData(this.settings);
    this.fanPsychrometricService.baseGasDensityData.next(defaultData);
    this.fanPsychrometricService.resetData.next(true);    
    this.fanPsychrometricService.disabledChartTab.next(true);
    this.setTab('results');
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
