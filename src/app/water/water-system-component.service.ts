import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IntakeSource, WaterProcessComponent, DischargeOutlet, WaterAssessment, MonthlyFlowData } from '../shared/models/water-assessment';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { WaterProcessComponentType } from '../../process-flow-types/shared-process-flow-types';
import * as _ from 'lodash';
import { getNewProcessComponent } from '../../process-flow-types/shared-process-flow-logic';

@Injectable({
  providedIn: 'root'
})
export class WaterSystemComponentService {
  selectedComponent: BehaviorSubject<WaterProcessComponent>;
  selectedViewComponents: BehaviorSubject<WaterProcessComponent[]>;

  constructor(private formBuilder: FormBuilder) {
    this.selectedComponent = new BehaviorSubject<WaterProcessComponent>(undefined);
    this.selectedViewComponents = new BehaviorSubject<WaterProcessComponent[]>(undefined);
  }

  setSelectedComponentOnTabChange(waterAssessment: WaterAssessment, tab: WaterProcessComponentType) {
    if (tab === 'water-intake') {
      this.setDefaultSelectedComponent(waterAssessment.intakeSources, this.selectedComponent.getValue(), tab);
    } else if (tab === 'water-discharge') {
      this.setDefaultSelectedComponent(waterAssessment.dischargeOutlets, this.selectedComponent.getValue(), tab);
    } else if (tab === 'water-using-system') {
      this.setDefaultSelectedComponent(waterAssessment.waterUsingSystems, this.selectedComponent.getValue(), tab);
    }
  }

  setDefaultSelectedComponent(components: WaterProcessComponent[], selectedComponent: WaterProcessComponent, activeComponentType: WaterProcessComponentType) {
    if (components.length > 0) {
      if (!selectedComponent || (selectedComponent && selectedComponent.processComponentType !== activeComponentType)) {
        let lastModified: WaterProcessComponent = _.maxBy(components, 'modifiedDate');
        this.selectedComponent.next(lastModified);
      }
    } else {
      this.selectedComponent.next(undefined);
    }
  }

  getIntakeSourceForm(intakeSource: IntakeSource): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [intakeSource.name, Validators.required],
      sourceType: [intakeSource.sourceType],
      annualUse: [intakeSource.annualUse, [Validators.required, Validators.min(0)]],
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

/**
 * Add new component or return component based from a diagram component
 * @param processFlowPart Build from diagram component
 */
  addIntakeSource(processFlowPart?: WaterProcessComponent): IntakeSource {
    let intakeSource: IntakeSource;
    let newComponent: WaterProcessComponent;
    if (!processFlowPart) {
      newComponent = getNewProcessComponent('water-intake') as IntakeSource;
    } else {
      newComponent = processFlowPart as IntakeSource;
    }
    intakeSource = {
      ...newComponent,
      createdByAssessment: true,
      sourceType: 0,
      annualUse: 0,
      addedMotorEnergy: []
    };
    return intakeSource;
  }

  getDischargeOutletForm(dischargeOutlet: DischargeOutlet): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [dischargeOutlet.name, Validators.required],
      outletType: [dischargeOutlet.outletType],
      annualUse: [dischargeOutlet.annualUse, [Validators.required, Validators.min(0)]],
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


/**
 * Add new component or return component based from a diagram component
 * @param processFlowPart Build from diagram component
 */
  addDischargeOutlet(processFlowPart?: WaterProcessComponent): DischargeOutlet {
    let dischargeOutlet: DischargeOutlet;
    let newComponent: WaterProcessComponent;
    if (!processFlowPart) {
      newComponent = getNewProcessComponent('water-discharge') as DischargeOutlet;
    } else {
      newComponent = processFlowPart as DischargeOutlet;
    }
    
    dischargeOutlet = {
      ...newComponent,
      createdByAssessment: true,
      outletType: 0,
      annualUse: 0,
      addedMotorEnergy: []
    };
    return dischargeOutlet;
  }

  markFormDirtyToDisplayValidation(form: UntypedFormGroup) {
    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
  }

  getAnnualUseFromMonthly(monthlyFlowData: MonthlyFlowData[]) {
    return monthlyFlowData.reduce((annualUse, intakeData) => intakeData.flow + annualUse, 0)
  }

}
