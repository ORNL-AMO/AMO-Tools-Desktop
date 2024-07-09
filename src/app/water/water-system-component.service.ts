import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IntakeSource, WaterUsingSystem, WaterProcessComponent, WaterAssessment } from '../shared/models/water-assessment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getNewProcessComponent } from '../../process-flow-types/shared-process-flow-types';

@Injectable({
  providedIn: 'root'
})
export class WaterProcessComponentService {
  selectedComponent: BehaviorSubject<WaterProcessComponent>;
  selectedViewComponents: BehaviorSubject<WaterProcessComponent[]>;
  constructor(private formBuilder: FormBuilder) { 
    this.selectedComponent = new BehaviorSubject<WaterProcessComponent>(undefined);
    this.selectedViewComponents = new BehaviorSubject<WaterProcessComponent[]>(undefined);
  }
  
  getIntakeSourceForm(intakeSource: IntakeSource): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [intakeSource.name, Validators.required],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getIntakeSourceFromForm(form: FormGroup, intakeSource: IntakeSource) {
    intakeSource.name = form.controls.name.value
    return intakeSource;
  }

  addNewIntakeSource(): IntakeSource {
    let intakeSource: IntakeSource;
    let newComponent = getNewProcessComponent('water-intake') as IntakeSource;
    intakeSource = {
      ...newComponent,
      sourceType: 'city',
    };
     return intakeSource;
  }

  getWaterUsingSystemForm(WaterUsingSystem: WaterUsingSystem): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [WaterUsingSystem.name, Validators.required],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getWaterUsingSystemFromForm(form: FormGroup, WaterUsingSystem: WaterUsingSystem) {
    WaterUsingSystem.name = form.controls.name.value
    return WaterUsingSystem;
  }

  addNewWaterUsingSystem(): WaterUsingSystem {
    let waterUsingSystem: WaterUsingSystem;
    let newComponent = getNewProcessComponent('water-using-system') as WaterUsingSystem;
    waterUsingSystem = {
      ...newComponent,
      systemType: 'something',
    };
     return waterUsingSystem;
  }


  markFormDirtyToDisplayValidation(form: FormGroup) {
    for (let key in form.controls) {
      if (form.controls[key] && form.controls[key].value != undefined) {
        form.controls[key].markAsDirty();
      }
    }
  }

}
