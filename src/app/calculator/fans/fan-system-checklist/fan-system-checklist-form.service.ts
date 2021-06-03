import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FanSystemChecklistInput } from '../../../shared/models/fans';

@Injectable()
export class FanSystemChecklistFormService {
  constructor(private formBuilder: FormBuilder) {}

  getFanSystemChecklistForm(inputObj: FanSystemChecklistInput): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [inputObj.name],
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      motorPower: [inputObj.motorPower],
      fanType: [inputObj.fanType],
      motorOverloads: [inputObj.motorOverloads],
      spillOrBypass: [inputObj.spillOrBypass],
      dischargeDamper: [inputObj.dischargeDamper],
      inletDamper: [inputObj.inletDamper],
      variableInletVane: [inputObj.variableInletVane],
      systemDamper: [inputObj.systemDamper],
      damperClosed: [inputObj.damperClosed],
      turnRight: [inputObj.turnRight],
      turnNear: [inputObj.turnNear],
      dirtLeg: [inputObj.dirtLeg],
      noOutletDuct: [inputObj.noOutletDuct],
      restrictedInlet: [inputObj.restrictedInlet],
      excessFlowOrPressure: [inputObj.excessFlowOrPressure],
      unstableSystem: [inputObj.unstableSystem],
      unreliableSystem: [inputObj.unreliableSystem],
      lowFlowOrPressure: [inputObj.lowFlowOrPressure],
      systemNoisy: [inputObj.systemNoisy],
      fanBladeBuildup: [inputObj.fanBladeBuildup],
      weldingDuctwork: [inputObj.weldingDuctwork],
      radialFanCleanAir: [inputObj.radialFanCleanAir],
      notes: [inputObj.notes]
    });

    return form;
  }

  getFanSystemChecklistInput(form: FormGroup): FanSystemChecklistInput {
    let obj: FanSystemChecklistInput = {
      operatingHours: form.controls.operatingHours.value,
      motorPower: form.controls.motorPower.value,
      fanType: form.controls.fanType.value,
      motorOverloads: form.controls.motorOverloads.value,
      spillOrBypass: form.controls.spillOrBypass.value,
      dischargeDamper: form.controls.dischargeDamper.value,
      inletDamper: form.controls.inletDamper.value,
      variableInletVane: form.controls.variableInletVane.value,
      systemDamper: form.controls.systemDamper.value,
      damperClosed: form.controls.damperClosed.value,
      turnRight: form.controls.turnRight.value,
      turnNear: form.controls.turnNear.value,
      dirtLeg: form.controls.dirtLeg.value,
      noOutletDuct: form.controls.noOutletDuct.value,
      restrictedInlet: form.controls.restrictedInlet.value,
      excessFlowOrPressure: form.controls.excessFlowOrPressure.value,
      unstableSystem: form.controls.unstableSystem.value,
      unreliableSystem: form.controls.unreliableSystem.value,
      lowFlowOrPressure: form.controls.lowFlowOrPressure.value,
      systemNoisy: form.controls.systemNoisy.value,
      fanBladeBuildup: form.controls.fanBladeBuildup.value,
      weldingDuctwork: form.controls.weldingDuctwork.value,
      radialFanCleanAir: form.controls.radialFanCleanAir.value,
      name: form.controls.name.value,
      notes: form.controls.notes.value
    };
    return obj;
  }


}