import { Injectable } from '@angular/core';
import { NameplateData } from '../../../motor-inventory';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

@Injectable()
export class NameplateDataService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromNameplateData(nameplateData: NameplateData): UntypedFormGroup {
    return this.formBuilder.group({
      lineFrequency: [nameplateData.lineFrequency],
      ratedMotorPower: [nameplateData.ratedMotorPower, [Validators.min(0)]],
      efficiencyClass: [nameplateData.efficiencyClass],
      nominalEfficiency: [nameplateData.nominalEfficiency, [Validators.min(0), Validators.max(100)]],
    
      manufacturer: [nameplateData.manufacturer],
      model: [nameplateData.model],
      motorType: [nameplateData.motorType],
      enclosureType: [nameplateData.enclosureType],
      ratedVoltage: [nameplateData.ratedVoltage, [Validators.min(0)]],
      serviceFactor: [nameplateData.serviceFactor, [Validators.min(0), Validators.max(125)]],
      insulationClass: [nameplateData.insulationClass],
      weight: [nameplateData.weight, [Validators.min(0)]],
      numberOfPhases: [nameplateData.numberOfPhases],
      fullLoadSpeed: [nameplateData.fullLoadSpeed, [Validators.min(0), Validators.max(3600)]],
      fullLoadAmps: [nameplateData.fullLoadAmps, [Validators.min(0)]]
    });
  }

  updateNameplateDataFromForm(form: UntypedFormGroup, nameplateData: NameplateData): NameplateData {
    nameplateData.lineFrequency = form.controls.lineFrequency.value;
    nameplateData.ratedMotorPower = form.controls.ratedMotorPower.value;
    nameplateData.efficiencyClass = form.controls.efficiencyClass.value;
    nameplateData.nominalEfficiency = form.controls.nominalEfficiency.value;
   
    nameplateData.manufacturer = form.controls.manufacturer.value;
    nameplateData.model = form.controls.model.value;
    nameplateData.motorType = form.controls.motorType.value;
    nameplateData.enclosureType = form.controls.enclosureType.value;
    nameplateData.ratedVoltage = form.controls.ratedVoltage.value;
    nameplateData.serviceFactor = form.controls.serviceFactor.value;
    nameplateData.insulationClass = form.controls.insulationClass.value;
    nameplateData.weight = form.controls.weight.value;
    nameplateData.numberOfPhases = form.controls.numberOfPhases.value;
    nameplateData.fullLoadSpeed = form.controls.fullLoadSpeed.value;
    nameplateData.fullLoadAmps = form.controls.fullLoadAmps.value;
    return nameplateData;
  }
}
