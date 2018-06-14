import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { PowerFactorCorrectionService } from './power-factor-correction.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

@Component({
  selector: 'app-power-factor-correction',
  templateUrl: './power-factor-correction.component.html',
  styleUrls: ['./power-factor-correction.component.css']
})
export class PowerFactorCorrectionComponent implements OnInit {

  inputData: PowerFactorCorrectionInputs = {
    currentDemand: 100,
    currentPowerFactor: 0.5,
    proposedPowerFactor: 1,
    ratedVoltage: 0,
    lineFrequency: 60
  };
  results: PowerFactorCorrectionOutputs;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;
  currentField: string;
  toggleCalculate: boolean = false;
  tabSelect: string = 'results';
  constructor(private powerFactorCorrectionService: PowerFactorCorrectionService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.calculate(this.inputData);
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

  calculate(data: PowerFactorCorrectionInputs) {
    this.inputData = data;
    this.results = {
      actualDemand: this.powerFactorCorrectionService.actualDemand(data),
      apparentPower: this.powerFactorCorrectionService.apparentPower(data),
      currentReactivePower: this.powerFactorCorrectionService.currentReactivePower(data),
      demandSavings: this.powerFactorCorrectionService.demandSavings(data),
      capacitanceRequired: this.powerFactorCorrectionService.capacitanceRequired(data)
    }
  }
}


export interface PowerFactorCorrectionInputs {
  currentDemand: number,
  currentPowerFactor: number,
  proposedPowerFactor: number,
  ratedVoltage: number,
  lineFrequency: number
}


export interface PowerFactorCorrectionOutputs {
  actualDemand: number,
  apparentPower: number,
  currentReactivePower: number,
  demandSavings: number,
  capacitanceRequired: number
}