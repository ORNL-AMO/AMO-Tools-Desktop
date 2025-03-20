import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { FLAMotorWarnings, FullLoadAmpsService } from '../full-load-amps.service';
import { Subscription } from 'rxjs';
import { FanMotor } from '../../../../shared/models/fans';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';

@Component({
    selector: 'app-full-load-amps-form',
    templateUrl: './full-load-amps-form.component.html',
    styleUrls: ['./full-load-amps-form.component.css'],
    standalone: false
})
export class FullLoadAmpsFormComponent implements OnInit {
  @Input()
  settings: Settings;

  form: UntypedFormGroup;
  formWidth: number;
  idString: string = 'fla_calc';
  fullLoadAmps: number;
  warnings: FLAMotorWarnings;
  
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  fullLoadAmpsResultSub: Subscription;

  frequencies: Array<number> = [
    50,
    60
  ];
  efficiencyClasses: Array<{ display: string, value: number }> = motorEfficiencyConstants;
  
  constructor(private fullLoadAmpsService: FullLoadAmpsService) { }

  ngOnInit(): void {  
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.resetDataSub = this.fullLoadAmpsService.resetData.subscribe(value => {
      this.initForm();
    })
    this.generateExampleSub = this.fullLoadAmpsService.generateExample.subscribe(value => {
      this.initForm();
    });
    this.fullLoadAmpsResultSub = this.fullLoadAmpsService.fullLoadAmpsResult.subscribe(result => {
      this.fullLoadAmps = result;
    });
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
  }

  initForm() {
    let fullLoadAmpsInput: FanMotor = this.fullLoadAmpsService.fullLoadAmpsInputs.getValue();
    this.form = this.fullLoadAmpsService.getFormFromObj(fullLoadAmpsInput);
    this.checkWarnings(fullLoadAmpsInput);
    this.calculate();
  }

  changeLineFreq() {
    if (this.form.controls.lineFrequency.value === 60) {
      if (this.form.controls.motorRpm.value === 1485) {
        this.form.controls.motorRpm.patchValue(1780);
      }
    } else if (this.form.controls.lineFrequency.value === 50) {
      if (this.form.controls.motorRpm.value === 1780) {
        this.form.controls.motorRpm.patchValue(1485);
      }
    }
    this.calculate();
  }

  changeEfficiencyClass() {
    this.form = this.fullLoadAmpsService.changeEfficiencyClass(this.form);
    this.calculate();
  }

  checkWarnings(motor: FanMotor) {
    this.warnings = this.fullLoadAmpsService.checkMotorWarnings(motor, this.settings);
  }

  focusField(str: string) {
    this.fullLoadAmpsService.currentField.next(str);
  }

  calculate() {
    let updatedInput: FanMotor = this.fullLoadAmpsService.getObjFromForm(this.form);
    this.fullLoadAmpsService.fullLoadAmpsInputs.next(updatedInput);
    this.checkWarnings(updatedInput);
  }

}
