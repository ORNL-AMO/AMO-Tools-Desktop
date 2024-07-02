import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { PowerFactorCorrectionService } from './power-factor-correction.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-power-factor-correction',
  templateUrl: './power-factor-correction.component.html',
  styleUrls: ['./power-factor-correction.component.css']
})
export class PowerFactorCorrectionComponent implements OnInit {

  inputData: PowerFactorCorrectionInputs = {
    existingDemand: 100,
    currentPowerFactor: 0.5,
    proposedPowerFactor: 0.95,
    billedForDemand: 0,
    minimumPowerFactor: 0.95,
    targetPowerFactor: 0.95,
    adjustedOrActual: 0,
    marginalCostOfDemand: 8.15,
    costOfStaticCapacitance: 50,
    costOfDynamicCapacitance: 70,
    powerDemandInputs: [
      {
        input1: 462,
        input2: 0.8
      },
      {
        input1: 528,
        input2: 0.8
      },
      {
        input1: 492,
        input2: 0.8
      },
      {
        input1: 474,
        input2: 0.8
      },
      {
        input1: 499,
        input2: 0.8
      },
      {
        input1: 513,
        input2: 0.8
      },
      {
        input1: 530,
        input2: 0.8
      },
      {
        input1: 523,
        input2: 0.8
      },
      {
        input1: 547,
        input2: 0.8
      },
      {
        input1: 589,
        input2: 0.8
      },
      {
        input1: 621,
        input2: 0.8
      },
      {
        input1: 607,
        input2: 0.8
      },
    ]
  };
  results: PowerFactorCorrectionOutputs;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  smallScreenTab: string = 'form';
  containerHeight: number;
  headerHeight: number;
  currentField: string;
  toggleCalculate: boolean = false;
  tabSelect: string = 'results';
  constructor(private powerFactorCorrectionService: PowerFactorCorrectionService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-UTIL-power-factor-correction');
    this.calculate(this.inputData);
    if (this.powerFactorCorrectionService.inputData) {
      this.inputData = this.powerFactorCorrectionService.inputData;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.powerFactorCorrectionService.inputData = this.inputData;
  }

  btnResetData() {
    this.inputData = this.powerFactorCorrectionService.getResetData();
    this.powerFactorCorrectionService.inputData = this.inputData;
    this.calculate(this.inputData);
  }

  generateExample() {
    this.inputData = this.powerFactorCorrectionService.generateExample();
    this.powerFactorCorrectionService.inputData = this.inputData;
  }

  btnGenerateExample() {
    this.generateExample();
    this.calculate(this.inputData);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
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
      proposedApparentPower: this.powerFactorCorrectionService.proposedApparentPower(data),
      proposedReactivePower: this.powerFactorCorrectionService.proposedReactivePower(data),
      capacitancePowerRequired: this.powerFactorCorrectionService.capacitancePowerRequired(data)
    };
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}


export interface PowerFactorCorrectionInputs {
  existingDemand: number;
  currentPowerFactor: number;
  proposedPowerFactor: number;
  billedForDemand: number;
  minimumPowerFactor: number;
  targetPowerFactor: number;
  adjustedOrActual: number;
  marginalCostOfDemand: number;
  costOfStaticCapacitance: number;
  costOfDynamicCapacitance: number;
  powerDemandInputs: Array<PowerDemandInputs>;
}

export interface PowerDemandInputs {
  input1: number;
  input2: number;
}


export interface PowerFactorCorrectionOutputs {
  existingApparentPower: number;
  existingReactivePower: number;
  proposedApparentPower: number;
  proposedReactivePower: number;
  capacitancePowerRequired: number;
}
