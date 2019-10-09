import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FanSystemCurveFormService } from '../fan-system-curve-form.service';
import { Settings } from '../../../../shared/models/settings';
import { SystemAndEquipmentCurveService, FanSystemCurveData } from '../../system-and-equipment-curve.service';

@Component({
  selector: 'app-fan-system-curve-form',
  templateUrl: './fan-system-curve-form.component.html',
  styleUrls: ['./fan-system-curve-form.component.css']
})
export class FanSystemCurveFormComponent implements OnInit {
  @Input()
  settings: Settings;

  exponentInputWarning: string = null;
  pointOneFluidPower: number = 0;
  pointTwoFluidPower: number = 0;
  fanSystemCurveForm: FormGroup;
  constructor(private fanSystemCurveFormService: FanSystemCurveFormService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    let dataObj: FanSystemCurveData = this.systemAndEquipmentCurveService.fanSystemCurveData.value;
    if (dataObj == undefined) {
      dataObj = this.fanSystemCurveFormService.getFanSystemDefaults();
      this.systemAndEquipmentCurveService.fanSystemCurveData.next(dataObj);
    }
    this.fanSystemCurveForm = this.fanSystemCurveFormService.getFormFromObj(dataObj);
    this.calculateFluidPowers(dataObj);
    this.checkLossExponent(dataObj.systemLossExponent);
  }

  checkLossExponent(systemLossExponent: number) {
    if (systemLossExponent > 2.5 || systemLossExponent < 1) {
      this.exponentInputWarning = 'System Loss Exponent needs to be between 1 - 2.5';
    }
    else if (systemLossExponent < 0) {
      this.exponentInputWarning = 'Cannot have negative System Loss Exponent';
    }
    else {
      this.exponentInputWarning = null;
    }
  }

  focusField(str: string) {
    this.systemAndEquipmentCurveService.focusedCalculator.next('fan-system-curve');
    this.systemAndEquipmentCurveService.currentField.next(str);
  }

  saveChanges() {
    let dataObj: FanSystemCurveData = this.fanSystemCurveFormService.getObjFromForm(this.fanSystemCurveForm);
    this.checkLossExponent(dataObj.systemLossExponent);
    this.calculateFluidPowers(dataObj);
    this.systemAndEquipmentCurveService.fanSystemCurveData.next(dataObj);
  }

  calculateFluidPowers(fanSystemCurveData: FanSystemCurveData) {
    this.pointOneFluidPower = this.fanSystemCurveFormService.calculateFanFluidPower(fanSystemCurveData.pointOnePressure, fanSystemCurveData.pointOneFlowRate, fanSystemCurveData.compressibilityFactor, this.settings);
    this.pointTwoFluidPower = this.fanSystemCurveFormService.calculateFanFluidPower(fanSystemCurveData.pointTwoPressure, fanSystemCurveData.pointTwoFlowRate, fanSystemCurveData.compressibilityFactor, this.settings);
  }
}
