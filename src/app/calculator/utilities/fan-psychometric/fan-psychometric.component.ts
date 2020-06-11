import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FanPsychometricService } from './fan-psychometric.service';
import { Subscription } from 'rxjs';
import { BaseGasDensity } from '../../../shared/models/fans';

@Component({
  selector: 'app-fan-psychometric',
  templateUrl: './fan-psychometric.component.html',
  styleUrls: ['./fan-psychometric.component.css']
})
export class FanPsychometricComponent implements OnInit {
  
  @Input()
  settings: Settings;
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  
  tabSelect: string = 'results';
  headerHeight: any;

  baseGasDensityDataSub: Subscription;

  constructor(private settingsDbService: SettingsDbService, 
              private fanPsychometricService: FanPsychometricService,
              ) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    let defaultData: BaseGasDensity = this.fanPsychometricService.getDefaultData();
    this.fanPsychometricService.baseGasDensityData.next(defaultData);
    this.initSubscriptions();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.baseGasDensityDataSub.unsubscribe();
  }
  
  initSubscriptions() {
    this.baseGasDensityDataSub = this.fanPsychometricService.baseGasDensityData.subscribe(value => {
      this.calculate(this.settings);
    });
  }

  btnGenerateExample(){
    let exampleData: BaseGasDensity = this.fanPsychometricService.getExampleData();
    this.fanPsychometricService.baseGasDensityData.next(exampleData);
    this.fanPsychometricService.generateExample.next(true);
  }

  btnResetData(){
    let defaultData: BaseGasDensity = this.fanPsychometricService.getDefaultData();
    this.fanPsychometricService.baseGasDensityData.next(defaultData);
    this.fanPsychometricService.resetData.next(true);
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      if (this.leftPanelHeader.nativeElement.clientHeight) {
        this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      }
    }
  }

  calculate(settings: Settings) {
    this.fanPsychometricService.calculateBaseGasDensity(settings);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
}
