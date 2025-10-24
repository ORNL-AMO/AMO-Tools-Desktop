import { Injectable } from '@angular/core';
import { CompressedAirControlsProperties } from '../../../compressed-air-inventory';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class CompressedAirControlsCatalogService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromControlsProperties(controlsProperties: CompressedAirControlsProperties, compressorType: number): FormGroup {
    let unloadSumpPressureValidators: Array<Validators> = [];
    let showUnloadSumpPressure: boolean = this.checkDisplayUnloadSlumpPressure(compressorType, controlsProperties.controlType);
    if (showUnloadSumpPressure) {
      unloadSumpPressureValidators = [Validators.required];
    }

    let form: FormGroup = this.formBuilder.group({
      controlType: [controlsProperties.controlType, Validators.required],
      unloadPointCapacity: [controlsProperties.unloadPointCapacity],
      numberOfUnloadSteps: [controlsProperties.numberOfUnloadSteps],
      automaticShutdown: [controlsProperties.automaticShutdown],
      unloadSumpPressure: [controlsProperties.unloadSumpPressure, unloadSumpPressureValidators]
    });
    form = this.setCompressorControlValidators(form);
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  updateControlsPropertiesFromForm(form: FormGroup, controlsProperties: CompressedAirControlsProperties): CompressedAirControlsProperties {
    controlsProperties.controlType = form.controls.controlType.value;
    controlsProperties.unloadPointCapacity = form.controls.unloadPointCapacity.value;
    controlsProperties.numberOfUnloadSteps = form.controls.numberOfUnloadSteps.value;
    controlsProperties.automaticShutdown = form.controls.automaticShutdown.value;
    controlsProperties.unloadSumpPressure = form.controls.unloadSumpPressure.value;
    return controlsProperties;
  }

  checkDisplayUnloadSlumpPressure(compressorType: number, controlType: number): boolean {
    //"lubricant-injected rotary screws"
    //controlType "load/unload"
    if ((compressorType == 1 || compressorType == 2) && controlType != 6) {
      return true;
    }
    return false;
  }
  
  checkDisplayUnloadCapacity(controlType: number): boolean {
    return (controlType == 2 || controlType == 3 || controlType == 4 || controlType == 5 || controlType == 11);
  }

  checkDisplayAutomaticShutdown(controlType: number): boolean {
    if (controlType !== undefined) {
      return [2, 3, 4, 6, 7, 8, 9, 10, 11].includes(controlType);
    } 
    return false;
  }

  markFormDirtyToDisplayValidation(form: FormGroup) {
    for (let key in form.controls) {
      if (form.controls[key] && form.controls[key].value != undefined) {
        form.controls[key].markAsDirty();
      }
    }
  }

  setCompressorControlValidators(form: FormGroup): FormGroup {
    if (form.controls.controlType.value && (form.controls.controlType.value == 2 || form.controls.controlType.value == 3
      || form.controls.controlType.value == 4 || form.controls.controlType.value == 5 || form.controls.controlType.value == 6)) {
      form.controls.unloadPointCapacity.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      form.controls.numberOfUnloadSteps.setValidators([Validators.required, Validators.min(0), Validators.max(5)]);
      if (form.controls.controlType.value != 5) {
        form.controls.automaticShutdown.setValidators([Validators.required]);
      } else {
        form.controls.automaticShutdown.setValidators([]);
      }
    } else {
      form.controls.automaticShutdown.setValidators([]);
      form.controls.unloadPointCapacity.setValidators([]);
      form.controls.numberOfUnloadSteps.setValidators([]);
    }
    form.controls.unloadPointCapacity.updateValueAndValidity();
    form.controls.numberOfUnloadSteps.updateValueAndValidity();
    form.controls.automaticShutdown.updateValueAndValidity();

    return form;
  }

}
