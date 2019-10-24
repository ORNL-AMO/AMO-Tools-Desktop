import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { PumpSystemCurveData } from '../system-and-equipment-curve.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class PumpSystemCurveFormService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  //example/defaults same
  getPumpSystemCurveDefaults(settings: Settings): PumpSystemCurveData {
    let systemCurveFlowRate: number = 600;
    let pumpSystemCurveHead: number = 1000;
    if (settings.flowMeasurement !== 'gpm') {
      systemCurveFlowRate = Math.round(this.convertUnitsService.value(systemCurveFlowRate).from('gpm').to(settings.flowMeasurement) * 100) / 100;
    }
    if (settings.distanceMeasurement !== 'ft') {
      pumpSystemCurveHead = Math.round(this.convertUnitsService.value(pumpSystemCurveHead).from('ft').to(settings.distanceMeasurement) * 100) / 100;
    }
    let examplePumpSystemCurveData: PumpSystemCurveData = {
      specificGravity: 1.0,
      systemLossExponent: 1.9,
      pointOneFlowRate: 0,
      pointOneHead: 0,
      pointTwo: '',
      pointTwoFlowRate: systemCurveFlowRate,
      pointTwoHead: pumpSystemCurveHead,
    };
    return examplePumpSystemCurveData;
  }

  getResetPumpSystemCurveInputs(): PumpSystemCurveData {
    let pumpSystemCurveData: PumpSystemCurveData = {
      specificGravity: 1.0,
      systemLossExponent: 1.9,
      pointOneFlowRate: 0,
      pointOneHead: 0,
      pointTwo: '',
      pointTwoFlowRate: 0,
      pointTwoHead: 0,
    };
    return pumpSystemCurveData;
  }

  getFormFromObj(obj: PumpSystemCurveData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      specificGravity: [obj.specificGravity, [Validators.required, Validators.min(0)]],
      systemLossExponent: [obj.systemLossExponent, [Validators.required, Validators.min(0)]],
      pointOneFlowRate: [obj.pointOneFlowRate, [Validators.required, Validators.min(0)]],
      pointOneHead: [obj.pointOneHead, [Validators.required, Validators.min(0)]],
      pointTwo: [obj.pointTwo],
      pointTwoFlowRate: [obj.pointTwoFlowRate, [Validators.required, Validators.min(0)]],
      pointTwoHead: [obj.pointTwoHead, [Validators.required, Validators.min(0)]],
    })
    return form;
  }

  getObjFromForm(form: FormGroup): PumpSystemCurveData {
    let data: PumpSystemCurveData = {
      specificGravity: form.controls.specificGravity.value,
      systemLossExponent: form.controls.systemLossExponent.value,
      pointOneFlowRate: form.controls.pointOneFlowRate.value,
      pointOneHead: form.controls.pointOneHead.value,
      pointTwo: form.controls.pointTwo.value,
      pointTwoFlowRate: form.controls.pointTwoFlowRate.value,
      pointTwoHead: form.controls.pointTwoHead.value
    }
    return data;
  }

  calculatePumpFluidPower(head: number, flow: number, specificGravity: number, settings: Settings): number {
    //from Daryl -> fluidPower = (head * flow * specificGravity) / 3960
    if (settings.distanceMeasurement !== 'ft') {
      head = this.convertUnitsService.value(head).from(settings.distanceMeasurement).to('ft');
    }
    if (settings.flowMeasurement !== 'gpm') {
      flow = this.convertUnitsService.value(flow).from(settings.flowMeasurement).to('gpm');
    }
    let fluidPower: number = (head * flow * specificGravity) / 3960;

    if (settings.powerMeasurement !== 'hp') {
      fluidPower = this.convertUnitsService.value(fluidPower).from('hp').to(settings.powerMeasurement);
    }
    return fluidPower;
  }
}
