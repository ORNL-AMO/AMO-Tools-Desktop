import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-fan-shaft-power',
  templateUrl: './fan-shaft-power.component.html',
  styleUrls: ['./fan-shaft-power.component.css']
})
export class FanShaftPowerComponent implements OnInit {

  fanShaftPower: FanShaftPower = {
    method: 'Method 2',
    isVFD: 'No',
    mainsDataAvailable: 'Yes',
    ratedHP: 1750,
    synchronousSpeed: 1200,
    npv: 4160,
    fla: 210,
    vfdInput: 0,
    phase1: {
      voltage: 4200,
      amps: 205,
      powerFactor: .88
    },
    phase2: {
      voltage: 4200,
      amps: 205
    },
    phase3: {
      voltage: 4200,
      amps: 205
    },
    motorEfficiency: 95,
    vfdEfficiency: 100,
    driveEfficiency: 100
  }

  shaftPowerForm: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.shaftPowerForm = this.getFormFromObj(this.fanShaftPower);
  }

  getFormFromObj(obj: FanShaftPower): FormGroup {
    let form = this.formBuilder.group({
      method: obj.method,
      isVFD: obj.isVFD,
      mainsDataAvailable: obj.mainsDataAvailable,
      ratedHP: obj.ratedHP,
      synchronousSpeed: obj.synchronousSpeed,
      npv: obj.npv,
      fla: obj.fla,
      vfdInput: obj.vfdInput,
      phase1Voltage: obj.phase1.voltage,
      phase1Amps: obj.phase1.amps,
      phase1PowerFactor: obj.phase1.powerFactor,
      phase2Voltage: obj.phase2.voltage,
      phase2Amps: obj.phase2.amps,
      phase3Voltage: obj.phase3.voltage,
      phase3Amps: obj.phase3.amps,
      motorEfficiency: obj.motorEfficiency,
      vfdEfficiency: obj.vfdEfficiency,
      driveEfficiency: obj.driveEfficiency
    })
    return form;
  }

  getObjFromForm(form: FormGroup): FanShaftPower {
    let obj: FanShaftPower = {
      method: form.controls.method.value,
      isVFD: form.controls.isVFD.value,
      mainsDataAvailable: form.controls.mainsDataAvailable.value,
      ratedHP: form.controls.ratedHP.value,
      synchronousSpeed: form.controls.synchronousSpeed.value,
      npv: form.controls.npv.value,
      fla: form.controls.fla.value,
      vfdInput: form.controls.vfdInput.value,
      phase1: {
        voltage: form.controls.phase1Voltage.value,
        amps: form.controls.phase1Amps.value,
        powerFactor: form.controls.phase1PowerFactor.value
      },
      phase2: {
        voltage: form.controls.phase2Voltage.value,
        amps: form.controls.phase2Amps.value
      },
      phase3: {
        voltage: form.controls.phase3Voltage.value,
        amps: form.controls.phase3Amps.value
      },
      motorEfficiency: form.controls.motorEfficiency.value,
      vfdEfficiency: form.controls.vfdEfficiency.value,
      driveEfficiency: form.controls.driveEfficiency.value
    }
    return obj;
  }

  save() {
    //todo
  }

  focusField() {
    //todo
  }
}


export interface FanShaftPower {
  method: string,
  isVFD: string,
  mainsDataAvailable: string,
  ratedHP: number,
  synchronousSpeed: number,
  npv: number,
  fla: number,
  vfdInput: number,
  phase1: MotorPhase,
  phase2: MotorPhase,
  phase3: MotorPhase
  motorEfficiency: number,
  vfdEfficiency: number,
  driveEfficiency: number
}

export interface MotorPhase {
  voltage: number,
  amps: number,
  powerFactor?: number
}