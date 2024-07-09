import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IntakeSource, WaterUsingSystem, WaterProcessComponent, WaterAssessment, DischargeOutlet } from '../shared/models/water-assessment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WaterProcessComponentType, getNewProcessComponent } from '../../process-flow-types/shared-process-flow-types';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class WaterProcessComponentService {
  selectedComponent: BehaviorSubject<WaterProcessComponent>;
  selectedViewComponents: BehaviorSubject<WaterProcessComponent[]>;

  // todo break out components to individual services if things intensify
  constructor(private formBuilder: FormBuilder) {
    this.selectedComponent = new BehaviorSubject<WaterProcessComponent>(undefined);
    this.selectedViewComponents = new BehaviorSubject<WaterProcessComponent[]>(undefined);
  }

  setDefaultSelectedComponent(components: WaterProcessComponent[], selectedComponent: WaterProcessComponent, activeComponentType: WaterProcessComponentType) {
    if (components.length > 0) {
    if (!selectedComponent || (selectedComponent && selectedComponent.processComponentType !== activeComponentType)) {
      let lastModified: WaterProcessComponent = _.maxBy(components, 'modifiedDate');
      this.selectedComponent.next(lastModified);
    }
  }
  }

  getIntakeSourceForm(intakeSource: IntakeSource): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [intakeSource.name, Validators.required],
      sourceType: [intakeSource.sourceType],
      annualUse: [intakeSource.annualUse, [Validators.required, Validators.min]],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getIntakeSourceFromForm(form: FormGroup, intakeSource: IntakeSource): IntakeSource {
    intakeSource.name = form.controls.name.value;
    intakeSource.sourceType = form.controls.sourceType.value;
    intakeSource.annualUse = form.controls.annualUse.value;
    return intakeSource;
  }

  addNewIntakeSource(): IntakeSource {
    let intakeSource: IntakeSource;
    let newComponent = getNewProcessComponent('water-intake') as IntakeSource;
    intakeSource = {
      ...newComponent,
      sourceType: 0,
      annualUse: 0,
    };
    return intakeSource;
  }

  getDischargeOutletForm(dischargeOutlet: DischargeOutlet): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [dischargeOutlet.name, Validators.required],
      outletType: [dischargeOutlet.outletType],
      annualUse: [dischargeOutlet.annualUse, [Validators.required, Validators.min]],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getDischargeOutletFromForm(form: FormGroup, dischargeOutlet: DischargeOutlet): DischargeOutlet {
    dischargeOutlet.name = form.controls.name.value;
    dischargeOutlet.outletType = form.controls.outletType.value;
    dischargeOutlet.annualUse = form.controls.annualUse.value;
    return dischargeOutlet;
  }

  addNewDischargeOutlet(): DischargeOutlet {
    let dischargeOutlet: DischargeOutlet;
    let newComponent = getNewProcessComponent('water-discharge') as DischargeOutlet;
    dischargeOutlet = {
      ...newComponent,
      outletType: 0,
      annualUse: 0,
    };
    return dischargeOutlet;
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
      systemType: 'test',
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
