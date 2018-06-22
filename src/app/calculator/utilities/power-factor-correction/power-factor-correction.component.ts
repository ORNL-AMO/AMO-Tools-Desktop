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
    existingDemand: 100,
    currentPowerFactor: 0.5,
    proposedPowerFactor: 0.95
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
      existingApparentPower: this.powerFactorCorrectionService.existingApparentPower(data),
      existingReactivePower: this.powerFactorCorrectionService.existingReactivePower(data),
      proposedApparentPower: this.powerFactorCorrectionService.existingApparentPower(data),
      proposedReactivePower: this.powerFactorCorrectionService.existingReactivePower(data),
      capacitancePowerRequired: this.powerFactorCorrectionService.capacitancePowerRequired(data)
    };
  }
}


export interface PowerFactorCorrectionInputs {
  existingDemand: number,
  currentPowerFactor: number,
  proposedPowerFactor: number
}


export interface PowerFactorCorrectionOutputs {
  existingApparentPower: number,
  existingReactivePower: number,
  proposedApparentPower: number,
  proposedReactivePower: number,
  capacitancePowerRequired: number
}
