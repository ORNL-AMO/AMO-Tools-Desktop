import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { PSAT } from '../../../../shared/models/psat';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

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
  @Input()
  inAssessment: boolean;
  @Output('setVals')
  setVals = new EventEmitter<boolean>();
  @Output('save')
  save = new EventEmitter<boolean>();
  @Input()
  fsat: FSAT;
  @Input()
  isFan: boolean;

  exponentInputError: string = null;
  pumpForm: any;
  options: Array<PSAT | FSAT>;

  p1FlowRate: number;
  p1Head: number;
  p1Option: string;
  p2FlowRate: number;
  p2Head: number;
  p2Option: string;
  tmpSpecificGravity: number;
  tmpSystemLossExponent: any;

  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.options = new Array<PSAT | FSAT>();
    if (this.psat) {
      this.options.push(this.psat);
      if (this.psat.modifications) {
        this.psat.modifications.forEach(mod => {
          this.options.push(mod.psat);
        })
      }
    }else if(this.fsat){
      this.options.push(this.fsat);
      if(this.fsat.modifications) {
        this.fsat.modifications.forEach(mod => {
          this.options.push(mod.fsat);
        })
      }
    }else {
      this.p1Option = 'Point 1';
      this.p2Option = 'Point 2';
    }
  }

  saveChanges(){
    this.save.emit(true)
  }

  setFormValues() {
    if(this.inAssessment){
      this.setVals.emit(true);
    }
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

  getDisplayUnit(unit: string) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }

}
