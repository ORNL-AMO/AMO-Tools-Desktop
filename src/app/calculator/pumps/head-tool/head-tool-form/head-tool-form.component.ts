import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-head-tool-form',
  templateUrl: './head-tool-form.component.html',
  styleUrls: ['./head-tool-form.component.css']
})
export class HeadToolFormComponent implements OnInit {
  @Input()
  headToolForm: UntypedFormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  inAssessment: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  diameterError: string = null;
  diameterErrorOut: string = null;
  smallUnit: string;
  pressureError: string = null;
  constructor() { }

  ngOnInit() {
    if (this.settings.distanceMeasurement === 'ft') {
      this.smallUnit = 'in';
    } else {
      this.smallUnit = 'mm';
    }
    this.calc();
  }

  calc() {
    this.checkPressure();
    if (this.headToolForm.valid && this.checkPipeDiameterSuction() && this.checkPipeDiameterDischarge()) {
      this.calculate.emit(true);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  checkPipeDiameterSuction() {
    if (this.headToolForm.controls.suctionPipeDiameter.value === 0) {
      this.diameterError = "Cannot have 0 diameter";
      return false;
    }
    else if (this.headToolForm.controls.suctionPipeDiameter.value < 0) {
      this.diameterError = "Cannot have negative diameter";
      return false;
    }
    else {
      this.diameterError = null;
      return true;
    }
  }
  checkPipeDiameterDischarge() {
    if (this.headToolForm.controls.dischargePipeDiameter.value === 0) {
      this.diameterErrorOut = "Cannot have 0 diameter";
      return false;
    }
    else if (this.headToolForm.controls.dischargePipeDiameter.value < 0) {
      this.diameterErrorOut = "Cannot have negative diameter";
      return false;
    }
    else {
      this.diameterErrorOut = null;
      return true;
    }
  }

  checkPressure() {
    if (this.headToolForm.controls.suctionGuagePressure.value > this.headToolForm.controls.dischargeGaugePressure.value) {
      this.pressureError = 'Suction Pressure cannot be greater than Discharge Pressure';
      return false;
    } else {
      this.pressureError = null;
      return true;
    }
  }
}
