import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AeratorPerformanceData } from '../../shared/models/waste-water';

@Injectable()
export class AeratorPerformanceFormService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(obj: AeratorPerformanceData): FormGroup{
    let form: FormGroup = this.formBuilder.group({
      OperatingDO: [obj.OperatingDO, [Validators.required, Validators.min(0)]],
      Alpha: [obj.Alpha, [Validators.required, Validators.min(0)]],
      Beta: [obj.Beta, [Validators.required, Validators.min(0)]],
      SOTR: [obj.SOTR, [Validators.required, Validators.min(0)]],
      Aeration: [obj.Aeration, [Validators.required, Validators.min(0)]],
      Elevation: [obj.Elevation, [Validators.required, Validators.min(0)]],
      OperatingTime: [obj.OperatingTime, [Validators.required, Validators.min(0)]],
      TypeAerators: [obj.TypeAerators, [Validators.required, Validators.min(0)]],
      Speed: [obj.Speed, [Validators.required, Validators.min(0), Validators.max(100)]],
      EnergyCostUnit: [obj.EnergyCostUnit, [Validators.required, Validators.min(0)]]
    });
    return form;
  }

  getObjFromForm(form: FormGroup): AeratorPerformanceData{
    return {
      OperatingDO: form.controls.OperatingDO.value,
      Alpha: form.controls.Alpha.value,
      Beta: form.controls.Beta.value,
      SOTR: form.controls.SOTR.value,
      Aeration: form.controls.Aeration.value,
      Elevation: form.controls.Elevation.value,
      OperatingTime: form.controls.OperatingTime.value,
      TypeAerators: form.controls.TypeAerators.value,
      Speed: form.controls.Speed.value,
      EnergyCostUnit: form.controls.EnergyCostUnit.value
    }
  }
}
