import { Injectable } from '@angular/core';
import { Settings } from '../shared/models/settings';
import { FsatInput, OutletPressureData, InletPressureData, FSAT, FsatOutput } from '../shared/models/fans';
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

    inputCpy.motorRatedPower = this.convertUnitsService.value(inputCpy.motorRatedPower).from(settings.fanPowerMeasurement).to('hp');

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
    dataCpy.airTreatmentLoss = this.convertNum(dataCpy.airTreatmentLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    dataCpy.flowMeasurementLoss = this.convertNum(dataCpy.flowMeasurementLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    dataCpy.inletDamperLoss = this.convertNum(dataCpy.inletDamperLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    dataCpy.inletDuctworkLoss = this.convertNum(dataCpy.inletDuctworkLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    dataCpy.inletLoss = this.convertNum(dataCpy.inletLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    dataCpy.inletSystemEffectLoss = this.convertNum(dataCpy.inletSystemEffectLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    dataCpy.processRequirements = this.convertNum(dataCpy.processRequirements, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    dataCpy.systemDamperLoss = this.convertNum(dataCpy.systemDamperLoss, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
    return dataCpy;
  }

  convertAllInputData(fsat: FSAT, oldSettings: Settings, newSettings: Settings): FSAT {
    let inputCpy: FSAT = JSON.parse(JSON.stringify(fsat));
    if (oldSettings.fanTemperatureMeasurement !== newSettings.fanTemperatureMeasurement) {
      inputCpy.baseGasDensity.dryBulbTemp = this.convertNum(inputCpy.baseGasDensity.dryBulbTemp, oldSettings.fanTemperatureMeasurement, newSettings.fanTemperatureMeasurement);
      inputCpy.baseGasDensity.wetBulbTemp = this.convertNum(inputCpy.baseGasDensity.wetBulbTemp, oldSettings.fanTemperatureMeasurement, newSettings.fanTemperatureMeasurement);
      inputCpy.baseGasDensity.dewPoint = this.convertNum(inputCpy.baseGasDensity.dewPoint, oldSettings.fanTemperatureMeasurement, newSettings.fanTemperatureMeasurement);
    }
    if (oldSettings.densityMeasurement !== newSettings.densityMeasurement) {
      inputCpy.baseGasDensity.gasDensity = this.convertNum(inputCpy.baseGasDensity.gasDensity, oldSettings.densityMeasurement, newSettings.densityMeasurement);
    }

    if (oldSettings.fanBarometricPressure !== newSettings.fanBarometricPressure) {
      inputCpy.baseGasDensity.barometricPressure = this.convertNum(inputCpy.baseGasDensity.barometricPressure, oldSettings.fanBarometricPressure, newSettings.fanBarometricPressure);
    }
    if (oldSettings.fanPressureMeasurement !== newSettings.fanPressureMeasurement) {
      inputCpy.baseGasDensity.staticPressure = this.convertNum(inputCpy.baseGasDensity.staticPressure, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
      inputCpy.fieldData.inletPressure = this.convertNum(inputCpy.fieldData.inletPressure, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
      inputCpy.fieldData.outletPressure = this.convertNum(inputCpy.fieldData.outletPressure, oldSettings.fanPressureMeasurement, newSettings.fanPressureMeasurement);
      if (inputCpy.fieldData.outletPressureData) {
        inputCpy.fieldData.outletPressureData = this.convertOutletPressureData(inputCpy.fieldData.outletPressureData, oldSettings, newSettings);
      }
    }
    if (oldSettings.fanFlowRate !== newSettings.fanFlowRate) {
      inputCpy.fieldData.flowRate = this.convertNum(inputCpy.fieldData.flowRate, oldSettings.fanFlowRate, newSettings.fanFlowRate);
    }

    if (oldSettings.fanSpecificHeatGas !== newSettings.fanSpecificHeatGas) {
      inputCpy.baseGasDensity.specificHeatGas = this.convertNum(inputCpy.baseGasDensity.specificHeatGas, oldSettings.fanSpecificHeatGas, newSettings.fanSpecificHeatGas);
    }
    if (oldSettings.fanPowerMeasurement !== newSettings.fanPowerMeasurement) {
      inputCpy.fanMotor.motorRatedPower = this.convertNum(inputCpy.fanMotor.motorRatedPower, oldSettings.fanPowerMeasurement, newSettings.fanPowerMeasurement);
    }
    // if (oldSettings.powerMeasurement != newSettings.powerMeasurement) {
    //   inputCpy.fieldData.motorPower = this.convertMotorPower(inputCpy.fieldData.motorPower, oldSettings.powerMeasurement, newSettings.powerMeasurement)
    // }
    return inputCpy;
  }
  convertFsatOutput(results: FsatOutput, settings: Settings): FsatOutput {
    if (settings.fanPowerMeasurement !== 'hp') {
      results.fanShaftPower = this.convertUnitsService.value(results.fanShaftPower).from('hp').to(settings.fanPowerMeasurement);
      results.motorRatedPower = this.convertUnitsService.value(results.motorRatedPower).from('hp').to(settings.fanPowerMeasurement);
      results.motorShaftPower = this.convertUnitsService.value(results.motorShaftPower).from('hp').to(settings.fanPowerMeasurement);
    }
    return results;
  }

  convertNum(num: number, from: string, to: string): number {
    num = this.convertUnitsService.value(num).from(from).to(to);
    num = Number(num.toFixed(3));
    return num;
  }

  convertExistingData(fsat: FSAT, oldSettings: Settings, settings: Settings): FSAT {
    fsat = this.convertAllInputData(fsat, oldSettings, settings);
    if(fsat.modifications){
      fsat.modifications.forEach(mod => {
        mod.fsat = this.convertAllInputData(mod.fsat, oldSettings, settings);
      })
    }
    return fsat;
  }
}
