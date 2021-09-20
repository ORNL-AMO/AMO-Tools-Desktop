import { Injectable } from '@angular/core';
import { AirLeakSurveyData, AirLeakSurveyInput, AirLeakSurveyResult, CompressedAirReductionInput, CompressedAirReductionResult, ElectricityReductionInput, ElectricityReductionResult, NaturalGasReductionInput, NaturalGasReductionResult, PipeInsulationReductionInput, PipeInsulationReductionResult, SteamReductionInput, SteamReductionOutput, SteamReductionResult, TankInsulationReductionInput, TankInsulationReductionResult, WaterReductionInput, WaterReductionResult } from '../shared/models/standalone';
import { SuiteApiHelperService } from './suite-api-helper.service';

declare var Module: any;

@Injectable()
export class CalculatorSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService) { }

  electricityReduction(inputObj: ElectricityReductionInput): ElectricityReductionResult {
    let inputs = new Module.ElectricityReductionInputV();
    
    inputObj.electricityReductionInputVec.forEach(electricityReduction => {
      // TODO calc only get results if valid
      electricityReduction.electricityCost = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(electricityReduction.electricityCost);
      electricityReduction.operatingHours = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(electricityReduction.operatingHours);
      electricityReduction.units = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(electricityReduction.units);
      
      electricityReduction.multimeterData.averageCurrent = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(electricityReduction.multimeterData.averageCurrent);
      electricityReduction.multimeterData.numberOfPhases = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(electricityReduction.multimeterData.numberOfPhases);
      electricityReduction.multimeterData.powerFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(electricityReduction.multimeterData.powerFactor);
      electricityReduction.multimeterData.supplyVoltage = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(electricityReduction.multimeterData.supplyVoltage);

      electricityReduction.nameplateData.lineFrequency = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(electricityReduction.nameplateData.lineFrequency);
      electricityReduction.nameplateData.loadFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(electricityReduction.nameplateData.loadFactor);
      electricityReduction.nameplateData.motorAndDriveEfficiency = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(electricityReduction.nameplateData.motorAndDriveEfficiency);
      electricityReduction.nameplateData.operationalFrequency = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(electricityReduction.nameplateData.operationalFrequency);
      electricityReduction.nameplateData.ratedMotorPower = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(electricityReduction.nameplateData.ratedMotorPower);

      electricityReduction.powerMeterData.power = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(electricityReduction.powerMeterData.power);
      electricityReduction.otherMethodData.energy = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(electricityReduction.otherMethodData.energy);

      let MultimeterData = new Module.MultimeterData(
        electricityReduction.multimeterData.numberOfPhases,
        electricityReduction.multimeterData.supplyVoltage,
        electricityReduction.multimeterData.averageCurrent, 
        electricityReduction.multimeterData.powerFactor
        );
      let NameplateData = new Module.NameplateData(electricityReduction.nameplateData.ratedMotorPower, electricityReduction.nameplateData.variableSpeedMotor,
          electricityReduction.nameplateData.operationalFrequency, electricityReduction.nameplateData.lineFrequency, electricityReduction.nameplateData.motorAndDriveEfficiency, electricityReduction.nameplateData.loadFactor);
      let PowerMeterData = new Module.PowerMeterData(electricityReduction.powerMeterData.power);
      let OtherMethodData = new Module.OtherMethodData(electricityReduction.otherMethodData.energy);

      let wasmConvertedInput = new Module.ElectricityReductionInput(
        electricityReduction.operatingHours, 
        electricityReduction.electricityCost, 
        electricityReduction.measurementMethod,
        MultimeterData, 
        NameplateData, 
        PowerMeterData, 
        OtherMethodData, 
        electricityReduction.units
        );
      
      inputs.push_back(wasmConvertedInput);

      wasmConvertedInput.delete();
      MultimeterData.delete();
      NameplateData.delete();
      PowerMeterData.delete();
      OtherMethodData.delete();
    });

    let ElectricityReductionCalculator = new Module.ElectricityReduction(inputs);
    let output = ElectricityReductionCalculator.calculate();
    ElectricityReductionCalculator.delete();
    inputs.delete();
    return output;
  }

  naturalGasReduction(inputObj: NaturalGasReductionInput): NaturalGasReductionResult {
    let inputs = new Module.NaturalGasReductionInputV();
    
    inputObj.naturalGasReductionInputVec.forEach(naturalGasReduction => {
      // TODO calc only get results if valid
      naturalGasReduction.operatingHours = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.operatingHours);
      naturalGasReduction.units = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.units);
      naturalGasReduction.fuelCost = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.fuelCost);
      
      naturalGasReduction.airMassFlowData.inletTemperature = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.airMassFlowData.inletTemperature);
      naturalGasReduction.airMassFlowData.outletTemperature = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.airMassFlowData.outletTemperature);
      naturalGasReduction.airMassFlowData.systemEfficiency = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.airMassFlowData.systemEfficiency);
      naturalGasReduction.airMassFlowData.airMassFlowMeasuredData.airVelocity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.airMassFlowData.airMassFlowMeasuredData.airVelocity);
      naturalGasReduction.airMassFlowData.airMassFlowMeasuredData.areaOfDuct = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.airMassFlowData.airMassFlowMeasuredData.areaOfDuct);
      naturalGasReduction.airMassFlowData.airMassFlowNameplateData.airFlow = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.airMassFlowData.airMassFlowNameplateData.airFlow);

      naturalGasReduction.flowMeterMethodData.flowRate = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.flowMeterMethodData.flowRate);
      naturalGasReduction.otherMethodData.consumption = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.otherMethodData.consumption);

      naturalGasReduction.waterMassFlowData.inletTemperature = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.waterMassFlowData.inletTemperature);
      naturalGasReduction.waterMassFlowData.outletTemperature = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.waterMassFlowData.outletTemperature);
      naturalGasReduction.waterMassFlowData.systemEfficiency = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.waterMassFlowData.systemEfficiency);
      naturalGasReduction.waterMassFlowData.waterFlow = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(naturalGasReduction.waterMassFlowData.waterFlow);
      
      let FlowMeterMethodData = new Module.FlowMeterMethodData(naturalGasReduction.flowMeterMethodData.flowRate);
      let NaturalGasOtherMethodData = new Module.NaturalGasOtherMethodData(naturalGasReduction.otherMethodData.consumption);
      let AirMassFlowMeasuredData = new Module.AirMassFlowMeasuredData(naturalGasReduction.airMassFlowData.airMassFlowMeasuredData.areaOfDuct,
          naturalGasReduction.airMassFlowData.airMassFlowMeasuredData.airVelocity);
      let AirMassFlowNameplateData = new Module.AirMassFlowNameplateData(naturalGasReduction.airMassFlowData.airMassFlowNameplateData.airFlow);
      let AirMassFlowData = new Module.AirMassFlowData(naturalGasReduction.airMassFlowData.isNameplate, AirMassFlowMeasuredData, AirMassFlowNameplateData,
          naturalGasReduction.airMassFlowData.inletTemperature, naturalGasReduction.airMassFlowData.outletTemperature, naturalGasReduction.airMassFlowData.systemEfficiency);
      let WaterMassFlowData = new Module.WaterMassFlowData(naturalGasReduction.waterMassFlowData.waterFlow,
          naturalGasReduction.waterMassFlowData.inletTemperature, naturalGasReduction.waterMassFlowData.outletTemperature, naturalGasReduction.waterMassFlowData.systemEfficiency);

      let wasmConvertedInput = new Module.NaturalGasReductionInput(
        naturalGasReduction.operatingHours, 
        naturalGasReduction.fuelCost, 
        naturalGasReduction.measurementMethod,
        FlowMeterMethodData, 
        NaturalGasOtherMethodData, 
        AirMassFlowData, 
        WaterMassFlowData, 
        naturalGasReduction.units);
      inputs.push_back(wasmConvertedInput);

      wasmConvertedInput.delete();
      FlowMeterMethodData.delete();
      NaturalGasOtherMethodData.delete();
      AirMassFlowMeasuredData.delete();
      AirMassFlowNameplateData.delete();
      AirMassFlowData.delete();
      WaterMassFlowData.delete();
    });

    let NaturalGasReductionCalculator = new Module.NaturalGasReduction(inputs);
    let output = NaturalGasReductionCalculator.calculate();
    NaturalGasReductionCalculator.delete();
    inputs.delete();
    return output;
  }

  compressedAirReduction(inputObj: CompressedAirReductionInput): CompressedAirReductionResult {
    let inputs = new Module.CompressedAirReductionInputV();
    
    inputObj.compressedAirReductionInputVec.forEach(compressedAirReduction => {
      compressedAirReduction.units = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.units);
      compressedAirReduction.hoursPerYear = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.hoursPerYear); 
      compressedAirReduction.utilityCost = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.utilityCost); 

      compressedAirReduction.flowMeterMethodData.meterReading = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.flowMeterMethodData.meterReading);
      
      compressedAirReduction.bagMethodData.height = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.bagMethodData.height);
      compressedAirReduction.bagMethodData.diameter = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.bagMethodData.diameter);
      compressedAirReduction.bagMethodData.fillTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.bagMethodData.fillTime);
      
      compressedAirReduction.pressureMethodData.nozzleType = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.pressureMethodData.nozzleType);
      compressedAirReduction.pressureMethodData.numberOfNozzles = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.pressureMethodData.numberOfNozzles);
      compressedAirReduction.pressureMethodData.supplyPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.pressureMethodData.supplyPressure);
      
      compressedAirReduction.otherMethodData.consumption = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.otherMethodData.consumption);
      compressedAirReduction.compressorElectricityData.compressorControlAdjustment = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.compressorElectricityData.compressorControlAdjustment);
      compressedAirReduction.compressorElectricityData.compressorSpecificPower = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.compressorElectricityData.compressorSpecificPower);

        let CompressedAirFlowMeterMethodData = new Module.CompressedAirFlowMeterMethodData(compressedAirReduction.flowMeterMethodData.meterReading);
        let BagMethodData = new Module.BagMethodData(compressedAirReduction.bagMethodData.height, compressedAirReduction.bagMethodData.diameter, compressedAirReduction.bagMethodData.fillTime);
        let PressureMethodData = new Module.PressureMethodData(compressedAirReduction.pressureMethodData.nozzleType, compressedAirReduction.pressureMethodData.numberOfNozzles,
            compressedAirReduction.pressureMethodData.supplyPressure);
        let CompressedAirOtherMethodData = new Module.CompressedAirOtherMethodData(compressedAirReduction.otherMethodData.consumption);
        let CompressorElectricityData = new Module.CompressorElectricityData(compressedAirReduction.compressorElectricityData.compressorControlAdjustment,
            compressedAirReduction.compressorElectricityData.compressorSpecificPower);

      let wasmConvertedInput = new Module.CompressedAirReductionInput(
        compressedAirReduction.hoursPerYear, 
        compressedAirReduction.utilityType, 
        compressedAirReduction.utilityCost, 
        compressedAirReduction.measurementMethod,
        CompressedAirFlowMeterMethodData, BagMethodData, PressureMethodData, CompressedAirOtherMethodData, CompressorElectricityData, compressedAirReduction.units);
      inputs.push_back(wasmConvertedInput);

      wasmConvertedInput.delete();
      CompressedAirFlowMeterMethodData.delete();
      BagMethodData.delete();
      PressureMethodData.delete();
      CompressedAirOtherMethodData.delete();
      CompressorElectricityData.delete();
    });

    let CompressedAirReductionCalculator = new Module.CompressedAirReduction(inputs);
    let output = CompressedAirReductionCalculator.calculate();
    CompressedAirReductionCalculator.delete();
    inputs.delete();
    return output;
  }

  compressedAirLeakSurvey(inputObj: AirLeakSurveyInput): AirLeakSurveyResult {
    let convertedInput: Array<AirLeakSurveyData> = inputObj.compressedAirLeakSurveyInputVec.map(input => {
      input.utilityCost = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.utilityCost);

      // TODO all methods should not calculate if missing required props
      input.bagMethodData.diameter = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.bagMethodData.diameter);
      input.bagMethodData.fillTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.bagMethodData.fillTime);
      input.bagMethodData.height = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.bagMethodData.height);
      // estimate method
      input.estimateMethodData.leakRateEstimate = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.estimateMethodData.leakRateEstimate);
      // orifice method
      input.orificeMethodData.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.atmosphericPressure);
      input.orificeMethodData.compressorAirTemp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.compressorAirTemp);
      input.orificeMethodData.dischargeCoefficient = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.dischargeCoefficient);
      input.orificeMethodData.numberOfOrifices = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.numberOfOrifices);
      input.orificeMethodData.orificeDiameter = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.orificeDiameter);
      input.orificeMethodData.supplyPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.supplyPressure);
      
      input.decibelsMethodData.decibelRatingA = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.atmosphericPressure);
      input.decibelsMethodData.decibelRatingB = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.compressorAirTemp);
      input.decibelsMethodData.decibels = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.dischargeCoefficient);
      input.decibelsMethodData.firstFlowA = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.numberOfOrifices);
      input.decibelsMethodData.firstFlowB = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.orificeDiameter);
      input.decibelsMethodData.linePressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.supplyPressure);
      input.decibelsMethodData.pressureA = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.supplyPressure);
      input.decibelsMethodData.pressureB = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.supplyPressure);
      input.decibelsMethodData.secondFlowA = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.supplyPressure);
      input.decibelsMethodData.secondFlowB = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.supplyPressure);
      return input;
    });
    let inputs = new Module.CompressedAirLeakSurveyInputV();
    
    convertedInput.forEach(airLeakSurvey => {
      let EstimateMethodData = new Module.EstimateMethodData(airLeakSurvey.estimateMethodData.leakRateEstimate);

      let BagMethodData = new Module.BagMethodData(airLeakSurvey.bagMethodData.height, airLeakSurvey.bagMethodData.diameter, airLeakSurvey.bagMethodData.fillTime);
      let DecibelsMethodData = new Module.DecibelsMethodData(airLeakSurvey.decibelsMethodData.linePressure,
          airLeakSurvey.decibelsMethodData.decibels, airLeakSurvey.decibelsMethodData.decibelRatingA, airLeakSurvey.decibelsMethodData.pressureA,
          airLeakSurvey.decibelsMethodData.firstFlowA, airLeakSurvey.decibelsMethodData.secondFlowA, airLeakSurvey.decibelsMethodData.decibelRatingB,
          airLeakSurvey.decibelsMethodData.pressureB, airLeakSurvey.decibelsMethodData.firstFlowB, airLeakSurvey.decibelsMethodData.secondFlowB);
      let OrificeMethodData = new Module.OrificeMethodData(airLeakSurvey.orificeMethodData.compressorAirTemp,
          airLeakSurvey.orificeMethodData.atmosphericPressure, airLeakSurvey.orificeMethodData.dischargeCoefficient,
          airLeakSurvey.orificeMethodData.orificeDiameter, airLeakSurvey.orificeMethodData.supplyPressure, airLeakSurvey.orificeMethodData.numberOfOrifices);
      let CompressorElectricityData = new Module.CompressorElectricityData(airLeakSurvey.compressorElectricityData.compressorControlAdjustment,
          airLeakSurvey.compressorElectricityData.compressorSpecificPower);

      let wasmConvertedInput = new Module.CompressedAirLeakSurveyInput(
        airLeakSurvey.hoursPerYear, 
        airLeakSurvey.utilityType, 
        airLeakSurvey.utilityCost, 
        airLeakSurvey.measurementMethod,
        EstimateMethodData, 
        DecibelsMethodData, 
        BagMethodData, 
        OrificeMethodData, 
        CompressorElectricityData, 
        airLeakSurvey.units
        );
      inputs.push_back(wasmConvertedInput);

      wasmConvertedInput.delete();
      EstimateMethodData.delete();
      DecibelsMethodData.delete();
      BagMethodData.delete();
      OrificeMethodData.delete();
      CompressorElectricityData.delete();
    });

    let CompressedAirLeakSurveyCalculator = new Module.CompressedAirLeakSurvey(inputs);
    let output = CompressedAirLeakSurveyCalculator.calculate();
    CompressedAirLeakSurveyCalculator.delete();
    inputs.delete();
    return output;
  }

  
  waterReduction(inputObj: WaterReductionInput): WaterReductionResult {
    let inputs = new Module.WaterReductionInputV();
    
    inputObj.waterReductionInputVec.forEach(waterReduction => {
      waterReduction.waterCost = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(waterReduction.waterCost);
      waterReduction.hoursPerYear = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(waterReduction.hoursPerYear);
      
      waterReduction.meteredFlowMethodData.meterReading = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(waterReduction.meteredFlowMethodData.meterReading);

      waterReduction.volumeMeterMethodData.elapsedTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(waterReduction.volumeMeterMethodData.elapsedTime);
      waterReduction.volumeMeterMethodData.finalMeterReading = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(waterReduction.volumeMeterMethodData.finalMeterReading);
      waterReduction.volumeMeterMethodData.initialMeterReading = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(waterReduction.volumeMeterMethodData.initialMeterReading);

      waterReduction.bucketMethodData.bucketFillTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(waterReduction.bucketMethodData.bucketFillTime);
      waterReduction.bucketMethodData.bucketVolume = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(waterReduction.bucketMethodData.bucketVolume);
      waterReduction.otherMethodData.consumption = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(waterReduction.otherMethodData.consumption);

      let MeteredFlowMethodData = new Module.MeteredFlowMethodData(waterReduction.meteredFlowMethodData.meterReading);
      let VolumeMeterMethodData = new Module.VolumeMeterMethodData(waterReduction.volumeMeterMethodData.initialMeterReading,
          waterReduction.volumeMeterMethodData.finalMeterReading, waterReduction.volumeMeterMethodData.elapsedTime);
      let BucketMethodData = new Module.BucketMethodData(waterReduction.bucketMethodData.bucketVolume, waterReduction.bucketMethodData.bucketFillTime);
      let OtherMethodData = new Module.WaterOtherMethodData(waterReduction.otherMethodData.consumption);

      let wasmConvertedInput = new Module.WaterReductionInput(
        waterReduction.hoursPerYear, 
        waterReduction.waterCost, 
        waterReduction.measurementMethod,
        MeteredFlowMethodData, 
        VolumeMeterMethodData, 
        BucketMethodData, 
        OtherMethodData
        );
      inputs.push_back(wasmConvertedInput);

      wasmConvertedInput.delete();
      MeteredFlowMethodData.delete();
      VolumeMeterMethodData.delete();
      BucketMethodData.delete();
      OtherMethodData.delete();
    });

    let WaterReductionCalculator = new Module.WaterReduction(inputs);
    let output = WaterReductionCalculator.calculate();
    WaterReductionCalculator.delete();
    inputs.delete();
    return output;
  }

  steamReduction(inputObj: SteamReductionInput): SteamReductionResult {
    let inputs = new Module.SteamReductionInputV();
    
    inputObj.steamReductionInputVec.forEach(steamReduction => {
      let FlowMeterMethodData = new Module.SteamFlowMeterMethodData(steamReduction.flowMeterMethodData.flowRate);

      let MassFlowMeasuredData = new Module.SteamMassFlowMeasuredData(steamReduction.airMassFlowMethodData.massFlowMeasuredData.areaOfDuct,
          steamReduction.airMassFlowMethodData.massFlowMeasuredData.airVelocity);
      let MassFlowNameplateData = new Module.SteamMassFlowNameplateData(steamReduction.airMassFlowMethodData.massFlowNameplateData.flowRate);
      let AirMassFlowMethodData = new Module.SteamMassFlowMethodData(steamReduction.airMassFlowMethodData.isNameplate,
          MassFlowMeasuredData, MassFlowNameplateData,
          steamReduction.airMassFlowMethodData.inletTemperature, steamReduction.airMassFlowMethodData.outletTemperature);

      MassFlowMeasuredData = new Module.SteamMassFlowMeasuredData(steamReduction.waterMassFlowMethodData.massFlowMeasuredData.areaOfDuct,
          steamReduction.waterMassFlowMethodData.massFlowMeasuredData.airVelocity);
      MassFlowNameplateData = new Module.SteamMassFlowNameplateData(steamReduction.waterMassFlowMethodData.massFlowNameplateData.flowRate);
      let WaterMassFlowMethodData = new Module.SteamMassFlowMethodData(steamReduction.waterMassFlowMethodData.isNameplate,
          MassFlowMeasuredData, MassFlowNameplateData,
          steamReduction.waterMassFlowMethodData.inletTemperature, steamReduction.waterMassFlowMethodData.outletTemperature);

      let OtherMethodData = new Module.SteamOtherMethodData(steamReduction.otherMethodData.consumption);

      let wasmConvertedInput = new Module.SteamReductionInput(
        steamReduction.hoursPerYear, 
        steamReduction.utilityType, 
        steamReduction.utilityCost,
        steamReduction.measurementMethod, 
        steamReduction.systemEfficiency, 
        steamReduction.pressure,
        FlowMeterMethodData, AirMassFlowMethodData, WaterMassFlowMethodData, OtherMethodData, steamReduction.units);
      inputs.push_back(wasmConvertedInput);

      wasmConvertedInput.delete();
      OtherMethodData.delete();
      WaterMassFlowMethodData.delete();
      AirMassFlowMethodData.delete();
      MassFlowNameplateData.delete();
      MassFlowMeasuredData.delete();
      FlowMeterMethodData.delete();
    });

    let SteamReductionCalculator = new Module.SteamReduction(inputs);
    let output: SteamReductionResult = SteamReductionCalculator.calculate();
    SteamReductionCalculator.delete();
    inputs.delete();
    return output;
  }

  pipeInsulationReduction(inputObj: PipeInsulationReductionInput): PipeInsulationReductionResult {
    let pipeMaterialCoefficients = new Module.DoubleVector();
    let insulationMaterialCoefficients = new Module.DoubleVector();
    inputObj.pipeMaterialCoefficients.forEach(coefficient => pipeMaterialCoefficients.push_back(coefficient));
    inputObj.insulationMaterialCoefficients.forEach(coefficient => insulationMaterialCoefficients.push_back(coefficient));
    
    let wasmConvertedInput = new Module.InsulatedPipeInput(
      inputObj.operatingHours, 
      inputObj.pipeLength, 
      inputObj.pipeDiameter, 
      inputObj.pipeThickness,
      inputObj.pipeTemperature, 
      inputObj.ambientTemperature, 
      inputObj.windVelocity, 
      inputObj.systemEfficiency, 
      inputObj.insulationThickness,
      inputObj.pipeEmissivity, 
      inputObj.jacketEmissivity, 
      pipeMaterialCoefficients, 
      insulationMaterialCoefficients);

    let InsulatedPipeCalculator = new Module.InsulatedPipeCalculator(wasmConvertedInput);

    let rawOutput = InsulatedPipeCalculator.calculate();
    let pipeInsulationReductionResult: PipeInsulationReductionResult = {
      heatLength: rawOutput.getHeatLength(),
      annualHeatLoss: rawOutput.getAnnualHeatLoss(),
      energyCost: undefined,
    }
    InsulatedPipeCalculator.delete();
    wasmConvertedInput.delete();
    insulationMaterialCoefficients.delete();
    pipeMaterialCoefficients.delete();
    return pipeInsulationReductionResult;
  }

  tankInsulationReduction(inputObj: TankInsulationReductionInput): TankInsulationReductionResult {
    let input = new Module.InsulatedTankInput(
      inputObj.operatingHours, 
      inputObj.tankHeight, 
      inputObj.tankDiameter, 
      inputObj.tankThickness,
      inputObj.tankEmissivity, 
      inputObj.tankConductivity, 
      inputObj.tankTemperature, 
      inputObj.ambientTemperature, 
      inputObj.systemEfficiency,
      inputObj.insulationThickness, 
      inputObj.insulationConductivity, 
      inputObj.jacketEmissivity
    );
  let InsulatedTankCalculator = new Module.InsulatedTankCalculator(input);
  let rawOutput = InsulatedTankCalculator.calculate();
  let tankInsulationReductionResult: TankInsulationReductionResult = {
    heatLoss: rawOutput.getHeatLoss(),
    annualHeatLoss: rawOutput.getAnnualHeatLoss(),
    energyCost: undefined,
  }

  InsulatedTankCalculator.delete();
  input.delete();
  return tankInsulationReductionResult;
  }


}
