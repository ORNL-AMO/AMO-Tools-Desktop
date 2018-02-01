import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CashFlowForm, CashFlowResults } from './cash-flow';
import { CashFlowService } from './cash-flow.service';

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


  toggleCalculate: boolean = true;
  tabSelect: string = 'results';

  constructor(private cashFlowService: CashFlowService) {

  }

  ngOnInit() {
    this.cashFlowForm = {
      lifeYears: 10,
      energySavings: 1000,
      salvageInput: 3000,
      installationCost: 10000,
      operationCost: 500,
      fuelCost: 500,
      junkCost: 500
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
