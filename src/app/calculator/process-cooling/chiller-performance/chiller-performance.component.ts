import { ChangeDetectorRef, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { ChillerPerformanceInput } from '../../../shared/models/chillers';
import { Settings } from '../../../shared/models/settings';
import { ChillerPerformanceTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { WeatherBinsService, WeatherDataSourceView } from '../../utilities/weather-bins/weather-bins.service';
import { ChillerPerformanceService } from './chiller-performance.service';

@Component({
  selector: 'app-chiller-performance',
  templateUrl: './chiller-performance.component.html',
  styleUrls: ['./chiller-performance.component.css']
})
export class ChillerPerformanceComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<ChillerPerformanceTreasureHunt>();
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
  
  chillerPerformanceInputSub: Subscription;
  modalSubscription: Subscription;
  chillerPerformanceInput: ChillerPerformanceInput;
  
  displayWeatherTab: boolean = false;
  headerHeight: number;
  containerHeight: number;
  tabSelect: string = 'results';
  smallScreenTab: string = 'form';

  hasWeatherBinsDataSub: Subscription;
  hasWeatherBinsData: boolean = false;
  weatherDataSourceView: WeatherDataSourceView;

  constructor(private chillerPerformanceService: ChillerPerformanceService, private weatherBinsService: WeatherBinsService, private cd: ChangeDetectorRef,
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.chillerPerformanceService.chillerPerformanceInput.getValue();
    if(!existingInputs) {
      this.chillerPerformanceService.initDefaultEmptyInputs(this.settings);
      this.chillerPerformanceService.initDefaultEmptyOutputs();
    } 
    this.initSubscriptions();
  }

  ngOnDestroy() {
    if (!this.inTreasureHunt) {
      this.chillerPerformanceService.chillerPerformanceInput.next(this.chillerPerformanceInput);
    } else {
      this.chillerPerformanceService.chillerPerformanceInput.next(undefined);
    }
    this.chillerPerformanceInputSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  initSubscriptions() {
    this.chillerPerformanceInputSub = this.chillerPerformanceService.chillerPerformanceInput.subscribe(value => {
      this.chillerPerformanceInput = value;
      if(value){
        this.calculate();
      }
    });
  }

  calculate() {
    this.chillerPerformanceService.calculate(this.settings);
  }

  btnResetData() {
    this.chillerPerformanceService.initDefaultEmptyInputs(this.settings);
    this.chillerPerformanceService.resetData.next(true);
  }

  btnGenerateExample() {
    this.chillerPerformanceService.generateExampleData(this.settings);
    this.chillerPerformanceService.generateExample.next(true);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      this.helpPanelContainerHeight = this.contentContainer.nativeElement.offsetHeight - this.headerHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
      this.cd.detectChanges();
    }
  }

  save() {
    this.emitSave.emit({ chillerPerformanceData: this.chillerPerformanceInput, opportunityType: Treasure.chillerPerformance });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}
