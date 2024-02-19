import { Injectable } from '@angular/core';
import { BinParameter, WeatherBinsInput, WeatherBinsService } from '../weather-bins.service';
import { AbstractControl, FormBuilder, FormGroup, UntypedFormArray, UntypedFormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';
import { LessThanValidator } from '../../../../shared/validators/less-than';

@Injectable({
  providedIn: 'root'
})
export class WeatherBinsFormService {

  constructor(private formBuilder: FormBuilder, private weatherBinsService: WeatherBinsService) { }

  setBinParameters(binParameterForms: FormGroup[], weatherBinsInput: WeatherBinsInput) {
    weatherBinsInput.binParameters = []
    binParameterForms.forEach(binParameterForm => {
      weatherBinsInput.binParameters.push({
        name: binParameterForm.controls.name.value,
        range: binParameterForm.controls.range.value,
        min: binParameterForm.controls.min.value,
        max: binParameterForm.controls.max.value,
        startingValue: binParameterForm.controls.startingValue.value,
      })
    })
  }

  getBinParametersForms(weatherBinsInput: WeatherBinsInput, settings: Settings): FormGroup[] {
    let binParametersForms: Array<FormGroup> = [];
    weatherBinsInput.binParameters.forEach(param => {
      let form: FormGroup = this.getBinParameterForm(param);
      this.setParameterMinMax(form, weatherBinsInput, settings);
      if (form.controls.startingValue.value == undefined) {
        form.controls.startingValue.patchValue(form.controls.min.value);
      }
      this.setStartingValueValidator(form)
      binParametersForms.push(form)
    });
    return binParametersForms;
  }
  
  addBinParameter(binParameterForms: FormGroup[], weatherBinsInput: WeatherBinsInput, settings: Settings) {
    let defaultParamForm:FormGroup = this.getBinParameterForm({
      name: 'Dry-bulb (C)',
      range: 10,
      startingValue: undefined
    });
    this.setParameterMinMax(defaultParamForm, weatherBinsInput, settings);
    defaultParamForm.controls.startingValue.patchValue(defaultParamForm.controls.min.value);
    this.setStartingValueValidator(defaultParamForm)
    binParameterForms.push(defaultParamForm);
  }

  setParameterMinMax(form: FormGroup, weatherBinsInput: WeatherBinsInput, settings: Settings) {
    let {min, max } = this.weatherBinsService.getParameterMinMax(weatherBinsInput, form.controls.name.value, settings);
    form.patchValue({
      min: min,
      max: max
    });
  }

  setStartingValueValidator(form: FormGroup) {
    form.controls.startingValue.setValidators([GreaterThanValidator.greaterThan(form.controls.min.value), LessThanValidator.lessThan(form.controls.max.value)])
  }

  getBinParameterForm(binParameter: BinParameter): FormGroup {
    return this.formBuilder.group({
      name: [binParameter.name],
      range: [binParameter.range, [Validators.min(0)]],
      min: [binParameter.min],
      max: [binParameter.max],
      startingValue: [binParameter.startingValue],
    });
  }
}
