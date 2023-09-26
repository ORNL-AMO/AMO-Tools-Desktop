import { Injectable } from '@angular/core';
import { FanEfficiencyInputs } from '../calculator/fans/fan-efficiency/fan-efficiency.service';
import { BaseGasDensity, CompressibilityFactor, Fan203Inputs, Fan203Results, FsatInput, FsatOutput, Plane, PlaneResult, PlaneResults, PsychrometricResults } from '../shared/models/fans';
import { SuiteApiHelperService } from './suite-api-helper.service';

declare var Module: any;
@Injectable()
export class FansSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService) { }

  //results
  calculateExisting(input: FsatInput): FsatOutput {
    //enums
    let driveEnum = this.suiteApiHelperService.getDriveEnum(input.drive);
    let lineFrequencyEnum = this.suiteApiHelperService.getLineFrequencyEnum(input.lineFrequency);
    let efficiencyClassEnum = this.suiteApiHelperService.getMotorEfficiencyEnum(input.efficiencyClass);
    let loadEstimationMethodEnum = this.suiteApiHelperService.getLoadEstimationMethod(input.loadEstimationMethod);
    //convert from percent to fraction
    let specifiedDriveEfficiencyFraction: number = input.specifiedDriveEfficiency / 100;
    input.compressibilityFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.compressibilityFactor);
    let fanInput = new Module.FanInput(input.fanSpeed, input.airDensity, driveEnum, specifiedDriveEfficiencyFraction);
    let motor = new Module.Motor(lineFrequencyEnum, input.motorRatedPower, input.motorRpm, efficiencyClassEnum, input.specifiedEfficiency, input.motorRatedVoltage, input.fullLoadAmps, input.sizeMargin);
    let baselineFieldData = new Module.FieldDataBaseline(input.measuredPower, input.measuredVoltage, input.measuredAmps, input.flowRate, input.inletPressure, input.outletPressure, input.compressibilityFactor, loadEstimationMethodEnum, input.velocityPressure);
    let fanResult = new Module.FanResult(fanInput, motor, input.operatingHours, input.unitCost);
    let output = fanResult.calculateExisting(baselineFieldData);
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
    let driveEnum = this.suiteApiHelperService.getDriveEnum(input.drive);
    let lineFrequencyEnum = this.suiteApiHelperService.getLineFrequencyEnum(input.lineFrequency);
    let efficiencyClassEnum = this.suiteApiHelperService.getMotorEfficiencyEnum(input.efficiencyClass);
    //convert from percent to fraction
    let specifiedDriveEfficiencyFraction: number = input.specifiedDriveEfficiency / 100;
    let fanEfficiencyFraction: number = input.fanEfficiency / 100;

    let fanInput = new Module.FanInput(input.fanSpeed, input.airDensity, driveEnum, specifiedDriveEfficiencyFraction);
    // No default on new modification
    input.compressibilityFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.compressibilityFactor);
    let fanFieldData = new Module.FieldDataModified(input.measuredVoltage, input.measuredAmps, input.flowRate, input.inletPressure, input.outletPressure, input.compressibilityFactor, input.velocityPressure);
    let motor = new Module.Motor(lineFrequencyEnum, input.motorRatedPower, input.motorRpm, efficiencyClassEnum, input.specifiedEfficiency, input.motorRatedVoltage, input.fullLoadAmps, input.sizeMargin);
    let fanResult = new Module.FanResult(fanInput, motor, input.operatingHours, input.unitCost);
    let output = fanResult.calculateModified(fanFieldData, fanEfficiencyFraction);
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
    let gasType = this.suiteApiHelperService.getGasTypeEnum(inputs.gasType);
    let inputType = this.suiteApiHelperService.getBasGensityInputTypeEnum(inputs.inputType);
    let result: PsychrometricResults;
    if (inputs.dryBulbTemp != undefined && inputs.staticPressure != undefined && inputs.barometricPressure != undefined && inputs.dewPoint != undefined && gasType != undefined && inputType != undefined && inputs.specificGravity != undefined) {
      let dewPointInstance = new Module.BaseGasDensity(inputs.dryBulbTemp, inputs.staticPressure, inputs.barometricPressure, inputs.dewPoint, gasType, inputType, inputs.specificGravity);
      result = this.getGasDensityPsychometricResults(dewPointInstance);
      dewPointInstance.delete();
    }
    return result;
  }

  getBaseGasDensityRelativeHumidity(inputs: BaseGasDensity): PsychrometricResults {
    let gasType = this.suiteApiHelperService.getGasTypeEnum(inputs.gasType);
    let inputType = this.suiteApiHelperService.getBasGensityInputTypeEnum(inputs.inputType);
    let result: PsychrometricResults;
    if (inputs.dryBulbTemp != undefined && inputs.staticPressure != undefined && inputs.barometricPressure != undefined && inputs.relativeHumidity != undefined && gasType != undefined && inputType != undefined && inputs.specificGravity != undefined) {
      let relativeHumidityInstance = new Module.BaseGasDensity(inputs.dryBulbTemp, inputs.staticPressure, inputs.barometricPressure, inputs.relativeHumidity, gasType, inputType, inputs.specificGravity);
      result = this.getGasDensityPsychometricResults(relativeHumidityInstance);
      relativeHumidityInstance.delete();
    }
    return result
  }

  getBaseGasDensityWetBulb(inputs: BaseGasDensity): PsychrometricResults {
    let gasType = this.suiteApiHelperService.getGasTypeEnum(inputs.gasType);
    let inputType = this.suiteApiHelperService.getBasGensityInputTypeEnum(inputs.inputType);
    let result: PsychrometricResults;
    if (inputs.dryBulbTemp != undefined && inputs.staticPressure != undefined && inputs.barometricPressure != undefined && inputs.wetBulbTemp != undefined && gasType != undefined && inputType != undefined && inputs.specificGravity != undefined && inputs.specificHeatGas != undefined) {
      let wetBulbInstance = new Module.BaseGasDensity(inputs.dryBulbTemp, inputs.staticPressure, inputs.barometricPressure, inputs.wetBulbTemp, gasType, inputType, inputs.specificGravity, inputs.specificHeatGas);
      result = this.getGasDensityPsychometricResults(wetBulbInstance);
      wetBulbInstance.delete();
    }
    return result
  }

  getGasDensityPsychometricResults(gasDensityInstance): PsychrometricResults {
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
    let traversePlaneTraverseData = new Module.DoubleVector2D();
    let doubleVector;

    //  TODO pressure-readings-form.ts save() should change to Number
    let traverseData: Array<Array<number>> = inputs.traverseData.map(row => {
      return row.map(columnVal => Number(columnVal));
    });
    traverseData.forEach(dataRow => {
      doubleVector = this.suiteApiHelperService.returnDoubleVector(dataRow);
      traversePlaneTraverseData.push_back(doubleVector);
      doubleVector.delete();
    });
    let traversePlaneInstance = new Module.TraversePlane(inputs.area, inputs.dryBulbTemp, inputs.barometricPressure, inputs.staticPressure, inputs.pitotTubeCoefficient, traversePlaneTraverseData);

    let pv3 = traversePlaneInstance.getPv3Value();
    let percent75Rule = traversePlaneInstance.get75percentRule() * 100; // Convert to percentage
    traversePlaneInstance.delete();
    traversePlaneTraverseData.delete();
    return { pv3: pv3, percent75Rule: percent75Rule };
  }


  getPlaneResults(input: Fan203Inputs): PlaneResults {
    //plane data
    let planeDataInstance = this.getPlaneDataInstance(input);
    //BaseGasDensity
    let gasType = this.suiteApiHelperService.getGasTypeEnum(input.BaseGasDensity.gasType);
    let baseGasDensityInstance = new Module.BaseGasDensity(input.BaseGasDensity.dryBulbTemp, input.BaseGasDensity.staticPressure, input.BaseGasDensity.barometricPressure, input.BaseGasDensity.gasDensity, gasType);
    let output = Module.PlaneDataNodeBindingCalculate(planeDataInstance, baseGasDensityInstance);
    let AddlTraversePlanes: Array<PlaneResult> = new Array();
    for (let i = 0; i < output.addlTravPlanes.size(); i++) { // error: length = 0, was .size
      let traversPlane = output.addlTravPlanes.get(i)
      AddlTraversePlanes.push({
        gasDensity: traversPlane.gasDensity,
        gasTotalPressure: traversPlane.gasTotalPressure,
        gasVelocity: traversPlane.gasVelocity,
        gasVelocityPressure: traversPlane.gasVelocityPressure,
        gasVolumeFlowRate: traversPlane.gasVolumeFlowRate,
        staticPressure: traversPlane.staticPressure,
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
        staticPressure: output.flowTraverse.staticPressure,
      },
      InletMstPlane: {
        gasDensity: output.inletMstPlane.gasDensity,
        gasTotalPressure: output.inletMstPlane.gasTotalPressure,
        gasVelocity: output.inletMstPlane.gasVelocity,
        gasVelocityPressure: output.inletMstPlane.gasVelocityPressure,
        gasVolumeFlowRate: output.inletMstPlane.gasVolumeFlowRate,
        staticPressure: output.inletMstPlane.staticPressure,
      },
      OutletMstPlane: {
        gasDensity: output.outletMstPlane.gasDensity,
        gasTotalPressure: output.outletMstPlane.gasTotalPressure,
        gasVelocity: output.outletMstPlane.gasVelocity,
        gasVelocityPressure: output.outletMstPlane.gasVelocityPressure,
        gasVolumeFlowRate: output.outletMstPlane.gasVolumeFlowRate,
        staticPressure: output.outletMstPlane.staticPressure,
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
    let fanRatedInfoInstance = new Module.FanRatedInfo(input.FanRatedInfo.fanSpeed, input.FanRatedInfo.motorSpeed, input.FanRatedInfo.fanSpeedCorrected, input.FanRatedInfo.densityCorrected, input.FanRatedInfo.pressureBarometricCorrected);
    //BaseGasDensity
    let gasType = this.suiteApiHelperService.getGasTypeEnum(input.BaseGasDensity.gasType);
    let baseGasDensityInstance = new Module.BaseGasDensity(input.BaseGasDensity.dryBulbTemp, input.BaseGasDensity.staticPressure, input.BaseGasDensity.barometricPressure, input.BaseGasDensity.gasDensity, gasType);
    //FanShaftPower
    let fanShaftPowerInstance = new Module.FanShaftPower(input.FanShaftPower.motorShaftPower, input.FanShaftPower.efficiencyMotor, input.FanShaftPower.efficiencyVFD, input.FanShaftPower.efficiencyBelt, input.FanShaftPower.sumSEF);
    //plane data instance
    let planeDataInstance = this.getPlaneDataInstance(input);
    //Calculation procedure
    let fan203Instance = new Module.Fan203(fanRatedInfoInstance, planeDataInstance, baseGasDensityInstance, fanShaftPowerInstance);
    let fan203Output = fan203Instance.calculate();
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


  getPlaneDataInstance(input: Fan203Inputs) {
    //FlangePlane
    //FanInletFlange
    let flangePlaneInstance = new Module.FlangePlane(input.PlaneData.FanInletFlange.area, input.PlaneData.FanInletFlange.dryBulbTemp, input.PlaneData.FanInletFlange.barometricPressure);
    //FanEvaseOrOutletFlange
    let flangePlaneInstance2 = new Module.FlangePlane(input.PlaneData.FanEvaseOrOutletFlange.area, input.PlaneData.FanEvaseOrOutletFlange.dryBulbTemp, input.PlaneData.FanEvaseOrOutletFlange.barometricPressure);

    //TraversePlane
    //FlowTraverse
    let traversePlaneTraverseData = new Module.DoubleVector2D();
    let doubleVector;
    input.PlaneData.FlowTraverse.traverseData.forEach(dataRow => {
      doubleVector = this.suiteApiHelperService.returnDoubleVector(dataRow);
      traversePlaneTraverseData.push_back(doubleVector);
      doubleVector.delete();
    });
    let traversePlaneInstance = new Module.TraversePlane(input.PlaneData.FlowTraverse.area, input.PlaneData.FlowTraverse.dryBulbTemp, input.PlaneData.FlowTraverse.barometricPressure, input.PlaneData.FlowTraverse.staticPressure, input.PlaneData.FlowTraverse.pitotTubeCoefficient, traversePlaneTraverseData);
    // Release memory
    traversePlaneTraverseData.delete();

    //AddlTraversePlanes
    //traverse_plane_vector
    let addlTraversePlanes = new Module.TraversePlaneVector();
    if (input.FanRatedInfo.traversePlanes > 1) {
      traversePlaneTraverseData = new Module.DoubleVector2D();
      let traversePlane: Plane = input.PlaneData.AddlTraversePlanes[0];

      let doubleVector;
      traversePlane.traverseData.forEach(dataRow => {
        doubleVector = this.suiteApiHelperService.returnDoubleVector(dataRow);
        traversePlaneTraverseData.push_back(doubleVector);
        doubleVector.delete();
      });
      let traversePlaneInstance2 = new Module.TraversePlane(traversePlane.area, traversePlane.dryBulbTemp, traversePlane.barometricPressure, traversePlane.staticPressure, traversePlane.pitotTubeCoefficient, traversePlaneTraverseData);
      addlTraversePlanes.push_back(traversePlaneInstance2);
      traversePlaneInstance2.delete();
      traversePlaneTraverseData.delete();
    }

    //addlTraversePlane2
    if (input.FanRatedInfo.traversePlanes == 3) {
      traversePlaneTraverseData = new Module.DoubleVector2D();
      let traversePlane: Plane = input.PlaneData.AddlTraversePlanes[1];
      let doubleVector;
      traversePlane.traverseData.forEach(dataRow => {
        doubleVector = this.suiteApiHelperService.returnDoubleVector(dataRow);
        traversePlaneTraverseData.push_back(doubleVector);
        doubleVector.delete();
      });
      let traversePlaneInstance3 = new Module.TraversePlane(traversePlane.area, traversePlane.dryBulbTemp, traversePlane.barometricPressure, traversePlane.staticPressure, traversePlane.pitotTubeCoefficient, traversePlaneTraverseData);
      addlTraversePlanes.push_back(traversePlaneInstance3);
      traversePlaneInstance3.delete();
      // Release memory
      traversePlaneTraverseData.delete();
    }

    //MstPlane
    //InletMstPlane
    let mstPlaneInstance = new Module.MstPlane(input.PlaneData.InletMstPlane.area, input.PlaneData.InletMstPlane.dryBulbTemp, input.PlaneData.InletMstPlane.barometricPressure, input.PlaneData.InletMstPlane.staticPressure);

    //OutletMstPlane
    let mstPlaneInstance2 = new Module.MstPlane(input.PlaneData.OutletMstPlane.area, input.PlaneData.OutletMstPlane.dryBulbTemp, input.PlaneData.OutletMstPlane.barometricPressure, input.PlaneData.OutletMstPlane.staticPressure);

    //getPlaneData()
    let totalPressureLossBtwnPlanes1and4 = input.PlaneData.totalPressureLossBtwnPlanes1and4;
    let totalPressureLossBtwnPlanes2and5 = input.PlaneData.totalPressureLossBtwnPlanes2and5;
    let plane5upstreamOfPlane2 = input.PlaneData.plane5upstreamOfPlane2;
    let planeDataInstance = new Module.PlaneData(flangePlaneInstance, flangePlaneInstance2, traversePlaneInstance, addlTraversePlanes, mstPlaneInstance, mstPlaneInstance2, totalPressureLossBtwnPlanes1and4, totalPressureLossBtwnPlanes2and5, plane5upstreamOfPlane2);

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
    let fanType = this.suiteApiHelperService.getFanTypeEnum(inputs.fanType);
    // No default on new modification
    inputs.compressibility = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputs.compressibility);
    let optimalEfficiencyFactor = new Module.OptimalFanEfficiency(fanType, inputs.fanSpeed, inputs.flowRate, inputs.inletPressure, inputs.outletPressure, inputs.compressibility);
    let optimalEfficiencyFactorResult = optimalEfficiencyFactor.calculate();
    let result = optimalEfficiencyFactorResult * 100;
    optimalEfficiencyFactor.delete();
    return result;
  }

  compressibilityFactor(inputs: CompressibilityFactor): number {
    // null on new mod
    inputs.inletPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputs.inletPressure);
    inputs.outletPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputs.outletPressure);
    inputs.flowRate = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputs.flowRate);
    let compressibilityFactor = new Module.CompressibilityFactor(inputs.moverShaftPower, inputs.inletPressure, inputs.outletPressure, inputs.barometricPressure, inputs.flowRate, inputs.specificHeatRatio);
    let compressibilityFactorResult = compressibilityFactor.calculate();
    compressibilityFactor.delete();
    return compressibilityFactorResult;
  }
}
