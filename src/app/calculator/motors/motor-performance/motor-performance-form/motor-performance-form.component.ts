import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup, Validators } from '@angular/forms';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';

@Component({
  selector: 'app-motor-performance-form',
  templateUrl: './motor-performance-form.component.html',
  styleUrls: ['./motor-performance-form.component.css']
})
export class MotorPerformanceFormComponent implements OnInit {
  @Input()
  performanceForm: FormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Output('changeField')
  changeField = new EventEmitter<string>();

  frequencies: Array<number> = [
    50,
    60
  ];
  efficiencyClasses: Array<{ display: string, value: number }>;
  constructor(private psatService: PsatService) {
  }

  ngOnInit() {
    this.efficiencyClasses = motorEfficiencyConstants;
    this.setRpmValidation();
  }

  modifyPowerArrays() {
    //if specified
    if (this.performanceForm.controls.efficiencyClass.value == 3) {
      this.performanceForm.controls.efficiency.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    }
    this.setRpmValidation();
  }

  changePowerArrays() {
    this.modifyPowerArrays();
    this.emitChange();
  }

  emitChange() {
    this.calculate.emit(true);
  }

  calculateFullLoadAmps() {
    // let tmpFullLoadAmps: number = this.psatService.estFLA(
    //   this.performanceForm.controls.horsePower.value,
    //   this.performanceForm.controls.motorRPM.value,
    //   this.performanceForm.controls.frequency.value,
    //   this.performanceForm.controls.efficiencyClass.value,
    //   this.performanceForm.controls.efficiency.value,
    //   this.performanceForm.controls.motorVoltage.value,
    //   this.settings
    // );
    // this.performanceForm.patchValue({
    //   fullLoadAmps: tmpFullLoadAmps
    // })

    this.performanceForm = this.psatService.setFormFullLoadAmps(this.performanceForm, this.settings);
    this.emitChange();
  }

  setRpmValidation() {
    //standard or energy efficiency
    if (this.performanceForm.controls.efficiencyClass.value == 0 || this.performanceForm.controls.efficiencyClass.value == 1) {
      if (this.performanceForm.controls.frequency.value == 60) {
        this.performanceForm.controls.motorRPM.setValidators([Validators.required, Validators.min(540)]);
        this.performanceForm.controls.motorRPM.reset(this.performanceForm.controls.motorRPM.value);
        if (this.performanceForm.controls.motorRPM.value) {
          this.performanceForm.controls.motorRPM.markAsDirty();
        }
      } else if (this.performanceForm.controls.frequency.value == 50) {
        this.performanceForm.controls.motorRPM.setValidators([Validators.required, Validators.min(450)]);
        this.performanceForm.controls.motorRPM.reset(this.performanceForm.controls.motorRPM.value);
        if (this.performanceForm.controls.motorRPM.value) {
          this.performanceForm.controls.motorRPM.markAsDirty();
        }
      }
    }
    //premium
    else if (this.performanceForm.controls.efficiencyClass.value == 2) {
      if (this.performanceForm.controls.frequency.value == 60) {
        this.performanceForm.controls.motorRPM.setValidators([Validators.required, Validators.min(1080)]);
        this.performanceForm.controls.motorRPM.reset(this.performanceForm.controls.motorRPM.value);
        if (this.performanceForm.controls.motorRPM.value) {
          this.performanceForm.controls.motorRPM.markAsDirty();
        }
      } else if (this.performanceForm.controls.frequency.value == 50) {
        this.performanceForm.controls.motorRPM.setValidators([Validators.required, Validators.min(900)]);
        this.performanceForm.controls.motorRPM.reset(this.performanceForm.controls.motorRPM.value);
        if (this.performanceForm.controls.motorRPM.value) {
          this.performanceForm.controls.motorRPM.markAsDirty();
        }
      }
    }

  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
}
