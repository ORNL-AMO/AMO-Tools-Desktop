import { Injectable } from '@angular/core';
import { FieldMeasurementInputs, FieldMeasurementOutputs } from './percent-load-estimation.component';

@Injectable()
export class FieldMeasurementService {

  constructor() { }

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
