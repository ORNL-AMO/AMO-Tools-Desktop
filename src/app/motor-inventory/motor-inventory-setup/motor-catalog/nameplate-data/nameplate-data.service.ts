import { Injectable } from '@angular/core';
import { NameplateData } from '../../../motor-inventory';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Injectable()
export class NameplateDataService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromNameplateData(nameplateData: NameplateData): FormGroup {
    return this.formBuilder.group({
      lineFrequency: [nameplateData.lineFrequency, [Validators.required]],
      ratedMotorPower: [nameplateData.ratedMotorPower, [Validators.required]],
      efficiencyClass: [nameplateData.efficiencyClass, [Validators.required]],
      nominalEfficiency: [nameplateData.nominalEfficiency, [Validators.required]],
    
      manufacturer: [nameplateData.manufacturer],
      model: [nameplateData.model],
      motorType: [nameplateData.motorType],
      enclosureType: [nameplateData.enclosureType],
      ratedVoltage: [nameplateData.ratedVoltage],
      serviceFactor: [nameplateData.serviceFactor],
      insulationClass: [nameplateData.insulationClass],
      weight: [nameplateData.weight],
      numberOfPhases: [nameplateData.numberOfPhases],
      fullLoadSpeed: [nameplateData.fullLoadSpeed],
      fullLoadAmps: [nameplateData.fullLoadAmps]
    });
  }

  updateNameplateDataFromForm(form: FormGroup, nameplateData: NameplateData): NameplateData {
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
