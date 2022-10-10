import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Injectable()
export class FanEfficiencyService {
  fanEfficiencyInputs: FanEfficiencyInputs;
  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) { }

  initForm(): UntypedFormGroup {
    return this.formBuilder.group({
      fanType: [0, Validators.required],
      fanSpeed: [0, [Validators.required, Validators.min(0)]],
      inletPressure: [0, [Validators.required, Validators.max(0)]],
      outletPressure: [0, [Validators.required, Validators.min(0)]],
      flowRate: [0, Validators.required],
      compressibility: [0, Validators.required]
    });
  }

  initFormFromFsat(fsat: FSAT): UntypedFormGroup {
    return this.formBuilder.group({
      fanType: [fsat.fanSetup.fanType, Validators.required],
      fanSpeed: [fsat.fanSetup.fanSpeed, [Validators.required, Validators.min(0)]],
      inletPressure: [fsat.fieldData.inletPressure, [Validators.required, Validators.max(0)]],
      outletPressure: [fsat.fieldData.outletPressure, [Validators.required, Validators.min(0)]],
      flowRate: [fsat.fieldData.flowRate, Validators.required],
      compressibility: [fsat.fieldData.compressibilityFactor, Validators.required]
    });
  }

  initFormFromObj(obj: FanEfficiencyInputs): UntypedFormGroup {
    return this.formBuilder.group({
      fanType: [obj.fanType, Validators.required],
      fanSpeed: [obj.fanSpeed, [Validators.required, Validators.min(0)]],
      inletPressure: [obj.inletPressure, [Validators.required, Validators.max(0)]],
      outletPressure: [obj.outletPressure, [Validators.required, Validators.min(0)]],
      flowRate: [obj.flowRate, Validators.required],
      compressibility: [obj.compressibility, Validators.required]
    });
  }

  getObjFromForm(form: UntypedFormGroup): FanEfficiencyInputs {
    return {
      fanType: form.controls.fanType.value,
      fanSpeed: form.controls.fanSpeed.value,
      inletPressure: form.controls.inletPressure.value,
      outletPressure: form.controls.outletPressure.value,
      flowRate: form.controls.flowRate.value,
      compressibility: form.controls.compressibility.value
    };
  }

  generateExample(settings: Settings): FanEfficiencyInputs {
    let defaultFlowRate: number = 129691;
    if (settings.fanFlowRate != 'ft3/min') {
      defaultFlowRate = this.convertUnitsService.value(defaultFlowRate).from('ft3').to('m3');
      defaultFlowRate = Number(defaultFlowRate.toFixed(2));
    }
    let defaultInletPressure: number = -16.36;
    let defaultOutletPressure: number = 1.1;
    if (settings.fanPressureMeasurement != 'inH2o') {
      defaultInletPressure = this.convertUnitsService.value(defaultInletPressure).from('inH2o').to(settings.fanPressureMeasurement);
      defaultInletPressure = Number(defaultInletPressure.toFixed(3));

      defaultOutletPressure = this.convertUnitsService.value(defaultOutletPressure).from('inH2o').to(settings.fanPressureMeasurement);
      defaultOutletPressure = Number(defaultOutletPressure.toFixed(3));
    }

    return {
      fanType: 0,
      fanSpeed: 1180,
      inletPressure: defaultInletPressure,
      outletPressure: defaultOutletPressure,
      flowRate: defaultFlowRate,
      compressibility: 0.988
    }
  }
}


export interface FanEfficiencyInputs {
  fanType: number;
  fanSpeed: number;
  inletPressure: number;
  outletPressure: number;
  flowRate: number;
  compressibility: number;
}
