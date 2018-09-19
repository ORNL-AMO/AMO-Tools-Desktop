import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Boiler } from '../../shared/models/ssmt';

@Injectable()
export class BoilerService {

  constructor(private formBuilder: FormBuilder) { }

  initForm() {
    return this.formBuilder.group({
      'fuelType': [1],
      'fuel': [1],
      'combustionEfficiency': [''],
      'blowdownRate': [''],
      'blowdownFlashed': [0],
      'preheatMakeupWater': [0],
      'steamTemperature': [''],
      'deaeratorVentRate': [''],
      'deaeratorPressure': [''],
      'approachTemperature': ['']
    })
  }

  initFormFromObj(obj: Boiler): FormGroup {
    return this.formBuilder.group({
      'fuelType': [obj.fuelType],
      'fuel': [obj.fuel],
      'combustionEfficiency': [obj.combustionEfficiency],
      'blowdownRate': [obj.blowdownRate],
      'blowdownFlashed': [obj.blowdownFlashed],
      'preheatMakeupWater': [obj.preheatMakeupWater],
      'steamTemperature': [obj.steamTemperature],
      'deaeratorVentRate': [obj.deaeratorVentRate],
      'deaeratorPressure': [obj.deaeratorPressure],
      'approachTemperature': [obj.approachTemperature]
    })
  }

  initObjFromForm(form: FormGroup): Boiler {
    return {
      fuelType: form.controls.fuelType.value,
      fuel: form.controls.fuel.value,
      combustionEfficiency: form.controls.combustionEfficiency.value,
      blowdownRate: form.controls.blowdownRate.value,
      blowdownFlashed: form.controls.blowdownFlashed.value,
      preheatMakeupWater: form.controls.preheatMakeupWater.value,
      steamTemperature: form.controls.steamTemperature.value,
      deaeratorVentRate: form.controls.deaeratorVentRate.value,
      deaeratorPressure: form.controls.deaeratorPressure.value,
      approachTemperature: form.controls.approachTemperature.value
    }
  }
}
