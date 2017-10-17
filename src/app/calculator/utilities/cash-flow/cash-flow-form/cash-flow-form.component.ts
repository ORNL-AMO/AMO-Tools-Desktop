import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CashFlowForm } from '../cash-flow';

@Component({
  selector: 'app-cash-flow-form',
  templateUrl: './cash-flow-form.component.html',
  styleUrls: ['./cash-flow-form.component.css']
})
export class CashFlowFormComponent implements OnInit {
  @Input()
  cashFlowForm: CashFlowForm;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  // lifetime: number;
  // benefits: number;
  // cost: number;
  constructor() { }

  ngOnInit() {
    }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  calculate() {
    this.emitCalculate.emit(true);
  }

}
