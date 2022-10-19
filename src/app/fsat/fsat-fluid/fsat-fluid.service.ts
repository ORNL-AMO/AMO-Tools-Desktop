import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ValidatorFn } from '@angular/forms';
import { BaseGasDensity } from '../../shared/models/fans';
import { GreaterThanValidator } from '../../shared/validators/greater-than';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Injectable()
export class FsatFluidService {

  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) { }


  getGasDensityFormFromObj(obj: BaseGasDensity, settings: Settings): UntypedFormGroup {
    let barometricMin: number = this.convertUnitsService.value(10).from('inHg').to(settings.fanBarometricPressure);
    let barometricMax: number = this.convertUnitsService.value(60).from('inHg').to(settings.fanBarometricPressure);
    barometricMin = this.convertUnitsService.roundVal(barometricMin, 2);
    barometricMax = this.convertUnitsService.roundVal(barometricMax, 2);
    
    let gasDensityValidators: GasDensityValidators = this.getValidators(obj);
    let form = this.formBuilder.group({
      inputType: [obj.inputType, Validators.required],
      gasType: [obj.gasType, Validators.required],
      dryBulbTemp: [obj.dryBulbTemp, gasDensityValidators.dryBulbTempValidators],
      staticPressure: [obj.staticPressure, gasDensityValidators.staticPressureValidators],
      barometricPressure: [obj.barometricPressure, [Validators.required, Validators.min(barometricMin), Validators.max(barometricMax)]],
      specificGravity: [1, gasDensityValidators.specificGravityValidators],
      wetBulbTemp: [obj.wetBulbTemp, gasDensityValidators.wetBulbTempValidators],
      relativeHumidity: [obj.relativeHumidity, gasDensityValidators.relativeHumidityValidators],
      dewPoint: [obj.dewPoint, gasDensityValidators.dewPointValidators],
      gasDensity: [obj.gasDensity, [GreaterThanValidator.greaterThan(0), Validators.required]],
      specificHeatGas: [obj.specificHeatGas, gasDensityValidators.specificHeatGasValidators],
      specificHeatRatio: [obj.specificHeatRatio, [Validators.required, GreaterThanValidator.greaterThan(1), Validators.max(2)]],
      
    });
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

    if (obj.inputType !== 'custom') {
      dryBulbTempValidators = [Validators.required];
      staticPressureValidators = [Validators.required];
      specificGravityValidators = [Validators.required];
    }
    if (obj.inputType === 'wetBulb') {
      wetBulbTempValidators = [Validators.required, Validators.max(obj.dryBulbTemp)];
      // Not sure if specificHeatGas is necessary since it has been removed from user input in fans
      specificHeatGasValidators = [GreaterThanValidator.greaterThan(0), Validators.required];
    }
    if (obj.inputType === 'relativeHumidity') {
      relativeHumidityValidators = [Validators.min(0), Validators.max(100), Validators.required];
    }
    if (obj.inputType === 'dewPoint') {
      dewPointValidators = [Validators.required, Validators.max(obj.dryBulbTemp)];
    }

    return {
      dryBulbTempValidators: dryBulbTempValidators,
      staticPressureValidators: staticPressureValidators,
      specificGravityValidators: specificGravityValidators,
      wetBulbTempValidators: wetBulbTempValidators,
      relativeHumidityValidators: relativeHumidityValidators,
      dewPointValidators: dewPointValidators,
      specificHeatGasValidators: specificHeatGasValidators
    };
  }



  updateGasDensityForm(gasDensityForm: UntypedFormGroup): UntypedFormGroup {
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

  getGasDensityObjFromForm(form: UntypedFormGroup): BaseGasDensity {
    let fanGasDensity: BaseGasDensity = {
      inputType: form.controls.inputType.value,
      gasType: form.controls.gasType.value,
      dryBulbTemp: form.controls.dryBulbTemp.value,
      staticPressure: form.controls.staticPressure.value,
      barometricPressure: form.controls.barometricPressure.value,
      //hard coded from issue 4332
      specificGravity:1,
      wetBulbTemp: form.controls.wetBulbTemp.value,
      relativeHumidity: form.controls.relativeHumidity.value,
      dewPoint: form.controls.dewPoint.value,
      gasDensity: form.controls.gasDensity.value,
      specificHeatGas: form.controls.specificHeatGas.value,
      specificHeatRatio: form.controls.specificHeatRatio.value,
    };
    return fanGasDensity;
  }

  isFanFluidValid(obj: BaseGasDensity, settings: Settings): boolean {
    let form: UntypedFormGroup = this.getGasDensityFormFromObj(obj, settings);
    return form.valid;
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
