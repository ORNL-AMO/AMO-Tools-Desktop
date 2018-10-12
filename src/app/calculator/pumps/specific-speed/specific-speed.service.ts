import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PSAT } from '../../../shared/models/psat';
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
      pumpType: [this.psatService.getPumpStyleFromEnum(0), Validators.required],
      pumpRPM: [1780, Validators.required],
      flowRate: [tmpFlowRate, Validators.required],
      head: [tmpHead, Validators.required],
    })
  }

  initFormFromPsat(psat: PSAT): FormGroup {
    return this.formBuilder.group({
      'pumpType': [this.psatService.getPumpStyleFromEnum(psat.inputs.pump_style), Validators.required],
      'pumpRPM': [psat.inputs.pump_rated_speed, Validators.required],
      'flowRate': [psat.inputs.flow_rate, Validators.required],
      'head': [psat.inputs.head, Validators.required]
    })
  }


  initFormFromObj(obj: SpecificSpeedInputs): FormGroup {
    return this.formBuilder.group({
      'pumpType': [this.psatService.getPumpStyleFromEnum(obj.pumpType), Validators.required],
      'pumpRPM': [obj.pumpRPM, Validators.required],
      'flowRate': [obj.flowRate, Validators.required],
      'head': [obj.head, Validators.required]
    })
  }


  getObjFromForm(form: FormGroup): SpecificSpeedInputs {
    return {
      pumpType: this.psatService.getPumpStyleEnum(form.controls.pumpType.value),
      pumpRPM: form.controls.pumpRPM.value,
      flowRate: form.controls.flowRate.value,
      head: form.controls.head.value
    }
  }
}
