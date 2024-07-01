import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IntakeSource, ProcessUse, WaterProcessComponent } from '../shared/models/water-assessment';
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

  getProcessUseForm(ProcessUse: ProcessUse): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [ProcessUse.name, Validators.required],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getProcessUseFromForm(form: FormGroup, ProcessUse: ProcessUse) {
    ProcessUse.name = form.controls.name.value
    return ProcessUse;
  }

  markFormDirtyToDisplayValidation(form: FormGroup) {
    for (let key in form.controls) {
      if (form.controls[key] && form.controls[key].value != undefined) {
        form.controls[key].markAsDirty();
      }
    }
  }

}
