import { Injectable } from '@angular/core';
import { CentrifugalSpecifics, CompressedAirItem } from '../../../compressed-air-inventory';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';

@Injectable()
export class CentrifugalSpecificsCatalogService {

  constructor(private formBuilder: UntypedFormBuilder) { }


  getCentrifugalFormFromObj(compressor: CompressedAirItem): UntypedFormGroup {
    let surgeAirFlowValidators: Array<ValidatorFn> = this.setSurgeAirFlowValidators(compressor);
    let maxFullLoadPressureValidators: Array<ValidatorFn> = this.setMaxFullLoadPressureValidators(compressor.centrifugalSpecifics);
    let maxFullLoadCapacityValidators: Array<ValidatorFn> = this.setMaxFullLoadCapacityValidators(compressor);
    let minFullLoadPressureValidators: Array<ValidatorFn> = this.setMinFullLoadPressureValidators(compressor.centrifugalSpecifics);

    let form: UntypedFormGroup = this.formBuilder.group({
      surgeAirflow: [compressor.centrifugalSpecifics.surgeAirflow, surgeAirFlowValidators],
      maxFullLoadPressure: [compressor.centrifugalSpecifics.maxFullLoadPressure, maxFullLoadPressureValidators],
      maxFullLoadCapacity: [compressor.centrifugalSpecifics.maxFullLoadCapacity, maxFullLoadCapacityValidators],
      minFullLoadPressure: [compressor.centrifugalSpecifics.minFullLoadPressure, minFullLoadPressureValidators],
      minFullLoadCapacity: [compressor.centrifugalSpecifics.minFullLoadCapacity, [Validators.required, Validators.min(0)]]
    });

    for (let key in form.controls) {
      form.controls[key].markAsDirty();
    }
    return form;
  }


  setSurgeAirFlowValidators(compressor: CompressedAirItem) {
    let surgeAirFlowValidators: Array<ValidatorFn>;
    if (compressor.centrifugalSpecifics.surgeAirflow) {
      surgeAirFlowValidators = [Validators.required, Validators.min(0), Validators.max(compressor.nameplateData.fullLoadRatedCapacity)];
    } else {
      surgeAirFlowValidators = [Validators.required]
    }
    return surgeAirFlowValidators;
  }


  setMaxFullLoadPressureValidators(centrifugalSpecifics: CentrifugalSpecifics) {
    let maxFullLoadPressureValidators: Array<ValidatorFn>;
    if (centrifugalSpecifics.maxFullLoadPressure) {
      maxFullLoadPressureValidators = [Validators.required, Validators.min(centrifugalSpecifics.minFullLoadPressure)];
    } else {
      maxFullLoadPressureValidators = [Validators.required]
    }
    return maxFullLoadPressureValidators;
  }

  setMaxFullLoadCapacityValidators(compressor: CompressedAirItem) {
    let maxFullLoadCapacityValidators: Array<ValidatorFn>;
    if (compressor.centrifugalSpecifics.maxFullLoadCapacity) {
      maxFullLoadCapacityValidators = [Validators.required, Validators.min(0), Validators.max(compressor.nameplateData.fullLoadRatedCapacity)];
    } else {
      maxFullLoadCapacityValidators = [Validators.required]
    }
    return maxFullLoadCapacityValidators;
  }


  setMinFullLoadPressureValidators(centrifugalSpecifics: CentrifugalSpecifics) {
    let minFullLoadPressureValidators: Array<ValidatorFn>;
    if (centrifugalSpecifics.surgeAirflow) {
      minFullLoadPressureValidators = [Validators.required, Validators.min(0), Validators.max(centrifugalSpecifics.surgeAirflow)];
    } else {
      minFullLoadPressureValidators = [Validators.required]
    }
    return minFullLoadPressureValidators;
  }

  updateCentrifugalFromForm(form: UntypedFormGroup, centrifugalSpecifics: CentrifugalSpecifics): CentrifugalSpecifics {
    centrifugalSpecifics.surgeAirflow = form.controls.surgeAirflow.value;
    centrifugalSpecifics.maxFullLoadPressure = form.controls.maxFullLoadPressure.value;
    centrifugalSpecifics.maxFullLoadCapacity = form.controls.maxFullLoadCapacity.value;
    centrifugalSpecifics.minFullLoadPressure = form.controls.minFullLoadPressure.value;
    centrifugalSpecifics.minFullLoadCapacity = form.controls.minFullLoadCapacity.value;
    return centrifugalSpecifics;
  }

}
