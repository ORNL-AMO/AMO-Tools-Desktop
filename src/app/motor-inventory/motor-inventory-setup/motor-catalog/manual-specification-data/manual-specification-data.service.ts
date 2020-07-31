import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManualSpecificationData } from '../../../motor-inventory';

@Injectable()
export class ManualSpecificationDataService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromManualSpecificationData(manualSpecificationData: ManualSpecificationData): FormGroup {
    return this.formBuilder.group({
      synchronousSpeed: [manualSpecificationData.synchronousSpeed, [Validators.required]],
      frame: [manualSpecificationData.frame],
      shaftPosiion: [manualSpecificationData.shaftPosiion],
      windingResistance: [manualSpecificationData.windingResistance],
      rotorBars: [manualSpecificationData.rotorBars],
      statorSlots: [manualSpecificationData.statorSlots],
      ampsLockedRotor: [manualSpecificationData.ampsLockedRotor],
      stalledRotorTimeHot: [manualSpecificationData.stalledRotorTimeHot],
      stalledRotorTimeCold: [manualSpecificationData.stalledRotorTimeCold],
      poles: [manualSpecificationData.poles],
      currentType: [manualSpecificationData.currentType],
      ratedSpeed: [manualSpecificationData.ratedSpeed]
    });
  }

  updateManualDataFromForm(form: FormGroup, manualSpecificationData: ManualSpecificationData): ManualSpecificationData {
    manualSpecificationData.synchronousSpeed = form.controls.synchronousSpeed.value;
    manualSpecificationData.frame = form.controls.frame.value;
    manualSpecificationData.shaftPosiion = form.controls.shaftPosiion.value;
    manualSpecificationData.windingResistance = form.controls.windingResistance.value;
    manualSpecificationData.rotorBars = form.controls.rotorBars.value;
    manualSpecificationData.statorSlots = form.controls.statorSlots.value;
    manualSpecificationData.ampsLockedRotor = form.controls.ampsLockedRotor.value;
    manualSpecificationData.stalledRotorTimeHot = form.controls.stalledRotorTimeHot.value;
    manualSpecificationData.stalledRotorTimeCold = form.controls.stalledRotorTimeCold.value;
    manualSpecificationData.poles = form.controls.poles.value;
    manualSpecificationData.currentType = form.controls.currentType.value;
    manualSpecificationData.ratedSpeed = form.controls.ratedSpeed.value;
    return manualSpecificationData;
  }
}
