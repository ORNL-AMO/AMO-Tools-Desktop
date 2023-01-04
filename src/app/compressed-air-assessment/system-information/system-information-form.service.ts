import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { SystemInformation } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { GreaterThanValidator } from '../../shared/validators/greater-than';

@Injectable()
export class SystemInformationFormService {

  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) { }

  getFormFromObj(obj: SystemInformation, settings: Settings): UntypedFormGroup {
    let maxAtmosphericPressure: number = 16;
    if (settings && settings.unitsOfMeasure == 'Metric') {
      maxAtmosphericPressure = this.convertUnitsService.value(maxAtmosphericPressure).from('psia').to('kPaa');
      maxAtmosphericPressure = this.convertUnitsService.roundVal(maxAtmosphericPressure, 2);
    }
    let form: UntypedFormGroup = this.formBuilder.group({
      systemElevation: [obj.systemElevation, [Validators.min(0), Validators.max(29000)]],
      totalAirStorage: [obj.totalAirStorage, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      isSequencerUsed: [obj.isSequencerUsed],
      targetPressure: [obj.targetPressure],
      variance: [obj.variance],
      atmosphericPressure: [obj.atmosphericPressure, [Validators.required, Validators.min(0), Validators.max(maxAtmosphericPressure)]],
      atmosphericPressureKnown: [obj.atmosphericPressureKnown],
      plantMaxPressure: [obj.plantMaxPressure],
      multiCompressorSystemControls: [obj.multiCompressorSystemControls]

    });

    form = this.setSequencerFieldValidators(form);
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  setSequencerFieldValidators(form: UntypedFormGroup) {
    //TODO: set validators based on multiCompressorSystemControls
    if (form.controls.multiCompressorSystemControls.value === 'targetPressureSequencer') {
      form.controls.targetPressure.setValidators([Validators.required, Validators.min(0)]);
      form.controls.targetPressure.updateValueAndValidity();
      let varianceValidators: Array<ValidatorFn> = [Validators.required, Validators.min(0)];
      if (form.controls.targetPressure.value) {
        let maxVariance: number = form.controls.targetPressure.value * .5;
        varianceValidators.push(Validators.max(maxVariance))
      }
      form.controls.variance.setValidators(varianceValidators);
      form.controls.variance.updateValueAndValidity();
    } else {
      form.controls.targetPressure.setValidators([]);
      form.controls.targetPressure.updateValueAndValidity();
      form.controls.variance.setValidators([]);
      form.controls.variance.updateValueAndValidity();
    }
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): SystemInformation {
    return {
      systemElevation: form.controls.systemElevation.value,
      totalAirStorage: form.controls.totalAirStorage.value,
      isSequencerUsed: form.controls.isSequencerUsed.value,
      targetPressure: form.controls.targetPressure.value,
      variance: form.controls.variance.value,
      atmosphericPressure: form.controls.atmosphericPressure.value,
      atmosphericPressureKnown: form.controls.atmosphericPressureKnown.value,
      plantMaxPressure: form.controls.plantMaxPressure.value,
      multiCompressorSystemControls: form.controls.multiCompressorSystemControls.value
    }
  }
}
