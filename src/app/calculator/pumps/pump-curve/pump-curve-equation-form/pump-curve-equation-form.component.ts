import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, NgModel, FormsModule } from '@angular/forms';
import { PumpCurveForm, PumpCurveDataRow } from '../pump-curve';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-pump-curve-equation-form',
  templateUrl: './pump-curve-equation-form.component.html',
  styleUrls: ['./pump-curve-equation-form.component.css']
})
export class PumpCurveEquationFormComponent implements OnInit {
  @Input()
  pumpCurveForm: PumpCurveForm;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  
  orderOptions: Array<number> = [
    2, 3, 4, 5, 6
  ]

  // maxFlow
  constructor() { }

  ngOnInit() {
    this.emitCalculateChanges();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  emitCalculateChanges() {
    this.calculate.emit(true);
  }

  setOrder() {
    if (this.pumpCurveForm.headOrder < 3) {
      this.pumpCurveForm.headFlow3 = 0;
    }
    if (this.pumpCurveForm.headOrder < 4) {
      this.pumpCurveForm.headFlow4 = 0;
    }
    if (this.pumpCurveForm.headOrder < 5) {
      this.pumpCurveForm.headFlow5 = 0;
    }
    if (this.pumpCurveForm.headOrder < 6) {
      this.pumpCurveForm.headFlow6 = 0;
    }
    this.emitCalculateChanges();
  }
}
