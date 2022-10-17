import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { FanSystemChecklistInput } from '../../../shared/models/fans';

@Injectable()
export class FanSystemChecklistFormService {
  constructor(private formBuilder: UntypedFormBuilder) {}

  getFanSystemChecklistForm(inputObj: FanSystemChecklistInput): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      name: [inputObj.name],
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      motorPower: [inputObj.motorPower],
      fanType: [inputObj.fanType],
      motorOverloads: [inputObj.control.motorOverloads],
      spillOrBypass: [inputObj.control.spillOrBypass],
      dischargeDamper: [inputObj.control.dischargeDamper],
      inletDamper: [inputObj.control.inletDamper],
      variableInletVane: [inputObj.control.variableInletVane],
      systemDamper: [inputObj.control.systemDamper],
      damperClosed: [inputObj.control.damperClosed],
      turnRight: [inputObj.system.turnRight],
      turnNear: [inputObj.system.turnNear],
      dirtLeg: [inputObj.system.dirtLeg],
      noOutletDuct: [inputObj.system.noOutletDuct],
      restrictedInlet: [inputObj.system.restrictedInlet],
      excessFlowOrPressure: [inputObj.production.excessFlowOrPressure],
      unstableSystem: [inputObj.production.unstableSystem],
      unreliableSystem: [inputObj.production.unreliableSystem],
      lowFlowOrPressure: [inputObj.production.lowFlowOrPressure],
      systemNoisy: [inputObj.production.systemNoisy],
      fanBladeBuildup: [inputObj.production.fanBladeBuildup],
      weldingDuctwork: [inputObj.production.weldingDuctwork],
      radialFanCleanAir: [inputObj.production.radialFanCleanAir],
      notes: [inputObj.notes]
    });

    return form;
  }

  getFanSystemChecklistInput(form: UntypedFormGroup): FanSystemChecklistInput {
    let obj: FanSystemChecklistInput = {
      operatingHours: form.controls.operatingHours.value,
      motorPower: form.controls.motorPower.value,
      fanType: form.controls.fanType.value,
      control: {
        motorOverloads: form.controls.motorOverloads.value,
        spillOrBypass: form.controls.spillOrBypass.value,
        dischargeDamper: form.controls.dischargeDamper.value,
        inletDamper: form.controls.inletDamper.value,
        variableInletVane: form.controls.variableInletVane.value,
        systemDamper: form.controls.systemDamper.value,
        damperClosed: form.controls.damperClosed.value,
      },
      system: {
        turnRight: form.controls.turnRight.value,
        turnNear: form.controls.turnNear.value,
        dirtLeg: form.controls.dirtLeg.value,
        noOutletDuct: form.controls.noOutletDuct.value,
        restrictedInlet: form.controls.restrictedInlet.value,
      },
      production: {
        excessFlowOrPressure: form.controls.excessFlowOrPressure.value,
        unstableSystem: form.controls.unstableSystem.value,
        unreliableSystem: form.controls.unreliableSystem.value,
        lowFlowOrPressure: form.controls.lowFlowOrPressure.value,
        systemNoisy: form.controls.systemNoisy.value,
        fanBladeBuildup: form.controls.fanBladeBuildup.value,
        weldingDuctwork: form.controls.weldingDuctwork.value,
        radialFanCleanAir: form.controls.radialFanCleanAir.value,
      },
      name: form.controls.name.value,
      notes: form.controls.notes.value
    };
    return obj;
  }


}