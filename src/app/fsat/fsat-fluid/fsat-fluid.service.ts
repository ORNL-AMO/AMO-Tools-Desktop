import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseGasDensity } from '../../shared/models/fans';

@Injectable()
export class FsatFluidService {

  constructor(private formBuilder: FormBuilder) { }


  getGasDensityFormFromObj(obj: BaseGasDensity): FormGroup {
    let form = this.formBuilder.group({
      inputType: [obj.inputType, Validators.required],
      gasType: [obj.gasType, Validators.required],
      // humidityData: ['Yes', Validators.required],
      conditionLocation: [obj.conditionLocation, Validators.required],
      dryBulbTemp: [obj.dryBulbTemp, Validators.required],
      staticPressure: [obj.staticPressure, Validators.required],
      barometricPressure: [obj.barometricPressure, Validators.required],
      specificGravity: [obj.specificGravity, Validators.required],
      wetBulbTemp: [obj.wetBulbTemp, Validators.required],
      relativeHumidity: [obj.relativeHumidity, Validators.required],
      dewPoint: [obj.dewPoint, Validators.required],
      gasDensity: [obj.gasDensity, Validators.required],
      specificHeatGas: [obj.specificHeatGas]
    })
    return form;
  }

  getGasDensityObjFromForm(form: FormGroup): BaseGasDensity {
    let fanGasDensity: BaseGasDensity = {
      inputType: form.controls.inputType.value,
      gasType: form.controls.gasType.value,
      //  humidityData: form.controls.humidityData.value,
      conditionLocation: form.controls.conditionLocation.value,
      dryBulbTemp: form.controls.dryBulbTemp.value,
      staticPressure: form.controls.staticPressure.value,
      barometricPressure: form.controls.barometricPressure.value,
      specificGravity: form.controls.specificGravity.value,
      wetBulbTemp: form.controls.wetBulbTemp.value,
      relativeHumidity: form.controls.relativeHumidity.value,
      dewPoint: form.controls.dewPoint.value,
      gasDensity: form.controls.gasDensity.value,
      specificHeatGas: form.controls.specificHeatGas.value
    }
    return fanGasDensity;
  }
}
