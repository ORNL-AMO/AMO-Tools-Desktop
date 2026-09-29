import { Injectable } from '@angular/core';
import { FanEfficiencyInputs } from '../calculator/fans/fan-efficiency/fan-efficiency.service';
import { BaseGasDensity, CompressibilityFactor, Fan203Inputs, Fan203Results, FsatInput, FsatOutput, Plane, PlaneResult, PlaneResults, PsychrometricResults } from '../shared/models/fans';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import {
  type BaseGasDensity as SuiteBaseGasDensity,
  type BaseGasDensityInputType,
  type CompressibilityFactor as SuiteCompressibilityFactor,
  type DoubleVector,
  type DoubleVector2D,
  type Drive,
  type Fan203,
  type Fan203Output,
  type Fan203Results as SuiteFan203Results,
  type FanInput,
  type FanOutput,
  type FanRatedInfo,
  type FanResult,
  type FanShaftPower,
  type FanType,
  type FieldDataBaseline,
  type FieldDataModified,
  type FlangePlane,
  type GasType,
  type LineFrequency,
  type LoadEstimationMethod,
  type Motor,
  type MotorEfficiencyClass,
  type MstPlane,
  type OptimalFanEfficiency,
  type PlaneData,
  type PlaneDataNodeBindingData,
  type PlaneDataNodeBindingOutput,
  type TraversePlane,
  type TraversePlaneVector,
} from 'measur-tools-suite';
@Injectable()
export class FansSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService,
    private toolsSuiteApiService: ToolsSuiteApiService
  ) { }

  //results
  calculateExisting(input: FsatInput): FsatOutput {
    //enums
    let driveEnum: Drive = this.suiteApiHelperService.getDriveEnum(input.drive);
    let lineFrequencyEnum: LineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(input.lineFrequency);
    let efficiencyClassEnum: MotorEfficiencyClass = this.suiteApiHelperService.getMotorEfficiencyEnum(input.efficiencyClass);
    let loadEstimationMethodEnum: LoadEstimationMethod = this.suiteApiHelperService.getLoadEstimationMethod(input.loadEstimationMethod);
    //convert from percent to fraction
    let specifiedDriveEfficiencyFraction: number = input.specifiedDriveEfficiency / 100;
    let specifiedEfficiencyFraction: number = input.specifiedEfficiency / 100;
    input.compressibilityFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.compressibilityFactor);
    let fanInput: FanInput = new this.toolsSuiteApiService.ToolsSuiteModule.FanInput(input.fanSpeed, input.airDensity, driveEnum, specifiedDriveEfficiencyFraction);
    let motor: Motor = new this.toolsSuiteApiService.ToolsSuiteModule.Motor(lineFrequencyEnum, input.motorRatedPower, input.motorRpm, efficiencyClassEnum, specifiedEfficiencyFraction, input.motorRatedVoltage, input.fullLoadAmps, input.sizeMargin);
    let baselineFieldData: FieldDataBaseline = new this.toolsSuiteApiService.ToolsSuiteModule.FieldDataBaseline(input.measuredPower, input.measuredVoltage, input.measuredAmps, input.flowRate, input.inletPressure, input.outletPressure, input.compressibilityFactor, loadEstimationMethodEnum, input.velocityPressure);
    let fanResult: FanResult = new this.toolsSuiteApiService.ToolsSuiteModule.FanResult(fanInput, motor, input.operatingHours, input.unitCost);
    let output: FanOutput = fanResult.calculateExisting(baselineFieldData);
    let results: FsatOutput = {
      fanEfficiency: output.fanEfficiency,
      motorRatedPower: output.motorRatedPower,
      motorShaftPower: output.motorShaftPower,
      fanShaftPower: output.fanShaftPower,
      motorEfficiency: output.motorEfficiency,
      motorPowerFactor: output.motorPowerFactor,
      motorCurrent: output.motorCurrent,
      motorPower: output.motorPower,
      loadFactor: output.loadFactor,
      driveEfficiency: output.driveEfficiency,
      annualEnergy: output.annualEnergy,
      annualCost: output.annualCost,
      fanEnergyIndex: output.fanEnergyIndex,
      //modified
      estimatedFLA: output.estimatedFLA,
      percentSavings: undefined,
      energySavings: undefined,
      annualSavings: undefined,
      planeResults: undefined,
      psychrometricResults: undefined,
      co2EmissionsOutput: undefined,
      emissionsSavings: undefined,
    }
    output.delete();
    results = this.convertOutputPercentages(results);
    fanInput.delete();
    motor.delete();
    baselineFieldData.delete();
    fanResult.delete();
    return results;
  }

  calculateModified(input: FsatInput): FsatOutput {
    //enums
    let driveEnum: Drive = this.suiteApiHelperService.getDriveEnum(input.drive);
    let lineFrequencyEnum: LineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(input.lineFrequency);
    let efficiencyClassEnum: MotorEfficiencyClass = this.suiteApiHelperService.getMotorEfficiencyEnum(input.efficiencyClass);
    //convert from percent to fraction
    let specifiedDriveEfficiencyFraction: number = input.specifiedDriveEfficiency / 100;
    let fanEfficiencyFraction: number = input.fanEfficiency / 100;
    let specifiedEfficiencyFraction: number = input.specifiedEfficiency / 100;

    let fanInput: FanInput = new this.toolsSuiteApiService.ToolsSuiteModule.FanInput(input.fanSpeed, input.airDensity, driveEnum, specifiedDriveEfficiencyFraction);
    // No default on new modification
    input.compressibilityFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.compressibilityFactor);
    let fanFieldData: FieldDataModified = new this.toolsSuiteApiService.ToolsSuiteModule.FieldDataModified(input.measuredVoltage, input.measuredAmps, input.flowRate, input.inletPressure, input.outletPressure, input.compressibilityFactor, input.velocityPressure);
    let motor: Motor = new this.toolsSuiteApiService.ToolsSuiteModule.Motor(lineFrequencyEnum, input.motorRatedPower, input.motorRpm, efficiencyClassEnum, specifiedEfficiencyFraction, input.motorRatedVoltage, input.fullLoadAmps, input.sizeMargin);
    let fanResult: FanResult = new this.toolsSuiteApiService.ToolsSuiteModule.FanResult(fanInput, motor, input.operatingHours, input.unitCost);
    let output: FanOutput = fanResult.calculateModified(fanFieldData, fanEfficiencyFraction);
    let results: FsatOutput = {
      fanEfficiency: output.fanEfficiency,
      motorRatedPower: output.motorRatedPower,
      motorShaftPower: output.motorShaftPower,
      fanShaftPower: output.fanShaftPower,
      motorEfficiency: output.motorEfficiency,
      motorPowerFactor: output.motorPowerFactor,
      motorCurrent: output.motorCurrent,
      motorPower: output.motorPower,
      loadFactor: output.loadFactor,
      driveEfficiency: output.driveEfficiency,
      annualEnergy: output.annualEnergy,
      annualCost: output.annualCost,
      fanEnergyIndex: output.fanEnergyIndex,
      //modified
      estimatedFLA: output.estimatedFLA,
      percentSavings: undefined,
      energySavings: undefined,
      annualSavings: undefined,
      planeResults: undefined,
      psychrometricResults: undefined,
      co2EmissionsOutput: undefined,
      emissionsSavings: undefined,
    }
    output.delete();
    results = this.convertOutputPercentages(results);
    fanInput.delete();
    fanFieldData.delete();
    motor.delete();
    fanResult.delete();
    return results;
  }


  convertOutputPercentages(output: FsatOutput): FsatOutput {
    //perform conversions for return object
    output.fanEfficiency = output.fanEfficiency * 100;
    output.motorEfficiency = output.motorEfficiency * 100;
    output.motorPowerFactor = output.motorPowerFactor * 100;
    output.driveEfficiency = output.driveEfficiency * 100;
    return output;
  }

  //gas density
  getBaseGasDensityDewPoint(inputs: BaseGasDensity): PsychrometricResults {
    let gasType: GasType = this.suiteApiHelperService.getGasTypeEnum(inputs.gasType);
    let inputType: BaseGasDensityInputType = this.suiteApiHelperService.getBasGensityInputTypeEnum(inputs.inputType);
    let result: PsychrometricResults;
    if (inputs.dryBulbTemp != undefined && inputs.staticPressure != undefined && inputs.barometricPressure != undefined && inputs.dewPoint != undefined && gasType != undefined && inputType != undefined && inputs.specificGravity != undefined) {
      let dewPointInstance: SuiteBaseGasDensity = new this.toolsSuiteApiService.ToolsSuiteModule.BaseGasDensity(inputs.dryBulbTemp, inputs.staticPressure, inputs.barometricPressure, inputs.dewPoint, gasType, inputType, inputs.specificGravity);
      result = this.getGasDensityPsychometricResults(dewPointInstance);
      dewPointInstance.delete();
    }
    return result;
  }

  getBaseGasDensityRelativeHumidity(inputs: BaseGasDensity): PsychrometricResults {
    let gasType: GasType = this.suiteApiHelperService.getGasTypeEnum(inputs.gasType);
    let inputType: BaseGasDensityInputType = this.suiteApiHelperService.getBasGensityInputTypeEnum(inputs.inputType);
    let result: PsychrometricResults;
    if (inputs.dryBulbTemp != undefined && inputs.staticPressure != undefined && inputs.barometricPressure != undefined && inputs.relativeHumidity != undefined && gasType != undefined && inputType != undefined && inputs.specificGravity != undefined) {
      let relativeHumidityInstance: SuiteBaseGasDensity = new this.toolsSuiteApiService.ToolsSuiteModule.BaseGasDensity(inputs.dryBulbTemp, inputs.staticPressure, inputs.barometricPressure, inputs.relativeHumidity, gasType, inputType, inputs.specificGravity);
      result = this.getGasDensityPsychometricResults(relativeHumidityInstance);
      relativeHumidityInstance.delete();
    }
    return result
  }

  getBaseGasDensityWetBulb(inputs: BaseGasDensity): PsychrometricResults {
    let gasType: GasType = this.suiteApiHelperService.getGasTypeEnum(inputs.gasType);
    let inputType: BaseGasDensityInputType = this.suiteApiHelperService.getBasGensityInputTypeEnum(inputs.inputType);
    let result: PsychrometricResults;
    if (inputs.dryBulbTemp != undefined && inputs.staticPressure != undefined && inputs.barometricPressure != undefined && inputs.wetBulbTemp != undefined && gasType != undefined && inputType != undefined && inputs.specificGravity != undefined && inputs.specificHeatGas != undefined) {
      let wetBulbInstance: SuiteBaseGasDensity = new this.toolsSuiteApiService.ToolsSuiteModule.BaseGasDensity(inputs.dryBulbTemp, inputs.staticPressure, inputs.barometricPressure, inputs.wetBulbTemp, gasType, inputType, inputs.specificGravity, inputs.specificHeatGas);
      result = this.getGasDensityPsychometricResults(wetBulbInstance);
      wetBulbInstance.delete();
    }
    return result
  }

  getGasDensityPsychometricResults(gasDensityInstance: SuiteBaseGasDensity): PsychrometricResults {
    return {
      gasDensity: gasDensityInstance.getGasDensity(),
      absolutePressure: gasDensityInstance.getAbsolutePressureIn(),
      saturatedHumidity: gasDensityInstance.getSaturatedHumidityRatio(),
      saturationDegree: gasDensityInstance.getDegreeOfSaturation(),
      humidityRatio: gasDensityInstance.getHumidityRatio(),
      specificVolume: gasDensityInstance.getSpecificVolume(),
      enthalpy: gasDensityInstance.getEnthalpy(),
      dewPoint: gasDensityInstance.getDewPoint(),
      relativeHumidity: gasDensityInstance.getRelativeHumidity(),
      saturationPressure: gasDensityInstance.getSaturationPressure(),
      wetBulbTemp: gasDensityInstance.getWetBulbTemp(),
      // barometricPressure?: number,
      // dryBulbTemp?: number;
    }
  }


  getVelocityPressureData(inputs: Plane): { pv3: number, percent75Rule: number } {
    let traversePlaneTraverseData: DoubleVector2D = new this.toolsSuiteApiService.ToolsSuiteModule.DoubleVector2D();
    let doubleVector: DoubleVector;

    let traverseData: Array<Array<number>> = inputs.traverseData.map(row => {
      return row.map(columnVal => Number(columnVal));
    });
    traverseData.forEach(dataRow => {
      doubleVector = this.suiteApiHelperService.returnDoubleVector(dataRow);
      traversePlaneTraverseData.push_back(doubleVector);
      doubleVector.delete();
    });
    let traversePlaneInstance: TraversePlane = new this.toolsSuiteApiService.ToolsSuiteModule.TraversePlane(inputs.area, inputs.dryBulbTemp, inputs.barometricPressure, inputs.staticPressure, inputs.pitotTubeCoefficient, traversePlaneTraverseData);

    let pv3: number = traversePlaneInstance.getPv3Value();
    let percent75Rule: number = traversePlaneInstance.get75percentRule() * 100; // Convert to percentage
    traversePlaneInstance.delete();
    traversePlaneTraverseData.delete();
    return { pv3: pv3, percent75Rule: percent75Rule };
  }


  getPlaneResults(input: Fan203Inputs): PlaneResults {
    //plane data
    let planeDataInstance: PlaneData = this.getPlaneDataInstance(input);
    //BaseGasDensity
    let gasType: GasType = this.suiteApiHelperService.getGasTypeEnum(input.BaseGasDensity.gasType);

    let dryBulbTemp: number = input.BaseGasDensity.dryBulbTemp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.BaseGasDensity.dryBulbTemp);
    let staticPressure: number = input.BaseGasDensity.staticPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.BaseGasDensity.staticPressure);
    let barometricPressure: number = input.BaseGasDensity.barometricPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.BaseGasDensity.barometricPressure);
    let gasDensity: number = input.BaseGasDensity.gasDensity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.BaseGasDensity.gasDensity);

    let baseGasDensityInstance: SuiteBaseGasDensity = new this.toolsSuiteApiService.ToolsSuiteModule.BaseGasDensity(
      dryBulbTemp,
      staticPressure,
      barometricPressure,
      gasDensity,
      gasType
    );
    let output: PlaneDataNodeBindingOutput = this.toolsSuiteApiService.ToolsSuiteModule.PlaneDataNodeBindingCalculate(planeDataInstance, baseGasDensityInstance);
    let AddlTraversePlanes: Array<PlaneResult> = new Array();
    for (let i: number = 0; i < output.addlTravPlanes.size(); i++) { // error: length = 0, was .size
      let traversPlane: PlaneDataNodeBindingData = output.addlTravPlanes.get(i)
      AddlTraversePlanes.push({
        gasDensity: traversPlane.gasDensity,
        gasTotalPressure: traversPlane.gasTotalPressure,
        gasVelocity: traversPlane.gasVelocity,
        gasVelocityPressure: traversPlane.gasVelocityPressure,
        gasVolumeFlowRate: traversPlane.gasVolumeFlowRate,
        staticPressure: undefined,
      });
      traversPlane.delete();
    }
    let results: PlaneResults = {
      AddlTraversePlanes: AddlTraversePlanes,
      FanInletFlange: {
        gasDensity: output.fanInletFlange.gasDensity,
        gasTotalPressure: output.fanInletFlange.gasTotalPressure,
        gasVelocity: output.fanInletFlange.gasVelocity,
        gasVelocityPressure: output.fanInletFlange.gasVelocityPressure,
        gasVolumeFlowRate: output.fanInletFlange.gasVolumeFlowRate,
        staticPressure: output.fanInletFlange.staticPressure,
      },
      FanOrEvaseOutletFlange: {
        gasDensity: output.fanOrEvaseOutletFlange.gasDensity,
        gasTotalPressure: output.fanOrEvaseOutletFlange.gasTotalPressure,
        gasVelocity: output.fanOrEvaseOutletFlange.gasVelocity,
        gasVelocityPressure: output.fanOrEvaseOutletFlange.gasVelocityPressure,
        gasVolumeFlowRate: output.fanOrEvaseOutletFlange.gasVolumeFlowRate,
        staticPressure: output.fanOrEvaseOutletFlange.staticPressure,
      },
      FlowTraverse: {
        gasDensity: output.flowTraverse.gasDensity,
        gasTotalPressure: output.flowTraverse.gasTotalPressure,
        gasVelocity: output.flowTraverse.gasVelocity,
        gasVelocityPressure: output.flowTraverse.gasVelocityPressure,
        gasVolumeFlowRate: output.flowTraverse.gasVolumeFlowRate,
        staticPressure: undefined,
      },
      InletMstPlane: {
        gasDensity: output.inletMstPlane.gasDensity,
        gasTotalPressure: output.inletMstPlane.gasTotalPressure,
        gasVelocity: output.inletMstPlane.gasVelocity,
        gasVelocityPressure: output.inletMstPlane.gasVelocityPressure,
        gasVolumeFlowRate: output.inletMstPlane.gasVolumeFlowRate,
        staticPressure: undefined,
      },
      OutletMstPlane: {
        gasDensity: output.outletMstPlane.gasDensity,
        gasTotalPressure: output.outletMstPlane.gasTotalPressure,
        gasVelocity: output.outletMstPlane.gasVelocity,
        gasVelocityPressure: output.outletMstPlane.gasVelocityPressure,
        gasVolumeFlowRate: output.outletMstPlane.gasVolumeFlowRate,
        staticPressure: undefined,
      },
    }
    output.fanInletFlange.delete();
    output.fanOrEvaseOutletFlange.delete();
    output.flowTraverse.delete();
    output.inletMstPlane.delete();
    output.outletMstPlane.delete();
    output.delete();

    //release memory
    baseGasDensityInstance.delete();
    planeDataInstance.delete();
    return results;
  }

  fan203(input: Fan203Inputs): Fan203Results {
    //FanRatedInfo
    let fanRatedInfoInstance: FanRatedInfo = new this.toolsSuiteApiService.ToolsSuiteModule.FanRatedInfo(input.FanRatedInfo.fanSpeed, input.FanRatedInfo.motorSpeed, input.FanRatedInfo.fanSpeedCorrected, input.FanRatedInfo.densityCorrected, input.FanRatedInfo.pressureBarometricCorrected);
    //BaseGasDensity
    let gasType: GasType = this.suiteApiHelperService.getGasTypeEnum(input.BaseGasDensity.gasType);
    let baseGasDensityInstance: SuiteBaseGasDensity = new this.toolsSuiteApiService.ToolsSuiteModule.BaseGasDensity(input.BaseGasDensity.dryBulbTemp, input.BaseGasDensity.staticPressure, input.BaseGasDensity.barometricPressure, input.BaseGasDensity.gasDensity, gasType);
    //FanShaftPower
    let fanShaftPowerInstance: FanShaftPower = new this.toolsSuiteApiService.ToolsSuiteModule.FanShaftPower(input.FanShaftPower.motorShaftPower, input.FanShaftPower.efficiencyMotor, input.FanShaftPower.efficiencyVFD, input.FanShaftPower.efficiencyBelt, input.FanShaftPower.sumSEF);
    //plane data instance
    let planeDataInstance: PlaneData = this.getPlaneDataInstance(input);
    //Calculation procedure
    let fan203Instance: Fan203 = new this.toolsSuiteApiService.ToolsSuiteModule.Fan203(fanRatedInfoInstance, planeDataInstance, baseGasDensityInstance, fanShaftPowerInstance);
    let fan203Output: Fan203Output = fan203Instance.calculate();
    let results: Fan203Results = {
      fanEfficiencyTotalPressure: fan203Output.fanEfficiencyTotalPressure,
      fanEfficiencyStaticPressure: fan203Output.fanEfficiencyStaticPressure,
      fanEfficiencyStaticPressureRise: fan203Output.fanEfficiencyStaticPressureRise,
      flowCorrected: fan203Output.converted.flow,
      flow: fan203Output.asTested.flow,
      pressureTotal: fan203Output.asTested.pressureTotal,
      pressureTotalCorrected: fan203Output.converted.pressureTotal,
      pressureStatic: fan203Output.asTested.pressureStatic,
      pressureStaticCorrected: fan203Output.converted.pressureStatic,
      staticPressureRiseCorrected: fan203Output.converted.staticPressureRise,
      staticPressureRise: fan203Output.asTested.staticPressureRise,
      powerCorrected: fan203Output.converted.power,
      power: fan203Output.asTested.power,
      kpc: fan203Output.asTested.kpc,
      kpcCorrected: fan203Output.converted.kpc,
    }
    //release memory
    fan203Output.delete();
    fanShaftPowerInstance.delete();
    baseGasDensityInstance.delete();
    fan203Instance.delete();
    return results;
  }


  getPlaneDataInstance(input: Fan203Inputs): PlaneData {
    //FlangePlane
    //FanInletFlange
    let flangePlaneInstance: FlangePlane = new this.toolsSuiteApiService.ToolsSuiteModule.FlangePlane(input.PlaneData.FanInletFlange.area, input.PlaneData.FanInletFlange.dryBulbTemp, input.PlaneData.FanInletFlange.barometricPressure);
    //FanEvaseOrOutletFlange
    let flangePlaneInstance2: FlangePlane = new this.toolsSuiteApiService.ToolsSuiteModule.FlangePlane(input.PlaneData.FanEvaseOrOutletFlange.area, input.PlaneData.FanEvaseOrOutletFlange.dryBulbTemp, input.PlaneData.FanEvaseOrOutletFlange.barometricPressure);

    //TraversePlane
    //FlowTraverse
    let traversePlaneTraverseData: DoubleVector2D = new this.toolsSuiteApiService.ToolsSuiteModule.DoubleVector2D();
    let doubleVector: DoubleVector;

    let traverseData: Array<Array<number>> = input.PlaneData.FlowTraverse.traverseData.map(row => {
      return row.map(columnVal => Number(columnVal));
    });
    traverseData.forEach(dataRow => {
      doubleVector = this.suiteApiHelperService.returnDoubleVector(dataRow);
      traversePlaneTraverseData.push_back(doubleVector);
      doubleVector.delete();
    });
    let traversePlaneInstance: TraversePlane = new this.toolsSuiteApiService.ToolsSuiteModule.TraversePlane(input.PlaneData.FlowTraverse.area, input.PlaneData.FlowTraverse.dryBulbTemp, input.PlaneData.FlowTraverse.barometricPressure, input.PlaneData.FlowTraverse.staticPressure, input.PlaneData.FlowTraverse.pitotTubeCoefficient, traversePlaneTraverseData);
    // Release memory
    traversePlaneTraverseData.delete();

    //AddlTraversePlanes
    //traverse_plane_vector
    let addlTraversePlanes: TraversePlaneVector = new this.toolsSuiteApiService.ToolsSuiteModule.TraversePlaneVector();
    if (input.FanRatedInfo.traversePlanes > 1) {
      traversePlaneTraverseData = new this.toolsSuiteApiService.ToolsSuiteModule.DoubleVector2D();
      let traversePlane: Plane = input.PlaneData.AddlTraversePlanes[0];

      let doubleVector: DoubleVector;
      traversePlane.traverseData.forEach(dataRow => {
        doubleVector = this.suiteApiHelperService.returnDoubleVector(dataRow);
        traversePlaneTraverseData.push_back(doubleVector);
        doubleVector.delete();
      });
      let traversePlaneInstance2: TraversePlane = new this.toolsSuiteApiService.ToolsSuiteModule.TraversePlane(traversePlane.area, traversePlane.dryBulbTemp, traversePlane.barometricPressure, traversePlane.staticPressure, traversePlane.pitotTubeCoefficient, traversePlaneTraverseData);
      addlTraversePlanes.push_back(traversePlaneInstance2);
      traversePlaneInstance2.delete();
      traversePlaneTraverseData.delete();
    }

    //addlTraversePlane2
    if (input.FanRatedInfo.traversePlanes == 3) {
      traversePlaneTraverseData = new this.toolsSuiteApiService.ToolsSuiteModule.DoubleVector2D();
      let traversePlane: Plane = input.PlaneData.AddlTraversePlanes[1];
      let doubleVector: DoubleVector;
      traversePlane.traverseData.forEach(dataRow => {
        doubleVector = this.suiteApiHelperService.returnDoubleVector(dataRow);
        traversePlaneTraverseData.push_back(doubleVector);
        doubleVector.delete();
      });
      let traversePlaneInstance3: TraversePlane = new this.toolsSuiteApiService.ToolsSuiteModule.TraversePlane(traversePlane.area, traversePlane.dryBulbTemp, traversePlane.barometricPressure, traversePlane.staticPressure, traversePlane.pitotTubeCoefficient, traversePlaneTraverseData);
      addlTraversePlanes.push_back(traversePlaneInstance3);
      traversePlaneInstance3.delete();
      // Release memory
      traversePlaneTraverseData.delete();
    }

    //MstPlane
    //InletMstPlane
    let mstPlaneInstance: MstPlane = new this.toolsSuiteApiService.ToolsSuiteModule.MstPlane(input.PlaneData.InletMstPlane.area, input.PlaneData.InletMstPlane.dryBulbTemp, input.PlaneData.InletMstPlane.barometricPressure, input.PlaneData.InletMstPlane.staticPressure);

    //OutletMstPlane
    let mstPlaneInstance2: MstPlane = new this.toolsSuiteApiService.ToolsSuiteModule.MstPlane(input.PlaneData.OutletMstPlane.area, input.PlaneData.OutletMstPlane.dryBulbTemp, input.PlaneData.OutletMstPlane.barometricPressure, input.PlaneData.OutletMstPlane.staticPressure);

    //getPlaneData()
    let totalPressureLossBtwnPlanes1and4: number = input.PlaneData.totalPressureLossBtwnPlanes1and4;
    let totalPressureLossBtwnPlanes2and5: number = input.PlaneData.totalPressureLossBtwnPlanes2and5;
    let plane5upstreamOfPlane2: boolean = input.PlaneData.plane5upstreamOfPlane2;
    let planeDataInstance: PlaneData = new this.toolsSuiteApiService.ToolsSuiteModule.PlaneData(flangePlaneInstance, flangePlaneInstance2, traversePlaneInstance, addlTraversePlanes, mstPlaneInstance, mstPlaneInstance2, totalPressureLossBtwnPlanes1and4, totalPressureLossBtwnPlanes2and5, plane5upstreamOfPlane2);

    // Release memory
    flangePlaneInstance.delete();
    flangePlaneInstance2.delete();
    traversePlaneInstance.delete()
    addlTraversePlanes.delete();
    mstPlaneInstance.delete();
    mstPlaneInstance2.delete();
    return planeDataInstance;
  }

  optimalFanEfficiency(inputs: FanEfficiencyInputs): number {
    let fanType: FanType = this.suiteApiHelperService.getFanTypeEnum(inputs.fanType);
    // No default on new modification
    inputs.compressibility = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputs.compressibility);
    let optimalEfficiencyFactor: OptimalFanEfficiency = new this.toolsSuiteApiService.ToolsSuiteModule.OptimalFanEfficiency(fanType, inputs.fanSpeed, inputs.flowRate, inputs.inletPressure, inputs.outletPressure, inputs.compressibility);
    let optimalEfficiencyFactorResult: number = optimalEfficiencyFactor.calculate();
    let result: number = optimalEfficiencyFactorResult * 100;
    optimalEfficiencyFactor.delete();
    return result;
  }

  compressibilityFactor(inputs: CompressibilityFactor): number {
    inputs.inletPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputs.inletPressure);
    inputs.outletPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputs.outletPressure);
    inputs.flowRate = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputs.flowRate);
    inputs.moverShaftPower = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputs.moverShaftPower);
    inputs.specificHeatRatio = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputs.specificHeatRatio);
    inputs.barometricPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputs.barometricPressure);
    
    let compressibilityFactor: SuiteCompressibilityFactor = new this.toolsSuiteApiService.ToolsSuiteModule.CompressibilityFactor(inputs.moverShaftPower, inputs.inletPressure, inputs.outletPressure, inputs.barometricPressure, inputs.flowRate, inputs.specificHeatRatio);
    let compressibilityFactorResult: number = compressibilityFactor.calculate();
    compressibilityFactor.delete();
    return compressibilityFactorResult;
  }
}
