import { Injectable } from '@angular/core';
import { Fan203Inputs, FanRatedInfo, BaseGasDensity, Plane, PlaneData, Fan203Results, PlaneResults, PlaneResult, PsychrometricResults, FanShaftPower } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';


@Injectable()
export class ConvertFanAnalysisService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  // fan203(input: Fan203Inputs, settings: Settings): Fan203Results {
  //   let inputCpy: Fan203Inputs = JSON.parse(JSON.stringify(input));
  //   inputCpy = this.convertFan203DataForCalculations(inputCpy, settings);
  //   inputCpy.FanShaftPower.sumSEF = inputCpy.PlaneData.inletSEF + inputCpy.PlaneData.outletSEF;
  //   inputCpy = this.updateInputDataForCalcs(inputCpy);
  //   let results: Fan203Results = this.fansSuiteApiService.fan203(inputCpy);
  //   results = this.convertFan203Results(results, settings);
  //   return results;
  // }

  // getPlaneResults(input: Fan203Inputs, settings: Settings): PlaneResults {
  //   let inputCpy: Fan203Inputs = JSON.parse(JSON.stringify(input));
  //   inputCpy = this.convertFan203DataForCalculations(inputCpy, settings);
  //   inputCpy = this.updateInputDataForCalcs(inputCpy);
  //   let results: PlaneResults = {};
  //   try {
  //     results = this.fansSuiteApiService.getPlaneResults(inputCpy);
  //     results = this.convertPlaneResults(results, settings);
  //   } catch(err) {
  //     results.error = true;
  //   }
  //   return results;
  // }

  updateInputDataForCalcs(inputCpy: Fan203Inputs): Fan203Inputs {
    if (!inputCpy.BaseGasDensity.barometricPressure || inputCpy.BaseGasDensity.inputType == 'custom') {
      inputCpy.BaseGasDensity.barometricPressure = inputCpy.PlaneData.FlowTraverse.barometricPressure;
    }
    //dry bulb
    if (!inputCpy.BaseGasDensity.dryBulbTemp || inputCpy.BaseGasDensity.inputType == 'custom') {
      inputCpy.BaseGasDensity.dryBulbTemp = inputCpy.PlaneData.FlowTraverse.dryBulbTemp;
    }
    //static pressure 
    if (!inputCpy.BaseGasDensity.staticPressure || inputCpy.BaseGasDensity.inputType == 'custom') {
      inputCpy.BaseGasDensity.staticPressure = inputCpy.PlaneData.FlowTraverse.staticPressure;
    }
    if (inputCpy.FanRatedInfo.traversePlanes == 1) {
      inputCpy.PlaneData.AddlTraversePlanes = [];
    } else if (inputCpy.FanRatedInfo.traversePlanes == 2) {
      inputCpy.PlaneData.AddlTraversePlanes = [inputCpy.PlaneData.AddlTraversePlanes[0]];
    }
    return inputCpy;
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
    inputCpy.densityCorrected = this.convertNum(inputCpy.densityCorrected, settings.densityMeasurement, 'lbscf');
    inputCpy.pressureBarometricCorrected = this.convertNum(inputCpy.pressureBarometricCorrected, settings.fanBarometricPressure, 'inHg');
    inputCpy.globalBarometricPressure = this.convertNum(inputCpy.globalBarometricPressure, settings.fanBarometricPressure, 'inHg');
    return inputCpy;
  }

  convertGasDensityForCalculations(inputs: BaseGasDensity, settings: Settings): BaseGasDensity {
    let inputCpy: BaseGasDensity = JSON.parse(JSON.stringify(inputs));
    inputCpy.dryBulbTemp = this.convertNum(inputCpy.dryBulbTemp, settings.fanTemperatureMeasurement, 'F');
    inputCpy.wetBulbTemp = this.convertNum(inputCpy.wetBulbTemp, settings.fanTemperatureMeasurement, 'F');
    inputCpy.dewPoint = this.convertNum(inputCpy.dewPoint, settings.fanTemperatureMeasurement, 'F');
    inputCpy.gasDensity = this.convertNum(inputCpy.gasDensity, settings.densityMeasurement, 'lbscf');
    inputCpy.barometricPressure = this.convertNum(inputCpy.barometricPressure, settings.fanBarometricPressure, 'inHg');
    inputCpy.staticPressure = this.convertNum(inputCpy.staticPressure, settings.fanPressureMeasurement, 'inH2o');
    inputCpy.specificHeatGas = this.convertNum(inputCpy.specificHeatGas, settings.fanSpecificHeatGas, 'btulbF');
    return inputCpy;
  }

  convertBaseGasDensityDefaults(inputs: BaseGasDensity, settings: Settings): BaseGasDensity{
    let inputCpy: BaseGasDensity = JSON.parse(JSON.stringify(inputs));
    inputCpy.dryBulbTemp = this.convertNum(inputCpy.dryBulbTemp, 'F', settings.fanTemperatureMeasurement);
    inputCpy.wetBulbTemp = this.convertNum(inputCpy.wetBulbTemp, 'F', settings.fanTemperatureMeasurement);
    inputCpy.dewPoint = this.convertNum(inputCpy.dewPoint, 'F', settings.fanTemperatureMeasurement);
    inputCpy.gasDensity = this.convertNum(inputCpy.gasDensity, 'lbscf', settings.densityMeasurement);
    inputCpy.barometricPressure = this.convertNum(inputCpy.barometricPressure, 'inHg', settings.fanBarometricPressure);
    inputCpy.staticPressure = this.convertNum(inputCpy.staticPressure, 'inH2o', settings.fanPressureMeasurement);
    inputCpy.specificHeatGas = this.convertNum(inputCpy.specificHeatGas, 'btulbF', settings.fanSpecificHeatGas);
    return inputCpy;
  }


  convertPlaneForCalculations(inputs: Plane, settings: Settings): Plane {
    let inputCpy: Plane = JSON.parse(JSON.stringify(inputs));
    inputCpy.barometricPressure = this.convertNum(inputCpy.barometricPressure, settings.fanBarometricPressure, 'inHg');
    if (settings.fanFlowRate !== 'ft3/min') {
      inputCpy.area = this.convertNum(inputCpy.area, 'm2', 'ft2');
    }
    inputCpy.dryBulbTemp = this.convertNum(inputCpy.dryBulbTemp, settings.fanTemperatureMeasurement, 'F');
    inputCpy.staticPressure = this.convertNum(inputCpy.staticPressure, settings.fanPressureMeasurement, 'inH2o');
    return inputCpy;
  }

  convertPlaneDataForCalculations(inputs: PlaneData, settings: Settings): PlaneData {
    let inputCpy: PlaneData = JSON.parse(JSON.stringify(inputs));
    inputCpy.totalPressureLossBtwnPlanes1and4 = this.convertNum(inputCpy.totalPressureLossBtwnPlanes1and4, settings.fanPressureMeasurement, 'inH2o');
    inputCpy.totalPressureLossBtwnPlanes2and5 = this.convertNum(inputCpy.totalPressureLossBtwnPlanes2and5, settings.fanPressureMeasurement, 'inH2o');
    inputCpy.inletSEF = this.convertNum(inputCpy.inletSEF, settings.fanPressureMeasurement, 'inH2o');
    inputCpy.outletSEF = this.convertNum(inputCpy.outletSEF, settings.fanPressureMeasurement, 'inH2o');

    inputCpy.FanInletFlange = this.convertPlaneForCalculations(inputCpy.FanInletFlange, settings);
    inputCpy.FanEvaseOrOutletFlange = this.convertPlaneForCalculations(inputCpy.FanEvaseOrOutletFlange, settings);
    inputCpy.FlowTraverse = this.convertPlaneForCalculations(inputCpy.FlowTraverse, settings);
    inputCpy.FlowTraverse = this.convertTraverseData(inputCpy.FlowTraverse, settings.fanPressureMeasurement, 'inH2o');

    inputCpy.InletMstPlane = this.convertPlaneForCalculations(inputCpy.InletMstPlane, settings);
    inputCpy.OutletMstPlane = this.convertPlaneForCalculations(inputCpy.OutletMstPlane, settings);

    if (inputCpy.AddlTraversePlanes) {
      inputCpy.AddlTraversePlanes = inputCpy.AddlTraversePlanes.map(plane => {
        plane = this.convertPlaneForCalculations(plane, settings);
        plane = this.convertTraverseData(plane, settings.fanPressureMeasurement, 'inH2o');
        return plane;
      });
    }
    return inputCpy;
  }

  convertTraverseData(plane: Plane, from: string, to: string): Plane {
    if (plane.traverseData) {
      let convertedData: Array<Array<number>> = new Array();
      plane.traverseData.forEach(dataRow => {
        let dataRowConv = new Array();
        dataRow.forEach(d => {
          dataRowConv.push(this.convertNum(d, from, to));
        });
        convertedData.push(dataRowConv);
      });
      plane.traverseData = convertedData;
    }

    if (plane.staticPressureData) {
      let convertedData: Array<Array<number>> = new Array();
      plane.staticPressureData.forEach(dataRow => {
        let dataRowConv = new Array();
        dataRow.forEach(d => {
          dataRowConv.push(this.convertNum(d, from, to));
        });
        convertedData.push(dataRowConv);
      });
      plane.staticPressureData = convertedData;
    }

    return plane;
  }

  convertFan203Results(results: Fan203Results, settings: Settings): Fan203Results {
    results.pressureTotalCorrected = this.convertNum(results.pressureTotalCorrected, 'inH2o', settings.fanPressureMeasurement);
    results.pressureStaticCorrected = this.convertNum(results.pressureStaticCorrected, 'inH2o', settings.fanPressureMeasurement);
    results.staticPressureRiseCorrected = this.convertNum(results.staticPressureRiseCorrected, 'inH2o', settings.fanPressureMeasurement);
    results.flowCorrected = this.convertNum(results.flowCorrected, 'ft3/min', settings.fanFlowRate);
    results.powerCorrected = this.convertNum(results.powerCorrected, 'hp', settings.fanPowerMeasurement);
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
    result.gasDensity = this.convertNum(result.gasDensity, 'lbscf', settings.densityMeasurement);
    result.gasTotalPressure = this.convertNum(result.gasTotalPressure, 'inH2o', settings.fanPressureMeasurement);
    result.gasVelocityPressure = this.convertNum(result.gasVelocityPressure, 'inH2o', settings.fanPressureMeasurement);
    result.staticPressure = this.convertNum(result.staticPressure, 'inH2o', settings.fanPressureMeasurement);
    result.gasVolumeFlowRate = this.convertNum(result.gasVolumeFlowRate, 'ft3/min', settings.fanFlowRate);
    if (settings.fanFlowRate !== 'ft3/min') {
      result.gasVelocity = this.convertNum(result.gasVelocity, 'ft/min', 'm/s');
    }
    return result;
  }

  //inputs
  convertFan203Inputs(inputs: Fan203Inputs, settings: Settings): Fan203Inputs {
    inputs.BaseGasDensity = this.convertBaseGasDensityInput(inputs.BaseGasDensity, settings);
    inputs.FanRatedInfo = this.convertFanRatedInfoInput(inputs.FanRatedInfo, settings);
    if (inputs.PlaneData.AddlTraversePlanes) {
      inputs.PlaneData.AddlTraversePlanes = inputs.PlaneData.AddlTraversePlanes.map(plane => {
        plane = this.convertPlaneInput(plane, settings);
        plane = this.convertTraverseData(plane, 'inH2o', settings.fanPressureMeasurement);
        return plane;
      });
    }
    inputs.PlaneData.FanEvaseOrOutletFlange = this.convertPlaneInput(inputs.PlaneData.FanEvaseOrOutletFlange, settings);
    inputs.PlaneData.FanInletFlange = this.convertPlaneInput(inputs.PlaneData.FanInletFlange, settings);
    inputs.PlaneData.FlowTraverse = this.convertPlaneInput(inputs.PlaneData.FlowTraverse, settings);
    inputs.PlaneData.FlowTraverse = this.convertTraverseData(inputs.PlaneData.FlowTraverse, 'inH2o', settings.fanPressureMeasurement);
    inputs.PlaneData.InletMstPlane = this.convertPlaneInput(inputs.PlaneData.InletMstPlane, settings);
    inputs.PlaneData.OutletMstPlane = this.convertPlaneInput(inputs.PlaneData.OutletMstPlane, settings);

    inputs.PlaneData.totalPressureLossBtwnPlanes1and4 = this.convertNum(inputs.PlaneData.totalPressureLossBtwnPlanes1and4, 'inH2o', settings.fanPressureMeasurement);
    inputs.PlaneData.totalPressureLossBtwnPlanes2and5 = this.convertNum(inputs.PlaneData.totalPressureLossBtwnPlanes2and5, 'inH2o', settings.fanPressureMeasurement);
    inputs.PlaneData.inletSEF = this.convertNum(inputs.PlaneData.inletSEF, 'inH2o', settings.fanPressureMeasurement);
    inputs.PlaneData.outletSEF = this.convertNum(inputs.PlaneData.outletSEF, 'inH2o', settings.fanPressureMeasurement);
    return inputs;
  }

  convertBaseGasDensityInput(input: BaseGasDensity, settings: Settings): BaseGasDensity {
    input.dryBulbTemp = this.convertNum(input.dryBulbTemp, 'F', settings.fanTemperatureMeasurement);
    input.wetBulbTemp = this.convertNum(input.wetBulbTemp, 'F', settings.fanTemperatureMeasurement);
    input.dewPoint = this.convertNum(input.dewPoint, 'F', settings.fanTemperatureMeasurement);
    input.gasDensity = this.convertNum(input.gasDensity, 'lbscf', settings.densityMeasurement);
    input.barometricPressure = this.convertNum(input.barometricPressure, 'inHg', settings.fanBarometricPressure);
    input.staticPressure = this.convertNum(input.staticPressure, 'inH2o', settings.fanPressureMeasurement);
    input.specificHeatGas = this.convertNum(input.specificHeatGas, 'btulbF', settings.fanSpecificHeatGas);
    return input;
  }

  convertFanRatedInfoInput(input: FanRatedInfo, settings: Settings): FanRatedInfo {
    input.densityCorrected = this.convertNum(input.densityCorrected, 'lbscf', settings.densityMeasurement);
    input.pressureBarometricCorrected = this.convertNum(input.pressureBarometricCorrected, 'inHg', settings.fanBarometricPressure);
    input.globalBarometricPressure = this.convertNum(input.globalBarometricPressure, 'inHg', settings.fanBarometricPressure);
    return input;
  }

  convertPlaneInput(input: Plane, settings: Settings): Plane {
    input.barometricPressure = this.convertNum(input.barometricPressure, 'inHg', settings.fanBarometricPressure);
    if (settings.fanFlowRate !== 'ft3/min' && input.area) {
      input.length = this.convertNum(input.length, 'in', 'mm');
      input.width = this.convertNum(input.width, 'in', 'mm');
      input.area = this.convertNum(input.area, 'ft2', 'm2');
    }
    input.dryBulbTemp = this.convertNum(input.dryBulbTemp, 'F', settings.fanTemperatureMeasurement);
    input.staticPressure = this.convertNum(input.staticPressure, 'inH2o', settings.fanPressureMeasurement);
    if (input.userDefinedStaticPressure) {
      input.userDefinedStaticPressure = this.convertNum(input.userDefinedStaticPressure, 'inH2o', settings.fanPressureMeasurement);
    }
    return input;
  }

  convertPsychrometricResults(input: PsychrometricResults, settings: Settings): PsychrometricResults {
    input.gasDensity = this.convertNum(input.gasDensity, 'lbscf', settings.densityMeasurement);
    input.relativeHumidity = input.relativeHumidity * 100;
    //metric/imperial
    if (settings.unitsOfMeasure == 'Metric') {
      input.absolutePressure = this.convertNum(input.absolutePressure, 'inHg', 'Pa');
      input.saturationPressure = this.convertNum(input.saturationPressure, 'inHg', 'Pa')
      input.specificVolume = this.convertNum(input.specificVolume, 'ft3lb', 'm3kg');
      input.enthalpy = this.convertNum(input.enthalpy, 'btuLb', 'kJkg');
      input.wetBulbTemp = this.convertNum(input.wetBulbTemp, 'F', settings.fanTemperatureMeasurement);
    }

    input.dewPoint = this.convertNum(input.dewPoint, 'F', settings.fanTemperatureMeasurement);
    return input;
  }

  convertNum(num: number, from: string, to: string): number {
    if (from != to && num) {
      num = this.convertUnitsService.value(num).from(from).to(to);
      num = this.convertUnitsService.roundVal(num, 4);
    }
    return num;
  }

}
