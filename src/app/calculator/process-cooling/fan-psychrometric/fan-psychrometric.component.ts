import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FanPsychrometricService } from './fan-psychrometric.service';
import { Subscription } from 'rxjs';
import { BaseGasDensity } from '../../../shared/models/fans';
import { SettingsService } from '../../../settings/settings.service';

@Component({
  selector: 'app-fan-psychrometric',
  templateUrl: './fan-psychrometric.component.html',
  styleUrls: ['./fan-psychrometric.component.css']
})
export class FanPsychrometricComponent implements OnInit {
  
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
              private fanPsychrometricService: FanPsychrometricService,
              private settingsService: SettingsService
              ) { }

  ngOnInit() {
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
  }
  
  initSubscriptions() {
    this.baseGasDensityDataSub = this.fanPsychrometricService.baseGasDensityData.subscribe(value => {
      this.fanPsychrometricService.calculateBaseGasDensity(this.settings);
    });
  }

  btnGenerateExample(){
    let exampleData: BaseGasDensity = this.fanPsychrometricService.getExampleData(this.settings);
    this.fanPsychrometricService.baseGasDensityData.next(exampleData);
    this.fanPsychrometricService.generateExample.next(true);
  }

  btnResetData(){
    let defaultData: BaseGasDensity = this.fanPsychrometricService.getDefaultData(this.settings);
    this.fanPsychrometricService.baseGasDensityData.next(defaultData);
    this.fanPsychrometricService.resetData.next(true);
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      if (this.leftPanelHeader.nativeElement.clientHeight) {
        this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      }
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
}
