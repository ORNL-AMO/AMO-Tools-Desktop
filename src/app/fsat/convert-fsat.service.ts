import { Injectable } from '@angular/core';
import { Settings } from '../shared/models/settings';
import { FsatInput, OutletPressureData, InletPressureData, FSAT } from '../shared/models/fans';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

@Injectable()
export class ConvertFsatService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertInputDataForCalculations(inputs: FsatInput, settings: Settings): FsatInput {
    let inputCpy: FsatInput = JSON.parse(JSON.stringify(inputs));
    //gasDensity
    inputCpy.inletPressure = this.convertUnitsService.value(inputCpy.inletPressure).from(settings.fanPressureMeasurement).to('inH2o');
    inputCpy.outletPressure = this.convertUnitsService.value(inputCpy.outletPressure).from(settings.fanPressureMeasurement).to('inH2o');
    inputCpy.flowRate = this.convertUnitsService.value(inputCpy.flowRate).from(settings.fanFlowRate).to('ft3/min');
    return inputCpy;
  }

  convertOutletPressureData(data: OutletPressureData, oldSettings: Settings, newSettings: Settings): OutletPressureData {
    let dataCpy: OutletPressureData = JSON.parse(JSON.stringify(data));
    dataCpy.airTreatmentLoss = this.convertNum(dataCpy.airTreatmentLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    dataCpy.outletDamperLoss = this.convertNum(dataCpy.outletDamperLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    dataCpy.outletSystemEffectLoss = this.convertNum(dataCpy.outletSystemEffectLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    dataCpy.processRequirements = this.convertNum(dataCpy.processRequirements, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    dataCpy.systemDamperLoss = this.convertNum(dataCpy.systemDamperLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    return dataCpy;
  }

  convertInletPressureData(data: InletPressureData, oldSettings: Settings, newSettings: Settings): InletPressureData {
    let dataCpy: InletPressureData = JSON.parse(JSON.stringify(data));
    data.airTreatmentLoss = this.convertNum(dataCpy.airTreatmentLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    data.flowMeasurementLoss = this.convertNum(dataCpy.flowMeasurementLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    data.inletDamperLoss = this.convertNum(dataCpy.inletDamperLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    data.inletDuctworkLoss = this.convertNum(dataCpy.inletDuctworkLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    data.inletLoss = this.convertNum(dataCpy.inletLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    data.inletSystemEffectLoss = this.convertNum(dataCpy.inletSystemEffectLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    data.processRequirements = this.convertNum(dataCpy.processRequirements, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    data.systemDamperLoss = this.convertNum(dataCpy.systemDamperLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    return dataCpy;
  }

  convertAllInputData(fsat: FSAT, oldSettings: Settings, newSettings: Settings): FSAT {
    let inputCpy: FSAT = JSON.parse(JSON.stringify(fsat));
    if (oldSettings.temperatureMeasurement != newSettings.temperatureMeasurement) {
      inputCpy.baseGasDensity.dryBulbTemp = this.convertNum(inputCpy.baseGasDensity.dryBulbTemp, oldSettings.temperatureMeasurement, newSettings.temperatureMeasurement);
      inputCpy.baseGasDensity.wetBulbTemp = this.convertNum(inputCpy.baseGasDensity.wetBulbTemp, oldSettings.temperatureMeasurement, newSettings.temperatureMeasurement);
      inputCpy.baseGasDensity.dewPoint = this.convertNum(inputCpy.baseGasDensity.dewPoint, oldSettings.temperatureMeasurement, newSettings.temperatureMeasurement);
    }
    if (oldSettings.densityMeasurement != newSettings.densityMeasurement) {
      inputCpy.baseGasDensity.gasDensity = this.convertNum(inputCpy.baseGasDensity.gasDensity, oldSettings.densityMeasurement, newSettings.densityMeasurement);
    }
    if (oldSettings.fanBarometricPressure != newSettings.fanBarometricPressure) {
      inputCpy.baseGasDensity.barometricPressure = this.convertNum(inputCpy.baseGasDensity.barometricPressure, oldSettings.fanBarometricPressure, newSettings.fanBarometricPressure);
    }
    if (oldSettings.fanPressureMeasurement != newSettings.fanPressureMeasurement) {
      inputCpy.baseGasDensity.staticPressure = this.convertNum(inputCpy.baseGasDensity.staticPressure, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
      inputCpy.fieldData.inletPressure = this.convertNum(inputCpy.fieldData.inletPressure, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
      inputCpy.fieldData.outletPressure = this.convertNum(inputCpy.fieldData.outletPressure, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
      if (inputCpy.fieldData.outletPressureData) {
        inputCpy.fieldData.outletPressureData = this.convertOutletPressureData(inputCpy.fieldData.outletPressureData, oldSettings, newSettings);
      }
    }
    if (oldSettings.fanFlowRate != newSettings.fanFlowRate) {
      inputCpy.fieldData.flowRate = this.convertNum(inputCpy.fieldData.flowRate, oldSettings.fanFlowRate, newSettings.fanFlowRate);
    }
    // if (oldSettings.powerMeasurement != newSettings.powerMeasurement) {
    //   inputCpy.fieldData.motorPower = this.convertMotorPower(inputCpy.fieldData.motorPower, oldSettings.powerMeasurement, newSettings.powerMeasurement)
    // }
    return inputCpy;
  }

  // convertMotorPower(motorPower: number, oldPowerMeasurement: string, newPowerMeasurement: string): number {
  //   return 0;
  // }

  convertNum(num: number, from: string, to: string): number {
    num = this.convertUnitsService.value(num).from(from).to(to);
    num = Number(num.toFixed(3));
    return num;
  }
}
