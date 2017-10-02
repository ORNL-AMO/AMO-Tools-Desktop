import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CashFlowForm } from './cash-flow';
@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.css']
})
export class CashFlowComponent implements OnInit {

  cashFlowForm: CashFlowForm;

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


  calculate(){
    // cashFlowForm object has data from form
    // console.log(this.cashFlowForm.lifeYears);
    // console.log(this.cashFlowForm.energySavings);
    // let test = this.cashFlowForm.lifeYears + this.cashFlowForm.energySavings;
    // console.log(test);
    let benefits = this.cashFlowForm.energySavings + this.cashFlowForm.salvageInput;
    console.log(benefits);
    let cost = this.cashFlowForm.installationCost + this.cashFlowForm.operationCost + this.cashFlowForm.fuelCost + this.cashFlowForm.junkCost;
    console.log(cost);
    let results = benefits / cost;
    console.log(results);

    // I would create a results object for the calculations and then use it as an input for the cash-flow-diagram
  }


}
