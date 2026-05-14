import { Injectable } from '@angular/core';
import { AirLeakSurveyData, AirLeakSurveyInput, AirLeakSurveyResult, CompressedAirReductionInput, CompressedAirReductionResult, ElectricityReductionInput, ElectricityReductionResult, NaturalGasReductionInput, NaturalGasReductionResult, PipeInsulationReductionInput, PipeInsulationReductionResult, PowerFactorTriangleModeInputs, PowerFactorTriangleOutputs, SteamReductionInput, SteamReductionOutput, SteamReductionResult, TankInsulationReductionInput, TankInsulationReductionResult, WaterReductionInput, WaterReductionResult } from '../shared/models/standalone';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ValveEnergyLossInputs, ValveEnergyLossOutputs, ValveEnergyLossResults } from '../shared/models/calculators';
import { ToolsSuiteApiService } from './tools-suite-api.service';


@Injectable()
export class CalculatorSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService,
    private toolsSuiteApiService: ToolsSuiteApiService
  ) { }

  electricityReduction(inputObj: ElectricityReductionInput): ElectricityReductionResult {
    let inputs = new this.toolsSuiteApiService.ToolsSuiteModule.ElectricityReductionInputV();
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

      const measurementMethod = this.suiteApiHelperService.getElectricityReductionMeasurementMethodEnum(electricityReduction.measurementMethod);


      let wasmConvertedInput = {
        operatingHours: electricityReduction.operatingHours,
        electricityCost: electricityReduction.electricityCost,
        measurementMethod: measurementMethod,
        multimeterData: {
          numberOfPhases: electricityReduction.multimeterData.numberOfPhases,
          supplyVoltage: electricityReduction.multimeterData.supplyVoltage,
          averageCurrent: electricityReduction.multimeterData.averageCurrent,
          powerFactor: electricityReduction.multimeterData.powerFactor
        },
        nameplateData: {
          ratedMotorPower: electricityReduction.nameplateData.ratedMotorPower,
          variableSpeedMotor: electricityReduction.nameplateData.variableSpeedMotor,
          operationalFrequency: electricityReduction.nameplateData.operationalFrequency,
          lineFrequency: electricityReduction.nameplateData.lineFrequency,
          motorAndDriveEfficiency: electricityReduction.nameplateData.motorAndDriveEfficiency,
          loadFactor: electricityReduction.nameplateData.loadFactor
        },
        powerMeterData: {
          power: electricityReduction.powerMeterData.power
        },
        otherMethodData: {
          energy: electricityReduction.otherMethodData.energy
        },
        units: electricityReduction.units
      };

      inputs.push_back(wasmConvertedInput);
    });

    let output = this.toolsSuiteApiService.ToolsSuiteModule.electricityReduction(inputs);
    let results: ElectricityReductionResult = {
      energyUse: output.energyUse,
      energyCost: output.energyCost,
      power: output.power
    }
    inputs.delete();
    return results;
  }

  naturalGasReduction(inputObj: NaturalGasReductionInput): NaturalGasReductionResult {
    let inputs = new this.toolsSuiteApiService.ToolsSuiteModule.NaturalGasReductionInputV();

    inputObj.naturalGasReductionInputVec.forEach(naturalGasReduction => {
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

      const measurementMethod = this.suiteApiHelperService.getNaturalGasReductionMeasurementMethodEnum(naturalGasReduction.measurementMethod);

      let wasmConvertedInput = {
        operatingHours: naturalGasReduction.operatingHours,
        fuelCost: naturalGasReduction.fuelCost,
        measurementMethod: measurementMethod,
        flowMeterMethodData: {
          flowRate: naturalGasReduction.flowMeterMethodData.flowRate
        },
        otherMethodData: {
          consumption: naturalGasReduction.otherMethodData.consumption
        },
        airMassFlowData: {
          isNameplate: naturalGasReduction.airMassFlowData.isNameplate,
          measuredData: {
            areaOfDuct: naturalGasReduction.airMassFlowData.airMassFlowMeasuredData.areaOfDuct,
            airVelocity: naturalGasReduction.airMassFlowData.airMassFlowMeasuredData.airVelocity
          },
          nameplateData: {
            airFlow: naturalGasReduction.airMassFlowData.airMassFlowNameplateData.airFlow
          },
          inletTemperature: naturalGasReduction.airMassFlowData.inletTemperature,
          outletTemperature: naturalGasReduction.airMassFlowData.outletTemperature,
          systemEfficiency: naturalGasReduction.airMassFlowData.systemEfficiency
        },
        waterMassFlowData: {
          waterFlow: naturalGasReduction.waterMassFlowData.waterFlow,
          inletTemperature: naturalGasReduction.waterMassFlowData.inletTemperature,
          outletTemperature: naturalGasReduction.waterMassFlowData.outletTemperature,
          systemEfficiency: naturalGasReduction.waterMassFlowData.systemEfficiency
        },
        units: naturalGasReduction.units
      };
      inputs.push_back(wasmConvertedInput);
    });

    let output = this.toolsSuiteApiService.ToolsSuiteModule.naturalGasReduction(inputs);
    let results: NaturalGasReductionResult = {
      energyUse: output.energyUse,
      energyCost: output.energyCost,
      heatFlow: output.heatFlow,
      totalFlow: output.totalFlow
    };
    inputs.delete();
    return results;
  }

  compressedAirReduction(inputObj: CompressedAirReductionInput): CompressedAirReductionResult {
    let inputs = new this.toolsSuiteApiService.ToolsSuiteModule.CompressedAirReductionInputV();

    inputObj.compressedAirReductionInputVec.forEach(compressedAirReduction => {
      compressedAirReduction.units = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.units);
      compressedAirReduction.hoursPerYear = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.hoursPerYear);
      compressedAirReduction.utilityCost = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.utilityCost);

      compressedAirReduction.flowMeterMethodData.meterReading = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.flowMeterMethodData.meterReading);
      compressedAirReduction.bagMethodData.bagFillTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.bagMethodData.bagFillTime);
      compressedAirReduction.bagMethodData.bagVolume = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.bagMethodData.bagVolume);

      compressedAirReduction.pressureMethodData.nozzleType = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.pressureMethodData.nozzleType);
      compressedAirReduction.pressureMethodData.numberOfNozzles = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.pressureMethodData.numberOfNozzles);
      compressedAirReduction.pressureMethodData.supplyPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.pressureMethodData.supplyPressure);

      compressedAirReduction.otherMethodData.consumption = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.otherMethodData.consumption);
      compressedAirReduction.compressorElectricityData.compressorControlAdjustment = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.compressorElectricityData.compressorControlAdjustment);
      compressedAirReduction.compressorElectricityData.compressorSpecificPower = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(compressedAirReduction.compressorElectricityData.compressorSpecificPower);

      let CompressedAirFlowMeterMethodData = new this.toolsSuiteApiService.ToolsSuiteModule.CompressedAirFlowMeterMethodData(compressedAirReduction.flowMeterMethodData.meterReading);
      // hardcoded 1 - always calculate as single unit
      let BagMethod = new this.toolsSuiteApiService.ToolsSuiteModule.BagMethod(compressedAirReduction.bagMethodData.operatingTime, compressedAirReduction.bagMethodData.bagFillTime, compressedAirReduction.bagMethodData.bagVolume, 1);
      let PressureMethodData = new this.toolsSuiteApiService.ToolsSuiteModule.PressureMethodData(compressedAirReduction.pressureMethodData.nozzleType, compressedAirReduction.pressureMethodData.numberOfNozzles,
        compressedAirReduction.pressureMethodData.supplyPressure);
      let CompressedAirOtherMethodData = new this.toolsSuiteApiService.ToolsSuiteModule.CompressedAirOtherMethodData(compressedAirReduction.otherMethodData.consumption);
      let CompressorElectricityData = new this.toolsSuiteApiService.ToolsSuiteModule.CompressorElectricityData(compressedAirReduction.compressorElectricityData.compressorControlAdjustment,
        compressedAirReduction.compressorElectricityData.compressorSpecificPower);

      let wasmConvertedInput = new this.toolsSuiteApiService.ToolsSuiteModule.CompressedAirReductionInput(
        compressedAirReduction.hoursPerYear,
        compressedAirReduction.utilityType,
        compressedAirReduction.utilityCost,
        compressedAirReduction.measurementMethod,
        CompressedAirFlowMeterMethodData, BagMethod, PressureMethodData, CompressedAirOtherMethodData, CompressorElectricityData, compressedAirReduction.units);
      inputs.push_back(wasmConvertedInput);

      wasmConvertedInput.delete();
      CompressedAirFlowMeterMethodData.delete();
      BagMethod.delete();
      PressureMethodData.delete();
      CompressedAirOtherMethodData.delete();
      CompressorElectricityData.delete();
    });

    let CompressedAirReductionCalculator = new this.toolsSuiteApiService.ToolsSuiteModule.CompressedAirReduction(inputs);
    let output = CompressedAirReductionCalculator.calculate();
    let results: CompressedAirReductionResult = {
      energyUse: output.energyUse,
      energyCost: output.energyCost,
      flowRate: output.flowRate,
      singleNozzeFlowRate: output.singleNozzeFlowRate,
      consumption: output.consumption
    }

    output.delete();
    CompressedAirReductionCalculator.delete();
    inputs.delete();
    return results;
  }


  /**
   * Calculate Air Leak Survey results
   * 
   * Bag Method: totalFlowRate is in scfm, annualTotalFlowRate is in kscf, energy in mWh
   * 
   * All Other methods: totalFlowRate is in scfm, annualTotalFlowRate in scf, energy in kWh
   * @returns AirLeakSurveyResult - units described above
   */
  compressedAirLeakSurvey(inputObj: AirLeakSurveyInput): AirLeakSurveyResult {
    let convertedInput: Array<AirLeakSurveyData> = inputObj.compressedAirLeakSurveyInputVec.map(input => {

      // TODO all methods should not calculate if missing required props
      input.bagMethodData.bagFillTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.bagMethodData.bagFillTime);
      input.bagMethodData.bagVolume = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.bagMethodData.bagVolume);

      // estimate method
      input.estimateMethodData.leakRateEstimate = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.estimateMethodData.leakRateEstimate);
      // orifice method
      input.orificeMethodData.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.atmosphericPressure);
      input.orificeMethodData.compressorAirTemp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.compressorAirTemp);
      input.orificeMethodData.dischargeCoefficient = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.dischargeCoefficient);
      input.orificeMethodData.numberOfOrifices = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.numberOfOrifices);
      input.orificeMethodData.orificeDiameter = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.orificeDiameter);
      input.orificeMethodData.supplyPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeMethodData.supplyPressure);

      input.decibelsMethodData.decibelRatingA = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.decibelsMethodData.decibelRatingA);
      input.decibelsMethodData.decibelRatingB = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.decibelsMethodData.decibelRatingB);
      input.decibelsMethodData.decibels = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.decibelsMethodData.decibels);
      input.decibelsMethodData.firstFlowA = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.decibelsMethodData.firstFlowA);
      input.decibelsMethodData.firstFlowB = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.decibelsMethodData.firstFlowB);
      input.decibelsMethodData.linePressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.decibelsMethodData.linePressure);
      input.decibelsMethodData.pressureA = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.decibelsMethodData.pressureA);
      input.decibelsMethodData.pressureB = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.decibelsMethodData.pressureB);
      input.decibelsMethodData.secondFlowA = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.decibelsMethodData.secondFlowA);
      input.decibelsMethodData.secondFlowB = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.decibelsMethodData.secondFlowB);
      return input;
    });
    let inputs = new this.toolsSuiteApiService.ToolsSuiteModule.CompressedAirLeakSurveyInputV();

    convertedInput.forEach((airLeakSurvey: AirLeakSurveyData) => {
      let EstimateMethodData = new this.toolsSuiteApiService.ToolsSuiteModule.EstimateMethodData(airLeakSurvey.estimateMethodData.leakRateEstimate);
      airLeakSurvey.bagMethodData.bagFillTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.bagMethodData.bagFillTime);
      airLeakSurvey.bagMethodData.bagVolume = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.bagMethodData.bagVolume);

      // make TH backwards compatible. hours are undefined in update-data service. There is probably a bug in TH init for air leak daa 
      let operatingTime = airLeakSurvey.bagMethodData.operatingTime ? airLeakSurvey.bagMethodData.operatingTime : inputObj.facilityCompressorData.hoursPerYear;
      // hardcoded 1 - always calculate as single unit
      let BagMethod = new this.toolsSuiteApiService.ToolsSuiteModule.BagMethod(operatingTime, airLeakSurvey.bagMethodData.bagFillTime, airLeakSurvey.bagMethodData.bagVolume, 1);
      let DecibelsMethodData = new this.toolsSuiteApiService.ToolsSuiteModule.DecibelsMethodData(airLeakSurvey.decibelsMethodData.linePressure,
        airLeakSurvey.decibelsMethodData.decibels, airLeakSurvey.decibelsMethodData.decibelRatingA, airLeakSurvey.decibelsMethodData.pressureA,
        airLeakSurvey.decibelsMethodData.firstFlowA, airLeakSurvey.decibelsMethodData.secondFlowA, airLeakSurvey.decibelsMethodData.decibelRatingB,
        airLeakSurvey.decibelsMethodData.pressureB, airLeakSurvey.decibelsMethodData.firstFlowB, airLeakSurvey.decibelsMethodData.secondFlowB);

      let OrificeMethodData = new this.toolsSuiteApiService.ToolsSuiteModule.OrificeMethodData(airLeakSurvey.orificeMethodData.compressorAirTemp,
        airLeakSurvey.orificeMethodData.atmosphericPressure, airLeakSurvey.orificeMethodData.dischargeCoefficient,
        airLeakSurvey.orificeMethodData.orificeDiameter, airLeakSurvey.orificeMethodData.supplyPressure, airLeakSurvey.orificeMethodData.numberOfOrifices);

      // todo convert for nulls like above
      let CompressorElectricityData = new this.toolsSuiteApiService.ToolsSuiteModule.CompressorElectricityData(inputObj.facilityCompressorData.compressorElectricityData.compressorControlAdjustment,
        inputObj.facilityCompressorData.compressorElectricityData.compressorSpecificPower);

      let wasmConvertedInput = new this.toolsSuiteApiService.ToolsSuiteModule.CompressedAirLeakSurveyInput(
        inputObj.facilityCompressorData.hoursPerYear,
        inputObj.facilityCompressorData.utilityType,
        inputObj.facilityCompressorData.utilityCost,
        airLeakSurvey.measurementMethod,
        EstimateMethodData,
        DecibelsMethodData,
        BagMethod,
        OrificeMethodData,
        CompressorElectricityData,
        airLeakSurvey.units
      );
      inputs.push_back(wasmConvertedInput);

      wasmConvertedInput.delete();
      EstimateMethodData.delete();
      DecibelsMethodData.delete();
      BagMethod.delete();
      OrificeMethodData.delete();
      CompressorElectricityData.delete();
    });

    let CompressedAirLeakSurveyCalculator = new this.toolsSuiteApiService.ToolsSuiteModule.CompressedAirLeakSurvey(inputs);
    let output = CompressedAirLeakSurveyCalculator.calculate();
    let results: AirLeakSurveyResult = {
      totalFlowRate: output.totalFlowRate,
      annualTotalFlowRate: output.annualTotalFlowRate,
      annualTotalElectricity: output.annualTotalElectricity,
      annualTotalElectricityCost: output.annualTotalElectricityCost,
    }

    output.delete();
    CompressedAirLeakSurveyCalculator.delete();
    inputs.delete();
    return results;
  }


  waterReduction(inputObj: WaterReductionInput): WaterReductionResult {
    let inputs = new this.toolsSuiteApiService.ToolsSuiteModule.WaterReductionInputV();

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
      const measurementMethod = this.suiteApiHelperService.getWaterReductionMeasurementMethodEnum(waterReduction.measurementMethod);
      inputs.push_back({
        hoursPerYear: waterReduction.hoursPerYear,
        waterCost: waterReduction.waterCost,
        measurementMethod: measurementMethod,
        meteredFlowMethodData: { meterReading: waterReduction.meteredFlowMethodData.meterReading },
        volumeMeterMethodData: {
          finalMeterReading: waterReduction.volumeMeterMethodData.finalMeterReading,
          initialMeterReading: waterReduction.volumeMeterMethodData.initialMeterReading,
          elapsedTime: waterReduction.volumeMeterMethodData.elapsedTime
        },
        bucketMethodData: {
          bucketVolume: waterReduction.bucketMethodData.bucketVolume,
          bucketFillTime: waterReduction.bucketMethodData.bucketFillTime
        },
        otherMethodData: { consumption: waterReduction.otherMethodData.consumption }
      });
    });

    let output = this.toolsSuiteApiService.ToolsSuiteModule.waterReduction(inputs);
    let results: WaterReductionResult = {
      waterUse: output.waterUse,
      waterCost: output.waterCost,
      annualWaterSavings: 0,
      costSavings: 0
    };
    inputs.delete();
    return results;
  }

  steamReduction(inputObj: SteamReductionInput): SteamReductionResult {
    let inputs = new this.toolsSuiteApiService.ToolsSuiteModule.SteamReductionInputV();

    inputObj.steamReductionInputVec.forEach(steamReduction => {
      const measurementMethod = this.suiteApiHelperService.getSteamMeasurementMethodEnum(steamReduction.measurementMethod);
      const utilityType = this.suiteApiHelperService.getSteamUtilityTypeEnum(steamReduction.utilityType);
      const steamVariableOption = this.suiteApiHelperService.getThermodynamicQuantityType(steamReduction.steamVariableOption);

      let wasmConvertedInput = {
        hoursPerYear: steamReduction.hoursPerYear,
        utilityType: utilityType,
        utilityCost: steamReduction.utilityCost,
        measurementMethod: measurementMethod,
        systemEfficiency: steamReduction.systemEfficiency,
        pressure: steamReduction.pressure,
        flowMeterMethodData: {
          flowRate: steamReduction.flowMeterMethodData.flowRate
        },
        airMassFlowMethodData: {
          isNameplate: steamReduction.airMassFlowMethodData.isNameplate,
          massFlowMeasuredData: {
            areaOfDuct: steamReduction.airMassFlowMethodData.massFlowMeasuredData.areaOfDuct,
            airVelocity: steamReduction.airMassFlowMethodData.massFlowMeasuredData.airVelocity
          },
          massFlowNameplateData: {
            flowRate: steamReduction.airMassFlowMethodData.massFlowNameplateData.flowRate
          },
          inletTemperature: steamReduction.airMassFlowMethodData.inletTemperature,
          outletTemperature: steamReduction.airMassFlowMethodData.outletTemperature
        },
        waterMassFlowMethodData: {
          isNameplate: steamReduction.waterMassFlowMethodData.isNameplate,
          massFlowMeasuredData: {
            areaOfDuct: steamReduction.waterMassFlowMethodData.massFlowMeasuredData.areaOfDuct,
            airVelocity: steamReduction.waterMassFlowMethodData.massFlowMeasuredData.airVelocity
          },
          massFlowNameplateData: {
            flowRate: steamReduction.waterMassFlowMethodData.massFlowNameplateData.flowRate
          },
          inletTemperature: steamReduction.waterMassFlowMethodData.inletTemperature,
          outletTemperature: steamReduction.waterMassFlowMethodData.outletTemperature
        },
        offsheetMethodData: {
          consumption: steamReduction.otherMethodData.consumption
        },
        units: steamReduction.units,
        boilerEfficiency: steamReduction.boilerEfficiency,
        steamVariableOption: steamVariableOption,
        steamVariable: steamReduction.steamVariable,
        feedWaterTemperature: steamReduction.feedWaterTemperature
      };
      inputs.push_back(wasmConvertedInput);
    });

    let output = this.toolsSuiteApiService.ToolsSuiteModule.steamReduction(inputs);
    let results: SteamReductionResult = {
      energyCost: output.energyCost,
      energyUse: output.energyUse,
      steamUse: output.steamUse
    };
    inputs.delete();
    return results;
  }

  pipeInsulationReduction(inputObj: PipeInsulationReductionInput): PipeInsulationReductionResult {
    let pipeMaterialCoefficients = new this.toolsSuiteApiService.ToolsSuiteModule.DoubleVector();
    let insulationMaterialCoefficients = new this.toolsSuiteApiService.ToolsSuiteModule.DoubleVector();
    inputObj.pipeMaterialCoefficients.forEach(coefficient => pipeMaterialCoefficients.push_back(coefficient));
    inputObj.insulationMaterialCoefficients.forEach(coefficient => insulationMaterialCoefficients.push_back(coefficient));

    inputObj.systemEfficiency = inputObj.systemEfficiency / 100;
    let wasmConvertedInput = new this.toolsSuiteApiService.ToolsSuiteModule.InsulatedPipeInput(
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

    let InsulatedPipeReduction = new this.toolsSuiteApiService.ToolsSuiteModule.InsulatedPipeReduction(wasmConvertedInput);

    let rawOutput = InsulatedPipeReduction.calculate();
    let pipeInsulationReductionResult: PipeInsulationReductionResult = {
      heatLength: rawOutput.getHeatLength(),
      annualHeatLoss: rawOutput.getAnnualHeatLoss(),
      energyCost: undefined,
    }
    rawOutput.delete();
    InsulatedPipeReduction.delete();
    wasmConvertedInput.delete();
    insulationMaterialCoefficients.delete();
    pipeMaterialCoefficients.delete();
    return pipeInsulationReductionResult;
  }

  tankInsulationReduction(inputObj: TankInsulationReductionInput): TankInsulationReductionResult {
    let input = new this.toolsSuiteApiService.ToolsSuiteModule.InsulatedTankInput(
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
      inputObj.jacketEmissivity,
      inputObj.surfaceTemperature
    );
    let InsulatedTankReduction = new this.toolsSuiteApiService.ToolsSuiteModule.InsulatedTankReduction(input);
    let rawOutput = InsulatedTankReduction.calculate();
    let tankInsulationReductionResult: TankInsulationReductionResult = {
      heatLoss: rawOutput.getHeatLoss(),
      annualHeatLoss: rawOutput.getAnnualHeatLoss() * 100,
      energyCost: undefined,
    }
    rawOutput.delete();
    InsulatedTankReduction.delete();
    input.delete();
    return tankInsulationReductionResult;
  }

  powerFactorTriangle(inputObj: PowerFactorTriangleModeInputs): PowerFactorTriangleOutputs {
    let modeEnum = this.suiteApiHelperService.getPowerFactorModeEnum(inputObj.mode);
    inputObj.mode = modeEnum;
    inputObj.input1 = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.input1);
    inputObj.input2 = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.input2);
    inputObj.inputPowerFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.inputPowerFactor);
    let PowerFactor = new this.toolsSuiteApiService.ToolsSuiteModule.PowerFactor();
    let rawOutput = PowerFactor.calculate(inputObj.mode, inputObj.input1, inputObj.input2, inputObj.inputPowerFactor);
    let powerFactorTriangleOutputs: PowerFactorTriangleOutputs = {
      apparentPower: rawOutput.apparentPower,
      realPower: rawOutput.realPower,
      reactivePower: rawOutput.reactivePower,
      phaseAngle: rawOutput.phaseAngle,
      powerFactor: rawOutput.powerFactor,
    }
    rawOutput.delete();
    PowerFactor.delete();
    return powerFactorTriangleOutputs;
  }

  valveEnergyLossCalc(baselineInputs: ValveEnergyLossInputs, modificationInputs: ValveEnergyLossInputs): ValveEnergyLossResults {
    let PumpValvePowerLoss = new this.toolsSuiteApiService.ToolsSuiteModule.PumpValvePowerLoss();
    let baselineRawOutputs = PumpValvePowerLoss.calculate(baselineInputs.hoursOperation, baselineInputs.efficiencyPump / 100, baselineInputs.efficiencyMotor / 100, baselineInputs.SG, baselineInputs.flowRate, baselineInputs.upstreamPressure, baselineInputs.upstreamHeight, baselineInputs.downstreamPressure, baselineInputs.downstreamHeight);
    let modificationRawOutputs = PumpValvePowerLoss.calculate(modificationInputs.hoursOperation, modificationInputs.efficiencyPump / 100, modificationInputs.efficiencyMotor / 100, modificationInputs.SG, modificationInputs.flowRate, modificationInputs.upstreamPressure, modificationInputs.upstreamHeight, modificationInputs.downstreamPressure, modificationInputs.downstreamHeight);

    let baselineOutputs: ValveEnergyLossOutputs = {
      headLoss: baselineRawOutputs.head_loss,
      powerLossFrictional: baselineRawOutputs.power_loss_frictional,
      powerLossElectrical: baselineRawOutputs.power_loss_electrical,
      annualEnergyLoss: baselineRawOutputs.annual_energy_loss,
      annualEnergyCost: baselineRawOutputs.annual_energy_loss * baselineInputs.electricalRate,
    };

    let modificationOutputs: ValveEnergyLossOutputs = {
      headLoss: modificationRawOutputs.head_loss,
      powerLossFrictional: modificationRawOutputs.power_loss_frictional,
      powerLossElectrical: modificationRawOutputs.power_loss_electrical,
      annualEnergyLoss: modificationRawOutputs.annual_energy_loss,
      annualEnergyCost: modificationRawOutputs.annual_energy_loss * modificationInputs.electricalRate,
    };

    let valveEnergyLossOutputs: ValveEnergyLossResults = {
      baselineOutputs: baselineOutputs,
      modificationOutputs: modificationOutputs,
    };

    baselineRawOutputs.delete();
    modificationRawOutputs.delete();
    PumpValvePowerLoss.delete();

    return valveEnergyLossOutputs;
  }

}
