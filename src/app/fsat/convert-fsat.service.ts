import { Injectable } from '@angular/core';
import { Settings } from '../shared/models/settings';
import { FsatInput, OutletPressureData, InletPressureData, FSAT, BaseGasDensity, Plane, FanRatedInfo, PlaneData, Fan203Inputs, PlaneResults, PlaneResult, Fan203Results, FsatOutput, FanShaftPower } from '../shared/models/fans';
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

  convertGasDensityForCalculations(inputs: BaseGasDensity, settings: Settings): BaseGasDensity {
    let inputCpy: BaseGasDensity = JSON.parse(JSON.stringify(inputs));
    //TODO: Convert to imperial for calcs
    if (settings.fanTemperatureMeasurement != 'F') {
      inputCpy.dryBulbTemp = this.convertUnitsService.value(inputCpy.dryBulbTemp).from(settings.fanTemperatureMeasurement).to('F');
      inputCpy.wetBulbTemp = this.convertUnitsService.value(inputCpy.wetBulbTemp).from(settings.fanTemperatureMeasurement).to('F');
      inputCpy.dewPoint = this.convertUnitsService.value(inputCpy.dewPoint).from(settings.fanTemperatureMeasurement).to('F');
    }
    if (settings.densityMeasurement != 'lbscf') {
      inputCpy.gasDensity = this.convertUnitsService.value(inputCpy.gasDensity).from(settings.densityMeasurement).to('lbscf');
    }
    if (settings.fanBarometricPressure != 'inHg') {
      inputCpy.barometricPressure = this.convertUnitsService.value(inputCpy.barometricPressure).from(settings.fanBarometricPressure).to('inHg');
    }
    if (settings.fanPressureMeasurement != 'inH2o') {
      inputCpy.staticPressure = this.convertUnitsService.value(inputCpy.staticPressure).from(settings.fanPressureMeasurement).to('inH2o');
    }
    if (settings.fanSpecificHeatGas != 'btulbF') {
      inputCpy.specificHeatGas = this.convertUnitsService.value(inputCpy.specificHeatGas).from(settings.fanSpecificHeatGas).to('btulbF');
    }
    return inputCpy;
  }

  convertPlaneForCalculations(inputs: Plane, settings: Settings): Plane {
    let inputCpy: Plane = JSON.parse(JSON.stringify(inputs));
    if (settings.fanBarometricPressure != 'inHg') {
      inputCpy.barometricPressure = this.convertUnitsService.value(inputCpy.barometricPressure).from(settings.fanBarometricPressure).to('inHg');
    }

    if (settings.fanFlowRate != 'ft3/min') {
      inputCpy.area = this.convertUnitsService.value(inputCpy.area).from('m2').to('ft2');
    }
    if (settings.fanTemperatureMeasurement != 'F') {
      inputCpy.dryBulbTemp = this.convertUnitsService.value(inputCpy.dryBulbTemp).from(settings.fanTemperatureMeasurement).to('F');
    }
    if (settings.fanPressureMeasurement != 'inH2o' && inputCpy.staticPressure) {
      inputCpy.staticPressure = this.convertUnitsService.value(inputCpy.staticPressure).from(settings.fanPressureMeasurement).to('inH2o');
    }
    return inputCpy;
  }

  convertFanRatedInfoForCalculations(inputs: FanRatedInfo, settings: Settings): FanRatedInfo {
    let inputCpy: FanRatedInfo = JSON.parse(JSON.stringify(inputs));
    if (settings.densityMeasurement != 'lbscf') {
      inputCpy.densityCorrected = this.convertUnitsService.value(inputCpy.densityCorrected).from(settings.densityMeasurement).to('lbscf')
    }
    if (settings.fanBarometricPressure != 'inHg') {
      inputCpy.pressureBarometricCorrected = this.convertUnitsService.value(inputCpy.pressureBarometricCorrected).from(settings.fanBarometricPressure).to('inHg');
      inputCpy.globalBarometricPressure = this.convertUnitsService.value(inputCpy.globalBarometricPressure).from(settings.fanBarometricPressure).to('inHg');
    }
    return inputCpy;
  }

  convertPlaneDataForCalculations(inputs: PlaneData, settings: Settings): PlaneData {
    let inputCpy: PlaneData = JSON.parse(JSON.stringify(inputs));
    //TODO: convert to imperial for calcs
    if (settings.fanPressureMeasurement != 'inH2o') {
      inputCpy.totalPressureLossBtwnPlanes1and4 = this.convertUnitsService.value(inputCpy.totalPressureLossBtwnPlanes1and4).from(settings.fanPressureMeasurement).to('inH2o');
      inputCpy.totalPressureLossBtwnPlanes2and5 = this.convertUnitsService.value(inputCpy.totalPressureLossBtwnPlanes2and5).from(settings.fanPressureMeasurement).to('inH2o');
      inputCpy.inletSEF = this.convertUnitsService.value(inputCpy.inletSEF).from(settings.fanPressureMeasurement).to('inH2o');
      inputCpy.outletSEF = this.convertUnitsService.value(inputCpy.outletSEF).from(settings.fanPressureMeasurement).to('inH2o');
    }
    inputCpy.FanInletFlange = this.convertPlaneForCalculations(inputCpy.FanInletFlange, settings);
    inputCpy.FanEvaseOrOutletFlange = this.convertPlaneForCalculations(inputCpy.FanEvaseOrOutletFlange, settings);
    inputCpy.FlowTraverse = this.convertPlaneForCalculations(inputCpy.FlowTraverse, settings);
    inputCpy.InletMstPlane = this.convertPlaneForCalculations(inputCpy.InletMstPlane, settings);
    inputCpy.OutletMstPlane = this.convertPlaneForCalculations(inputCpy.OutletMstPlane, settings);
    inputCpy.AddlTraversePlanes.forEach(plane => {
      plane = this.convertPlaneForCalculations(plane, settings);
    });
    return inputCpy;
  }

  convertFan203DataForCalculations(input: Fan203Inputs, settings: Settings): Fan203Inputs {
    let inputCpy: Fan203Inputs = JSON.parse(JSON.stringify(input));
    inputCpy.FanRatedInfo = this.convertFanRatedInfoForCalculations(inputCpy.FanRatedInfo, settings);
    inputCpy.BaseGasDensity = this.convertGasDensityForCalculations(inputCpy.BaseGasDensity, settings);
    inputCpy.PlaneData = this.convertPlaneDataForCalculations(inputCpy.PlaneData, settings);
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
    if (oldSettings.fanTemperatureMeasurement != newSettings.fanTemperatureMeasurement) {
      inputCpy.baseGasDensity.dryBulbTemp = this.convertNum(inputCpy.baseGasDensity.dryBulbTemp, oldSettings.fanTemperatureMeasurement, newSettings.fanTemperatureMeasurement);
      inputCpy.baseGasDensity.wetBulbTemp = this.convertNum(inputCpy.baseGasDensity.wetBulbTemp, oldSettings.fanTemperatureMeasurement, newSettings.fanTemperatureMeasurement);
      inputCpy.baseGasDensity.dewPoint = this.convertNum(inputCpy.baseGasDensity.dewPoint, oldSettings.fanTemperatureMeasurement, newSettings.fanTemperatureMeasurement);
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

    if (oldSettings.fanSpecificHeatGas != newSettings.fanSpecificHeatGas) {
      inputCpy.baseGasDensity.specificHeatGas = this.convertNum(inputCpy.baseGasDensity.specificHeatGas, oldSettings.fanSpecificHeatGas, newSettings.fanSpecificHeatGas);
    }
    // if (oldSettings.powerMeasurement != newSettings.powerMeasurement) {
    //   inputCpy.fieldData.motorPower = this.convertMotorPower(inputCpy.fieldData.motorPower, oldSettings.powerMeasurement, newSettings.powerMeasurement)
    // }
    return inputCpy;
  }

  // convertMotorPower(motorPower: number, oldPowerMeasurement: string, newPowerMeasurement: string): number {
  //   return 0;
  // }

  convertPlaneResults(results: PlaneResults, settings: Settings): PlaneResults {
    results.FanInletFlange = this.convertPlaneResult(results.FanInletFlange, settings);
    results.FanOrEvaseOutletFlange = this.convertPlaneResult(results.FanOrEvaseOutletFlange, settings);
    results.FlowTraverse = this.convertPlaneResult(results.FlowTraverse, settings);
    results.InletMstPlane = this.convertPlaneResult(results.InletMstPlane, settings);
    results.OutletMstPlane = this.convertPlaneResult(results.OutletMstPlane, settings);
    results.AddlTraversePlanes.forEach(plane => {
      plane = this.convertPlaneResult(plane, settings);
    })
    return results;
  }

  convertPlaneResult(result: PlaneResult, settings: Settings): PlaneResult {
    if (settings.densityMeasurement != 'lbscf') {
      result.gasDensity = this.convertUnitsService.value(result.gasDensity).from('lbscf').to(settings.densityMeasurement);
    }

    if (settings.fanPressureMeasurement != 'inHg') {
      result.gasTotalPressure = this.convertUnitsService.value(result.gasTotalPressure).from('inHg').to(settings.fanPressureMeasurement);
      result.gasVelocityPressure = this.convertUnitsService.value(result.gasVelocityPressure).from('inHg').to(settings.fanPressureMeasurement);
      if (result.staticPressure) {
        result.staticPressure = this.convertUnitsService.value(result.staticPressure).from('inHg').to(settings.fanPressureMeasurement);
      }
    }
    if (settings.fanFlowRate != 'ft3/min') {
      result.gasVelocity = this.convertUnitsService.value(result.gasVelocity).from('ft/min').to('m/s');
      result.gasVolumeFlowRate = this.convertUnitsService.value(result.gasVolumeFlowRate).from('ft3/min').to(settings.fanFlowRate);
    }
    return result;
  }

  convertFan203Results(results: Fan203Results, settings: Settings): Fan203Results {
    if (settings.fanPressureMeasurement != 'inH2o') {
      results.pressureTotalCorrected = this.convertUnitsService.value(results.pressureTotalCorrected).from('inH2o').to(settings.fanPressureMeasurement);
      results.pressureStaticCorrected = this.convertUnitsService.value(results.pressureStaticCorrected).from('inH2o').to(settings.fanPressureMeasurement);
      results.staticPressureRiseCorrected = this.convertUnitsService.value(results.staticPressureRiseCorrected).from('inH2o').to(settings.fanPressureMeasurement);
    }
    if (settings.fanFlowRate != 'ft3/min') {
      results.flowCorrected = this.convertUnitsService.value(results.flowCorrected).from('ft3/min').to(settings.fanFlowRate);
    }

    if (settings.fanPowerMeasurement != 'hp') {
      results.powerCorrected = this.convertUnitsService.value(results.powerCorrected).from('hp').to(settings.fanPowerMeasurement);
    }
    return results;
  }

  convertFsatOutput(results: FsatOutput, settings: Settings): FsatOutput {
    if (settings.fanPowerMeasurement != 'hp') {
      results.fanShaftPower = this.convertUnitsService.value(results.fanShaftPower).from('hp').to(settings.fanPowerMeasurement);
      results.motorRatedPower = this.convertUnitsService.value(results.motorRatedPower).from('hp').to(settings.fanPowerMeasurement);
      results.motorShaftPower = this.convertUnitsService.value(results.motorShaftPower).from('hp').to(settings.fanPowerMeasurement);
    }
    return results;
  }


  convertFan203Inputs(inputs: Fan203Inputs, settings: Settings): Fan203Inputs {
    inputs.BaseGasDensity = this.convertBaseGasDensityInput(inputs.BaseGasDensity, settings);
    inputs.FanRatedInfo = this.convertFanRatedInfoInput(inputs.FanRatedInfo, settings);
    if (inputs.PlaneData.AddlTraversePlanes) {
      if (inputs.PlaneData.AddlTraversePlanes[0]) {
        inputs.PlaneData.AddlTraversePlanes[0] = this.convertPlaneInput(inputs.PlaneData.AddlTraversePlanes[0], settings);
      }
      if (inputs.PlaneData.AddlTraversePlanes[1]) {
        inputs.PlaneData.AddlTraversePlanes[1] = this.convertPlaneInput(inputs.PlaneData.AddlTraversePlanes[1], settings);
      }
      if (inputs.PlaneData.AddlTraversePlanes[2]) {
        inputs.PlaneData.AddlTraversePlanes[2] = this.convertPlaneInput(inputs.PlaneData.AddlTraversePlanes[2], settings);
      }
    }
    inputs.PlaneData.FanEvaseOrOutletFlange = this.convertPlaneInput(inputs.PlaneData.FanEvaseOrOutletFlange, settings);
    inputs.PlaneData.FanInletFlange = this.convertPlaneInput(inputs.PlaneData.FanInletFlange, settings);
    inputs.PlaneData.FlowTraverse = this.convertPlaneInput(inputs.PlaneData.FlowTraverse, settings);
    inputs.PlaneData.InletMstPlane = this.convertPlaneInput(inputs.PlaneData.InletMstPlane, settings);
    inputs.PlaneData.OutletMstPlane = this.convertPlaneInput(inputs.PlaneData.OutletMstPlane, settings);
    //pressure
    if (settings.fanPressureMeasurement != 'inH2o') {
      inputs.PlaneData.totalPressureLossBtwnPlanes1and4 = this.convertUnitsService.value(inputs.PlaneData.totalPressureLossBtwnPlanes1and4).from('inH2o').to(settings.fanPressureMeasurement);
      inputs.PlaneData.totalPressureLossBtwnPlanes2and5 = this.convertUnitsService.value(inputs.PlaneData.totalPressureLossBtwnPlanes2and5).from('inH2o').to(settings.fanPressureMeasurement);
      inputs.PlaneData.inletSEF = this.convertUnitsService.value(inputs.PlaneData.inletSEF).from('inH2o').to(settings.fanPressureMeasurement);
      inputs.PlaneData.outletSEF = this.convertUnitsService.value(inputs.PlaneData.outletSEF).from('inH2o').to(settings.fanPressureMeasurement);
    }
    return inputs;
  }


  convertBaseGasDensityInput(input: BaseGasDensity, settings: Settings): BaseGasDensity {
    if (settings.fanTemperatureMeasurement != 'F') {
      input.dryBulbTemp = this.convertUnitsService.value(input.dryBulbTemp).from('F').to(settings.fanTemperatureMeasurement);
      input.wetBulbTemp = this.convertUnitsService.value(input.wetBulbTemp).from('F').to(settings.fanTemperatureMeasurement);
      input.dewPoint = this.convertUnitsService.value(input.dewPoint).from('F').to(settings.fanTemperatureMeasurement);
    }
    if (settings.densityMeasurement != 'lbscf') {
      input.gasDensity = this.convertUnitsService.value(input.gasDensity).from('lbscf').to(settings.densityMeasurement);
    }
    if (settings.fanBarometricPressure != 'inHg') {
      input.barometricPressure = this.convertUnitsService.value(input.barometricPressure).from('inHg').to(settings.fanBarometricPressure);
    }
    if (settings.fanPressureMeasurement != 'inH2o') {
      input.staticPressure = this.convertUnitsService.value(input.staticPressure).from('inH2o').to(settings.fanPressureMeasurement);
    }
    if (settings.fanSpecificHeatGas != 'btulbF') {
      input.specificHeatGas = this.convertUnitsService.value(input.specificHeatGas).from('btulbF').to(settings.fanSpecificHeatGas);
    }
    return input;
  }

  convertFanRatedInfoInput(input: FanRatedInfo, settings: Settings): FanRatedInfo {
    if (settings.densityMeasurement != 'lbscf') {
      input.densityCorrected = this.convertUnitsService.value(input.densityCorrected).from('lbscf').to(settings.densityMeasurement)
    }
    if (settings.fanBarometricPressure != 'inHg') {
      input.pressureBarometricCorrected = this.convertUnitsService.value(input.pressureBarometricCorrected).from('inHg').to(settings.fanBarometricPressure);
      input.globalBarometricPressure = this.convertUnitsService.value(input.globalBarometricPressure).from('inHg').to(settings.fanBarometricPressure);
    }
    return input;
  }

  convertPlaneInput(input: Plane, settings: Settings): Plane {
    if (settings.fanBarometricPressure != 'inHg') {
      input.barometricPressure = this.convertUnitsService.value(input.barometricPressure).from('inHg').to(settings.fanBarometricPressure);
    }
    if (settings.fanFlowRate != 'ft3/min') {
      input.area = this.convertUnitsService.value(input.area).from('ft2').to('m2');
    }
    if (settings.fanTemperatureMeasurement != 'F') {
      input.dryBulbTemp = this.convertUnitsService.value(input.dryBulbTemp).from('F').to(settings.fanTemperatureMeasurement);
    }
    if (settings.fanPressureMeasurement != 'inH2o' && input.staticPressure) {
      input.staticPressure = this.convertUnitsService.value(input.staticPressure).from('inH2o').to(settings.fanPressureMeasurement);
    }
    return input;
  }

  convertNum(num: number, from: string, to: string): number {
    num = this.convertUnitsService.value(num).from(from).to(to);
    num = Number(num.toFixed(3));
    return num;
  }
}
