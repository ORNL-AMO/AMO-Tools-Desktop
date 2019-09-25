import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FanSystemCurveFormService } from '../fan-system-curve-form.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-fan-system-curve-form',
  templateUrl: './fan-system-curve-form.component.html',
  styleUrls: ['./fan-system-curve-form.component.css']
})
export class FanSystemCurveFormComponent implements OnInit {
  @Input()
  settings: Settings;

  exponentInputWarning: boolean = null;
  pointOneFluidPower: number;
  pointTwoFluidPower: number;
  fanSystemCurveForm: FormGroup;
  constructor(private fanSystemCurveFormService: FanSystemCurveFormService) { }

  ngOnInit() {
    this.fanSystemCurveForm = this.fanSystemCurveFormService.getForm();
  }


  checkLossExponent() {
    // if (this.tmpSystemLossExponent > 2.5 || this.tmpSystemLossExponent < 1) {
    //   this.exponentInputWarning = 'System Loss Exponent needs to be between 1 - 2.5';
    // }
    // else if (this.exponentInputWarning < 0) {
    //   this.exponentInputError = 'Cannot have negative System Loss Exponent';
    // }
    // else {
    this.exponentInputWarning = null;
    // }
  }

}
