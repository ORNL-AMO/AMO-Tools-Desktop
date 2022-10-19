import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { FanShaftPower } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';
import { GreaterThanValidator } from '../../../../../shared/validators/greater-than';
import { ConvertFanAnalysisService } from '../../convert-fan-analysis.service';

@Injectable()
export class FanShaftPowerFormService {

  constructor(private formBuilder: UntypedFormBuilder, private convertFanAnalysisService: ConvertFanAnalysisService) { }

  getShaftPowerFormFromObj(obj: FanShaftPower, inStandalone?: boolean, settings?: Settings): UntypedFormGroup {
    let motorShaftPower = obj.motorShaftPower;
    if (inStandalone && obj.motorShaftPower) {
      motorShaftPower = this.convertFanAnalysisService.convertNum(obj.motorShaftPower, settings.fanPowerMeasurement, 'kW'); 
    }

    let form = this.formBuilder.group({
      isMethodOne: [obj.isMethodOne, Validators.required],
      isVFD: [obj.isVFD, Validators.required],
      mainsDataAvailable: [obj.mainsDataAvailable, Validators.required],
      ratedHP: [obj.ratedHP, Validators.required],
      synchronousSpeed: [obj.synchronousSpeed, Validators.required],
      powerFactorAtLoad: [obj.powerFactorAtLoad, [Validators.required, Validators.min(0), Validators.max(1), GreaterThanValidator.greaterThan(0)]],
      npv: [obj.npv, [Validators.required, Validators.min(0), Validators.max(20000)]],
      fullLoadAmps: [obj.fla, Validators.required],
      motorShaftPower: [motorShaftPower, Validators.required],
      phase1Voltage: [obj.phase1.voltage, Validators.min(0)],
      phase1Amps: [obj.phase1.amps, Validators.min(0)],
      phase2Voltage: [obj.phase2.voltage, Validators.min(0)],
      phase2Amps: [obj.phase2.amps, Validators.min(0)],
      phase3Voltage: [obj.phase3.voltage, Validators.min(0)],
      phase3Amps: [obj.phase3.amps, Validators.min(0)],
      efficiencyMotor: [obj.efficiencyMotor, [Validators.required, Validators.min(0), Validators.max(100), GreaterThanValidator.greaterThan(0)]],
      efficiencyVFD: [obj.efficiencyVFD, [Validators.required, Validators.min(0), Validators.max(100)]],
      efficiencyBelt: [obj.efficiencyBelt, [Validators.required, Validators.min(0), Validators.max(100)]],
      driveType: [obj.driveType],
      efficiencyClass: [obj.efficiencyClass],
      frequency: [obj.frequency]
    });

    return form;
  }

  getShaftPowerObjFromForm(form: UntypedFormGroup, obj: FanShaftPower, inStandalone?: boolean, settings?: Settings): FanShaftPower {
    if (inStandalone && form.controls.motorShaftPower.value) {
      obj.motorShaftPower = this.convertFanAnalysisService.convertNum(form.controls.motorShaftPower.value, 'kW', settings.fanPowerMeasurement); 
    }
    obj.isMethodOne = form.controls.isMethodOne.value;
    obj.isVFD = form.controls.isVFD.value;
    obj.mainsDataAvailable = form.controls.mainsDataAvailable.value;
    obj.ratedHP = form.controls.ratedHP.value;
    obj.synchronousSpeed = form.controls.synchronousSpeed.value;
    obj.npv = form.controls.npv.value;
    obj.fla = form.controls.fullLoadAmps.value;
    
    obj.phase1 = {
      voltage: form.controls.phase1Voltage.value,
      amps: form.controls.phase1Amps.value
    };
    obj.phase2 = {
      voltage: form.controls.phase2Voltage.value,
      amps: form.controls.phase2Amps.value
    };
    obj.phase3 = {
      voltage: form.controls.phase3Voltage.value,
      amps: form.controls.phase3Amps.value
    };
    obj.efficiencyMotor = form.controls.efficiencyMotor.value;
    obj.efficiencyVFD = form.controls.efficiencyVFD.value;
    obj.efficiencyBelt = form.controls.efficiencyBelt.value;
    obj.powerFactorAtLoad = form.controls.powerFactorAtLoad.value;
    obj.driveType = form.controls.driveType.value;
    obj.frequency = form.controls.frequency.value;
    obj.efficiencyClass = form.controls.efficiencyClass.value;
    return obj;
  }
}
