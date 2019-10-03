import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { BoilerBlowdownRateService, BoilerBlowdownRateInputs } from './boiler-blowdown-rate.service';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-boiler-blowdown-rate',
  templateUrl: './boiler-blowdown-rate.component.html',
  styleUrls: ['./boiler-blowdown-rate.component.css']
})
export class BoilerBlowdownRateComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  baselineInputs: BoilerBlowdownRateInputs;
  modificationInputs: BoilerBlowdownRateInputs;
  modificationExists: boolean = false;
  modificationSub: Subscription;
  baselineSelected: boolean = true;
  tabSelect: string = 'results';
  settings: Settings;
  headerHeight: number;
  constructor(private boilerBlowdownRateService: BoilerBlowdownRateService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.initData();
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.modificationSub = this.boilerBlowdownRateService.modificationInputs.subscribe(val => {
      if (val) {
        this.modificationExists = true;
      } else {
        this.modificationExists = false;
      }
    })
  }

  ngOnDestroy() {
    this.modificationSub.unsubscribe();
  }

  initData() {
    let baselineInputs: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.getDefaultInputs();
    this.boilerBlowdownRateService.baselineInputs.next(baselineInputs);
  }

  createModification() {
    let baselineInputs: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.baselineInputs.getValue();
    this.boilerBlowdownRateService.modificationInputs.next(baselineInputs);
  }

  setModificationSelected() {
    this.baselineSelected = false;
  }

  setBaselineSelected() {
    this.baselineSelected = true;
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
}
