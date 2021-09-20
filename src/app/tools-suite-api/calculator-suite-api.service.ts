import { Injectable } from '@angular/core';
import { AirLeakSurveyData, AirLeakSurveyInput, AirLeakSurveyResult, CompressedAirReductionInput, CompressedAirReductionResult, ElectricityReductionInput, ElectricityReductionResult, NaturalGasReductionInput, NaturalGasReductionResult, PipeInsulationReductionInput, PipeInsulationReductionResult, SteamReductionInput, SteamReductionOutput, SteamReductionResult, TankInsulationReductionInput, TankInsulationReductionResult, WaterReductionInput, WaterReductionResult } from '../shared/models/standalone';
import { SuiteApiEnumService } from './suite-api-enum.service';

declare var Module: any;

@Injectable()
export class CalculatorSuiteApiService {

  constructor(private suiteApiEnumService: SuiteApiEnumService) { }

  electricityReduction(inputObj: ElectricityReductionInput): ElectricityReductionResult {
    let inputs = new Module.ElectricityReductionInputV();
    
    inputObj.electricityReductionInputVec.forEach(electricityReduction => {
      // TODO calc only get results if valid
      electricityReduction.electricityCost = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(electricityReduction.electricityCost);
      electricityReduction.operatingHours = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(electricityReduction.operatingHours);
      electricityReduction.units = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(electricityReduction.units);
      
      electricityReduction.multimeterData.averageCurrent = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(electricityReduction.multimeterData.averageCurrent);
      electricityReduction.multimeterData.numberOfPhases = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(electricityReduction.multimeterData.numberOfPhases);
      electricityReduction.multimeterData.powerFactor = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(electricityReduction.multimeterData.powerFactor);
      electricityReduction.multimeterData.supplyVoltage = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(electricityReduction.multimeterData.supplyVoltage);

      electricityReduction.nameplateData.lineFrequency = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(electricityReduction.nameplateData.lineFrequency);
      electricityReduction.nameplateData.loadFactor = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(electricityReduction.nameplateData.loadFactor);
      electricityReduction.nameplateData.motorAndDriveEfficiency = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(electricityReduction.nameplateData.motorAndDriveEfficiency);
      electricityReduction.nameplateData.operationalFrequency = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(electricityReduction.nameplateData.operationalFrequency);
      electricityReduction.nameplateData.ratedMotorPower = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(electricityReduction.nameplateData.ratedMotorPower);

      electricityReduction.powerMeterData.power = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(electricityReduction.powerMeterData.power);
      electricityReduction.otherMethodData.energy = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(electricityReduction.otherMethodData.energy);

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
      naturalGasReduction.operatingHours = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.operatingHours);
      naturalGasReduction.units = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.units);
      naturalGasReduction.fuelCost = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.fuelCost);
      
      naturalGasReduction.airMassFlowData.inletTemperature = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.airMassFlowData.inletTemperature);
      naturalGasReduction.airMassFlowData.outletTemperature = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.airMassFlowData.outletTemperature);
      naturalGasReduction.airMassFlowData.systemEfficiency = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.airMassFlowData.systemEfficiency);
      naturalGasReduction.airMassFlowData.airMassFlowMeasuredData.airVelocity = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.airMassFlowData.airMassFlowMeasuredData.airVelocity);
      naturalGasReduction.airMassFlowData.airMassFlowMeasuredData.areaOfDuct = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.airMassFlowData.airMassFlowMeasuredData.areaOfDuct);
      naturalGasReduction.airMassFlowData.airMassFlowNameplateData.airFlow = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.airMassFlowData.airMassFlowNameplateData.airFlow);

      naturalGasReduction.flowMeterMethodData.flowRate = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.flowMeterMethodData.flowRate);
      naturalGasReduction.otherMethodData.consumption = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.otherMethodData.consumption);

      naturalGasReduction.waterMassFlowData.inletTemperature = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.waterMassFlowData.inletTemperature);
      naturalGasReduction.waterMassFlowData.outletTemperature = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.waterMassFlowData.outletTemperature);
      naturalGasReduction.waterMassFlowData.systemEfficiency = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.waterMassFlowData.systemEfficiency);
      naturalGasReduction.waterMassFlowData.waterFlow = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(naturalGasReduction.waterMassFlowData.waterFlow);
      
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
      compressedAirReduction.units = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(compressedAirReduction.units);
      compressedAirReduction.hoursPerYear = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(compressedAirReduction.hoursPerYear); 
      compressedAirReduction.utilityCost = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(compressedAirReduction.utilityCost); 

      compressedAirReduction.flowMeterMethodData.meterReading = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(compressedAirReduction.flowMeterMethodData.meterReading);
      
      compressedAirReduction.bagMethodData.height = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(compressedAirReduction.bagMethodData.height);
      compressedAirReduction.bagMethodData.diameter = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(compressedAirReduction.bagMethodData.diameter);
      compressedAirReduction.bagMethodData.fillTime = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(compressedAirReduction.bagMethodData.fillTime);
      
      compressedAirReduction.pressureMethodData.nozzleType = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(compressedAirReduction.pressureMethodData.nozzleType);
      compressedAirReduction.pressureMethodData.numberOfNozzles = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(compressedAirReduction.pressureMethodData.numberOfNozzles);
      compressedAirReduction.pressureMethodData.supplyPressure = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(compressedAirReduction.pressureMethodData.supplyPressure);
      
      compressedAirReduction.otherMethodData.consumption = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(compressedAirReduction.otherMethodData.consumption);
      compressedAirReduction.compressorElectricityData.compressorControlAdjustment = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(compressedAirReduction.compressorElectricityData.compressorControlAdjustment);
      compressedAirReduction.compressorElectricityData.compressorSpecificPower = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(compressedAirReduction.compressorElectricityData.compressorSpecificPower);

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
      input.utilityCost = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.utilityCost);

      // TODO all methods should not calculate if missing required props
      input.bagMethodData.diameter = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.bagMethodData.diameter);
      input.bagMethodData.fillTime = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.bagMethodData.fillTime);
      input.bagMethodData.height = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.bagMethodData.height);
      // estimate method
      input.estimateMethodData.leakRateEstimate = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.estimateMethodData.leakRateEstimate);
      // orifice method
      input.orificeMethodData.atmosphericPressure = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.atmosphericPressure);
      input.orificeMethodData.compressorAirTemp = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.compressorAirTemp);
      input.orificeMethodData.dischargeCoefficient = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.dischargeCoefficient);
      input.orificeMethodData.numberOfOrifices = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.numberOfOrifices);
      input.orificeMethodData.orificeDiameter = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.orificeDiameter);
      input.orificeMethodData.supplyPressure = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.supplyPressure);
      
      input.decibelsMethodData.decibelRatingA = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.atmosphericPressure);
      input.decibelsMethodData.decibelRatingB = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.compressorAirTemp);
      input.decibelsMethodData.decibels = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.dischargeCoefficient);
      input.decibelsMethodData.firstFlowA = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.numberOfOrifices);
      input.decibelsMethodData.firstFlowB = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.orificeDiameter);
      input.decibelsMethodData.linePressure = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.supplyPressure);
      input.decibelsMethodData.pressureA = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.supplyPressure);
      input.decibelsMethodData.pressureB = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.supplyPressure);
      input.decibelsMethodData.secondFlowA = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.supplyPressure);
      input.decibelsMethodData.secondFlowB = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(input.orificeMethodData.supplyPressure);
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
      waterReduction.waterCost = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(waterReduction.waterCost);
      waterReduction.hoursPerYear = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(waterReduction.hoursPerYear);
      
      waterReduction.meteredFlowMethodData.meterReading = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(waterReduction.meteredFlowMethodData.meterReading);

      waterReduction.volumeMeterMethodData.elapsedTime = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(waterReduction.volumeMeterMethodData.elapsedTime);
      waterReduction.volumeMeterMethodData.finalMeterReading = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(waterReduction.volumeMeterMethodData.finalMeterReading);
      waterReduction.volumeMeterMethodData.initialMeterReading = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(waterReduction.volumeMeterMethodData.initialMeterReading);

      waterReduction.bucketMethodData.bucketFillTime = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(waterReduction.bucketMethodData.bucketFillTime);
      waterReduction.bucketMethodData.bucketVolume = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(waterReduction.bucketMethodData.bucketVolume);
      waterReduction.otherMethodData.consumption = this.suiteApiEnumService.convertNullInputValueForObjectConstructor(waterReduction.otherMethodData.consumption);

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
