import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PowerFactorCorrectionInputs } from '../power-factor-correction.component';

@Component({
  selector: 'app-power-factor-correction-form',
  templateUrl: './power-factor-correction-form.component.html',
  styleUrls: ['./power-factor-correction-form.component.css']
})
export class PowerFactorCorrectionFormComponent implements OnInit {
  @Input()
  data: PowerFactorCorrectionInputs;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<PowerFactorCorrectionInputs>();

  constructor() { }

  ngOnInit() {
  }

  calculate() {
    this.emitCalculate.emit(this.data);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
}
