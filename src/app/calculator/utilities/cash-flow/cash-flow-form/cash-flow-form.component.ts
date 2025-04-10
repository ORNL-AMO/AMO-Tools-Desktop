import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
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
    this.checkDisableAddBtn();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  
  calculate() {    
    this.checkDisableAddBtn();
    this.emitCalculate.emit(true);
  }

  addCashflow() {
    this.cashFlowForm.advancedCashflows.push(0);    
    this.checkDisableAddBtn();
    
  }

  deleteCashflow(index: number) {
    this.cashFlowForm.advancedCashflows.splice(index, 1);
    this.checkDisableAddBtn();
  }

  checkDisableAddBtn(){
    if (this.cashFlowForm.advancedCashflows.length == this.cashFlowForm.lifeYears) {
      this.disableAddBtn = true;
    } else {
      this.disableAddBtn = false;
    }
  }

}
