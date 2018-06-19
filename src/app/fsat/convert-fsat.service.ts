import { Injectable } from '@angular/core';
import { Settings } from '../shared/models/settings';
import { FsatInput, OutletPressureData, InletPressureData } from '../shared/models/fans';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

@Injectable()
export class ConvertFsatService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertInputData(inputs: FsatInput, settings: Settings): FsatInput {
    let inputCpy: FsatInput = JSON.parse(JSON.stringify(inputs));
    //gasDensity
    inputCpy.inletPressure = this.convertUnitsService.value(inputCpy.inletPressure).from(settings.fanPressureMeasurement).to('inH2o');
    inputCpy.outletPressure = this.convertUnitsService.value(inputCpy.outletPressure).from(settings.fanPressureMeasurement).to('inH2o');
    inputCpy.flowRate = this.convertUnitsService.value(inputCpy.flowRate).from(settings.fanFlowRate).to('ft3/min');
    return inputCpy;
  }

  convertOutletPressureData(data: OutletPressureData, settings: Settings): OutletPressureData {
    let dataCpy: OutletPressureData = JSON.parse(JSON.stringify(data));
    dataCpy.airTreatmentLoss = this.convertUnitsService.value(dataCpy.airTreatmentLoss).from(settings.fanPressureMeasurement).to('inH2o');
    dataCpy.outletDamperLoss = this.convertUnitsService.value(dataCpy.outletDamperLoss).from(settings.fanPressureMeasurement).to('inH2o');
    dataCpy.outletSystemEffectLoss = this.convertUnitsService.value(dataCpy.outletSystemEffectLoss).from(settings.fanPressureMeasurement).to('inH2o');
    dataCpy.processRequirements = this.convertUnitsService.value(dataCpy.processRequirements).from(settings.fanPressureMeasurement).to('inH2o');
    dataCpy.systemDamperLoss = this.convertUnitsService.value(dataCpy.systemDamperLoss).from(settings.fanPressureMeasurement).to('inH2o');
    return dataCpy;
  }

  convertInletPressureData(data: InletPressureData, settings: Settings): InletPressureData {
    let dataCpy: InletPressureData = JSON.parse(JSON.stringify(data));
    data.airTreatmentLoss = this.convertUnitsService.value(dataCpy.airTreatmentLoss).from(settings.fanPressureMeasurement).to('inH2o');
    data.flowMeasurementLoss = this.convertUnitsService.value(dataCpy.flowMeasurementLoss).from(settings.fanPressureMeasurement).to('inH2o');
    data.inletDamperLoss = this.convertUnitsService.value(dataCpy.inletDamperLoss).from(settings.fanPressureMeasurement).to('inH2o');
    data.inletDuctworkLoss = this.convertUnitsService.value(dataCpy.inletDuctworkLoss).from(settings.fanPressureMeasurement).to('inH2o');
    data.inletLoss = this.convertUnitsService.value(dataCpy.inletLoss).from(settings.fanPressureMeasurement).to('inH2o');
    data.inletSystemEffectLoss = this.convertUnitsService.value(dataCpy.inletSystemEffectLoss).from(settings.fanPressureMeasurement).to('inH2o');
    data.processRequirements = this.convertUnitsService.value(dataCpy.processRequirements).from(settings.fanPressureMeasurement).to('inH2o');
    data.systemDamperLoss = this.convertUnitsService.value(dataCpy.systemDamperLoss).from(settings.fanPressureMeasurement).to('inH2o');
    return dataCpy;
  }
}
