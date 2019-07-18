import { Injectable } from '@angular/core';
import { Fan203Inputs, FanRatedInfo, BaseGasDensity, Plane, PlaneData, Fan203Results, PlaneResults, PlaneResult } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
declare var fanAddon: any;

@Injectable()
export class ConvertFanAnalysisService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  fan203(input: Fan203Inputs, settings: Settings): Fan203Results {
    let inputCpy: Fan203Inputs = JSON.parse(JSON.stringify(input));
    inputCpy = this.convertFan203DataForCalculations(inputCpy, settings);
    inputCpy.FanShaftPower.sumSEF = inputCpy.PlaneData.inletSEF + inputCpy.PlaneData.outletSEF;
    let results: Fan203Results = fanAddon.fan203(inputCpy);
    results = this.convertFan203Results(results, settings);
    return results;
  }

  getPlaneResults(input: Fan203Inputs, settings: Settings): PlaneResults {
    let inputCpy: Fan203Inputs = JSON.parse(JSON.stringify(input));
    inputCpy = this.convertFan203DataForCalculations(inputCpy, settings);
    let results: PlaneResults = fanAddon.getPlaneResults(inputCpy);
    results = this.convertPlaneResults(results, settings);
    return results;
  }

  convertFan203DataForCalculations(input: Fan203Inputs, settings: Settings): Fan203Inputs {
    let inputCpy: Fan203Inputs = JSON.parse(JSON.stringify(input));
    inputCpy.FanRatedInfo = this.convertFanRatedInfoForCalculations(inputCpy.FanRatedInfo, settings);
    inputCpy.BaseGasDensity = this.convertGasDensityForCalculations(inputCpy.BaseGasDensity, settings);
    inputCpy.PlaneData = this.convertPlaneDataForCalculations(inputCpy.PlaneData, settings);
    return inputCpy;
  }

  convertFanRatedInfoForCalculations(inputs: FanRatedInfo, settings: Settings): FanRatedInfo {
    let inputCpy: FanRatedInfo = JSON.parse(JSON.stringify(inputs));
    if (settings.densityMeasurement !== 'lbscf') {
      inputCpy.densityCorrected = this.convertUnitsService.value(inputCpy.densityCorrected).from(settings.densityMeasurement).to('lbscf')
    }
    if (settings.fanBarometricPressure !== 'inHg') {
      inputCpy.pressureBarometricCorrected = this.convertUnitsService.value(inputCpy.pressureBarometricCorrected).from(settings.fanBarometricPressure).to('inHg');
      inputCpy.globalBarometricPressure = this.convertUnitsService.value(inputCpy.globalBarometricPressure).from(settings.fanBarometricPressure).to('inHg');
    }
    return inputCpy;
  }

  convertGasDensityForCalculations(inputs: BaseGasDensity, settings: Settings): BaseGasDensity {
    let inputCpy: BaseGasDensity = JSON.parse(JSON.stringify(inputs));
    //TODO: Convert to imperial for calcs
    if (settings.fanTemperatureMeasurement !== 'F') {
      inputCpy.dryBulbTemp = this.convertUnitsService.value(inputCpy.dryBulbTemp).from(settings.fanTemperatureMeasurement).to('F');
      inputCpy.wetBulbTemp = this.convertUnitsService.value(inputCpy.wetBulbTemp).from(settings.fanTemperatureMeasurement).to('F');
      inputCpy.dewPoint = this.convertUnitsService.value(inputCpy.dewPoint).from(settings.fanTemperatureMeasurement).to('F');
    }
    if (settings.densityMeasurement !== 'lbscf') {
      inputCpy.gasDensity = this.convertUnitsService.value(inputCpy.gasDensity).from(settings.densityMeasurement).to('lbscf');
    }
    if (settings.fanBarometricPressure !== 'inHg') {
      inputCpy.barometricPressure = this.convertUnitsService.value(inputCpy.barometricPressure).from(settings.fanBarometricPressure).to('inHg');
    }
    if (settings.fanPressureMeasurement !== 'inH2o') {
      inputCpy.staticPressure = this.convertUnitsService.value(inputCpy.staticPressure).from(settings.fanPressureMeasurement).to('inH2o');
    }
    if (settings.fanSpecificHeatGas !== 'btulbF') {
      inputCpy.specificHeatGas = this.convertUnitsService.value(inputCpy.specificHeatGas).from(settings.fanSpecificHeatGas).to('btulbF');
    }
    return inputCpy;
  }

  convertPlaneForCalculations(inputs: Plane, settings: Settings): Plane {
    let inputCpy: Plane = JSON.parse(JSON.stringify(inputs));
    if (settings.fanBarometricPressure !== 'inHg') {
      inputCpy.barometricPressure = this.convertUnitsService.value(inputCpy.barometricPressure).from(settings.fanBarometricPressure).to('inHg');
    }

    if (settings.fanFlowRate !== 'ft3/min') {
      inputCpy.area = this.convertUnitsService.value(inputCpy.area).from('m2').to('ft2');
    }
    if (settings.fanTemperatureMeasurement !== 'F') {
      inputCpy.dryBulbTemp = this.convertUnitsService.value(inputCpy.dryBulbTemp).from(settings.fanTemperatureMeasurement).to('F');
    }
    if (settings.fanPressureMeasurement !== 'inH2o' && inputCpy.staticPressure) {
      inputCpy.staticPressure = this.convertUnitsService.value(inputCpy.staticPressure).from(settings.fanPressureMeasurement).to('inH2o');
    }
    return inputCpy;
  }

  convertPlaneDataForCalculations(inputs: PlaneData, settings: Settings): PlaneData {
    let inputCpy: PlaneData = JSON.parse(JSON.stringify(inputs));
    if (settings.fanPressureMeasurement !== 'inH2o') {
      inputCpy.totalPressureLossBtwnPlanes1and4 = this.convertUnitsService.value(inputCpy.totalPressureLossBtwnPlanes1and4).from(settings.fanPressureMeasurement).to('inH2o');
      inputCpy.totalPressureLossBtwnPlanes2and5 = this.convertUnitsService.value(inputCpy.totalPressureLossBtwnPlanes2and5).from(settings.fanPressureMeasurement).to('inH2o');
      inputCpy.inletSEF = this.convertUnitsService.value(inputCpy.inletSEF).from(settings.fanPressureMeasurement).to('inH2o');
      inputCpy.outletSEF = this.convertUnitsService.value(inputCpy.outletSEF).from(settings.fanPressureMeasurement).to('inH2o');
    }
    inputCpy.FanInletFlange = this.convertPlaneForCalculations(inputCpy.FanInletFlange, settings);
    inputCpy.FanEvaseOrOutletFlange = this.convertPlaneForCalculations(inputCpy.FanEvaseOrOutletFlange, settings);
    inputCpy.FlowTraverse = this.convertPlaneForCalculations(inputCpy.FlowTraverse, settings);
    inputCpy.FlowTraverse.traverseData = this.convertTraverseData(inputCpy.FlowTraverse.traverseData, settings.fanPressureMeasurement, 'inH2o');
    inputCpy.InletMstPlane = this.convertPlaneForCalculations(inputCpy.InletMstPlane, settings);
    inputCpy.OutletMstPlane = this.convertPlaneForCalculations(inputCpy.OutletMstPlane, settings);
    if (inputCpy.AddlTraversePlanes) {
      if (inputCpy.AddlTraversePlanes[0]) {
        inputCpy.AddlTraversePlanes[0] = this.convertPlaneForCalculations(inputCpy.AddlTraversePlanes[0], settings);
        if (inputCpy.AddlTraversePlanes[0].traverseData) {
          inputCpy.AddlTraversePlanes[0].traverseData = this.convertTraverseData(inputCpy.AddlTraversePlanes[0].traverseData, settings.fanPressureMeasurement, 'inH2o');
        }
      }
      if (inputCpy.AddlTraversePlanes[1]) {
        inputCpy.AddlTraversePlanes[1] = this.convertPlaneForCalculations(inputCpy.AddlTraversePlanes[1], settings);
        if (inputCpy.AddlTraversePlanes[1].traverseData) {
          inputCpy.AddlTraversePlanes[1].traverseData = this.convertTraverseData(inputCpy.AddlTraversePlanes[1].traverseData, settings.fanPressureMeasurement, 'inH2o');
        }
      }
      if (inputCpy.AddlTraversePlanes[2]) {
        inputCpy.AddlTraversePlanes[2] = this.convertPlaneForCalculations(inputCpy.AddlTraversePlanes[2], settings);
        if (inputCpy.AddlTraversePlanes[2].traverseData) {
          inputCpy.AddlTraversePlanes[2].traverseData = this.convertTraverseData(inputCpy.AddlTraversePlanes[2].traverseData, settings.fanPressureMeasurement, 'inH2o');
        }
      }
    }
    return inputCpy;
  }

  convertTraverseData(data: Array<Array<number>>, from: string, to: string): Array<Array<number>> {
    let convertedData: Array<Array<number>> = new Array();
    data.forEach(dataRow => {
      let dataRowConv = new Array();
      dataRow.forEach(d => {
        dataRowConv.push(this.convertUnitsService.value(d).from(from).to(to));
      });
      convertedData.push(dataRowConv);
    });
    return convertedData;
  }

  convertFan203Results(results: Fan203Results, settings: Settings): Fan203Results {
    if (settings.fanPressureMeasurement !== 'inH2o') {
      results.pressureTotalCorrected = this.convertUnitsService.value(results.pressureTotalCorrected).from('inH2o').to(settings.fanPressureMeasurement);
      results.pressureStaticCorrected = this.convertUnitsService.value(results.pressureStaticCorrected).from('inH2o').to(settings.fanPressureMeasurement);
      results.staticPressureRiseCorrected = this.convertUnitsService.value(results.staticPressureRiseCorrected).from('inH2o').to(settings.fanPressureMeasurement);
    }
    if (settings.fanFlowRate !== 'ft3/min') {
      results.flowCorrected = this.convertUnitsService.value(results.flowCorrected).from('ft3/min').to(settings.fanFlowRate);
    }

    if (settings.fanPowerMeasurement !== 'hp') {
      results.powerCorrected = this.convertUnitsService.value(results.powerCorrected).from('hp').to(settings.fanPowerMeasurement);
    }
    return results;
  }

  convertPlaneResults(results: PlaneResults, settings: Settings): PlaneResults {
    results.FanInletFlange = this.convertPlaneResult(results.FanInletFlange, settings);
    results.FanOrEvaseOutletFlange = this.convertPlaneResult(results.FanOrEvaseOutletFlange, settings);
    results.FlowTraverse = this.convertPlaneResult(results.FlowTraverse, settings);
    results.InletMstPlane = this.convertPlaneResult(results.InletMstPlane, settings);
    results.OutletMstPlane = this.convertPlaneResult(results.OutletMstPlane, settings);
    results.AddlTraversePlanes.forEach(plane => {
      plane = this.convertPlaneResult(plane, settings);
    });
    return results;
  }

  convertPlaneResult(result: PlaneResult, settings: Settings): PlaneResult {
    if (settings.densityMeasurement !== 'lbscf') {
      result.gasDensity = this.convertUnitsService.value(result.gasDensity).from('lbscf').to(settings.densityMeasurement);
    }

    if (settings.fanPressureMeasurement !== 'inH2o') {
      result.gasTotalPressure = this.convertUnitsService.value(result.gasTotalPressure).from('inH2o').to(settings.fanPressureMeasurement);
      result.gasVelocityPressure = this.convertUnitsService.value(result.gasVelocityPressure).from('inH2o').to(settings.fanPressureMeasurement);
      if (result.staticPressure) {
        result.staticPressure = this.convertUnitsService.value(result.staticPressure).from('inH2o').to(settings.fanPressureMeasurement);
      }
    }
    if (settings.fanFlowRate !== 'ft3/min') {
      result.gasVelocity = this.convertUnitsService.value(result.gasVelocity).from('ft/min').to('m/s');
      result.gasVolumeFlowRate = this.convertUnitsService.value(result.gasVolumeFlowRate).from('ft3/min').to(settings.fanFlowRate);
    }
    return result;
  }
}
