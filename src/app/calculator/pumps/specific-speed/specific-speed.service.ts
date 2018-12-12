import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PSAT, PsatInputs } from '../../../shared/models/psat';
import { SpecificSpeedInputs } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { PsatService } from '../../../psat/psat.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Injectable()
export class SpecificSpeedService {
  specificSpeedInputs: SpecificSpeedInputs;
  constructor(private formBuilder: FormBuilder, private psatService: PsatService, private convertUnitsService: ConvertUnitsService) { }


  initForm(settings: Settings): FormGroup {
    let tmpFlowRate: number = 2000;
    let tmpHead: number = 277;
    if (settings.flowMeasurement != 'gpm') {
      tmpFlowRate = this.convertUnitsService.value(tmpFlowRate).from('gpm').to(settings.flowMeasurement);
      tmpFlowRate = this.convertUnitsService.roundVal(tmpFlowRate, 2)
    }
    if (settings.distanceMeasurement != 'ft') {
      tmpHead = this.convertUnitsService.value(tmpHead).from('ft').to(settings.distanceMeasurement);
      tmpHead = this.convertUnitsService.roundVal(tmpHead, 2)
    }
    return this.formBuilder.group({
      pumpType: [0, Validators.required],
      pumpRPM: [1780, [Validators.required, Validators.min(0)]],
      flowRate: [tmpFlowRate, [Validators.required, Validators.min(0)]],
      head: [tmpHead, [Validators.required, Validators.min(0)]],
    })
  }

  initFormFromPsat(psatInputs: PsatInputs): FormGroup {
    return this.formBuilder.group({
      pumpType: [psatInputs.pump_style, Validators.required],
      pumpRPM: [psatInputs.pump_rated_speed, [Validators.required, Validators.min(0)]],
      flowRate: [psatInputs.flow_rate, [Validators.required, Validators.min(0)]],
      head: [psatInputs.head, [Validators.required, Validators.min(0)]]
    })
  }


  initFormFromObj(obj: SpecificSpeedInputs): FormGroup {
    return this.formBuilder.group({
      pumpType: [obj.pumpType, Validators.required],
      pumpRPM: [obj.pumpRPM, Validators.required],
      flowRate: [obj.flowRate, Validators.required],
      head: [obj.head, Validators.required]
    })
  }

  getObjFromForm(form: FormGroup): SpecificSpeedInputs {
    return {
      pumpType: form.controls.pumpType.value,
      pumpRPM: form.controls.pumpRPM.value,
      flowRate: form.controls.flowRate.value,
      head: form.controls.head.value
    }
  }
}
