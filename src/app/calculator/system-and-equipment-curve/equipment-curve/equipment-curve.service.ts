import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class EquipmentCurveService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  getEquipmentCurveForm(): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      measurementOption: [1, Validators.required],
      baselineMeasurement: [1800, [Validators.required, Validators.min(0)]],
      modificationMeasurementOption: [1, Validators.required],
      modifiedMeasurement: [1800, [Validators.required, Validators.min(0)]],
    });
    form.controls.modificationMeasurementOption.disable();
    return form;
  }

  getByEquationForm(flowUnit: string, distanceUnit: string): FormGroup {
    let tmpMaxFlow = 1020;
    let tmpConstant = 356.96;
    if (flowUnit !== 'gpm') {
      tmpMaxFlow = Math.round(this.convertUnitsService.value(tmpMaxFlow).from('gpm').to(flowUnit) * 100) / 100;
    }
    if (distanceUnit !== 'ft') {
      tmpConstant = Math.round(this.convertUnitsService.value(tmpConstant).from('ft').to(distanceUnit) * 100) / 100;
    }
    let form: FormGroup = this.formBuilder.group({
      maxFlow: [tmpMaxFlow, [Validators.required, Validators.min(0), Validators.max(1000000)]],
      equationOrder: [3, Validators.required],
      constant: [tmpConstant, [Validators.required, Validators.min(0)]],
      flow: [-0.0686, Validators.required],
      flowTwo: [0.000005, Validators.required],
      flowThree: [-0.00000008, Validators.required],
      flowFour: [0, Validators.required],
      flowFive: [0, Validators.required],
      flowSix: [0, Validators.required]
    });
    return form;

  }
}
