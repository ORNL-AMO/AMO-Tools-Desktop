import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { BruteForceResults, CashFlowFinalResults, CashFlowForm, CashFlowOutputsAndResults, CashFlowResults, Outputs, WithoutTaxesOutputs } from './cash-flow';
import { CashFlowService } from './cash-flow.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.css'],
  standalone: false
})
export class CashFlowComponent implements OnInit {
  @Input()
  currentField: string = 'lifeYears';
  cashFlowForm: CashFlowForm;
  cashFlowResults: CashFlowResults = {
    benefits: 0,
    cost: 0,
    results: 0,
    payback: 0
  };
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
  toggleCalculate: boolean = true;
  tabSelect: string = 'results';
  cashFlowOutputsAndResults: CashFlowOutputsAndResults;
  constructor(private cashFlowService: CashFlowService, private settingsDbService: SettingsDbService,
    private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-UTIL-cash-flow');
    if (!this.cashFlowService.inputData) {
      this.cashFlowForm = {
        lifeYears: 15,
        energySavings: 50000,
        salvageInput: 50000,
        installationCost: 250000,
        operationCost: 5000,
        otherCost: 0,
        junkCost: 100000,
        otherSavings: 0,
        discountRate: 10,
        includeTaxes: 0,
        taxRate: 30,
        depreciationMethod: 0,
        advancedCashflows: [
          0,
          -1000,
          5000,
          -1000,
          0,
          4000,
          0,
          -1000,
          5000,
          -1000,
          0,
          4000,
          0,
          -1000,
          5000
        ]
      };
    } else {
      this.cashFlowForm = this.cashFlowService.inputData;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    this.calculate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.cashFlowService.inputData = this.cashFlowForm;
  }

  btnGenerateExample() {
    this.cashFlowForm = {
      lifeYears: 15,
      energySavings: 50000,
      salvageInput: 50000,
      installationCost: 250000,
      operationCost: 5000,
      otherCost: 0,
      junkCost: 100000,
      otherSavings: 0,
      discountRate: 10,
      includeTaxes: 0,
      taxRate: 30,
      depreciationMethod: 0,
      advancedCashflows: [
        0,
        -1000,
        5000,
        -1000,
        0,
        4000,
        0,
        -1000,
        5000,
        -1000,
        0,
        4000,
        0,
        -1000,
        5000
      ]
    };
    this.cashFlowService.inputData = this.cashFlowForm;
    this.calculate();
  }

  btnResetData() {
    this.cashFlowForm = {
      lifeYears: 0,
      energySavings: 0,
      salvageInput: 0,
      installationCost: 0,
      operationCost: 0,
      otherCost: 0,
      junkCost: 0,
      otherSavings: 0,
      discountRate: 0,
      includeTaxes: 1,
      taxRate: 0,
      depreciationMethod: 0,
      advancedCashflows: []
    };
    this.cashFlowService.inputData = this.cashFlowForm;
    this.calculate();
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
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

  setField(str: string) {
    this.currentField = str;
  }

  calculate() {
    // Benefits/Cost Ratio
    this.cashFlowResults.results = ((this.cashFlowForm.energySavings * this.cashFlowForm.lifeYears) + this.cashFlowForm.salvageInput) /
      (((this.cashFlowForm.installationCost + this.cashFlowForm.junkCost) + (this.cashFlowForm.operationCost + this.cashFlowForm.otherCost)) * this.cashFlowForm.lifeYears);
    // Payback
    this.cashFlowResults.payback = (this.cashFlowForm.installationCost * 12) / this.cashFlowForm.energySavings;
    this.toggleCalculate = !this.toggleCalculate;

    let yearlyCashFlowOutputs: Outputs = this.cashFlowService.calculateYearlyCashFlowOutputs(this.cashFlowForm);
    let presentValueCashFlowOutputs: Outputs = this.cashFlowService.calculatePresentValueCashFlowOutputs(this.cashFlowForm, yearlyCashFlowOutputs);
    let bruteForceResults: Array<BruteForceResults> = this.cashFlowService.calculateBruteForceResults(this.cashFlowForm, yearlyCashFlowOutputs);
    let withoutTaxesPresentValueOutputs: WithoutTaxesOutputs = this.cashFlowService.calculateWithoutTaxesPresentValueOutputs(presentValueCashFlowOutputs, bruteForceResults);
    let withoutTaxesAnnualWorthOutputs: WithoutTaxesOutputs = this.cashFlowService.calculateWithoutTaxesAnnualWorthOutputs(this.cashFlowForm, withoutTaxesPresentValueOutputs, bruteForceResults);
    let presentValueCashFlowResults: CashFlowResults = this.cashFlowService.calculatePresentValueCashFlowResults(withoutTaxesPresentValueOutputs);
    let annualWorthCashFlowResults: CashFlowResults = this.cashFlowService.calculateAnnualWorthCashFlowResults(withoutTaxesAnnualWorthOutputs);
    let cashFlowFinalResults: CashFlowFinalResults = this.cashFlowService.calculateCashFlowFinalResults(presentValueCashFlowResults, annualWorthCashFlowResults, withoutTaxesPresentValueOutputs, withoutTaxesAnnualWorthOutputs);

    this.cashFlowOutputsAndResults = {
      yearlyCashFlowOutputs: yearlyCashFlowOutputs,
      presentValueCashFlowOutputs: presentValueCashFlowOutputs,
      bruteForceResults: bruteForceResults,
      withoutTaxesPresentValueOutputs: withoutTaxesPresentValueOutputs,
      withoutTaxesAnnualWorthOutputs: withoutTaxesAnnualWorthOutputs,
      presentValueCashFlowResults: presentValueCashFlowResults,
      annualWorthCashFlowResults: annualWorthCashFlowResults,
      cashFlowFinalResults: cashFlowFinalResults,
    }

    console.log(this.cashFlowOutputsAndResults);

  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }


}
