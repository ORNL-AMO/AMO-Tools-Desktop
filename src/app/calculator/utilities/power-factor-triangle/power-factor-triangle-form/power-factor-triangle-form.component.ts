import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PowerFactorTriangleInputs, PowerFactorTriangleOutputs } from '../../../../shared/models/standalone';

@Component({
  selector: 'app-power-factor-triangle-form',
  templateUrl: './power-factor-triangle-form.component.html',
  styleUrls: ['./power-factor-triangle-form.component.css']
})
export class PowerFactorTriangleFormComponent implements OnInit {

  @Input()
  data: PowerFactorTriangleInputs;
  @Input()
  results: PowerFactorTriangleOutputs;
  @Output('changeField')
  changeField = new EventEmitter<string>();

  @Output('emitCalculate')
  emitCalculate = new EventEmitter<PowerFactorTriangleInputs>();

  modeList: Array<{ value: number, name: string }> = [
    { value: 1, name: 'Apparent & Real' },
    { value: 2, name: 'Apparent & Reactive' },
    { value: 3, name: 'Apparent & Phase Angle' },
    { value: 4, name: 'Apparent & Power Factor' },
    { value: 5, name: 'Real & Reactive' },
    { value: 6, name: 'Real & Phase Angle' },
    { value: 7, name: 'Real & Power Factor' },
    { value: 8, name: 'Reactive & Phase Angle' },
    { value: 9, name: 'Reactive & Power Factor' },
  ];

  constructor() { }

  ngOnInit() {
  }

  calculate() {
    if (this.data.phaseAngle < 90 || (this.data.powerFactor <= 1 && this.data.powerFactor > 0)) {
      this.emitCalculate.emit(this.data);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }



}