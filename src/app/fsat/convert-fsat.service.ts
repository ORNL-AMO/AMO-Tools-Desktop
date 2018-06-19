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
    dataCpy.airTreatmentLoss = this.convertUnitsService.value(dataCpy.airTreatmentLoss).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
    dataCpy.outletDamperLoss = this.convertUnitsService.value(dataCpy.outletDamperLoss).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
    dataCpy.outletSystemEffectLoss = this.convertUnitsService.value(dataCpy.outletSystemEffectLoss).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
    dataCpy.processRequirements = this.convertUnitsService.value(dataCpy.processRequirements).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
    dataCpy.systemDamperLoss = this.convertUnitsService.value(dataCpy.systemDamperLoss).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
    return dataCpy;
  }

  convertInletPressureData(data: InletPressureData, oldSettings: Settings, newSettings: Settings): InletPressureData {
    let dataCpy: InletPressureData = JSON.parse(JSON.stringify(data));
    data.airTreatmentLoss = this.convertUnitsService.value(dataCpy.airTreatmentLoss).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
    data.flowMeasurementLoss = this.convertUnitsService.value(dataCpy.flowMeasurementLoss).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
    data.inletDamperLoss = this.convertUnitsService.value(dataCpy.inletDamperLoss).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
    data.inletDuctworkLoss = this.convertUnitsService.value(dataCpy.inletDuctworkLoss).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
    data.inletLoss = this.convertUnitsService.value(dataCpy.inletLoss).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
    data.inletSystemEffectLoss = this.convertUnitsService.value(dataCpy.inletSystemEffectLoss).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
    data.processRequirements = this.convertUnitsService.value(dataCpy.processRequirements).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
    data.systemDamperLoss = this.convertUnitsService.value(dataCpy.systemDamperLoss).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
    return dataCpy;
  }

  convertAllInputData(fsat: FSAT, oldSettings: Settings, newSettings: Settings): FSAT {
    let inputCpy: FSAT = JSON.parse(JSON.stringify(fsat));
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      inputCpy.baseGasDensity.barometricPressure
      inputCpy.baseGasDensity.staticPressure
      inputCpy.baseGasDensity.gasDensity
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      inputCpy.baseGasDensity.barometricPressure
      inputCpy.baseGasDensity.staticPressure
      inputCpy.baseGasDensity.gasDensity
    }

    if(oldSettings.temperatureMeasurement != newSettings.temperatureMeasurement){
      inputCpy.baseGasDensity.dryBulbTemp
      inputCpy.baseGasDensity.wetBulbTemp
      inputCpy.baseGasDensity.dewPoint
    }

    if (oldSettings.fanPressureMeasurement != newSettings.fanPressureMeasurement) {
      inputCpy.fieldData.inletPressure = this.convertUnitsService.value(inputCpy.fieldData.inletPressure).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
      inputCpy.fieldData.outletPressure = this.convertUnitsService.value(inputCpy.fieldData.outletPressure).from(oldSettings.fanPressureMeasurement).to(newSettings.fanPressureMeasurement);
      if (inputCpy.fieldData.outletPressureData) {
        inputCpy.fieldData.outletPressureData = this.convertOutletPressureData(inputCpy.fieldData.outletPressureData, oldSettings, newSettings);
      }
    }
    if (oldSettings.fanFlowRate != newSettings.fanFlowRate) {
      inputCpy.fieldData.flowRate = this.convertUnitsService.value(inputCpy.fieldData.flowRate).from(oldSettings.fanFlowRate).to(newSettings.fanPressureMeasurement);
    }
    if (oldSettings.powerMeasurement != newSettings.powerMeasurement) {
      inputCpy.fieldData.motorPower = this.convertMotorPower(inputCpy.fieldData.motorPower, oldSettings.powerMeasurement, newSettings.powerMeasurement)
    }


    return inputCpy;
  }

  convertMotorPower(motorPower: number, oldPowerMeasurement: string, newPowerMeasurement: string): number {
    return 0;
  }
}
