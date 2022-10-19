import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { FanRatedInfo } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

@Injectable()
export class FanInfoFormService {

  constructor(private convertUnitsService: ConvertUnitsService, private formBuilder: UntypedFormBuilder) { }

  getBasicsFormFromObject(obj: FanRatedInfo, settings: Settings): UntypedFormGroup {
    let pressureMin: number = 10;
    let pressureMax: number = 60;
    if (settings.fanBarometricPressure !== 'inHg') {
      pressureMax = this.convertUnitsService.value(pressureMax).from('inHg').to(settings.fanBarometricPressure);
      pressureMax = Number(pressureMax.toFixed(0));
      pressureMin = this.convertUnitsService.value(pressureMin).from('inHg').to(settings.fanBarometricPressure);
      pressureMin = Number(pressureMin.toFixed(0));
    }
    let form = this.formBuilder.group({
      fanSpeed: [obj.fanSpeed, [Validators.required, Validators.min(0), Validators.max(5000)]],
      motorSpeed: [obj.motorSpeed, [Validators.required, Validators.min(0), Validators.max(3600)]],
      fanSpeedCorrected: [obj.fanSpeedCorrected, [Validators.required, Validators.min(0), Validators.max(5000)]],
      densityCorrected: [obj.densityCorrected, Validators.required],
      pressureBarometricCorrected: [obj.pressureBarometricCorrected, [Validators.required, Validators.min(pressureMin), Validators.max(pressureMax)]],
      includesEvase: [obj.includesEvase, Validators.required],
      upDownStream: [obj.upDownStream],
      traversePlanes: [obj.traversePlanes, Validators.required],
      globalBarometricPressure: [obj.globalBarometricPressure, [Validators.required, Validators.min(pressureMin), Validators.max(pressureMax)]]
      //planarBarometricPressure: [obj.planarBarometricPressure, Validators.required]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getBasicsObjectFromForm(form: UntypedFormGroup): FanRatedInfo {
    let obj: FanRatedInfo = {
      fanSpeed: form.controls.fanSpeed.value,
      motorSpeed: form.controls.motorSpeed.value,
      fanSpeedCorrected: form.controls.fanSpeedCorrected.value,
      densityCorrected: form.controls.densityCorrected.value,
      pressureBarometricCorrected: form.controls.pressureBarometricCorrected.value,
      //Mark additions
      includesEvase: form.controls.includesEvase.value,
      upDownStream: form.controls.upDownStream.value,
      traversePlanes: form.controls.traversePlanes.value,
      globalBarometricPressure: form.controls.globalBarometricPressure.value
    };
    return obj;
  }
}
