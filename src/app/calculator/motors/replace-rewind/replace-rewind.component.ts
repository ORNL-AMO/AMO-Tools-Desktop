
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
  inputs: ReplaceRewindData;
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

  rewoundMotorInputs: ReplaceRewindData;
  newMotorInputs: ReplaceRewindData;

  constructor(private replaceRewindService: ReplaceRewindService, private settingsDbService: SettingsDbService) { }

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
    this.inputs = this.replaceRewindService.replaceRewindData;
    this.rewoundMotorInputs = this.replaceRewindService.replaceRewindData;
    this.newMotorInputs = {
      operatingHours: this.rewoundMotorInputs.operatingHours,
      motorSize: this.rewoundMotorInputs.motorSize,
      load: this.rewoundMotorInputs.load,
      electricityCost: this.rewoundMotorInputs.electricityCost,
      currentEfficiency: null,
      rewindEfficiencyLoss: null,
      costOfRewind: null,
      newEfficiency: this.inputs.newEfficiency,
      purchaseCost: this.inputs.purchaseCost
    };

  }

  btnResetData() {
    this.inputs = this.replaceRewindService.initReplaceRewindData();
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

  calculate(_inputs: ReplaceRewindData) {
    //case of calculate new motor input
    if (_inputs.newEfficiency === null) {
      this.rewoundMotorInputs = _inputs;
      this.newMotorInputs = {
        operatingHours: this.rewoundMotorInputs.operatingHours,
        motorSize: this.rewoundMotorInputs.motorSize,
        load: this.rewoundMotorInputs.load,
        electricityCost: this.rewoundMotorInputs.electricityCost,
        currentEfficiency: null,
        rewindEfficiencyLoss: null,
        costOfRewind: null,
        newEfficiency: this.newMotorInputs.newEfficiency,
        purchaseCost: this.newMotorInputs.purchaseCost
      };
    }
    else {
      this.newMotorInputs = {
        operatingHours: this.rewoundMotorInputs.operatingHours,
        motorSize: this.rewoundMotorInputs.motorSize,
        load: this.rewoundMotorInputs.load,
        electricityCost: this.rewoundMotorInputs.electricityCost,
        currentEfficiency: null,
        rewindEfficiencyLoss: null,
        costOfRewind: null,
        newEfficiency: _inputs.newEfficiency,
        purchaseCost: _inputs.purchaseCost
      };
    }
    this.inputs = {
      operatingHours: this.rewoundMotorInputs.operatingHours,
      motorSize: this.rewoundMotorInputs.motorSize,
      load: this.rewoundMotorInputs.load,
      electricityCost: this.rewoundMotorInputs.electricityCost,
      currentEfficiency: this.rewoundMotorInputs.currentEfficiency,
      rewindEfficiencyLoss: this.rewoundMotorInputs.rewindEfficiencyLoss,
      costOfRewind: this.rewoundMotorInputs.costOfRewind,
      newEfficiency: this.newMotorInputs.newEfficiency,
      purchaseCost: this.newMotorInputs.purchaseCost
    };

    this.results = this.replaceRewindService.getResults(this.inputs);
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
  purchaseCost: number,
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