import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { PSAT } from '../../../../shared/models/psat';

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

  options: Array<PSAT>;

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
    }
  }

  checkInputs() {
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

  setFormValues(point: any) {
    console.log(point);
  }

  initPointForm(psat: PSAT) {
    return this.formBuilder.group({
      'flowRate': [psat.inputs.flow_rate, Validators.required],
      'head': [psat.inputs.head, Validators.required],
      'pointAdjustment': [psat.name, Validators.required]
    })
  }


}
