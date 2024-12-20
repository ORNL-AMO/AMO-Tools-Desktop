import { Component, OnInit, ViewChild, HostListener, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { PowerFactorCorrectionService } from './power-factor-correction.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { PowerFactorCorrectionTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-power-factor-correction',
  templateUrl: './power-factor-correction.component.html',
  styleUrls: ['./power-factor-correction.component.css']
})
export class PowerFactorCorrectionComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<PowerFactorCorrectionTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();

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
        month: 'January 2024',
        input1: 462,
        input2: 0.8,
        input3: 0
      },
      {
        month: 'February 2024',
        input1: 528,
        input2: 0.8,
        input3: 0
      },
      {
        month: 'March 2024',
        input1: 492,
        input2: 0.8,
        input3: 0
      },
      {
        month: 'April 2024',
        input1: 474,
        input2: 0.8,
        input3: 0
      },
      {
        month: 'May 2024',
        input1: 499,
        input2: 0.8,
        input3: 0
      },
      {
        month: 'June 2024',
        input1: 513,
        input2: 0.8,
        input3: 0
      },
      {
        month: 'July 2024',
        input1: 530,
        input2: 0.8,
        input3: 0
      },
      {
        month: 'August 2024',
        input1: 523,
        input2: 0.8,
        input3: 0
      },
      {
        month: 'September 2024',
        input1: 547,
        input2: 0.8,
        input3: 0
      },
      {
        month: 'October 2024',
        input1: 589,
        input2: 0.8,
        input3: 0
      },
      {
        month: 'November 2024',
        input1: 621,
        input2: 0.8,
        input3: 0
      },
      {
        month: 'December 2024',
        input1: 607,
        input2: 0.8,
        input3: 0
      },
    ],
    startMonth: 1,
    startYear: 2024,
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
    } else {
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
    this.results = this.powerFactorCorrectionService.getResults(data);
  }

  save() {
    this.emitSave.emit({ inputData: this.inputData, opportunityType: Treasure.powerFactorCorrection });
  }

  cancel() {
    this.emitCancel.emit(true);
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
  startMonth: number;
  startYear: number;
}

export interface MonthyInputs {
  month: string;
  input1: number;
  input2: number;
  input3: number;
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
