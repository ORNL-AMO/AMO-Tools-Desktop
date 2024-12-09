import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PowerFactorTriangleInputs, PowerFactorTriangleOutputs } from '../../../../shared/models/standalone';
import { UntypedFormGroup } from '@angular/forms';
import { PowerFactorTriangleService } from '../power-factor-triangle.service';

@Component({
  selector: 'app-power-factor-triangle-form',
  templateUrl: './power-factor-triangle-form.component.html',
  styleUrls: ['./power-factor-triangle-form.component.css']
})
export class PowerFactorTriangleFormComponent implements OnInit {

  @Input()
  powerFactorTriangleForm: UntypedFormGroup;
  @Input()
  results: PowerFactorTriangleOutputs;
  @Output('changeField')
  changeField = new EventEmitter<string>();

  @Output('emitCalculate')
  emitCalculate = new EventEmitter<UntypedFormGroup>();

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

  isValid: boolean = true;

  constructor(private powerFactorTriangleService: PowerFactorTriangleService) { }

  ngOnInit() {
  }

  calculate() {
    this.powerFactorTriangleForm = this.powerFactorTriangleService.setModeValidation(this.powerFactorTriangleForm);
    if (this.powerFactorTriangleForm.valid) {
      this.powerFactorTriangleForm.controls.mode.enable();
      this.emitCalculate.emit(this.powerFactorTriangleForm);
    } else {
      this.powerFactorTriangleForm.controls.mode.disable();
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }



}