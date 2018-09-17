import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CashFlowForm, CashFlowResults } from './cash-flow';
import { CashFlowService } from './cash-flow.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

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

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  toggleCalculate: boolean = true;
  tabSelect: string = 'results';

  constructor(private cashFlowService: CashFlowService, private settingsDbService: SettingsDbService) {
  }

  ngOnInit() {
    if (!this.cashFlowService.inputData) {
      this.cashFlowForm = {
        lifeYears: 10,
        energySavings: 1000,
        salvageInput: 3000,
        installationCost: 10000,
        operationCost: 500,
        fuelCost: 500,
        junkCost: 500
      }
    } else {
      this.cashFlowForm = this.cashFlowService.inputData;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy(){
    this.cashFlowService.inputData = this.cashFlowForm;
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
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
    this.cashFlowService.calculate.next(true);
  }


}
