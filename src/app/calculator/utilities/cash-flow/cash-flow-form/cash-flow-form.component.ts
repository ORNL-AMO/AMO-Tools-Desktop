import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AdvancedCashflowData, CashFlowForm } from '../cash-flow';

@Component({
    selector: 'app-cash-flow-form',
    templateUrl: './cash-flow-form.component.html',
    styleUrls: ['./cash-flow-form.component.css'],
    standalone: false
})
export class CashFlowFormComponent implements OnInit {
  @Input()
  cashFlowForm: CashFlowForm;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();

  disableAddBtn: boolean = false;
  
  constructor() { }

  ngOnInit() {
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  calculate() {
    this.emitCalculate.emit(true);
  }

  addCashflow() {
    let newData: AdvancedCashflowData = {
      year: this.cashFlowForm.advancedCashflows.length,
      cashflow: 0,
    }

    this.cashFlowForm.advancedCashflows.push(0);
    
  }

  deleteCashflow(index: number) {
    this.cashFlowForm.advancedCashflows.splice(index, 1);
  }

}
