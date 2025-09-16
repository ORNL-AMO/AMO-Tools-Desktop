import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
@Component({
    selector: 'app-head-tool-suction-form',
    templateUrl: './head-tool-suction-form.component.html',
    styleUrls: ['./head-tool-suction-form.component.css'],
    standalone: false
})
export class HeadToolSuctionFormComponent implements OnInit {
  @Input()
  headToolSuctionForm: UntypedFormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  inAssessment: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  diameterSuctionError: string = null;
  diameterSuctionErrorOut: string = null;
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
    if (this.headToolSuctionForm.valid && this.checkPipeDiameterIn() && this.checkPipeDiameterOut()) {
      this.calculate.emit(true);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  checkPipeDiameterIn() {
    if (this.headToolSuctionForm.controls.suctionPipeDiameter.value === 0) {
      this.diameterSuctionError = "Cannot have 0 diameter";
      return false;
    }
    else if (this.headToolSuctionForm.controls.suctionPipeDiameter.value < 0) {
      this.diameterSuctionError = "Cannot have negative diameter";
      return false;
    }
    else {
      this.diameterSuctionError = null;
      return true;
    }
  }
  checkPipeDiameterOut() {
    if (this.headToolSuctionForm.controls.dischargePipeDiameter.value === 0) {
      this.diameterSuctionErrorOut = "Cannot have 0 diameter";
      return false;
    }
    else if (this.headToolSuctionForm.controls.dischargePipeDiameter.value < 0) {
      this.diameterSuctionErrorOut = "Cannot have negative diameter";
      return false;
    }
    else {
      this.diameterSuctionErrorOut = null;
      return true;
    }
  }


  checkPressure() {
    if (this.headToolSuctionForm.controls.suctionTankGasOverPressure.value > this.headToolSuctionForm.controls.dischargeGaugePressure.value) {
      this.pressureError = 'Suction Pressure cannot be greater than Discharge Pressure';
      return false;
    } else {
      this.pressureError = null;
      return true;
    }
  }
}
