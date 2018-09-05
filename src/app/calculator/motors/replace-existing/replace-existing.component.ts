import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { ReplaceExistingService } from './replace-existing.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-replace-existing',
  templateUrl: './replace-existing.component.html',
  styleUrls: ['./replace-existing.component.css']
})
export class ReplaceExistingComponent implements OnInit {
  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  headerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  settings: Settings;
  results: ReplaceExistingResults = {
    existingEnergyUse: 0,
    newEnergyUse: 0,
    existingEnergyCost: 0,
    newEnergyCost: 0,
    annualEnergySavings: 0,
    costSavings: 0,
    simplePayback: 0
  };
  inputs: ReplaceExistingData;


  constructor(private replaceExistingService: ReplaceExistingService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.inputs = this.replaceExistingService.replaceExistingData;
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

  calculate(_inputs: ReplaceExistingData) {
    this.results = this.replaceExistingService.getResults(_inputs);
  }
}


export interface ReplaceExistingData {
  operatingHours: number,
  motorSize: number,
  existingEfficiency: number,
  load: number,
  electricityCost: number,
  newEfficiency: number,
  purchaseCost: number
}
export interface ReplaceExistingResults {
  existingEnergyUse: number,
  newEnergyUse: number,
  existingEnergyCost: number,
  newEnergyCost: number,
  annualEnergySavings: number,
  costSavings: number,
  simplePayback: number
}