import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { PSAT } from '../../../../shared/models/psat';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-system-curve-form',
  templateUrl: './system-curve-form.component.html',
  styleUrls: ['./system-curve-form.component.css']
})
export class SystemCurveFormComponent implements OnInit {
  @Input()
  curveConstants: any;
  @Input()
  pointOne: any;
  @Input()
  pointTwo: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Output('calculateP1')
  calculateP1 = new EventEmitter<boolean>();
  @Output('calculateP2')
  calculateP2 = new EventEmitter<boolean>();
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;

  exponentInputError: string = null;
  pumpForm: any;
  options: Array<PSAT>;

  p1FlowRate: number;
  p1Head: number;
  p1Option: string;
  p2FlowRate: number;
  p2Head: number;
  p2Option: string;
  tmpSpecificGravity: number;
  tmpSystemLossExponent: any;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.options = new Array<PSAT>();
    if (this.psat) {
      this.options.push(this.psat);
      if (this.psat.modifications) {
        this.psat.modifications.forEach(mod => {
          this.options.push(mod.psat);
        })
      }
    } else {

      this.p1Option = 'Point 1';
      this.p2Option = 'Point 2';
    }

    if (this.pointOne) {
      this.p1Head = this.pointOne.form.controls.head.value;
      this.p1FlowRate = this.pointOne.form.controls.flowRate.value;
      this.p1Option = this.pointOne.form.controls.pointAdjustment.value;
    }

    if (this.pointTwo) {
      this.p2Head = this.pointTwo.form.controls.head.value;
      this.p2FlowRate = this.pointTwo.form.controls.flowRate.value;
      this.p2Option = this.pointTwo.form.controls.pointAdjustment.value;
    }

    if (this.curveConstants) {
      this.tmpSpecificGravity = this.curveConstants.form.controls.specificGravity.value;
      this.tmpSystemLossExponent = this.curveConstants.form.controls.systemLossExponent.value;
    }
    this.checkInputs();
  }

  checkInputs() {
    this.setFormValues();
    let p1 = this.checkForm(this.pointOne);
    let p2 = this.checkForm(this.pointTwo);
    let cc = this.checkForm(this.curveConstants);

    if (p1) {
      this.calculateP1.emit(true);
    }
    if (p2) {
        this.calculateP2.emit(true);
    }
    if (p1 && p2 && cc) {
      this.calculate.emit(true);
    }
  }

  checkForm(point: any) {
    if (point.form.status == "VALID") {
      return true;
    }
    else {
      return false;
    }
  }

  setFormValues() {
    this.pointOne.form.patchValue({
      flowRate: this.p1FlowRate,
      head: this.p1Head,
      pointAdjustment: this.p1Option
    });

    this.pointTwo.form.patchValue({
      flowRate: this.p2FlowRate,
      head: this.p2Head,
      pointAdjustment: this.p2Option
    });
    this.curveConstants.form.patchValue({
      specificGravity: this.tmpSpecificGravity,
      systemLossExponent: this.tmpSystemLossExponent
    });

  }

    checkLossExponent() {
    if (this.tmpSystemLossExponent > 2.5 || this.tmpSystemLossExponent < 1) {
      this.exponentInputError = 'System Loss Exponent needs to be between 1 - 2.5';
      return false;
    }
    else if (this.tmpSystemLossExponent < 0) {
      this.exponentInputError = 'Cannot have negative System Loss Exponent';
      return false;
    }
    else {
      this.exponentInputError = null;
      return true;
    }
  }

}
