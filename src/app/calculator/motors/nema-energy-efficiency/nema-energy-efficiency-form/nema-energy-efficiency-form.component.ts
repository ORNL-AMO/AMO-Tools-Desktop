import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';
@Component({
    selector: 'app-nema-energy-efficiency-form',
    templateUrl: './nema-energy-efficiency-form.component.html',
    styleUrls: ['./nema-energy-efficiency-form.component.css'],
    standalone: false
})
export class NemaEnergyEfficiencyFormComponent implements OnInit {
  @Input()
  nemaForm: UntypedFormGroup;
  @Input()
  settings: Settings;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();

  frequencies: Array<number> = [
    50,
    60
  ];

  efficiencyClasses: Array<{display: string, value: number}>;
  efficiencyError: string = null;
  // options: Array<any>;
  constructor() { }

  ngOnInit() {
    this.efficiencyClasses = motorEfficiencyConstants;
    this.modifyPowerArrays();
  }

  addNum(str: string) {
    if (str === 'motorRPM') {
      this.nemaForm.patchValue({
        'motorRPM': this.nemaForm.controls.motorRPM.value + 1
      });
    }
    this.calculate();
  }

  subtractNum(str: string) {
    if (str === 'motorRPM') {
      if (this.nemaForm.controls.motorRPM.value !== 1) {
        this.nemaForm.patchValue({
          'motorRPM': this.nemaForm.controls.motorRPM.value - 1
        });
      }
    }
    this.calculate();
  }


  modifyPowerArrays() {
    //if efficiency class is specified efficiency
    if (this.nemaForm.controls.efficiencyClass.value === 3) {
      this.nemaForm.controls.efficiency.setValidators([Validators.min(1), Validators.max(100), Validators.required]);
    }else {
      this.nemaForm.controls.efficiency.clearValidators();
      this.nemaForm.controls.efficiency.reset();
    }
    this.calculate();
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
}
