import { Injectable } from '@angular/core';
import { AirLeakSurveyData, AirLeakSurveyInput, AirLeakSurveyResult, CompressedAirReductionInput, CompressedAirReductionResult, ElectricityReductionInput, ElectricityReductionResult, NaturalGasReductionInput, NaturalGasReductionResult, PipeInsulationReductionInput, PipeInsulationReductionResult, PowerFactorTriangleModeInputs, PowerFactorTriangleOutputs, SteamReductionInput, SteamReductionOutput, SteamReductionResult, TankInsulationReductionInput, TankInsulationReductionResult, WaterReductionInput, WaterReductionResult } from '../shared/models/standalone';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ValveEnergyLossInputs, ValveEnergyLossOutputs, ValveEnergyLossResults } from '../shared/models/calculators';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import {
  type CompressedAirLeakSurveyInput as SuiteCompressedAirLeakSurveyInput,
  type CompressedAirLeakSurveyResult as SuiteCompressedAirLeakSurveyResult,
  type CompressedAirMeasurementMethod,
  type CompressedAirReductionInput as SuiteCompressedAirReductionInput,
  type CompressedAirReductionInputV,
  type CompressedAirReductionOutput,
  type CompressedAirUtilityType,
  type DoubleVector,
  type ElectricityReductionInput as SuiteElectricityReductionInput,
  type ElectricityReductionInputV,
  type ElectricityReductionMeasurementMethod,
  type ElectricityReductionOutput,
  type InsulatedPipeInput,
  type InsulatedPipeOutput,
  type InsulatedTankInput,
  type InsulatedTankOutput,
  type MeasurementMethod as CompressedAirLeakSurveyMeasurementMethod,
  type NaturalGasMeasurementMethod,
  type NaturalGasReductionInput as SuiteNaturalGasReductionInput,
  type NaturalGasReductionInputV,
  type NaturalGasReductionOutput,
  type PowerFactor as SuitePowerFactor,
  type PowerFactorModeType,
  type PowerFactorOutput,
  type PumpValvePowerLoss as SuitePumpValvePowerLoss,
  type PumpValvePowerLossOutput,
  type SteamMeasurementMethod,
  type SteamReductionInput as SuiteSteamReductionInput,
  type SteamReductionInputV,
  type SteamReductionOutput as SuiteSteamReductionOutput,
  type SteamUtilityType,
  type ThermodynamicQuantity,
  type UtilityTypeCA as CompressedAirLeakSurveyUtilityType,
  type WaterReductionInput as SuiteWaterReductionInput,
  type WaterReductionInputV,
  type WaterReductionMeasurementMethod,
  type WaterReductionOutput,
} from 'measur-tools-suite';


@Injectable()
export class CalculatorSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService,
    private toolsSuiteApiService: ToolsSuiteApiService
  ) { }

  electricityReduction(inputObj: ElectricityReductionInput): ElectricityReductionResult {
    let inputs: ElectricityReductionInputV = new this.toolsSuiteApiService.ToolsSuiteModule.ElectricityReductionInputV();
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

      const measurementMethod: ElectricityReductionMeasurementMethod = this.suiteApiHelperService.getElectricityReductionMeasurementMethodEnum(electricityReduction.measurementMethod);


      let wasmConvertedInput: SuiteElectricityReductionInput = {
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

    let output: ElectricityReductionOutput = this.toolsSuiteApiService.ToolsSuiteModule.electricityReduction(inputs);
    let results: ElectricityReductionResult = {
      energyUse: output.energyUse,
      energyCost: output.energyCost,
      power: output.power
    }
    inputs.delete();
    return results;
  }

  naturalGasReduction(inputObj: NaturalGasReductionInput): NaturalGasReductionResult {
    let inputs: NaturalGasReductionInputV = new this.toolsSuiteApiService.ToolsSuiteModule.NaturalGasReductionInputV();

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

      const measurementMethod: NaturalGasMeasurementMethod = this.suiteApiHelperService.getNaturalGasReductionMeasurementMethodEnum(naturalGasReduction.measurementMethod);

      let wasmConvertedInput: SuiteNaturalGasReductionInput = {
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

    let output: NaturalGasReductionOutput = this.toolsSuiteApiService.ToolsSuiteModule.naturalGasReduction(inputs);
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
    let inputs: CompressedAirReductionInputV = new this.toolsSuiteApiService.ToolsSuiteModule.CompressedAirReductionInputV();

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

      const measurementMethod: CompressedAirMeasurementMethod = this.suiteApiHelperService.getCompressedAirMeasurementMethodEnum(compressedAirReduction.measurementMethod);
      const utilityType: CompressedAirUtilityType = this.suiteApiHelperService.getCompressedAirUtilityTypeEnum(compressedAirReduction.utilityType);

      let wasmConvertedInput: SuiteCompressedAirReductionInput = {
        hoursPerYear: compressedAirReduction.hoursPerYear,
        utilityType: utilityType,
        utilityCost: compressedAirReduction.utilityCost,
        measurementMethod: measurementMethod,
        flowMeterMethodData: {
          meterReading: compressedAirReduction.flowMeterMethodData.meterReading
        },
        bagMethodData: {
          bagFillTime: compressedAirReduction.bagMethodData.bagFillTime,
          bagVolume: compressedAirReduction.bagMethodData.bagVolume
        },
        pressureMethodData: {
          nozzleType: compressedAirReduction.pressureMethodData.nozzleType,
          numberOfNozzles: compressedAirReduction.pressureMethodData.numberOfNozzles,
          supplyPressure: compressedAirReduction.pressureMethodData.supplyPressure
        },
        otherMethodData: {
          consumption: compressedAirReduction.otherMethodData.consumption
        },
        compressorElectricityData: {
          compressorControlAdjustment: compressedAirReduction.compressorElectricityData.compressorControlAdjustment,
          compressorSpecificPower: compressedAirReduction.compressorElectricityData.compressorSpecificPower
        },
        units: compressedAirReduction.units
      };

      inputs.push_back(wasmConvertedInput);
    });

    let output: CompressedAirReductionOutput = this.toolsSuiteApiService.ToolsSuiteModule.compressedAirReduction(inputs);
    let results: CompressedAirReductionResult = {
      energyUse: output.energyUse,
      energyCost: output.energyCost,
      flowRate: output.flowRate,
      singleNozzleFlowRate: output.singleNozzleFlowRate,
      consumption: output.consumption
    };

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
    const inputs: Array<SuiteCompressedAirLeakSurveyInput> = inputObj.compressedAirLeakSurveyInputVec.map((airLeakSurvey: AirLeakSurveyData) => {
      // make TH backwards compatible. hours are undefined in update-data service.
      const operatingTime: number = airLeakSurvey.bagMethodData.operatingTime ? airLeakSurvey.bagMethodData.operatingTime : inputObj.facilityCompressorData.hoursPerYear;

      return {
        hoursPerYear: inputObj.facilityCompressorData.hoursPerYear,
        utilityType: inputObj.facilityCompressorData.utilityType as CompressedAirLeakSurveyUtilityType,
        utilityCost: inputObj.facilityCompressorData.utilityCost,
        measurementMethod: airLeakSurvey.measurementMethod as CompressedAirLeakSurveyMeasurementMethod,
        estimateMethodInput: {
          operatingTime: inputObj.facilityCompressorData.hoursPerYear,
          leakRateEstimate: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.estimateMethodData.leakRateEstimate),
        },
        decibelsMethodInput: {
          operatingTime: 0,
          linePressure: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.decibelsMethodData.linePressure),
          decibels: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.decibelsMethodData.decibels),
          decibelRatingA: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.decibelsMethodData.decibelRatingA),
          pressureA: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.decibelsMethodData.pressureA),
          firstFlowA: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.decibelsMethodData.firstFlowA),
          secondFlowA: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.decibelsMethodData.secondFlowA),
          decibelRatingB: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.decibelsMethodData.decibelRatingB),
          pressureB: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.decibelsMethodData.pressureB),
          firstFlowB: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.decibelsMethodData.firstFlowB),
          secondFlowB: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.decibelsMethodData.secondFlowB),
        },
        // hardcoded numberOfUnits: 1 - always calculate as single unit
        bagMethodInput: {
          operatingTime: operatingTime,
          bagFillTime: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.bagMethodData.bagFillTime),
          bagVolume: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.bagMethodData.bagVolume),
          numberOfUnits: 1,
        },
        orificeMethodInput: {
          operatingTime: 0,
          airTemp: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.orificeMethodData.compressorAirTemp),
          atmPressure: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.orificeMethodData.atmosphericPressure),
          dischargeCoef: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.orificeMethodData.dischargeCoefficient),
          diameter: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.orificeMethodData.orificeDiameter),
          supplyPressure: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.orificeMethodData.supplyPressure),
          numOrifices: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(airLeakSurvey.orificeMethodData.numberOfOrifices),
        },
        compressorElectricityData: {
          compressorControlAdjustment: inputObj.facilityCompressorData.compressorElectricityData.compressorControlAdjustment,
          compressorSpecificPower: inputObj.facilityCompressorData.compressorElectricityData.compressorSpecificPower,
        },
        units: airLeakSurvey.units,
      };
    });

    const output: SuiteCompressedAirLeakSurveyResult = this.toolsSuiteApiService.ToolsSuiteModule.calculateCompressedAirLeakSurvey(inputs);
    return {
      totalFlowRate: output.totalFlowRate,
      annualTotalFlowRate: output.annualTotalFlowRate,
      annualTotalElectricity: output.annualTotalElectricity,
      annualTotalElectricityCost: output.annualTotalElectricityCost,
    };
  }


  waterReduction(inputObj: WaterReductionInput): WaterReductionResult {
    let inputs: WaterReductionInputV = new this.toolsSuiteApiService.ToolsSuiteModule.WaterReductionInputV();

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
      const measurementMethod: WaterReductionMeasurementMethod = this.suiteApiHelperService.getWaterReductionMeasurementMethodEnum(waterReduction.measurementMethod);
      const wasmInput: SuiteWaterReductionInput = {
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
      };
      inputs.push_back(wasmInput);
    });

    let output: WaterReductionOutput = this.toolsSuiteApiService.ToolsSuiteModule.waterReduction(inputs);
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
    let inputs: SteamReductionInputV = new this.toolsSuiteApiService.ToolsSuiteModule.SteamReductionInputV();

    inputObj.steamReductionInputVec.forEach(steamReduction => {
      const measurementMethod: SteamMeasurementMethod = this.suiteApiHelperService.getSteamMeasurementMethodEnum(steamReduction.measurementMethod);
      const utilityType: SteamUtilityType = this.suiteApiHelperService.getSteamUtilityTypeEnum(steamReduction.utilityType);
      const steamVariableOption: ThermodynamicQuantity = this.suiteApiHelperService.getThermodynamicQuantityType(steamReduction.steamVariableOption);

      let wasmConvertedInput: SuiteSteamReductionInput = {
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
    this.toolsSuiteApiService.ToolsSuiteModule

    let output: SuiteSteamReductionOutput = this.toolsSuiteApiService.ToolsSuiteModule.steamReduction(inputs);
    let results: SteamReductionResult = {
      energyCost: output.energyCost,
      energyUse: output.energyUse,
      steamUse: output.steamUse
    };
    inputs.delete();
    return results;
  }

  pipeInsulationReduction(inputObj: PipeInsulationReductionInput): PipeInsulationReductionResult {
    let pipeMaterialCoefficients: DoubleVector = new this.toolsSuiteApiService.ToolsSuiteModule.DoubleVector();
    let insulationMaterialCoefficients: DoubleVector = new this.toolsSuiteApiService.ToolsSuiteModule.DoubleVector();
    inputObj.pipeMaterialCoefficients.forEach(coefficient => pipeMaterialCoefficients.push_back(coefficient));
    inputObj.insulationMaterialCoefficients.forEach(coefficient => insulationMaterialCoefficients.push_back(coefficient));

    inputObj.systemEfficiency = inputObj.systemEfficiency / 100;
    let wasmInput: InsulatedPipeInput = {
      operatingHours: inputObj.operatingHours,
      pipeLength: inputObj.pipeLength,
      pipeDiameter: inputObj.pipeDiameter,
      pipeThickness: inputObj.pipeThickness,
      pipeTemperature: inputObj.pipeTemperature,
      ambientTemperature: inputObj.ambientTemperature,
      windVelocity: inputObj.windVelocity,
      systemEfficiency: inputObj.systemEfficiency,
      insulationThickness: inputObj.insulationThickness,
      pipeEmissivity: inputObj.pipeEmissivity,
      jacketEmissivity: inputObj.jacketEmissivity,
      pipeMaterialCoefficients: pipeMaterialCoefficients,
      insulationMaterialCoefficients: insulationMaterialCoefficients
    };

    let rawOutput: InsulatedPipeOutput = this.toolsSuiteApiService.ToolsSuiteModule.insulatedPipeReduction(wasmInput);
    let pipeInsulationReductionResult: PipeInsulationReductionResult = {
      heatLength: rawOutput.heatLossPerLength,
      annualHeatLoss: rawOutput.annualHeatLoss,
      energyCost: undefined,
    }
    insulationMaterialCoefficients.delete();
    pipeMaterialCoefficients.delete();
    return pipeInsulationReductionResult;
  }

  tankInsulationReduction(inputObj: TankInsulationReductionInput): TankInsulationReductionResult {
    let wasmInput: InsulatedTankInput = {
      operatingHours: inputObj.operatingHours,
      tankHeight: inputObj.tankHeight,
      tankDiameter: inputObj.tankDiameter,
      tankThickness: inputObj.tankThickness,
      tankEmissivity: inputObj.tankEmissivity,
      tankConductivity: inputObj.tankConductivity,
      tankTemperature: inputObj.tankTemperature,
      ambientTemperature: inputObj.ambientTemperature,
      systemEfficiency: inputObj.systemEfficiency / 100,
      insulationThickness: inputObj.insulationThickness,
      insulationConductivity: inputObj.insulationConductivity,
      jacketEmissivity: inputObj.jacketEmissivity,
      surfaceTemperature: inputObj.surfaceTemperature
    };
    let rawOutput: InsulatedTankOutput = this.toolsSuiteApiService.ToolsSuiteModule.insulatedTankReduction(wasmInput);
    let tankInsulationReductionResult: TankInsulationReductionResult = {
      heatLoss: rawOutput.heatLoss,
      annualHeatLoss: rawOutput.annualHeatLoss,
      energyCost: undefined,
    }
    return tankInsulationReductionResult;
  }

  powerFactorTriangle(inputObj: PowerFactorTriangleModeInputs): PowerFactorTriangleOutputs {
    let modeEnum: PowerFactorModeType = this.suiteApiHelperService.getPowerFactorModeEnum(inputObj.mode);
    inputObj.mode = modeEnum;
    inputObj.input1 = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.input1);
    inputObj.input2 = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.input2);
    inputObj.inputPowerFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.inputPowerFactor);
    let PowerFactor: SuitePowerFactor = new this.toolsSuiteApiService.ToolsSuiteModule.PowerFactor();
    let rawOutput: PowerFactorOutput = PowerFactor.calculate(inputObj.mode, inputObj.input1, inputObj.input2, inputObj.inputPowerFactor);
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
    let PumpValvePowerLoss: SuitePumpValvePowerLoss = new this.toolsSuiteApiService.ToolsSuiteModule.PumpValvePowerLoss();
    let baselineRawOutputs: PumpValvePowerLossOutput = PumpValvePowerLoss.calculate(baselineInputs.hoursOperation, baselineInputs.efficiencyPump / 100, baselineInputs.efficiencyMotor / 100, baselineInputs.SG, baselineInputs.flowRate, baselineInputs.upstreamPressure, baselineInputs.upstreamHeight, baselineInputs.downstreamPressure, baselineInputs.downstreamHeight);
    let modificationRawOutputs: PumpValvePowerLossOutput = PumpValvePowerLoss.calculate(modificationInputs.hoursOperation, modificationInputs.efficiencyPump / 100, modificationInputs.efficiencyMotor / 100, modificationInputs.SG, modificationInputs.flowRate, modificationInputs.upstreamPressure, modificationInputs.upstreamHeight, modificationInputs.downstreamPressure, modificationInputs.downstreamHeight);

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
