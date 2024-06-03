import { Injectable } from '@angular/core';
import { BinParameter, WeatherBinsInput, WeatherBinsService } from '../weather-bins.service';
import { AbstractControl, FormBuilder, FormGroup, UntypedFormArray, UntypedFormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';
import { LessThanValidator } from '../../../../shared/validators/less-than';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherBinsFormService {
  updateBinParametersForm: BehaviorSubject<boolean>;
  constructor(private formBuilder: FormBuilder, private weatherBinsService: WeatherBinsService) {
    this.updateBinParametersForm = new BehaviorSubject<boolean>(undefined);
   }

  setBinParameters(binParameterForms: FormGroup[], weatherBinsInput: WeatherBinsInput) {
    weatherBinsInput.binParameters = []
    binParameterForms.forEach(binParameterForm => {
      weatherBinsInput.binParameters.push({
        name: binParameterForm.controls.name.value,
        range: binParameterForm.controls.range.value,
        min: binParameterForm.controls.min.value,
        max: binParameterForm.controls.max.value,
        startingValue: binParameterForm.controls.startingValue.value,
        endValue: binParameterForm.controls.endValue.value,
      })
    })
  }

  getFormValid(binParameterForms: FormGroup[]): boolean {
    let hasInValidParameters = binParameterForms.some(binParameterForm => !binParameterForm.valid);
    return !hasInValidParameters;
  }

  getBinParametersForms(weatherBinsInput: WeatherBinsInput, settings: Settings): FormGroup[] {
    let binParametersForms: Array<FormGroup> = [];
    weatherBinsInput.binParameters.forEach(param => {
      let form: FormGroup = this.getBinParameterForm(param);
      this.setParameterMinMax(form, weatherBinsInput, settings);
      if (form.controls.startingValue.value == undefined) {
        form.controls.startingValue.patchValue(form.controls.min.value);
      }
      if (form.controls.endValue.value == undefined) {
        form.controls.endValue.patchValue(form.controls.max.value);
      }
      this.setStartingValueValidator(form)
      this.setEndValueValidator(form)
      this.setRangeValidator(form);
      // this.setBinCountValidator(form);
      binParametersForms.push(form)
    });
    return binParametersForms;
  }
  
  addBinParameter(binParameterForms: FormGroup[], weatherBinsInput: WeatherBinsInput, settings: Settings) {
    let defaultParamForm:FormGroup = this.getBinParameterForm({
      name: 'Dry-bulb (C)',
      range: 10,
      startingValue: undefined,
      endValue: undefined
    });
    this.setParameterMinMax(defaultParamForm, weatherBinsInput, settings);
    defaultParamForm.controls.startingValue.patchValue(defaultParamForm.controls.min.value);
    defaultParamForm.controls.endValue.patchValue(defaultParamForm.controls.max.value);
    this.setStartingValueValidator(defaultParamForm);
    this.setEndValueValidator(defaultParamForm);
    this.setRangeValidator(defaultParamForm);
    // this.setBinCountValidator(defaultParamForm);
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
    form.controls.startingValue.setValidators([GreaterThanValidator.greaterThan(form.controls.min.value - 1), LessThanValidator.lessThan(form.controls.endValue.value), Validators.required])
  }

  setEndValueValidator(form: FormGroup) {
    form.controls.endValue.setValidators([GreaterThanValidator.greaterThan(form.controls.startingValue.value), LessThanValidator.lessThan(form.controls.max.value + 1), Validators.required])
  }

  
  setRangeValidator(form: FormGroup) {
    form.controls.range.setValidators([GreaterThanValidator.greaterThan(0)])
  }

  // setRangeValidator(form: FormGroup) {
  //   if (form.controls.useBinCount) {
  //     form.controls.range.setValidators([])
  //   } else {
  //     form.controls.binCount.setValidators([GreaterThanValidator.greaterThan(0), Validators.required])
  //   }
  // }

  // setBinCountValidator(form: FormGroup) {
  //   if (form.controls.useBinCount) {
  //     form.controls.binCount.setValidators([GreaterThanValidator.greaterThan(0), Validators.required])
  //   } else {
  //     form.controls.binCount.setValidators([])
  //   }
  // }

  getBinParameterForm(binParameter: BinParameter): FormGroup {
    return this.formBuilder.group({
      name: [binParameter.name],
      range: [binParameter.range, [Validators.min(0)]],
      min: [binParameter.min],
      max: [binParameter.max],
      startingValue: [binParameter.startingValue],
      endValue: [binParameter.endValue],
      // binCount: [binParameter.binCount],
      // useBinCount: [binParameter.useBinCount]
    });
  }
}
