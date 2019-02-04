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
  @ViewChild('contentContainer') contentContainer: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  containerHeight: number;
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

  replacementMotorInputs: ReplaceExistingData;
  existingMotorInputs: ReplaceExistingData;


  constructor(private replaceExistingService: ReplaceExistingService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.initMotorInputs();
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

  initMotorInputs() {
    this.inputs = this.replaceExistingService.initReplaceExistingData();
    this.existingMotorInputs = {
      operatingHours: this.inputs.operatingHours,
      motorSize: this.inputs.motorSize,
      load: this.inputs.load,
      electricityCost: this.inputs.electricityCost,
      existingEfficiency: this.inputs.existingEfficiency,
      newEfficiency: null,
      purchaseCost: null
    }
    this.replacementMotorInputs = {
      operatingHours: this.existingMotorInputs.operatingHours,
      motorSize: this.existingMotorInputs.motorSize,
      load: this.existingMotorInputs.load,
      electricityCost: this.existingMotorInputs.electricityCost,
      existingEfficiency: null,
      newEfficiency: this.inputs.newEfficiency,
      purchaseCost: this.inputs.purchaseCost
    };
  }


  btnResetData() {
    this.initMotorInputs();
    this.calculate(this.inputs);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.clientHeight - this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  calculate(_inputs: ReplaceExistingData) {
    //case of calculate replacement motor
    if (_inputs.newEfficiency === null) {
      this.existingMotorInputs = _inputs;
      this.replacementMotorInputs = {
        operatingHours: this.existingMotorInputs.operatingHours,
        motorSize: this.existingMotorInputs.motorSize,
        load: this.existingMotorInputs.load,
        electricityCost: this.existingMotorInputs.electricityCost,
        existingEfficiency: null,
        newEfficiency: this.replacementMotorInputs.newEfficiency,
        purchaseCost: this.replacementMotorInputs.purchaseCost
      };
    }
    else {
      this.replacementMotorInputs = {
        operatingHours: this.existingMotorInputs.operatingHours,
        motorSize: this.existingMotorInputs.motorSize,
        load: this.existingMotorInputs.load,
        electricityCost: this.existingMotorInputs.electricityCost,
        existingEfficiency: null,
        newEfficiency: _inputs.newEfficiency,
        purchaseCost: _inputs.purchaseCost
      }
    }
    this.inputs = {
      operatingHours: this.existingMotorInputs.operatingHours,
      motorSize: this.existingMotorInputs.motorSize,
      load: this.existingMotorInputs.load,
      electricityCost: this.existingMotorInputs.electricityCost,
      existingEfficiency: this.existingMotorInputs.existingEfficiency,
      newEfficiency: this.replacementMotorInputs.newEfficiency,
      purchaseCost: this.replacementMotorInputs.purchaseCost
    }
    this.results = this.replaceExistingService.getResults(this.inputs);
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