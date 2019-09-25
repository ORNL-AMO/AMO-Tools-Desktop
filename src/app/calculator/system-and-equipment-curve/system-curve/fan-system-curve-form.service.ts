import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FanSystemCurveData } from '../system-and-equipment-curve.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class FanSystemCurveFormService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  getForm(): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      compressibilityFactor: [.98, [Validators.required, Validators.min(0)]],
      systemLossExponent: [1.9, [Validators.required, Validators.min(0)]],
      pointOneFlowRate: [0, [Validators.required, Validators.min(0)]],
      pointOnePressure: [0, [Validators.required, Validators.min(0)]],
      pointTwo: [''],
      pointTwoFlowRate: [0, [Validators.required, Validators.min(0)]],
      pointTwoPressure: [0, [Validators.required, Validators.min(0)]],
    })
    return form;
  }

  getObjFromForm(form: FormGroup): FanSystemCurveData {
    let data: FanSystemCurveData = {
      compressibilityFactor: form.controls.compressibilityFactor.value,
      systemLossExponent: form.controls.systemLossExponent.value,
      pointOneFlowRate: form.controls.pointOneFlowRate.value,
      pointOnePressure: form.controls.pointOnePressure.value,
      pointTwo: form.controls.pointTwo.value,
      pointTwoFlowRate: form.controls.pointTwoFlowRate.value,
      pointTwoPressure: form.controls.pointTwoPressure.value
    }
    return data;
  }

  getFormFromObj(obj: FanSystemCurveData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      compressibilityFactor: [obj.compressibilityFactor, [Validators.required, Validators.min(0)]],
      systemLossExponent: [obj.systemLossExponent, [Validators.required, Validators.min(0)]],
      pointOneFlowRate: [obj.pointOneFlowRate, [Validators.required, Validators.min(0)]],
      pointOnePressure: [obj.pointOnePressure, [Validators.required, Validators.min(0)]],
      pointTwo: [obj.pointTwo],
      pointTwoFlowRate: [obj.pointTwoFlowRate, [Validators.required, Validators.min(0)]],
      pointTwoPressure: [obj.pointTwoPressure, [Validators.required, Validators.min(0)]],
    })
    return form;

  }

  calculateFanFluidPower(pressure: number, flow: number, compressibilityFactor: number, settings: Settings): number {
    if (settings.fanPressureMeasurement !== 'inH2o') {
      pressure = this.convertUnitsService.value(pressure).from(settings.fanPressureMeasurement).to('inH2o');
    }
    if (settings.fanFlowRate !== 'ft3/min') {
      flow = this.convertUnitsService.value(flow).from(settings.fanFlowRate).to('ft3/min');
    }
    let fluidPower: number = (pressure * flow * compressibilityFactor) / 6362;
    if (settings.powerMeasurement !== 'hp') {
      fluidPower = this.convertUnitsService.value(fluidPower).from('hp').to(settings.fanPowerMeasurement);
    }
    return fluidPower;
  }
}
