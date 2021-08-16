import { ElementRef, HostListener, ViewChild } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { ChillerPerformanceService } from './chiller-performance.service';

@Component({
  selector: 'app-chiller-performance',
  templateUrl: './chiller-performance.component.html',
  styleUrls: ['./chiller-performance.component.css']
})
export class ChillerPerformanceComponent implements OnInit {
  @Input()
  settings: Settings;
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  
  chillerPerformanceInputSub: Subscription;
  modalSubscription: Subscription;
  
  displayWeatherTab: boolean = false;
  headerHeight: number;
  tabSelect: string = 'results';

  hasWeatherBinsDataSub: Subscription;
  hasWeatherBinsData: boolean = false;
  
  constructor(private chillerPerformanceService: ChillerPerformanceService,
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    let existingInputs = this.chillerPerformanceService.chillerPerformanceInput.getValue();
    if(!existingInputs) {
      this.chillerPerformanceService.initDefaultEmptyInputs();
      this.chillerPerformanceService.initDefaultEmptyOutputs();
    } 
    else {
      this.chillerPerformanceService.sethasWeatherBinsData();
    }
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.chillerPerformanceInputSub.unsubscribe();
    this.hasWeatherBinsDataSub.unsubscribe();

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  setWeatherCalculatorActive(displayWeatherTab: boolean) {
    this.displayWeatherTab = displayWeatherTab;
  }

  initSubscriptions() {
    this.chillerPerformanceInputSub = this.chillerPerformanceService.chillerPerformanceInput.subscribe(value => {
      this.calculate();
    });
    this.hasWeatherBinsDataSub = this.chillerPerformanceService.hasWeatherBinsData.subscribe(value => {
      this.hasWeatherBinsData = value;
    });
  }

  calculate() {
    this.chillerPerformanceService.calculate(this.settings);
  }

  btnResetData() {
    this.chillerPerformanceService.initDefaultEmptyInputs();
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
    }
  }

}
