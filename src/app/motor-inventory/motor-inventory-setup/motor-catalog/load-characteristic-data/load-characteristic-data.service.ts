import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LoadCharacteristicData } from '../../../motor-inventory';

@Injectable()
export class LoadCharacteristicDataService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromLoadCharacteristicData(loadCharacteristicData: LoadCharacteristicData): UntypedFormGroup {
    return this.formBuilder.group({
      efficiency75: [loadCharacteristicData.efficiency75, [Validators.min(0), Validators.max(100)]],
      efficiency50: [loadCharacteristicData.efficiency50, [Validators.min(0), Validators.max(100)]],
      efficiency25: [loadCharacteristicData.efficiency25, [Validators.min(0), Validators.max(100)]],
      powerFactor100: [loadCharacteristicData.powerFactor100, [Validators.min(0), Validators.max(100)]],
      powerFactor75: [loadCharacteristicData.powerFactor75, [Validators.min(0), Validators.max(100)]],
      powerFactor50: [loadCharacteristicData.powerFactor50, [Validators.min(0), Validators.max(100)]],
      powerFactor25: [loadCharacteristicData.powerFactor25, [Validators.min(0), Validators.max(100)]],
      ampsIdle: [loadCharacteristicData.ampsIdle, [Validators.min(0)]],
    });
  }

  updateLoadCharacteristicDataFromForm(form: UntypedFormGroup, loadCharacteristicData: LoadCharacteristicData): LoadCharacteristicData {
    loadCharacteristicData.efficiency75 = form.controls.efficiency75.value
    loadCharacteristicData.efficiency50 = form.controls.efficiency50.value
    loadCharacteristicData.efficiency25 = form.controls.efficiency25.value
    loadCharacteristicData.powerFactor100 = form.controls.powerFactor100.value
    loadCharacteristicData.powerFactor75 = form.controls.powerFactor75.value
    loadCharacteristicData.powerFactor50 = form.controls.powerFactor50.value
    loadCharacteristicData.powerFactor25 = form.controls.powerFactor25.value
    loadCharacteristicData.ampsIdle = form.controls.ampsIdle.value
    return loadCharacteristicData;
  }
}
