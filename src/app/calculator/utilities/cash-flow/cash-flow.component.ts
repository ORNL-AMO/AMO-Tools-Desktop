import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CashFlowForm, CashFlowResults } from './cash-flow';
@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.css']
})
export class CashFlowComponent implements OnInit {

  cashFlowForm: CashFlowForm;
  cashFlowResults: CashFlowResults = {
    benefits: 0,
    cost: 0,
    results: 0,
    payback: 0
  };

  tabSelect: string = 'diagram';
  currentField: string;
  constructor() { }

  ngOnInit() {
    this.cashFlowForm = {
      lifeYears: 0,
      energySavings: 0,
      salvageInput: 0,
      installationCost: 0,
      operationCost: 0,
      fuelCost: 0,
      junkCost: 0
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
    console.log(this.cashFlowResults.results);
  // Payback
    this.cashFlowResults.payback = (this.cashFlowForm.installationCost * 12) / this.cashFlowForm.energySavings;

  }


}
