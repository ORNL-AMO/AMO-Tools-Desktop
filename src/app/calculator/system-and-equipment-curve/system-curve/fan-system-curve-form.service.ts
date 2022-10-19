import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { FanSystemCurveData } from '../../../shared/models/system-and-equipment-curve';

@Injectable()
export class FanSystemCurveFormService {

  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) { }

  getFanSystemCurveDefaults(): FanSystemCurveData {
    let defaultFanSystemCurveData: FanSystemCurveData = {
      compressibilityFactor: 0,
      systemLossExponent: 0,
      pointOneFlowRate: 0,
      pointOnePressure: 0,
      pointTwo: '',
      pointTwoFlowRate: 0,
      pointTwoPressure: 0,
      modificationCurve: {
        modificationMeasurementOption: 0,
        modifiedFlow: 0,
        modifiedPressure: 0,
      }
    };
    return defaultFanSystemCurveData;
  }

  getFanSystemCurveExample(settings: Settings): FanSystemCurveData {
    let systemCurveFlowRate: number = 129691;
    let fanSystemCurvePressure: number = 17.46;
    let modifiedCurvePressure = 12;
    if (settings.fanFlowRate != 'ft3/min') {
      systemCurveFlowRate = Math.round(this.convertUnitsService.value(systemCurveFlowRate).from('ft3/min').to(settings.fanFlowRate) * 100) / 100;
    }
    if (settings.fanPressureMeasurement != 'inH2o') {
      modifiedCurvePressure = Math.round(this.convertUnitsService.value(modifiedCurvePressure).from('inH2o').to(settings.fanPressureMeasurement) * 100) / 100;
      fanSystemCurvePressure = Math.round(this.convertUnitsService.value(fanSystemCurvePressure).from('inH2o').to(settings.fanPressureMeasurement) * 100) / 100;
    }
    let defaultFanSystemCurveData: FanSystemCurveData = {
      compressibilityFactor: .98,
      systemLossExponent: 2,
      pointOneFlowRate: 0,
      pointOnePressure: 0,
      pointTwo: '',
      pointTwoFlowRate: systemCurveFlowRate,
      pointTwoPressure: fanSystemCurvePressure,
      modificationCurve: {
        modificationMeasurementOption: 1,
        modifiedFlow: 0,
        modifiedPressure: modifiedCurvePressure,
      }
    };
    return defaultFanSystemCurveData;
  }

  getObjFromForm(form: UntypedFormGroup): FanSystemCurveData {
    let data: FanSystemCurveData = {
      compressibilityFactor: form.controls.compressibilityFactor.value,
      systemLossExponent: form.controls.systemLossExponent.value,
      pointOneFlowRate: form.controls.pointOneFlowRate.value,
      pointOnePressure: form.controls.pointOnePressure.value,
      pointTwo: form.controls.pointTwo.value,
      pointTwoFlowRate: form.controls.pointTwoFlowRate.value,
      pointTwoPressure: form.controls.pointTwoPressure.value,
      modificationCurve: {
        modificationMeasurementOption: form.controls.modificationMeasurementOption.value,
        modifiedFlow: form.controls.modifiedFlow.value,
        modifiedPressure: form.controls.modifiedPressure.value,
      }
    };
    return data;
  }

  getFormFromObj(obj: FanSystemCurveData): UntypedFormGroup {
    let modificationMeasurementOption = [0, Validators.required];
    let modifiedFlow = [0, [Validators.required, Validators.min(0)]];
    let modifiedPressure = [0, [Validators.required, Validators.min(0)]];

    if (obj.modificationCurve) {
      modificationMeasurementOption = [obj.modificationCurve.modificationMeasurementOption, Validators.required];
      modifiedFlow = [obj.modificationCurve.modifiedFlow, [Validators.required, Validators.min(0)]];
      modifiedPressure = [obj.modificationCurve.modifiedPressure, [Validators.required, Validators.min(0)]];
    }
    let form: UntypedFormGroup = this.formBuilder.group({
      compressibilityFactor: [obj.compressibilityFactor, [Validators.required, Validators.min(0)]],
      systemLossExponent: [obj.systemLossExponent, [Validators.required, Validators.min(0)]],
      pointOneFlowRate: [obj.pointOneFlowRate, [Validators.required, Validators.min(0)]],
      pointOnePressure: [obj.pointOnePressure, [Validators.required, Validators.min(0)]],
      pointTwo: [obj.pointTwo],
      pointTwoFlowRate: [obj.pointTwoFlowRate, [Validators.required, Validators.min(0)]],
      pointTwoPressure: [obj.pointTwoPressure, [Validators.required, Validators.min(0)]],
      modificationMeasurementOption: modificationMeasurementOption,
      modifiedFlow: modifiedFlow,
      modifiedPressure: modifiedPressure,
    });
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
