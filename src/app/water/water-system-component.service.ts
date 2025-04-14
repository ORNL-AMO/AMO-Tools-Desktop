import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { WaterProcessComponent, WaterAssessment, WaterProcessComponentType, IntakeSource, getNewProcessComponent, DischargeOutlet, MonthlyFlowData, WaterTreatment, getWaterTreatmentComponent, WasteWaterTreatment } from 'process-flow-lib';

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
    } else if (tab === 'water-treatment') {
      this.setDefaultSelectedComponent(waterAssessment.waterTreatments, this.selectedComponent.getValue(), tab);
    } else if (tab === 'waste-water-treatment') {
      this.setDefaultSelectedComponent(waterAssessment.wasteWaterTreatments, this.selectedComponent.getValue(), tab);
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
      cost: [intakeSource.cost, Validators.required],
      sourceType: [intakeSource.sourceType],
      annualUse: [intakeSource.userEnteredData.totalDischargeFlow, [Validators.required, Validators.min(0)]],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getIntakeSourceFromForm(form: FormGroup, intakeSource: IntakeSource): IntakeSource {
    intakeSource.name = form.controls.name.value;
    intakeSource.cost = form.controls.cost.value;
    intakeSource.sourceType = form.controls.sourceType.value;
    intakeSource.userEnteredData.totalDischargeFlow = form.controls.annualUse.value;
    return intakeSource;
  }

  getDischargeOutletForm(dischargeOutlet: DischargeOutlet): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [dischargeOutlet.name, Validators.required],
      cost: [dischargeOutlet.cost, Validators.required],
      outletType: [dischargeOutlet.outletType],
      annualUse: [dischargeOutlet.userEnteredData.totalSourceFlow, [Validators.required, Validators.min(0)]],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getDischargeOutletFromForm(form: FormGroup, dischargeOutlet: DischargeOutlet): DischargeOutlet {
    dischargeOutlet.name = form.controls.name.value;
    dischargeOutlet.cost = form.controls.cost.value;
    dischargeOutlet.outletType = form.controls.outletType.value;
    dischargeOutlet.userEnteredData.totalSourceFlow = form.controls.annualUse.value;
    return dischargeOutlet;
  }


  getWaterTreatmentFormFromObj(obj: WaterTreatment): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      treatmentType: [obj.treatmentType],
      customTreatmentType: [obj.customTreatmentType],
      cost: [obj.cost],
      name: [obj.name],
      flowValue: [obj.userEnteredData.totalSourceFlow]
    });
    return form;
  }

  getWaterTreatmentFromForm(form: FormGroup, waterTreatment: WaterTreatment): WaterTreatment {
    waterTreatment.treatmentType = form.controls.treatmentType.value;
    waterTreatment.cost = form.controls.cost.value;
    waterTreatment.name = form.controls.name.value;
    waterTreatment.customTreatmentType = form.controls.customTreatmentType.value;
    waterTreatment.userEnteredData.totalSourceFlow = form.controls.flowValue.value;
    return waterTreatment;
  }


  addWaterTreatmentComponent(existingComponent?: WaterProcessComponent, createdByAssessment = false): WaterTreatment {
    const waterTreatment = existingComponent ? existingComponent as WaterTreatment : undefined;
    return getWaterTreatmentComponent(waterTreatment, false, createdByAssessment);
  }

    getWasteWaterFormFromObj(obj: WasteWaterTreatment): FormGroup {
      let form: FormGroup = this.formBuilder.group({
        treatmentType: [obj.treatmentType],
        customTreatmentType: [obj.customTreatmentType],
        cost: [obj.cost],
        name: [obj.name],
        flowValue: [obj.userEnteredData.totalSourceFlow]
      });
      return form;
    }
  
    getWasteWaterTreatmentFromForm(form: FormGroup, wasteWaterTreatment: WasteWaterTreatment): WasteWaterTreatment {
      wasteWaterTreatment.treatmentType = form.controls.treatmentType.value;
      wasteWaterTreatment.cost = form.controls.cost.value;
      wasteWaterTreatment.name = form.controls.name.value;
      wasteWaterTreatment.customTreatmentType = form.controls.customTreatmentType.value;
      wasteWaterTreatment.userEnteredData.totalSourceFlow = form.controls.flowValue.value;
      return wasteWaterTreatment;
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
