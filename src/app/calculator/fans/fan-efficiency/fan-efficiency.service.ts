import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Injectable()
export class FanEfficiencyService {
  fanEfficiencyInputs: FanEfficiencyInputs;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  initForm(): FormGroup {
    return this.formBuilder.group({
      fanType: [0, Validators.required],
      fanSpeed: [0, [Validators.required, Validators.min(0)]],
      inletPressure: [0, Validators.required],
      outletPressure: [0, Validators.required],
      flowRate: [0, Validators.required],
      compressibility: [0, Validators.required]
    });
  }

  initFormFromFsat(fsat: FSAT): FormGroup {
    return this.formBuilder.group({
      fanType: [fsat.fanSetup.fanType, Validators.required],
      fanSpeed: [fsat.fanSetup.fanSpeed, [Validators.required, Validators.min(0)]],
      inletPressure: [fsat.fieldData.inletPressure, Validators.required],
      outletPressure: [fsat.fieldData.outletPressure, Validators.required],
      flowRate: [fsat.fieldData.flowRate, Validators.required],
      compressibility: [fsat.fieldData.compressibilityFactor, Validators.required]
    });
  }

  initFormFromObj(obj: FanEfficiencyInputs): FormGroup {
    return this.formBuilder.group({
      fanType: [obj.fanType, Validators.required],
      fanSpeed: [obj.fanSpeed, [Validators.required, Validators.min(0)]],
      inletPressure: [obj.inletPressure, Validators.required],
      outletPressure: [obj.outletPressure, Validators.required],
      flowRate: [obj.flowRate, Validators.required],
      compressibility: [obj.compressibility, Validators.required]
    });
  }

  getObjFromForm(form: FormGroup): FanEfficiencyInputs {
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
    let tmpFlowRate = 129691;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpFlowRate = (this.convertUnitsService.value(tmpFlowRate).from('ft3').to('m3') * 100) / 100;
    }
    return {
      fanType: 0,
      fanSpeed: 1180,
      inletPressure: -16.36,
      outletPressure: 1.1,
      flowRate: tmpFlowRate,
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
