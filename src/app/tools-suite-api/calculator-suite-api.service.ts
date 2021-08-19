import { Injectable } from '@angular/core';
import { AirLeakSurveyInput, AirLeakSurveyResult, CompressedAirReductionInput, CompressedAirReductionResult, ElectricityReductionInput, ElectricityReductionResult, NaturalGasReductionInput, NaturalGasReductionResult, PipeInsulationReductionInput, PipeInsulationReductionResult, SteamReductionInput, SteamReductionOutput, SteamReductionResult, TankInsulationReductionInput, TankInsulationReductionResult, WaterReductionInput, WaterReductionResult } from '../shared/models/standalone';
import { SuiteApiEnumService } from './suite-api-enum.service';

declare var Module: any;

@Injectable()
export class CalculatorSuiteApiService {

  constructor( ) { }

  electricityReduction(inputObj: ElectricityReductionInput): ElectricityReductionResult {
    let inputs = new Module.ElectricityReductionInputV();
    
    inputObj.electricityReductionInputVec.forEach(electricityReduction => {
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
    let inputs = new Module.CompressedAirLeakSurveyInputV();
    
    inputObj.compressedAirLeakSurveyInputVec.forEach(airLeakSurvey => {
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
