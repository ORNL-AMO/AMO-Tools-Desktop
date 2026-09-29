import { Injectable } from '@angular/core';
import { AirSystemCapacityInput, AirSystemCapacityOutput, AirVelocityInput, BagMethodInput, BagMethodOutput, CalculateUsableCapacity, CombinedHeatPower, CombinedHeatPowerOutput, CompressedAirPressureReductionInput, CompressedAirPressureReductionResult, CompressedAirReductionInput, CompressedAirReductionResult, ElectricityReductionInput, ElectricityReductionResult, NaturalGasReductionInput, NaturalGasReductionResult, OperatingCostInput, OperatingCostOutput, PipeInsulationReductionInput, PipeInsulationReductionResult, PipeSizes, PipeSizingInput, PipeSizingOutput, PneumaticAirRequirementInput, PneumaticAirRequirementOutput, ReceiverTankBridgingCompressor, ReceiverTankCompressorCycle, ReceiverTankCompressorCycleOutput, ReceiverTankDedicatedStorage, ReceiverTankGeneral, ReceiverTankMeteredResults, ReceiverTankMeteredStorage } from '../shared/models/standalone';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import {
  type AirSystemCapacityOutput as SuiteAirSystemCapacityOutput,
  type BagMethodResult,
  type CHP,
  type CHPOption,
  type CostInfoOutput,
  type DoubleVector,
  type OperatingCostResult,
  type PipeData,
  type PipeSizingResult,
  type PneumaticAirRequirementResult,
  type ReceiverTankCompressorCycleResult,
  type ReceiverTankMeteredStorageResult,
  type ReceiverTankSizeResult,
  type ReceiverTankUsableCapacityResult,
} from 'measur-tools-suite';

@Injectable()
export class StandaloneSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService,
    private toolsSuiteApiService: ToolsSuiteApiService
  ) { }

  pneumaticAirRequirement(input: PneumaticAirRequirementInput): PneumaticAirRequirementOutput {
    input.airPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airPressure);
    input.cyclesPerMinute = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.cyclesPerMinute);
    input.cylinderDiameter = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.cylinderDiameter);
    input.cylinderStroke = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.cylinderStroke);
    input.pistonRodDiameter = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.pistonRodDiameter);
    let output: PneumaticAirRequirementResult;
    if (input.pistonType === 1) {
      output = this.toolsSuiteApiService.ToolsSuiteModule.calculatePneumaticAirRequirementDoubleActing({
        cylinderDiameter: input.cylinderDiameter,
        cylinderStroke: input.cylinderStroke,
        pistonRodDiameter: input.pistonRodDiameter,
        airPressure: input.airPressure,
        cyclesPerMin: input.cyclesPerMinute,
      });
    } else {
      output = this.toolsSuiteApiService.ToolsSuiteModule.calculatePneumaticAirRequirementSingleActing({
        cylinderDiameter: input.cylinderDiameter,
        cylinderStroke: input.cylinderStroke,
        airPressure: input.airPressure,
        cyclesPerMin: input.cyclesPerMinute,
      });
    }
    let results: PneumaticAirRequirementOutput = {
      airRequirementPneumaticCylinder: output.airRequirementPneumaticCylinder,
      volumeAirIntakePiston: output.volumeAirIntakePiston,
      compressionRatio: output.compressionRatio,
    };
    return results;
  }

  receiverTankGeneral(input: ReceiverTankGeneral): number {
    input.airDemand = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airDemand);
    input.allowablePressureDrop = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.allowablePressureDrop);
    input.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPressure);
    let output: ReceiverTankSizeResult = this.toolsSuiteApiService.ToolsSuiteModule.calculateReceiverTankGeneralSize({
      airDemand: input.airDemand,
      allowablePressureDrop: input.allowablePressureDrop,
      atmosphericPressure: input.atmosphericPressure,
    });
    return output.tankSize;
  }

  receiverTankDedicatedStorage(input: ReceiverTankDedicatedStorage): number {
    input.airFlowRequirement = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airFlowRequirement);
    input.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPressure);
    input.initialTankPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.initialTankPressure);
    input.lengthOfDemand = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.lengthOfDemand);
    input.finalTankPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.finalTankPressure);
    let output: ReceiverTankSizeResult = this.toolsSuiteApiService.ToolsSuiteModule.calculateReceiverTankDedicatedStorageSize({
      lengthOfDemand: input.lengthOfDemand,
      airFlowRequirement: input.airFlowRequirement,
      atmosphericPressure: input.atmosphericPressure,
      initialTankPressure: input.initialTankPressure,
      finalTankPressure: input.finalTankPressure,
    });
    return output.tankSize;
  }

  receiverTankSizeBridgingCompressor(input: ReceiverTankBridgingCompressor): number {
    input.distanceToCompressorRoom = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.distanceToCompressorRoom);
    input.speedOfAir = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.speedOfAir);
    input.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPressure);
    input.airDemand = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airDemand);
    input.allowablePressureDrop = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.allowablePressureDrop);
    let output: ReceiverTankSizeResult = this.toolsSuiteApiService.ToolsSuiteModule.calculateReceiverTankBridgingSize({
      distanceToCompressorRoom: input.distanceToCompressorRoom,
      speedOfAir: input.speedOfAir,
      atmosphericPressure: input.atmosphericPressure,
      airDemandCfm: input.airDemand,
      allowablePressureDrop: input.allowablePressureDrop,
    });
    return output.tankSize;
  }

  receiverTankSizeMeteredStorage(input: ReceiverTankMeteredStorage): ReceiverTankMeteredResults {
    input.lengthOfDemand = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.lengthOfDemand);
    input.airFlowRequirement = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airFlowRequirement);
    input.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPressure);
    input.initialTankPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.initialTankPressure);
    input.finalTankPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.finalTankPressure);
    input.meteredControl = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.meteredControl);
    let output: ReceiverTankMeteredStorageResult = this.toolsSuiteApiService.ToolsSuiteModule.calculateReceiverTankMeteredStorageSize({
      lengthOfDemand: input.lengthOfDemand,
      airFlowRequirement: input.airFlowRequirement,
      atmosphericPressure: input.atmosphericPressure,
      initialTankPressure: input.initialTankPressure,
      finalTankPressure: input.finalTankPressure,
      meteredFlowControl: input.meteredControl,
    });

    let results: ReceiverTankMeteredResults = {
      volume: output.tankSize,
      refillTime: output.refillTime,
    }
    return results;
  }

  operatingCost(input: OperatingCostInput): OperatingCostOutput {
    input.motorBhp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.motorBhp);
    input.bhpUnloaded = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.bhpUnloaded);
    input.annualOperatingHours = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.annualOperatingHours);
    input.runTimeLoaded = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.runTimeLoaded);
    input.efficiencyLoaded = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.efficiencyLoaded);
    input.efficiencyUnloaded = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.efficiencyUnloaded);
    input.costOfElectricity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.costOfElectricity);

    let output: OperatingCostResult = this.toolsSuiteApiService.ToolsSuiteModule.calculateOperatingCost({
      motorBhp: input.motorBhp,
      bhpUnloaded: input.bhpUnloaded,
      annualOperatingHours: input.annualOperatingHours,
      runTimeLoaded: input.runTimeLoaded,
      efficiencyLoaded: input.efficiencyLoaded,
      efficiencyUnloaded: input.efficiencyUnloaded,
      costOfElectricity: input.costOfElectricity,
    });
    let results: OperatingCostOutput = {
      runTimeUnloaded: output.runTimeUnloaded,
      costForLoaded: output.costForLoaded,
      costForUnloaded: output.costForUnloaded,
      totalAnnualCost: output.totalAnnualCost,
    }
    return results;
  }

  airSystemCapacity(input: AirSystemCapacityInput): AirSystemCapacityOutput {
    let receiverCapacities: Array<number> = input.receiverCapacities.map(capacity => {
      return Number(capacity);
    });
    let receiverCapacitiesInput: DoubleVector = this.suiteApiHelperService.returnDoubleVector(receiverCapacities);

    let pipeData: PipeData = new this.toolsSuiteApiService.ToolsSuiteModule.PipeData(
      input.oneHalf,
      input.threeFourths,
      input.one,
      input.oneAndOneFourth,
      input.oneAndOneHalf,
      input.two,
      input.twoAndOneHalf,
      input.three,
      input.threeAndOneHalf,
      input.four,
      input.five,
      input.six,
      input.eight,
      input.ten,
      input.twelve,
      input.fourteen,
      input.sixteen,
      input.eighteen,
      input.twenty,
      input.twentyFour,
    );

    let rawOutput: SuiteAirSystemCapacityOutput = this.toolsSuiteApiService.ToolsSuiteModule.calculateAirSystemCapacity({
      pipeLengths: pipeData,
      receivers: receiverCapacitiesInput,
    });


    let receiverCapacitiesOutput: Array<number> = [];
    for (let i: number = 0; i < rawOutput.receiverCapacities.size(); ++i) {
      let output: number = rawOutput.receiverCapacities.get(i);
      receiverCapacitiesOutput.push(output);
    }

    let output: AirSystemCapacityOutput = {
      receiverCapacities: receiverCapacitiesOutput,
      totalPipeVolume: rawOutput.totalPipeVolume,
      totalReceiverVolume: rawOutput.totalReceiverVolume,
      totalCapacityOfCompressedAirSystem: rawOutput.totalCapacityOfCompressedAirSystem,
      oneHalf: rawOutput.pipeLengths.oneHalf,
      threeFourths: rawOutput.pipeLengths.threeFourths,
      one: rawOutput.pipeLengths.one,
      oneAndOneFourth: rawOutput.pipeLengths.oneAndOneFourth,
      oneAndOneHalf: rawOutput.pipeLengths.oneAndOneHalf,
      two: rawOutput.pipeLengths.two,
      twoAndOneHalf: rawOutput.pipeLengths.twoAndOneHalf,
      three: rawOutput.pipeLengths.three,
      threeAndOneHalf: rawOutput.pipeLengths.threeAndOneHalf,
      four: rawOutput.pipeLengths.four,
      five: rawOutput.pipeLengths.five,
      six: rawOutput.pipeLengths.six,
      eight: rawOutput.pipeLengths.eight,
      ten: rawOutput.pipeLengths.ten,
      twelve: rawOutput.pipeLengths.twelve,
      fourteen: rawOutput.pipeLengths.fourteen,
      sixteen: rawOutput.pipeLengths.sixteen,
      eighteen: rawOutput.pipeLengths.eighteen,
      twenty: rawOutput.pipeLengths.twenty,
      twentyFour: rawOutput.pipeLengths.twentyFour,
    }

    rawOutput.receiverCapacities.delete();
    rawOutput.pipeLengths.delete();
    pipeData.delete();
    receiverCapacitiesInput.delete();
    return output;
  }

  airVelocity(input: AirVelocityInput): PipeSizes {
    input.airFlow = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airFlow);
    input.pipePressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.pipePressure);
    input.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPressure);
    let output: PipeData = this.toolsSuiteApiService.ToolsSuiteModule.calculateAirVelocity({
      airFlow: input.airFlow,
      pipePressure: input.pipePressure,
      atmosphericPressure: input.atmosphericPressure,
    });
    let results: PipeSizes = {
      oneHalf: output.oneHalf,
      threeFourths: output.threeFourths,
      one: output.one,
      oneAndOneFourth: output.oneAndOneFourth,
      oneAndOneHalf: output.oneAndOneHalf,
      two: output.two,
      twoAndOneHalf: output.twoAndOneHalf,
      three: output.three,
      threeAndOneHalf: output.threeAndOneHalf,
      four: output.four,
      five: output.five,
      six: output.six,
      eight: output.eight,
      ten: output.ten,
      twelve: output.twelve,
      fourteen: output.fourteen,
      sixteen: output.sixteen,
      eighteen: output.eighteen,
      twenty: output.twenty,
      twentyFour: output.twentyFour,
    }
    output.delete();
    return results;
  }

  pipeSizing(input: PipeSizingInput): PipeSizingOutput {
    input.airFlow = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airFlow);
    input.airlinePressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airlinePressure);
    input.designVelocity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.designVelocity);
    input.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPressure);

    let output: PipeSizingResult = this.toolsSuiteApiService.ToolsSuiteModule.calculatePipeSize({
      airflow: input.airFlow,
      airlinePressure: input.airlinePressure,
      designVelocity: input.designVelocity,
      atmosphericPressure: input.atmosphericPressure
    });
    let results: PipeSizingOutput = {
      crossSectionalArea: output.crossSectionalArea,
      pipeDiameter: output.pipeDiameter
    }
    return results;
  }

  // pneumaticValveCalculateFlowRate(input: PneumaticValveFlowRateInput): PneumaticValveFlowRateOutput {
  //   let PneumaticValve = new this.toolsSuiteApiService.ToolsSuiteModule.PneumaticValve(input.inletPressure, input.outletPressure);
  //   let output: PneumaticValveFlowRateOutput = PneumaticValve.calculate();
  //   PneumaticValve.delete();
  //   return output;
  // }

  // pneumaticValve(input: PneumaticValve): PneumaticValveFlowCoefficient {
  //   let PneumaticValve = new this.toolsSuiteApiService.ToolsSuiteModule.PneumaticValve(input.inletPressure, input.outletPressure, input.flowRate);
  //   let output: PneumaticValveFlowCoefficient = PneumaticValve.calculate();
  //   PneumaticValve.delete();
  //   return output;
  // }

  /**
   * Calculate Bag Method for air leak or pressure reduction
   * @returns BagMethodOutput - totalFlowRate is in scfm, annualTotalFlowRate is in kscf, energy in mWh
   */
  bagMethod(input: BagMethodInput): BagMethodOutput {
    input.bagFillTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.bagFillTime);
    input.bagVolume = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.bagVolume);
    let rawOutput: BagMethodResult = this.toolsSuiteApiService.ToolsSuiteModule.calculateBagMethod({
      operatingTime: input.operatingTime,
      bagFillTime: input.bagFillTime,
      bagVolume: input.bagVolume,
    });
    let output: BagMethodOutput = {
      flowRate: isNaN(rawOutput.flowRate) ? undefined : rawOutput.flowRate,
      annualConsumption: isNaN(rawOutput.annualConsumption) ? undefined : rawOutput.annualConsumption
    }
    return output;
  }

  CHPcalculator(input: CombinedHeatPower): CombinedHeatPowerOutput {
    input.annualOperatingHours = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.annualOperatingHours);
    input.annualElectricityConsumption = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.annualElectricityConsumption);
    input.annualThermalDemand = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.annualThermalDemand);
    input.boilerThermalFuelCosts = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.boilerThermalFuelCosts);
    input.avgElectricityCosts = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.avgElectricityCosts);
    input.boilerThermalFuelCostsCHPcase = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.boilerThermalFuelCostsCHPcase);
    input.CHPfuelCosts = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.CHPfuelCosts);
    input.percentAvgkWhElectricCostAvoidedOrStandbyRate = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.percentAvgkWhElectricCostAvoidedOrStandbyRate);
    input.displacedThermalEfficiency = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.displacedThermalEfficiency);
    input.chpAvailability = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.chpAvailability);
    input.thermalUtilization = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.thermalUtilization);

    let chpOption: CHPOption = this.suiteApiHelperService.getCHPOptionEnum(input.option);
    let CHP: CHP = new this.toolsSuiteApiService.ToolsSuiteModule.CHP(
      input.annualOperatingHours,
      input.annualElectricityConsumption,
      input.annualThermalDemand,
      input.boilerThermalFuelCosts,
      input.avgElectricityCosts,
      chpOption,
      input.boilerThermalFuelCostsCHPcase,
      input.CHPfuelCosts,
      input.percentAvgkWhElectricCostAvoidedOrStandbyRate,
      input.displacedThermalEfficiency,
      input.chpAvailability,
      input.thermalUtilization
    );

    let output: CostInfoOutput = CHP.getCostInfo();
    let results: CombinedHeatPowerOutput = {
      annualOperationSavings: output.annualOperationSavings,
      totalInstalledCostsPayback: output.totalInstalledCostsPayback,
      simplePayback: output.simplePayback,
      fuelCosts: output.fuelCosts,
      thermalCredit: output.thermalCredit,
      incrementalOandM: output.incrementalOandM,
      totalOperatingCosts: output.totalOperatingCosts,
    }
    output.delete();
    CHP.delete();
    return results;
  }

  usableAirCapacity(input: CalculateUsableCapacity): number {
    input.tankSize = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.tankSize);
    input.airPressureIn = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airPressureIn);
    input.airPressureOut = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airPressureOut);
    let output: ReceiverTankUsableCapacityResult = this.toolsSuiteApiService.ToolsSuiteModule.calculateReceiverTankUsableCapacity({
      tankSize: input.tankSize,
      airPressureIn: input.airPressureIn,
      airPressureOut: input.airPressureOut,
    });
    return output.usableCapacity;
  }

  calculateReceiverTankCompressorCycleSize(input: ReceiverTankCompressorCycle): ReceiverTankCompressorCycleOutput {
    input.unloadPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadPressure);
    input.fullLoadPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.fullLoadPressure);
    input.compressorCapacity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.compressorCapacity);
    input.loadTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.loadTime);
    input.unloadTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.unloadTime);
    input.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPressure);

    let output: ReceiverTankCompressorCycleResult = this.toolsSuiteApiService.ToolsSuiteModule.calculateReceiverTankCompressorCycleSize({
      unloadPressure: input.unloadPressure,
      fullLoadPressure: input.fullLoadPressure,
      compressorCapacity: input.compressorCapacity,
      loadTime: input.loadTime,
      unloadTime: input.unloadTime,
      atmosphericPressure: input.atmosphericPressure,
    });
    return {
      pressureChange: output.pressureChange,
      capacity: output.effectiveCapacity,
      areaStorageVolume: output.volumeCf,
      liquidStorageVolume: output.tankSize,
    };
  }
}
