import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CashFlowForm, CashFlowResults } from './cash-flow';
import { CashFlowService } from './cash-flow.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.css']
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
  constructor(private cashFlowService: CashFlowService, private settingsDbService: SettingsDbService,
    private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-UTIL-cash-flow');
    if (!this.cashFlowService.inputData) {
      this.cashFlowForm = {
        lifeYears: 10,
        energySavings: 1000,
        salvageInput: 3000,
        installationCost: 10000,
        operationCost: 500,
        fuelCost: 500,
        junkCost: 500
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

  btnGenerateExample(){
    this.cashFlowForm = {
      lifeYears: 10,
      energySavings: 1000,
      salvageInput: 3000,
      installationCost: 10000,
      operationCost: 500,
      fuelCost: 500,
      junkCost: 500
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
      fuelCost: 0,
      junkCost: 0
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
      (((this.cashFlowForm.installationCost + this.cashFlowForm.junkCost) + (this.cashFlowForm.operationCost + this.cashFlowForm.fuelCost)) * this.cashFlowForm.lifeYears);
    // Payback
    this.cashFlowResults.payback = (this.cashFlowForm.installationCost * 12) / this.cashFlowForm.energySavings;
    this.toggleCalculate = !this.toggleCalculate;
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }


}
