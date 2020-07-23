import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadCharacteristicData } from '../../../motor-inventory';

@Injectable()
export class LoadCharacteristicDataService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromLoadCharacteristicData(loadhCharacteristicData: LoadCharacteristicData): FormGroup {
    return this.formBuilder.group({
      efficiency75: [loadhCharacteristicData.efficiency75, [Validators.min(0), Validators.max(100)]],
      efficiency50: [loadhCharacteristicData.efficiency50, [Validators.min(0), Validators.max(100)]],
      efficiency25: [loadhCharacteristicData.efficiency25, [Validators.min(0), Validators.max(100)]],
      powerFactor100: [loadhCharacteristicData.powerFactor100],
      powerFactor75: [loadhCharacteristicData.powerFactor75],
      powerFactor50: [loadhCharacteristicData.powerFactor50],
      powerFactor25: [loadhCharacteristicData.powerFactor25],
      ampsIdle: [loadhCharacteristicData.ampsIdle],
    });
  }

  updateLoadCharacteristicDataFromForm(form: FormGroup, loadhCharacteristicData: LoadCharacteristicData): LoadCharacteristicData {
    loadhCharacteristicData.efficiency75 = form.controls.efficiency75.value
    loadhCharacteristicData.efficiency50 = form.controls.efficiency50.value
    loadhCharacteristicData.efficiency25 = form.controls.efficiency25.value
    loadhCharacteristicData.powerFactor100 = form.controls.powerFactor100.value
    loadhCharacteristicData.powerFactor75 = form.controls.powerFactor75.value
    loadhCharacteristicData.powerFactor50 = form.controls.powerFactor50.value
    loadhCharacteristicData.powerFactor25 = form.controls.powerFactor25.value
    loadhCharacteristicData.ampsIdle = form.controls.ampsIdle.value
    return loadhCharacteristicData;
  }
}
