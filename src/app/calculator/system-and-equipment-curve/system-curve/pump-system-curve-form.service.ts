import { Injectable } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { PumpSystemCurveData } from '../../../shared/models/system-and-equipment-curve';

@Injectable()
export class PumpSystemCurveFormService {

  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) { }

  getPumpSystemCurveExample(settings: Settings): PumpSystemCurveData {
    let systemCurveFlowRate: number = 600;
    let pumpSystemCurveHead: number = 300;
    let modifiedCurveFlow = 500;
    if (settings.flowMeasurement !== 'gpm') {
      systemCurveFlowRate = Math.round(this.convertUnitsService.value(systemCurveFlowRate).from('gpm').to(settings.flowMeasurement) * 100) / 100;
      modifiedCurveFlow = Math.round(this.convertUnitsService.value(modifiedCurveFlow).from('gpm').to(settings.flowMeasurement) * 100) / 100;
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
      modificationCurve: {
        modificationMeasurementOption: 0,
        modifiedFlow: modifiedCurveFlow,
        modifiedHead: 0,
      }
    };
    return examplePumpSystemCurveData;
  }


  getResetPumpSystemCurveInputs(): PumpSystemCurveData {
    let pumpSystemCurveData: PumpSystemCurveData = {
      specificGravity: 0,
      systemLossExponent: 0,
      pointOneFlowRate: 0,
      pointOneHead: 0,
      pointTwo: '',
      pointTwoFlowRate: 0,
      pointTwoHead: 0,
      modificationCurve: {
        modificationMeasurementOption: 0,
        modifiedFlow: 0,
        modifiedHead: 0,
      }
    };
    return pumpSystemCurveData;
  }

  getFormFromObj(obj: PumpSystemCurveData): UntypedFormGroup {
    let modificationMeasurementOption = [0, Validators.required];
    let modifiedFlow = [0, [Validators.required, Validators.min(0)]];
    let modifiedHead = [0, [Validators.required, Validators.min(0)]];

    if (obj.modificationCurve) {
      modificationMeasurementOption = [obj.modificationCurve.modificationMeasurementOption, Validators.required];
      modifiedFlow = [obj.modificationCurve.modifiedFlow, [Validators.required, Validators.min(0)]];
      modifiedHead = [obj.modificationCurve.modifiedHead, [Validators.required, Validators.min(0)]];
    }
    
    let form: UntypedFormGroup = this.formBuilder.group({
      specificGravity: [obj.specificGravity, [Validators.required, Validators.min(0)]],
      systemLossExponent: [obj.systemLossExponent, [Validators.required, Validators.min(0)]],
      pointOneFlowRate: [obj.pointOneFlowRate, [Validators.required, Validators.min(0)]],
      pointOneHead: [obj.pointOneHead, [Validators.required, Validators.min(0)]],
      pointTwo: [obj.pointTwo],
      pointTwoFlowRate: [obj.pointTwoFlowRate, [Validators.required, Validators.min(0)]],
      pointTwoHead: [obj.pointTwoHead, [Validators.required, Validators.min(0)]],
      modificationMeasurementOption: modificationMeasurementOption,
      modifiedFlow: modifiedFlow,
      modifiedHead: modifiedHead,
    })
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): PumpSystemCurveData {
    let data: PumpSystemCurveData = {
      specificGravity: form.controls.specificGravity.value,
      systemLossExponent: form.controls.systemLossExponent.value,
      pointOneFlowRate: form.controls.pointOneFlowRate.value,
      pointOneHead: form.controls.pointOneHead.value,
      pointTwo: form.controls.pointTwo.value,
      pointTwoFlowRate: form.controls.pointTwoFlowRate.value,
      pointTwoHead: form.controls.pointTwoHead.value,
      modificationCurve: {
        modificationMeasurementOption: form.controls.modificationMeasurementOption.value,
        modifiedFlow: form.controls.modifiedFlow.value,
        modifiedHead: form.controls.modifiedHead.value,
      }
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
