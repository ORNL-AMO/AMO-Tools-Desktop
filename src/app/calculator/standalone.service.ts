// @ts-ignore
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import {
  CombinedHeatPower, CombinedHeatPowerOutput, PneumaticAirRequirementInput, PneumaticAirRequirementOutput,
  ReceiverTankGeneral, ReceiverTankDedicatedStorage, ReceiverTankBridgingCompressor, ReceiverTankMeteredStorage,
  OperatingCostInput, OperatingCostOutput, AirSystemCapacityInput, AirSystemCapacityOutput, AirVelocityInput, PipeSizes,
  PipeSizingOutput, PipeSizingInput, BagMethodInput, BagMethodOutput, CalculateUsableCapacity,
  ElectricityReductionInput, NaturalGasReductionInput, NaturalGasReductionResult, ElectricityReductionResult,
  CompressedAirReductionInput, CompressedAirReductionResult, WaterReductionInput, WaterReductionResult, SteamReductionInput, PipeInsulationReductionInput,
  PipeInsulationReductionResult, TankInsulationReductionInput, TankInsulationReductionResult, AirLeakSurveyInput, AirLeakSurveyResult, CompEEM_kWAdjustedInput, SteamReductionOutput, SteamReductionResult,
  PowerFactorTriangleModeInputs,
  PowerFactorTriangleOutputs,
  ReceiverTankMeteredResults,
} from '../shared/models/standalone';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { StandaloneSuiteApiService } from '../tools-suite-api/standalone-suite-api.service';
import { CalculatorSuiteApiService } from '../tools-suite-api/calculator-suite-api.service';

@Injectable()
export class StandaloneService {


  constructor(private convertUnitsService: ConvertUnitsService, private standaloneSuiteApiService: StandaloneSuiteApiService, private calculatorSuiteApiService: CalculatorSuiteApiService) { }

  pneumaticAirRequirement(input: PneumaticAirRequirementInput, settings: Settings): PneumaticAirRequirementOutput {
    const inputCpy: PneumaticAirRequirementInput = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure === 'Metric') {
      //metric: cm imperial: in
      inputCpy.cylinderDiameter = this.convertUnitsService.value(inputCpy.cylinderDiameter).from('cm').to('in');
      inputCpy.cylinderStroke = this.convertUnitsService.value(inputCpy.cylinderStroke).from('cm').to('in');
      inputCpy.pistonRodDiameter = this.convertUnitsService.value(inputCpy.pistonRodDiameter).from('cm').to('in');
      //metric: kPa imperial: psi
      inputCpy.airPressure = this.convertUnitsService.value(inputCpy.airPressure).from('kPa').to('psi');
      let output: PneumaticAirRequirementOutput = this.standaloneSuiteApiService.pneumaticAirRequirement(inputCpy);
      //metric: m3 imperial: ft3
      output.airRequirementPneumaticCylinder = this.convertUnitsService.value(output.airRequirementPneumaticCylinder).from('ft3').to('m3');
      //metric: m3 imperial: ft3
      output.volumeAirIntakePiston = this.convertUnitsService.value(output.volumeAirIntakePiston).from('ft3').to('m3');
      return output;
    }
    else {
      return this.standaloneSuiteApiService.pneumaticAirRequirement(inputCpy);
    }
  }

  receiverTankSizeGeneral(input: ReceiverTankGeneral, settings: Settings): number {
    let inputCpy: ReceiverTankGeneral = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure === 'Metric') {
      //metric:m3 imperial:ft3
      inputCpy.airDemand = this.convertUnitsService.value(inputCpy.airDemand).from('m3').to('ft3');
      //metric:kpa imperial:psi
      inputCpy.allowablePressureDrop = this.convertUnitsService.value(inputCpy.allowablePressureDrop).from('kPa').to('psi');
      //metric:kpaa imperial:psia
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPaa').to('psia');
      let requiredStorage: number = this.standaloneSuiteApiService.receiverTankGeneral(inputCpy);
      //metric:m3 imperial:gal
      requiredStorage = this.convertUnitsService.value(requiredStorage).from('gal').to('m3');
      return requiredStorage;
    } else {
      return this.standaloneSuiteApiService.receiverTankGeneral(inputCpy);
    }
  }

  receiverTankSizeDedicatedStorage(input: ReceiverTankDedicatedStorage, settings: Settings): number {
    let inputCpy: ReceiverTankDedicatedStorage = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure === 'Metric') {
      //metric:m3 imperial:ft3
      inputCpy.airFlowRequirement = this.convertUnitsService.value(inputCpy.airFlowRequirement).from('m3').to('ft3');
      //metric:kPaa imperial: psia
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPaa').to('psia');
      //metric:kpa imperial:psi
      inputCpy.initialTankPressure = this.convertUnitsService.value(inputCpy.initialTankPressure).from('kPa').to('psi');
      inputCpy.finalTankPressure = this.convertUnitsService.value(inputCpy.finalTankPressure).from('kPa').to('psi');
      //metric:m3 imperial:gal
      let calcVolume: number = this.standaloneSuiteApiService.receiverTankDedicatedStorage(inputCpy);
      calcVolume = this.convertUnitsService.value(calcVolume).from('gal').to('m3');
      return calcVolume;
    } else {
      return this.standaloneSuiteApiService.receiverTankDedicatedStorage(inputCpy);
    }
  }

  receiverTankSizeBridgingCompressor(input: ReceiverTankBridgingCompressor, settings: Settings): number {
    let inputCpy: ReceiverTankBridgingCompressor = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure === 'Metric') {
      //metric: m imperial: ft
      inputCpy.distanceToCompressorRoom = this.convertUnitsService.value(inputCpy.distanceToCompressorRoom).from('m').to('ft');
      inputCpy.speedOfAir = this.convertUnitsService.value(inputCpy.speedOfAir).from('m').to('ft');
      // metric: m3 imperial:scfm (ft3)
      inputCpy.airDemand = this.convertUnitsService.value(inputCpy.airDemand).from('m3').to('ft3');
      //metric:kPa imperial: psi
      inputCpy.allowablePressureDrop = this.convertUnitsService.value(inputCpy.allowablePressureDrop).from('kPa').to('psig');
      //metric:kpaa imperial:psia
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPaa').to('psia');
      //metric: m3 imperial: gal
      let calcVolume: number = this.standaloneSuiteApiService.receiverTankSizeBridgingCompressor(inputCpy);
      calcVolume = this.convertUnitsService.value(calcVolume).from('gal').to('m3');
      return calcVolume;
    } else {
      return this.standaloneSuiteApiService.receiverTankSizeBridgingCompressor(inputCpy);
    }
  }

  receiverTankSizeMeteredStorage(input: ReceiverTankMeteredStorage, settings: Settings): ReceiverTankMeteredResults {
    let inputCpy: ReceiverTankMeteredStorage = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure === 'Metric') {
      //metric: m imperial: ft
      inputCpy.airFlowRequirement = this.convertUnitsService.value(inputCpy.airFlowRequirement).from('m3').to('ft3');
      inputCpy.meteredControl = this.convertUnitsService.value(inputCpy.meteredControl).from('m3').to('ft3');
      //metric:kPaa imperial: psia
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPaa').to('psia');
      //metric:kpa imperial:psi
      inputCpy.initialTankPressure = this.convertUnitsService.value(inputCpy.initialTankPressure).from('kPa').to('psi');
      inputCpy.finalTankPressure = this.convertUnitsService.value(inputCpy.finalTankPressure).from('kPa').to('psi');
      //metric: m3 imperial: gal
      let results: ReceiverTankMeteredResults = this.standaloneSuiteApiService.receiverTankSizeMeteredStorage(inputCpy);
      results.volume = this.convertUnitsService.value(results.volume).from('gal').to('m3');
      return results;
    } else {
      let results: ReceiverTankMeteredResults = this.standaloneSuiteApiService.receiverTankSizeMeteredStorage(inputCpy)
      return results;
    }
  }

  operatingCost(input: OperatingCostInput, settings: Settings): OperatingCostOutput {
    let inputCpy: OperatingCostInput = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure === 'Metric') {
      inputCpy.motorBhp = this.convertUnitsService.value(inputCpy.motorBhp).from('kW').to('hp');
    }
    return this.standaloneSuiteApiService.operatingCost(inputCpy);
  }

  airSystemCapacity(input: AirSystemCapacityInput, settings: Settings): AirSystemCapacityOutput {
    let inputCpy: AirSystemCapacityInput = JSON.parse(JSON.stringify(input));
    inputCpy = this.sumPipeInputs(inputCpy);

    let outputs: AirSystemCapacityOutput;
    if (settings.unitsOfMeasure === 'Metric') {

      inputCpy.allPipes = inputCpy.allPipes.map(pipe => {
        pipe.pipeSize = this.convertUnitsService.value(pipe.pipeSize).from('mm').to('in');
        pipe.pipeLength = this.convertUnitsService.value(pipe.pipeLength).from('m').to('ft');
        pipe.customPipeSize = this.convertUnitsService.value(pipe.customPipeSize).from('mm').to('in');
        return pipe;
      })
      //convert input data and get custom volumes
      let customPipeVolume: number = 0;
      inputCpy.customPipes.forEach((pipe: { pipeSize: number, pipeLength: number }) => {
        pipe.pipeSize = this.convertUnitsService.value(pipe.pipeSize).from('cm').to('in');
        pipe.pipeLength = this.convertUnitsService.value(pipe.pipeLength).from('m').to('ft');
        customPipeVolume += this.calculatePipeVolume(pipe.pipeSize, pipe.pipeLength);
      });
      let tmpCapacities: Array<number> = new Array<number>();
      inputCpy.receiverCapacities.forEach(
        reciever => {
          tmpCapacities.push(this.convertUnitsService.value(reciever).from('m3').to('gal')
          );
        });
      inputCpy.receiverCapacities = tmpCapacities;
      outputs = this.standaloneSuiteApiService.airSystemCapacity(inputCpy);
      outputs.totalCapacityOfCompressedAirSystem += customPipeVolume;
      outputs.totalPipeVolume += customPipeVolume;
      outputs.totalReceiverVolume = this.convertUnitsService.value(outputs.totalReceiverVolume).from('ft3').to('m3');
      outputs.totalPipeVolume = this.convertUnitsService.value(outputs.totalPipeVolume).from('ft3').to('m3');
      outputs.totalCapacityOfCompressedAirSystem = this.convertUnitsService.value(outputs.totalCapacityOfCompressedAirSystem).from('ft3').to('m3');
    } else {
      let customPipeVolume: number = 0;
      inputCpy.customPipes.forEach((pipe: { pipeSize: number, pipeLength: number }) => {
        customPipeVolume += this.calculatePipeVolume(pipe.pipeSize, pipe.pipeLength);
      });
      outputs = this.standaloneSuiteApiService.airSystemCapacity(inputCpy);
      outputs.totalCapacityOfCompressedAirSystem += customPipeVolume;
      outputs.totalPipeVolume += customPipeVolume;
    }
    let numerator = outputs.totalCapacityOfCompressedAirSystem * (inputCpy.leakRateInput.airPressureIn - inputCpy.leakRateInput.airPressureOut);
    let denominator = (inputCpy.leakRateInput.dischargeTime) * inputCpy.leakRateInput.atmosphericPressure;
    outputs.leakRate = numerator * 1.25 / denominator;

    if (settings.unitsOfMeasure == 'Imperial') {
      outputs.totalReceiverVolume = this.convertUnitsService.value(outputs.totalReceiverVolume).from('ft3').to('gal');
      outputs.totalPipeVolume = this.convertUnitsService.value(outputs.totalPipeVolume).from('ft3').to('gal');
      outputs.totalCapacityOfCompressedAirSystem = this.convertUnitsService.value(outputs.totalCapacityOfCompressedAirSystem).from('ft3').to('gal');

      outputs.totalReceiverVolume = Number(outputs.totalReceiverVolume.toFixed());
      outputs.totalPipeVolume = Number(outputs.totalPipeVolume.toFixed());
      outputs.totalCapacityOfCompressedAirSystem = Number(outputs.totalCapacityOfCompressedAirSystem.toFixed());
    }

    return outputs;
  }

  sumPipeInputs(inputCpy: AirSystemCapacityInput): AirSystemCapacityInput {
    inputCpy.customPipes = new Array();
    inputCpy.allPipes.forEach(pipe => {
      //if custom add to custom array
      if (pipe.pipeSize == 'CUSTOM') {
        inputCpy.customPipes.push({
          pipeLength: pipe.pipeLength,
          pipeSize: pipe.customPipeSize
        });
      } else {
        //otherwise sum pipe size
        inputCpy[pipe.pipeSize] += pipe.pipeLength;
      }
    });
    return inputCpy;
  }


  //imperial: (diameter: inches, length: ft)
  calculatePipeVolume(diameter: number, length: number): number {
    let volume: number = Math.pow((diameter / 24), 2) * Math.PI * length;
    return volume;
  }

  airVelocity(input: AirVelocityInput, settings: Settings): PipeSizes {
    let inputCpy: AirVelocityInput = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure === 'Metric') {
      //metric: m3 imperial: ft3
      inputCpy.airFlow = this.convertUnitsService.value(inputCpy.airFlow).from('m3').to('ft3');
      //metric: kPaa imperial: psia
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPaa').to('psia');
      //metric: kPa imperial: psi
      inputCpy.pipePressure = this.convertUnitsService.value(inputCpy.pipePressure).from('kPa').to('psi');
      let output: PipeSizes = this.standaloneSuiteApiService.airVelocity(inputCpy);
      //all sizes metric: cm imperial: in
      for (let key in output) {
        output[key] = this.convertUnitsService.value(output[key]).from('ft').to('m');
      }
      return output;
    }
    return this.standaloneSuiteApiService.airVelocity(inputCpy);
  }

  pipeSizing(input: PipeSizingInput, settings: Settings): PipeSizingOutput {
    let inputCpy: PipeSizingInput = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure === 'Metric') {
      //metric: m3 imperial: ft3
      inputCpy.airFlow = this.convertUnitsService.value(inputCpy.airFlow).from('m3').to('ft3');
      //metric: kPa imperial: psi
      inputCpy.airlinePressure = this.convertUnitsService.value(inputCpy.airlinePressure).from('kPa').to('psi');
      //metric:kpaa imperial:psia
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPaa').to('psia');
      //metric: m imperial: ft
      inputCpy.designVelocity = this.convertUnitsService.value(inputCpy.designVelocity).from('m').to('ft');
      let outputs: PipeSizingOutput = this.standaloneSuiteApiService.pipeSizing(inputCpy);
      //metric: cm2 imperial: in2
      outputs.crossSectionalArea = this.convertUnitsService.value(outputs.crossSectionalArea).from('in2').to('cm2');
      //metric: cm imperial: in
      outputs.pipeDiameter = this.convertUnitsService.value(outputs.pipeDiameter).from('in').to('cm');
      return outputs;
    } else {
      return this.standaloneSuiteApiService.pipeSizing(inputCpy);
    }
  }

  // calculate flow rate
  // pneumaticValveCalculateFlowRate(inletPressure: number, outletPressure: number, settings: Settings): number {
  //   let inletPressureCpy: number = JSON.parse(JSON.stringify(inletPressure));
  //   let outletPressureCpy: number = JSON.parse(JSON.stringify(outletPressure));
  //   if (settings.unitsOfMeasure === 'Metric') {
  //     inletPressureCpy = this.convertUnitsService.value(inletPressureCpy).from('kPa').to('psi');
  //     outletPressureCpy = this.convertUnitsService.value(outletPressureCpy).from('kPa').to('psi');
  //     let flowRate: number = this.standaloneSuiteApiService.pneumaticValveCalculateFlowRate({ inletPressure: inletPressureCpy, outletPressure: outletPressureCpy }).flowRate;
  //     flowRate = this.convertUnitsService.value(flowRate).from('ft3').to('m3');
  //     return flowRate;
  //   } else {
  //     return this.standaloneSuiteApiService.pneumaticValveCalculateFlowRate({ inletPressure: inletPressureCpy, outletPressure: outletPressureCpy }).flowRate;
  //   }
  // }

  // // calculate flow coefficient
  // pneumaticValve(input: PneumaticValve, settings: Settings): number {
  //   let inputCpy: PneumaticValve = JSON.parse(JSON.stringify(input));
  //   if (settings.unitsOfMeasure === 'Metric') {
  //     inputCpy.inletPressure = this.convertUnitsService.value(inputCpy.inletPressure).from('kPa').to('psi');
  //     inputCpy.outletPressure = this.convertUnitsService.value(inputCpy.outletPressure).from('kPa').to('psi');
  //     inputCpy.flowRate = this.convertUnitsService.value(inputCpy.flowRate).from('m3').to('ft3');
  //     let flowCoefficient: number = this.standaloneSuiteApiService.pneumaticValve(inputCpy).flowCoefficient;
  //     flowCoefficient = this.convertUnitsService.value(flowCoefficient).from('ft3').to('m3');
  //     return flowCoefficient;
  //   } else {
  //     return this.standaloneSuiteApiService.pneumaticValve(inputCpy).flowCoefficient;
  //   }
  // }

  bagMethod(input: BagMethodInput, settings: Settings): BagMethodOutput {
    let inputCpy: BagMethodInput = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure === 'Metric') {
      inputCpy.bagVolume = this.convertUnitsService.value(inputCpy.bagVolume).from('L').to('ft3');
      let results: BagMethodOutput = this.standaloneSuiteApiService.bagMethod(inputCpy);
      results.flowRate = this.convertUnitsService.value(results.flowRate).from('ft3').to('m3');
      // convert kscfm to scfm
      results.annualConsumption = results.annualConsumption * 1000;
      results.annualConsumption = this.convertUnitsService.value(results.annualConsumption).from('ft3').to('m3');
      return results;
    } else {
      inputCpy.bagVolume = this.convertUnitsService.value(inputCpy.bagVolume).from('gal').to('ft3');
      let results: BagMethodOutput = this.standaloneSuiteApiService.bagMethod(inputCpy);
      // convert kscf to scf
      results.annualConsumption = results.annualConsumption * 1000;
      return results;
    }
  }

  CHPcalculator(inputs: CombinedHeatPower, settings: Settings): CombinedHeatPowerOutput {
    let inputCpy: CombinedHeatPower = JSON.parse(JSON.stringify(inputs));
    if (settings.unitsOfMeasure != 'Imperial') {
      let fuelCostHelper: number = this.convertUnitsService.value(1).from('GJ').to('MMBtu');
      inputCpy.boilerThermalFuelCosts = inputCpy.boilerThermalFuelCosts / fuelCostHelper;
      inputCpy.boilerThermalFuelCostsCHPcase = inputCpy.boilerThermalFuelCostsCHPcase / fuelCostHelper;
      inputCpy.CHPfuelCosts = inputCpy.CHPfuelCosts / fuelCostHelper;
      inputCpy.annualThermalDemand = this.convertUnitsService.value(inputCpy.annualThermalDemand).from('GJ').to('MMBtu');
    }
    return this.standaloneSuiteApiService.CHPcalculator(inputCpy);
  }

  usableAirCapacity(input: CalculateUsableCapacity, settings: Settings): number {
    let inputCpy: CalculateUsableCapacity = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure === 'Metric') {
      //metric: m3 imperial: gal
      inputCpy.tankSize = this.convertUnitsService.value(inputCpy.tankSize).from('m3').to('gal');
      //metric:kPa imperial: psi
      inputCpy.airPressureIn = this.convertUnitsService.value(inputCpy.airPressureIn).from('kPa').to('psig');
      inputCpy.airPressureOut = this.convertUnitsService.value(inputCpy.airPressureOut).from('kPa').to('psig');
      //metric: m3 imperial: ft3
      let calcTankCapacity: number = this.standaloneSuiteApiService.usableAirCapacity(inputCpy);
      calcTankCapacity = this.convertUnitsService.value(calcTankCapacity).from('ft3').to('m3');
      return calcTankCapacity;
    } else {
      return this.standaloneSuiteApiService.usableAirCapacity(inputCpy);
    }
  }

  electricityReduction(inputObj: ElectricityReductionInput): ElectricityReductionResult {
    return this.calculatorSuiteApiService.electricityReduction(inputObj);
  }

  naturalGasReduction(inputObj: NaturalGasReductionInput): NaturalGasReductionResult {
    return this.calculatorSuiteApiService.naturalGasReduction(inputObj);
  }

  compressedAirReduction(inputObj: CompressedAirReductionInput): CompressedAirReductionResult {
    let results: CompressedAirReductionResult = this.calculatorSuiteApiService.compressedAirReduction(inputObj);
    return results;
  }

  airLeakSurvey(inputObj: AirLeakSurveyInput): AirLeakSurveyResult {
    let results: AirLeakSurveyResult = this.calculatorSuiteApiService.compressedAirLeakSurvey(inputObj);
    return results;
  }

  waterReduction(inputObj: WaterReductionInput): WaterReductionResult {
    return this.calculatorSuiteApiService.waterReduction(inputObj);
  }

  steamReduction(inputObj: SteamReductionInput): SteamReductionResult {
    let result: SteamReductionResult = this.calculatorSuiteApiService.steamReduction(inputObj);
    return result;
  }

  pipeInsulationReduction(inputObj: PipeInsulationReductionInput): PipeInsulationReductionResult {
    return this.calculatorSuiteApiService.pipeInsulationReduction(inputObj);
  }

  tankInsulationReduction(inputObj: TankInsulationReductionInput): TankInsulationReductionResult {
    return this.calculatorSuiteApiService.tankInsulationReduction(inputObj);
  }

  powerFactorTriangle(inputObj: PowerFactorTriangleModeInputs): PowerFactorTriangleOutputs {
    return this.calculatorSuiteApiService.powerFactorTriangle(inputObj);
  }
}
