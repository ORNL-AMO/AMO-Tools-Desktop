import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FanSystemCurveFormService } from '../fan-system-curve-form.service';
import { Settings } from '../../../../shared/models/settings';
import { SystemAndEquipmentCurveService, FanSystemCurveData } from '../../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';
import { CurveDataService } from '../../curve-data.service';

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
  resetFormsSub: Subscription;
  assessmentDataPoints: Array<{ pointName: string, flowRate: number, yValue: number }>;
  showDataPointOptions: boolean = false;
  constructor(private fanSystemCurveFormService: FanSystemCurveFormService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService,
    private curveDataService: CurveDataService) { }

  ngOnInit() {
    this.initForm();
    this.resetFormsSub = this.curveDataService.resetForms.subscribe(val => {
      if (val == true) {
        this.initForm();
      }
    });

    if (this.systemAndEquipmentCurveService.systemCurveDataPoints) {
      this.assessmentDataPoints = this.systemAndEquipmentCurveService.systemCurveDataPoints;
      if (this.fanSystemCurveForm.controls.pointTwo.value == '') {
        this.fanSystemCurveForm.controls.pointTwo.patchValue('Baseline');
        this.setFormValues();
      }
      this.showDataPointOptions = true;
    }
  }

  ngOnDestroy() {
    this.resetFormsSub.unsubscribe();
  }

  initForm() {
    let dataObj: FanSystemCurveData = this.systemAndEquipmentCurveService.fanSystemCurveData.value;
    if (dataObj == undefined) {
      dataObj = this.fanSystemCurveFormService.getFanSystemCurveDefaults(this.settings);
    }
    this.systemAndEquipmentCurveService.fanSystemCurveData.next(dataObj);
    this.fanSystemCurveForm = this.fanSystemCurveFormService.getFormFromObj(dataObj);
    this.calculateFluidPowers(dataObj);
    this.checkLossExponent(dataObj.systemLossExponent);
  }

  resetForm() {
    let dataObj: FanSystemCurveData = this.systemAndEquipmentCurveService.fanSystemCurveData.value;
    this.fanSystemCurveForm = this.fanSystemCurveFormService.getFormFromObj(dataObj);
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
    this.systemAndEquipmentCurveService.focusedCalculator.next('fan-system-curve');
    this.systemAndEquipmentCurveService.currentField.next(str);
  }

  saveChanges() {
    if (this.fanSystemCurveForm.valid) {
      let dataObj: FanSystemCurveData = this.fanSystemCurveFormService.getObjFromForm(this.fanSystemCurveForm);
      this.checkLossExponent(dataObj.systemLossExponent);
      this.calculateFluidPowers(dataObj);
      this.systemAndEquipmentCurveService.fanSystemCurveData.next(dataObj);
    } else {
      this.pointOneFluidPower = 0;
      this.pointTwoFluidPower = 0;
      this.systemAndEquipmentCurveService.fanSystemCurveData.next(undefined);
    }
  }

  calculateFluidPowers(fanSystemCurveData: FanSystemCurveData) {
    this.pointOneFluidPower = this.fanSystemCurveFormService.calculateFanFluidPower(fanSystemCurveData.pointOnePressure, fanSystemCurveData.pointOneFlowRate, fanSystemCurveData.compressibilityFactor, this.settings);
    this.pointTwoFluidPower = this.fanSystemCurveFormService.calculateFanFluidPower(fanSystemCurveData.pointTwoPressure, fanSystemCurveData.pointTwoFlowRate, fanSystemCurveData.compressibilityFactor, this.settings);
  }

  setFormValues() {
    let dataPoint: { pointName: string, flowRate: number, yValue: number } = this.assessmentDataPoints.find(point => { return point.pointName == this.fanSystemCurveForm.controls.pointTwo.value });
    if (dataPoint) {
      this.fanSystemCurveForm.patchValue({
        pointTwoFlowRate: dataPoint.flowRate,
        pointTwoPressure: dataPoint.yValue
      });
      this.saveChanges();
    }
  }
}
