import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { WaterUsingSystem } from '../../shared/models/water-assessment';
import { getNewProcessComponent } from '../../../process-flow-types/shared-process-flow-types';

@Injectable()
export class WaterUsingSystemService {

  constructor(private formBuilder: FormBuilder) { }

  getWaterUsingSystemForm(waterUsingSystem: WaterUsingSystem): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [waterUsingSystem.name, Validators.required],
      systemType: [waterUsingSystem.systemType],
      sourceWater: [waterUsingSystem.sourceWater, [Validators.required, Validators.min(0)]],
      recycledWater: [waterUsingSystem.recycledWater, [Validators.min(0)]],
      recirculatedWater: [waterUsingSystem.recirculatedWater, [Validators.min(0)]],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getWaterUsingSystemFromForm(form: FormGroup, waterUsingSystem: WaterUsingSystem) {
    waterUsingSystem.name = form.controls.name.value;
    waterUsingSystem.systemType = form.controls.systemType.value;
    waterUsingSystem.sourceWater = form.controls.sourceWater.value;
    waterUsingSystem.recycledWater = form.controls.recycledWater.value;
    waterUsingSystem.recirculatedWater = form.controls.recirculatedWater.value;
    return waterUsingSystem;
  }

  addNewWaterUsingSystem(): WaterUsingSystem {
    let waterUsingSystem: WaterUsingSystem;
    let newComponent = getNewProcessComponent('water-using-system') as WaterUsingSystem;
    waterUsingSystem = {
      ...newComponent,
      systemType: 0,
      sourceWater: undefined,
      recycledWater: undefined,
      recirculatedWater: undefined,
      intakeSources: [
        {
          sourceType: 0,
          annualUse: 0
        }
      ],
      heatEnergy: {
        incomingTemp: undefined,
        outgoingTemp: undefined,
        heaterEfficiency: undefined,
        heatingFuelType: 0,
        wasteWaterDischarge: undefined
      },
      addedMotorEquipment: []

    }

    return waterUsingSystem;
  }


  markFormDirtyToDisplayValidation(form: UntypedFormGroup) {
    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
  }
}
