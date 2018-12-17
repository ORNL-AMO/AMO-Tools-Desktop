import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Injectable()
export class PercentLoadEstimationService {
  slipMethodInputs: SlipMethod = {
    synchronousSpeed: 0,
    measuredSpeed: 0,
    nameplateFullLoadSpeed: 0
  };
  fieldMeasurementInputs: FieldMeasurementInputs = {
    phase1Voltage: 0,
    phase1Amps: 0,
    phase2Voltage: 0,
    phase2Amps: 0,
    phase3Voltage: 0,
    phase3Amps: 0,
    ratedVoltage: 0,
    ratedCurrent: 0,
    powerFactor: 0
  };
  loadEstimationMethod: number = 0;
  constructor(private formBuilder: FormBuilder) { }

  initSlipMethodInputs(): SlipMethod {
    this.slipMethodInputs = {
      synchronousSpeed: 0,
      measuredSpeed: 0,
      nameplateFullLoadSpeed: 0
    };
    return this.slipMethodInputs;
  }

  initSlipMethodForm(): FormGroup {
    let tmpForm: FormGroup = this.formBuilder.group({
      synchronousSpeed: [0],
      measuredSpeed: [0, [Validators.required]],
      nameplateFullLoadSpeed: [0, [Validators.required]]
    });
    return tmpForm;
  }

  getSlipMethodFormFromObj(inputObj: SlipMethod, lineFrequency: number): FormGroup {
    let tmpForm: FormGroup = this.formBuilder.group({
      lineFrequency: [lineFrequency],
      synchronousSpeed: [inputObj.synchronousSpeed],
      measuredSpeed: [inputObj.measuredSpeed, [Validators.required]],
      nameplateFullLoadSpeed: [inputObj.nameplateFullLoadSpeed, [Validators.required]]
    });
    return tmpForm;
  }

  // getSlipMethodObjFromForm(form: FormGroup): SlipMethod {
  //   let tmpSlipMethodInputs = {
  //     measuredSpeed: form.controls.measuredSpeed.value,
  //     nameplateFullLoadSpeed: form.controls.nameplateFullLoadSpeed.value
  //   };
  //   return tmpSlipMethodInputs;
  // }

  updateSlipMethodValidation(synchronousSpeeds: Array<number>, form: FormGroup): FormGroup {
    let tmpForm = form;
    tmpForm.controls.nameplateFullLoadSpeed.clearValidators();
    tmpForm.controls.measuredSpeed.clearValidators();
    tmpForm.controls.nameplateFullLoadSpeed.setValidators([Validators.required, Validators.max(synchronousSpeeds[synchronousSpeeds.length - 1])]);
    tmpForm.controls.measuredSpeed.setValidators([Validators.required, Validators.max(synchronousSpeeds[synchronousSpeeds.length - 1])]);
    return tmpForm;
  }

  initFieldMeasurementInputs(): FieldMeasurementInputs {
    this.fieldMeasurementInputs = {
      phase1Voltage: 0,
      phase1Amps: 0,
      phase2Voltage: 0,
      phase2Amps: 0,
      phase3Voltage: 0,
      phase3Amps: 0,
      ratedVoltage: 0,
      ratedCurrent: 0,
      powerFactor: 0
    }
    return this.fieldMeasurementInputs;
  }

  initFieldMeasurementForm(): FormGroup {
    let tmpForm = this.formBuilder.group({

    });
    return tmpForm;
  }

  getFieldMeasurementFormFromObj(inputObj: FieldMeasurementInputs): FormGroup {
    let tmpForm = this.formBuilder.group({
      phase1Voltage: [inputObj.phase1Voltage, [Validators.required]],
      phase1Amps: [inputObj.phase1Amps, [Validators.required]],
      phase2Voltage: [inputObj.phase2Voltage, [Validators.required]],
      phase2Amps: [inputObj.phase2Amps, [Validators.required]],
      phase3Voltage: [inputObj.phase3Voltage, [Validators.required]],
      phase3Amps: [inputObj.phase3Amps, [Validators.required]],
      ratedCurrent: [inputObj.ratedCurrent, [Validators.required, Validators.min(0)]],
      ratedVoltage: [inputObj.ratedVoltage, [Validators.required]],
      powerFactor: [inputObj.powerFactor, [Validators.required]]
    });

    return tmpForm;
  }

  getResults(data: FieldMeasurementInputs): FieldMeasurementOutputs {
    let outputs: FieldMeasurementOutputs = {
      averageVoltage: this.averageVoltage(data),
      averageCurrent: this.averageCurrent(data),
      inputPower: this.inputPower(data),
      percentLoad: this.percentLoad(data),
      maxVoltageDeviation: this.voltageDeviation(data),
      voltageUnbalance: this.voltageUnbalance(data)
    }
    return outputs;
  }

  averageVoltage(data: FieldMeasurementInputs): number {
    let sum: number = data.phase1Voltage + data.phase2Voltage + data.phase3Voltage;
    return sum / 3;
  }

  averageCurrent(data: FieldMeasurementInputs): number {
    let sum: number = data.phase1Amps + data.phase2Amps + data.phase3Amps;
    return sum / 3;
  }

  inputPower(data: FieldMeasurementInputs): number {
    let val: number = data.ratedVoltage * data.ratedCurrent * data.powerFactor * Math.sqrt(3);
    return val / 1000;
  }

  percentLoad(data: FieldMeasurementInputs): number {
    let averageCurrent: number = this.averageCurrent(data);
    let percentLoadCurrent: number = averageCurrent / data.ratedCurrent;

    let averageVoltage: number = this.averageVoltage(data);
    let percentLoadVoltage: number = averageVoltage / data.ratedVoltage;

    let percentLoad: number = percentLoadVoltage * percentLoadCurrent * 100;
    return percentLoad;
  }

  voltageDeviation(data: FieldMeasurementInputs): number {
    let avgVoltage: number = this.averageVoltage(data);
    let deviation1: number = Math.abs(avgVoltage - data.phase1Voltage);
    let deviation2: number = Math.abs(avgVoltage - data.phase2Voltage);
    let deviation3: number = Math.abs(avgVoltage - data.phase3Voltage);
    return Math.max(deviation1, deviation2, deviation3);
  }

  voltageUnbalance(data: FieldMeasurementInputs): number {
    let deviation: number = this.voltageDeviation(data);
    let avgVoltage: number = this.averageVoltage(data);
    return (deviation / avgVoltage) * 100;
  }
}

export interface SlipMethod {
  synchronousSpeed: number,
  measuredSpeed: number,
  nameplateFullLoadSpeed: number
}


export interface FieldMeasurementInputs {
  phase1Voltage: number,
  phase1Amps: number,
  phase2Voltage: number,
  phase2Amps: number,
  phase3Voltage: number,
  phase3Amps: number,
  ratedVoltage: number,
  ratedCurrent: number,
  powerFactor: number
}

export interface FieldMeasurementOutputs {
  averageVoltage: number,
  averageCurrent: number,
  inputPower: number,
  percentLoad: number,
  maxVoltageDeviation: number,
  voltageUnbalance: number
}
