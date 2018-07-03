import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { ReplaceRewindService } from './replace-rewind.service'
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-replace-rewind',
  templateUrl: './replace-rewind.component.html',
  styleUrls: ['./replace-rewind.component.css']
})
export class ReplaceRewindComponent implements OnInit {
  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  headerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  settings: Settings;
  inputs: ReplaceRewindData = {
    operatingHours: 6000,
    motorSize: 350,
    load: 75,
    electricityCost: 0.08,
    currentEfficiency: 94.4,
    rewindEfficiencyLoss: 0.5,
    costOfRewind: 8384,
    newEfficiency: 95.7,
    purchaseCost: 33163
  };
  results: ReplaceRewindResults = {
    differentialCost: 0,
    rewoundEnergyUse: 0,
    rewoundEnergyCost: 0,
    newEnergyUse: 0,
    newEnergyCost: 0,
    annualEnergySavings: 0,
    costSavings: 0,
    simplePayback: 0
  }

  constructor(private replaceRewindService: ReplaceRewindService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.calculate(this.inputs);
    this.settings = this.settingsDbService.globalSettings;
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  calculate(_inputs: ReplaceRewindData) {
    this.results = this.replaceRewindService.getResults(_inputs);
  }
}


export interface ReplaceRewindData {
  operatingHours: number,
  motorSize: number,
  load: number,
  electricityCost: number,
  currentEfficiency: number,
  rewindEfficiencyLoss: number,
  costOfRewind: number,
  newEfficiency: number,
  purchaseCost: number
}

export interface ReplaceRewindResults {
  differentialCost: number,
  rewoundEnergyUse: number,
  rewoundEnergyCost: number,
  newEnergyUse: number,
  newEnergyCost: number,
  annualEnergySavings: number,
  costSavings: number,
  simplePayback: number
}