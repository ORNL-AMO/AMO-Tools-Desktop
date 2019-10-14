import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PumpSystemCurveFormService } from '../pump-system-curve-form.service';
import { Settings } from '../../../../shared/models/settings';
import { SystemAndEquipmentCurveService, PumpSystemCurveData } from '../../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pump-system-curve-form',
  templateUrl: './pump-system-curve-form.component.html',
  styleUrls: ['./pump-system-curve-form.component.css']
})
export class PumpSystemCurveFormComponent implements OnInit {
  @Input()
  settings: Settings;

  exponentInputWarning: string = null;
  pointOneFluidPower: number = 0;
  pointTwoFluidPower: number = 0;
  pumpSystemCurveForm: FormGroup;
  resetFormsSub: Subscription;
  constructor(private pumpSystemCurveFormService: PumpSystemCurveFormService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService) { }

  ngOnInit() {
    this.initForm();
    this.resetFormsSub = this.systemAndEquipmentCurveService.resetForms.subscribe(val => {
      if (val == true) {
        this.initForm();
      }
    });
  }

  ngOnDestroy() {
    this.resetFormsSub.unsubscribe();
  }

  initForm() {
    let dataObj: PumpSystemCurveData = this.systemAndEquipmentCurveService.pumpSystemCurveData.value;
    if (dataObj == undefined) {
      dataObj = this.pumpSystemCurveFormService.getPumpSystemCurveDefaults();
    }
    this.systemAndEquipmentCurveService.pumpSystemCurveData.next(dataObj);
    this.pumpSystemCurveForm = this.pumpSystemCurveFormService.getFormFromObj(dataObj);
    this.calculateFluidPowers(dataObj);
    this.checkLossExponent(dataObj.systemLossExponent);
  }

  resetForm() {
    let dataObj: PumpSystemCurveData = this.systemAndEquipmentCurveService.pumpSystemCurveData.value;
    this.pumpSystemCurveForm = this.pumpSystemCurveFormService.getFormFromObj(dataObj);
    this.calculateFluidPowers(dataObj);
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
    this.systemAndEquipmentCurveService.focusedCalculator.next('pump-system-curve');
    this.systemAndEquipmentCurveService.currentField.next(str);
  }

  saveChanges() {
    let dataObj: PumpSystemCurveData = this.pumpSystemCurveFormService.getObjFromForm(this.pumpSystemCurveForm);
    this.checkLossExponent(dataObj.systemLossExponent);
    this.calculateFluidPowers(dataObj);
    this.systemAndEquipmentCurveService.pumpSystemCurveData.next(dataObj);
  }

  calculateFluidPowers(pumpSystemCurveData: PumpSystemCurveData) {
    this.pointOneFluidPower = this.pumpSystemCurveFormService.calculatePumpFluidPower(pumpSystemCurveData.pointOneHead, pumpSystemCurveData.pointOneFlowRate, pumpSystemCurveData.specificGravity, this.settings);
    this.pointTwoFluidPower = this.pumpSystemCurveFormService.calculatePumpFluidPower(pumpSystemCurveData.pointTwoHead, pumpSystemCurveData.pointTwoFlowRate, pumpSystemCurveData.specificGravity, this.settings);
  }
}
