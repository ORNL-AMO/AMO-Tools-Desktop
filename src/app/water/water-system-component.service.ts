import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IntakeSource, WaterUsingSystem, WaterProcessComponent } from '../shared/models/water-assessment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  markFormDirtyToDisplayValidation(form: FormGroup) {
    for (let key in form.controls) {
      if (form.controls[key] && form.controls[key].value != undefined) {
        form.controls[key].markAsDirty();
      }
    }
  }

}
