import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AeratorPerformanceData } from '../../shared/models/waste-water';

@Injectable()
export class AeratorPerformanceFormService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromObj(obj: AeratorPerformanceData): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      OperatingDO: [obj.OperatingDO, [Validators.required, Validators.min(0)]],
      Alpha: [obj.Alpha, [Validators.required, Validators.min(0)]],
      Beta: [obj.Beta, [Validators.required, Validators.min(0)]],
      SOTR: [obj.SOTR, [Validators.required, Validators.min(0)]],
      Aeration: [obj.Aeration, [Validators.required, Validators.min(0)]],
      Elevation: [obj.Elevation, [Validators.required, Validators.min(0)]],
      OperatingTime: [obj.OperatingTime, [Validators.required, Validators.min(0), Validators.max(24)]],
      TypeAerators: [obj.TypeAerators, [Validators.required, Validators.min(0)]],
      Aerator: [obj.Aerator],
      Speed: [obj.Speed, [Validators.required, Validators.min(0), Validators.max(100)]],
      AnoxicZoneCondition: [obj.AnoxicZoneCondition]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): AeratorPerformanceData {
    return {
      OperatingDO: form.controls.OperatingDO.value,
      Alpha: form.controls.Alpha.value,
      Beta: form.controls.Beta.value,
      SOTR: form.controls.SOTR.value,
      Aeration: form.controls.Aeration.value,
      Elevation: form.controls.Elevation.value,
      OperatingTime: form.controls.OperatingTime.value,
      TypeAerators: form.controls.TypeAerators.value,
      Aerator: form.controls.Aerator.value,
      Speed: form.controls.Speed.value,
      AnoxicZoneCondition: form.controls.AnoxicZoneCondition.value
    }
  }

  checkWarnings(obj: AeratorPerformanceData): AeratorPerformanceWarnings {
    let SpeedWarning: string = null;
    if (obj.TypeAerators == 1 && (obj.Speed < 50 || obj.Speed > 100)) {
      SpeedWarning = 'Mechanical Aerators Speed should be between 50% and 100%';
    } else if (obj.TypeAerators == 2 && (obj.Speed < 50 || obj.Speed > 100)) {
      SpeedWarning = 'Positive Displacement Blower Speed should be between 50% and 100%';
    } else if (obj.TypeAerators == 3 && obj.Speed < 90) {
      SpeedWarning = 'Centrifugal Blowers typically run at 90% speed or greater';
    }
    let OperatingTimeWarning: string = null;
    if(obj.OperatingTime < 16){
      OperatingTimeWarning = 'Operating time should be greater than 16 hours.'
    }
    return {
      Speed: SpeedWarning,
      OperatingTime: OperatingTimeWarning
    }
  }
}

export interface AeratorPerformanceWarnings {
  Speed: string,
  OperatingTime: string
}
