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
    monthyInputs: [
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
    if (!this.powerFactorCorrectionService.inputData) {
      this.generateExample();
    } else{
      this.inputData = this.powerFactorCorrectionService.inputData;
    }
    this.calculate(this.inputData);
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
    this.results = this.powerFactorCorrectionService.getResetOutput();
    this.powerFactorCorrectionService.inputData = this.inputData;
    //this.calculate(this.inputData);
  }

  generateExample() {
    this.inputData = this.powerFactorCorrectionService.generateExample();
    //this.results = this.powerFactorCorrectionService.generateExampleOutput();
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
    if (data.billedForDemand == 0){
      if (data.adjustedOrActual == 0) {
        this.results = this.powerFactorCorrectionService.calculateRealPowerAndPowerFactor(data);
      } else if (data.adjustedOrActual == 1) {
        this.results = this.powerFactorCorrectionService.calculateRealPowerAndActualDemand(data);
      }
    } else if (data.billedForDemand == 1){
      if (data.adjustedOrActual == 0) {
        this.results = this.powerFactorCorrectionService.calculateApparentPowerAndPowerFactor(data);
      } else if (data.adjustedOrActual == 1) {
        this.results = this.powerFactorCorrectionService.calculateApparentPowerAndActualDemand(data);
      }
    } else {
      this.results = {
        annualPFPenalty: 0,
        proposedFixedCapacitance: 0,
        proposedVariableCapacitance: 0,
        capitalCost: 0,
        simplePayback: 0,
        monthlyOutputs: [
          {
            realDemand: 0,
            pfAdjustedDemand: 0,
            proposedApparentPower: 0,
            demandPenalty: 0,
            penaltyCost: 0,
            currentReactivePower: 0,
            proposedReactivePower: 0,
            proposedCapacitance: 0,
          }
        ]
      };

    }


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
  monthyInputs: Array<MonthyInputs>;
}

export interface MonthyInputs {
  input1: number;
  input2: number;
}


export interface PowerFactorCorrectionOutputs {
  annualPFPenalty: number;
  proposedFixedCapacitance: number;
  proposedVariableCapacitance: number;
  capitalCost: number;
  simplePayback: number;
  monthlyOutputs: Array<PFMonthlyOutputs>;
}

export interface PFMonthlyOutputs {
  realDemand: number;
  pfAdjustedDemand: number;
  proposedApparentPower: number;
  demandPenalty: number;
  penaltyCost: number;
  currentReactivePower: number;
  proposedReactivePower: number;
  proposedCapacitance: number;
}
