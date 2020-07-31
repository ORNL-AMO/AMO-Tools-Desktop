import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManualSpecificationData } from '../../../motor-inventory';

@Injectable()
export class ManualSpecificationDataService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromManualSpecificationData(manualSpecificationData: ManualSpecificationData): FormGroup {
    return this.formBuilder.group({
      synchronousSpeed: [manualSpecificationData.synchronousSpeed, [Validators.required]],
      frameNumber: [manualSpecificationData.frameNumber],
      uFrame: [manualSpecificationData.uFrame],
      cFace: [manualSpecificationData.cFace],
      verticalShaft: [manualSpecificationData.verticalShaft],
      dFlange: [manualSpecificationData.dFlange],
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
    manualSpecificationData.frameNumber = form.controls.frameNumber.value;
    manualSpecificationData.uFrame = form.controls.uFrame.value;
    manualSpecificationData.cFace = form.controls.cFace.value;
    manualSpecificationData.verticalShaft = form.controls.verticalShaft.value;
    manualSpecificationData.dFlange = form.controls.dFlange.value;
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
