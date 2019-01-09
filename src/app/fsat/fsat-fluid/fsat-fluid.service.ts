import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { BaseGasDensity } from '../../shared/models/fans';

@Injectable()
export class FsatFluidService {

  constructor(private formBuilder: FormBuilder) { }


  getGasDensityFormFromObj(obj: BaseGasDensity): FormGroup {
    let gasDensityValidators: GasDensityValidators = this.getValidators(obj);
    let form = this.formBuilder.group({
      inputType: [obj.inputType, Validators.required],
      gasType: [obj.gasType, Validators.required],
      dryBulbTemp: [obj.dryBulbTemp, gasDensityValidators.dryBulbTempValidators],
      staticPressure: [obj.staticPressure, gasDensityValidators.staticPressureValidators],
      barometricPressure: [obj.barometricPressure, [Validators.required, Validators.min(0)]],
      specificGravity: [obj.specificGravity, gasDensityValidators.specificGravityValidators],
      wetBulbTemp: [obj.wetBulbTemp, gasDensityValidators.wetBulbTempValidators],
      relativeHumidity: [obj.relativeHumidity, gasDensityValidators.relativeHumidityValidators],
      dewPoint: [obj.dewPoint, gasDensityValidators.dewPointValidators],
      gasDensity: [obj.gasDensity, [Validators.min(0.01), Validators.required]],
      specificHeatGas: [obj.specificHeatGas, gasDensityValidators.specificHeatGasValidators]
    })
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getValidators(obj: BaseGasDensity): GasDensityValidators {
    let dryBulbTempValidators: Array<ValidatorFn> = [];
    let staticPressureValidators: Array<ValidatorFn> = [];
    let specificGravityValidators: Array<ValidatorFn> = [];
    let wetBulbTempValidators: Array<ValidatorFn> = [];
    let relativeHumidityValidators: Array<ValidatorFn> = [];
    let dewPointValidators: Array<ValidatorFn> = [];
    let specificHeatGasValidators: Array<ValidatorFn> = [];

    if (obj.inputType != 'custom') {
      dryBulbTempValidators = [Validators.required];
      staticPressureValidators = [Validators.required];
      specificGravityValidators = [Validators.required];
    }
    if (obj.inputType == 'wetBulb') {
      wetBulbTempValidators = [Validators.required];
      specificHeatGasValidators = [Validators.min(0.01), Validators.required];
    }
    if (obj.inputType == 'relativeHumidity') {
      relativeHumidityValidators = [Validators.min(0), Validators.max(100), Validators.required];
    }
    if (obj.inputType == 'dewPoint') {
      dewPointValidators = [Validators.required];
    }

    return {
      dryBulbTempValidators: dryBulbTempValidators,
      staticPressureValidators: staticPressureValidators,
      specificGravityValidators: specificGravityValidators,
      wetBulbTempValidators: wetBulbTempValidators,
      relativeHumidityValidators: relativeHumidityValidators,
      dewPointValidators: dewPointValidators,
      specificHeatGasValidators: specificHeatGasValidators
    }
  }



  updateGasDensityForm(gasDensityForm: FormGroup): FormGroup {
    let tmpObj: BaseGasDensity = this.getGasDensityObjFromForm(gasDensityForm);
    let gasDensityValidators: GasDensityValidators = this.getValidators(tmpObj);
    //dryBulbTempValidators
    gasDensityForm.controls.dryBulbTemp.setValidators(gasDensityValidators.dryBulbTempValidators);
    gasDensityForm.controls.dryBulbTemp.reset(gasDensityForm.controls.dryBulbTemp.value);
    if (gasDensityForm.controls.dryBulbTemp.value) {
      gasDensityForm.controls.dryBulbTemp.markAsDirty();
    }
    // staticPressureValidators
    gasDensityForm.controls.staticPressure.setValidators(gasDensityValidators.staticPressureValidators);
    gasDensityForm.controls.staticPressure.reset(gasDensityForm.controls.staticPressure.value);
    if (gasDensityForm.controls.staticPressure.value) {
      gasDensityForm.controls.staticPressure.markAsDirty();
    }
    // specificGravityValidators
    gasDensityForm.controls.specificGravity.setValidators(gasDensityValidators.specificGravityValidators);
    gasDensityForm.controls.specificGravity.reset(gasDensityForm.controls.specificGravity.value);
    if (gasDensityForm.controls.specificGravity.value) {
      gasDensityForm.controls.specificGravity.markAsDirty();
    }
    // wetBulbTempValidators
    gasDensityForm.controls.wetBulbTemp.setValidators(gasDensityValidators.wetBulbTempValidators);
    gasDensityForm.controls.wetBulbTemp.reset(gasDensityForm.controls.wetBulbTemp.value);
    if (gasDensityForm.controls.wetBulbTemp.value) {
      gasDensityForm.controls.wetBulbTemp.markAsDirty();
    }
    // relativeHumidityValidators
    gasDensityForm.controls.relativeHumidity.setValidators(gasDensityValidators.relativeHumidityValidators);
    gasDensityForm.controls.relativeHumidity.reset(gasDensityForm.controls.relativeHumidity.value);
    if (gasDensityForm.controls.relativeHumidity.value) {
      gasDensityForm.controls.relativeHumidity.markAsDirty();
    }
    // dewPointValidators
    gasDensityForm.controls.dewPoint.setValidators(gasDensityValidators.dewPointValidators);
    gasDensityForm.controls.dewPoint.reset(gasDensityForm.controls.dewPoint.value);
    if (gasDensityForm.controls.dewPoint.value) {
      gasDensityForm.controls.dewPoint.markAsDirty();
    }
    // specificHeatGasValidators
    gasDensityForm.controls.specificHeatGas.setValidators(gasDensityValidators.specificHeatGasValidators);
    gasDensityForm.controls.specificHeatGas.reset(gasDensityForm.controls.specificHeatGas.value);
    if (gasDensityForm.controls.specificHeatGas.value) {
      gasDensityForm.controls.specificHeatGas.markAsDirty();
    }
    return gasDensityForm;
  }

  getGasDensityObjFromForm(form: FormGroup): BaseGasDensity {
    let fanGasDensity: BaseGasDensity = {
      inputType: form.controls.inputType.value,
      gasType: form.controls.gasType.value,
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

  isFanFluidValid(obj: BaseGasDensity): boolean {
    let form: FormGroup = this.getGasDensityFormFromObj(obj);
    if (form.status == 'VALID') {
      return true;
    } else {
      return false;
    }
  }
}


export interface GasDensityValidators {
  dryBulbTempValidators: Array<ValidatorFn>;
  staticPressureValidators: Array<ValidatorFn>;
  specificGravityValidators: Array<ValidatorFn>;
  wetBulbTempValidators: Array<ValidatorFn>;
  relativeHumidityValidators: Array<ValidatorFn>;
  dewPointValidators: Array<ValidatorFn>;
  specificHeatGasValidators: Array<ValidatorFn>;
}