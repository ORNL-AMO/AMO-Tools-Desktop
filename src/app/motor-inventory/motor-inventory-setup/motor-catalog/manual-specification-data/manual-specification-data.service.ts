import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ManualSpecificationData } from '../../../motor-inventory';

@Injectable()
export class ManualSpecificationDataService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromManualSpecificationData(manualSpecificationData: ManualSpecificationData): UntypedFormGroup {
    return this.formBuilder.group({
      synchronousSpeed: [manualSpecificationData.synchronousSpeed],
      frame: [manualSpecificationData.frame],
      shaftPosiion: [manualSpecificationData.shaftPosiion],
      windingResistance: [manualSpecificationData.windingResistance, [Validators.min(0)]],
      rotorBars: [manualSpecificationData.rotorBars, [Validators.min(0)]],
      statorSlots: [manualSpecificationData.statorSlots, [Validators.min(0)]],
      ampsLockedRotor: [manualSpecificationData.ampsLockedRotor, [Validators.min(0)]],
      poles: [manualSpecificationData.poles],
      currentType: [manualSpecificationData.currentType],
      ratedSpeed: [manualSpecificationData.ratedSpeed, [Validators.min(0), Validators.max(3600)]]
    });
  }

  updateManualDataFromForm(form: UntypedFormGroup, manualSpecificationData: ManualSpecificationData): ManualSpecificationData {
    manualSpecificationData.synchronousSpeed = form.controls.synchronousSpeed.value;
    manualSpecificationData.frame = form.controls.frame.value;
    manualSpecificationData.shaftPosiion = form.controls.shaftPosiion.value;
    manualSpecificationData.windingResistance = form.controls.windingResistance.value;
    manualSpecificationData.rotorBars = form.controls.rotorBars.value;
    manualSpecificationData.statorSlots = form.controls.statorSlots.value;
    manualSpecificationData.ampsLockedRotor = form.controls.ampsLockedRotor.value;
    manualSpecificationData.poles = form.controls.poles.value;
    manualSpecificationData.currentType = form.controls.currentType.value;
    manualSpecificationData.ratedSpeed = form.controls.ratedSpeed.value;
    return manualSpecificationData;
  }
}
