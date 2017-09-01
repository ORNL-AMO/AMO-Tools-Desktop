import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, NgModel, FormsModule } from '@angular/forms';
import { PumpCurveForm, PumpCurveDataRow } from '../pump-curve';

@Component({
  selector: 'app-pump-curve-equation-form',
  templateUrl: './pump-curve-equation-form.component.html',
  styleUrls: ['./pump-curve-equation-form.component.css']
})
export class PumpCurveEquationFormComponent implements OnInit {
  @Input()
  pumpCurveForm: PumpCurveForm;

  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();

  orderOptions: Array<number> = [
    2, 3, 4, 5, 6
  ]
  pumpForm: any;

  constructor() {}

  ngOnInit() {
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  emitCalculateChanges() {
    this.calculate.emit(true);
  }
}
