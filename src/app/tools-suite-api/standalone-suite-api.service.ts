import { Injectable } from '@angular/core';
import { AirSystemCapacityInput, AirSystemCapacityOutput, AirVelocityInput, BagMethodInput, BagMethodOutput, CalculateUsableCapacity, CombinedHeatPower, CombinedHeatPowerOutput, CompressedAirPressureReductionInput, CompressedAirPressureReductionResult, CompressedAirReductionInput, CompressedAirReductionResult, ElectricityReductionInput, ElectricityReductionResult, NaturalGasReductionInput, NaturalGasReductionResult, OperatingCostInput, OperatingCostOutput, PipeInsulationReductionInput, PipeInsulationReductionResult, PipeSizes, PipeSizingInput, PipeSizingOutput, PneumaticAirRequirementInput, PneumaticAirRequirementOutput, PneumaticValve, PneumaticValveFlowCoefficient, PneumaticValveFlowRateInput, PneumaticValveFlowRateOutput, ReceiverTankBridgingCompressor, ReceiverTankDedicatedStorage, ReceiverTankGeneral, ReceiverTankMeteredStorage, SteamReductionInput, TankInsulationReductionInput, TankInsulationReductionResult, WaterReductionInput, WaterReductionResult } from '../shared/models/standalone';
import { SuiteApiHelperService } from './suite-api-helper.service';

declare var Module: any;
@Injectable()
export class StandaloneSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService ) { }

  pneumaticAirRequirement(input: PneumaticAirRequirementInput): PneumaticAirRequirementOutput {
    let pistonType = this.suiteApiHelperService.getPistonTypeEnum(input.pistonType);
    let PneumaticAirRequirement;
    input.airPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airPressure);
    input.cyclesPerMinute = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.cyclesPerMinute);
    input.cylinderDiameter = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.cylinderDiameter);
    input.cylinderStroke = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.cylinderStroke);
    input.pistonRodDiameter = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.pistonRodDiameter);
    if (input.pistonType === 1) {
      PneumaticAirRequirement = new Module.PneumaticAirRequirement(pistonType, input.cylinderDiameter, input.cylinderStroke, input.pistonRodDiameter, input.airPressure, input.cyclesPerMinute);
    } else {
      PneumaticAirRequirement = new Module.PneumaticAirRequirement(pistonType, input.cylinderDiameter, input.cylinderStroke, input.airPressure, input.cyclesPerMinute);
    }
    let output = PneumaticAirRequirement.calculate();
    PneumaticAirRequirement.delete();
    return output;
  }

  receiverTankGeneral(input: ReceiverTankGeneral): number {
    input.airDemand = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airDemand);
    input.allowablePressureDrop = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.allowablePressureDrop);
    input.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPressure);
    let ReceiverTank = new Module.ReceiverTank(Module.ReceiverTankMethod.General, input.airDemand, input.allowablePressureDrop, input.atmosphericPressure);
    let output: number = ReceiverTank.calculateSize();
    ReceiverTank.delete();
    return output;
  }

  receiverTankDedicatedStorage(input: ReceiverTankDedicatedStorage): number {
    input.airFlowRequirement = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airFlowRequirement);
    input.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPressure);
    input.initialTankPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.initialTankPressure);
    input.lengthOfDemand = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.lengthOfDemand);
    input.finalTankPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.finalTankPressure);
    let ReceiverTank = new Module.ReceiverTank(Module.ReceiverTankMethod.DedicatedStorage, input.lengthOfDemand, input.airFlowRequirement, input.atmosphericPressure, input.initialTankPressure, input.finalTankPressure);
    let output: number = ReceiverTank.calculateSize();
    ReceiverTank.delete();
    return output;
  }

  receiverTankSizeBridgingCompressor(input: ReceiverTankBridgingCompressor): number {
    input.distanceToCompressorRoom = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.distanceToCompressorRoom);
    input.speedOfAir = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.speedOfAir);
    input.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPressure);
    input.airDemand = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airDemand);
    input.allowablePressureDrop = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.allowablePressureDrop);
    let ReceiverTank = new Module.ReceiverTank(Module.ReceiverTankMethod.BridgingCompressorReactionDelay, input.distanceToCompressorRoom, input.speedOfAir, input.atmosphericPressure, input.airDemand, input.allowablePressureDrop);
    let output: number = ReceiverTank.calculateSize();
    ReceiverTank.delete();
    return output;
  }

  receiverTankSizeMeteredStorage(input: ReceiverTankMeteredStorage): number {
    input.lengthOfDemand = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.lengthOfDemand);
    input.airFlowRequirement = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airFlowRequirement);
    input.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPressure);
    input.initialTankPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.initialTankPressure);
    input.finalTankPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.finalTankPressure);
    input.meteredControl = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.meteredControl);
    let ReceiverTank = new Module.ReceiverTank(Module.ReceiverTankMethod.MeteredStorage, input.lengthOfDemand, input.airFlowRequirement, input.atmosphericPressure, input.initialTankPressure, input.finalTankPressure, input.meteredControl);
    let output: number = ReceiverTank.calculateSize();
    ReceiverTank.delete();
    return output;
  }

  operatingCost(input: OperatingCostInput): OperatingCostOutput {
    input.motorBhp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.motorBhp);
    input.bhpUnloaded = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.bhpUnloaded);
    input.annualOperatingHours = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.motorBhp);
    input.runTimeLoaded = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.runTimeLoaded);
    input.efficiencyLoaded = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.efficiencyLoaded);
    input.efficiencyUnloaded = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.efficiencyUnloaded);
    input.costOfElectricity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.costOfElectricity);

    let OperatingCost = new Module.OperatingCost(
      input.motorBhp, 
      input.bhpUnloaded, 
      input.annualOperatingHours,
      input.runTimeLoaded, 
      input.efficiencyLoaded, 
      input.efficiencyUnloaded,
      input.costOfElectricity
    );
    let output: OperatingCostOutput = OperatingCost.calculate();
    OperatingCost.delete();
    return output;
  }

  airSystemCapacity(input: AirSystemCapacityInput): AirSystemCapacityOutput {
    let receiverCapacities: Array<number> = input.receiverCapacities.map(capacity => {
      return Number(capacity);
    });
    let receiverCapacitiesInput = this.returnDoubleVector(receiverCapacities);

    let PipeData = new Module.PipeData(
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

    let AirSystemCapacity = new Module.AirSystemCapacity(PipeData, receiverCapacitiesInput);
    let rawOutput = AirSystemCapacity.calculate();


    let receiverCapacitiesOutput: Array<number> = [];
    for (let i = 0; i < rawOutput.receiverCapacities.size(); ++i) {
      receiverCapacitiesOutput.push(rawOutput.receiverCapacities.get(i));
    }

    let output: AirSystemCapacityOutput = {
      receiverCapacities: receiverCapacitiesOutput,
      totalPipeVolume: rawOutput.totalPipeVolume,
      totalReceiverVolume: rawOutput.totalReceiverVolume,
      totalCapacityOfCompressedAirSystem: rawOutput.totalCapacityOfCompressedAirSystem,
      leakRate: rawOutput.leakRate,
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

    PipeData.delete();
    AirSystemCapacity.delete();
    receiverCapacitiesInput.delete();
    return output;
  }

  airVelocity(input: AirVelocityInput): PipeSizes {
    input.airFlow = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airFlow);
    input.pipePressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.pipePressure);
    input.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPressure);
    let AirVelocity = new Module.AirVelocity(input.airFlow, input.pipePressure, input.atmosphericPressure);
    let output: PipeSizes = AirVelocity.calculate();
    AirVelocity.delete();
    return output;
  }

  pipeSizing(input: PipeSizingInput): PipeSizingOutput {
    input.airFlow = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airFlow);
    input.airlinePressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airlinePressure);
    input.designVelocity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.designVelocity);
    input.atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.atmosphericPressure);

    let PipeSizing = new Module.PipeSizing(input.airFlow, input.airlinePressure, input.designVelocity, input.atmosphericPressure);
    let output: PipeSizingOutput = PipeSizing.calculate();
    PipeSizing.delete();
    return output;
  }

  pneumaticValveCalculateFlowRate(input: PneumaticValveFlowRateInput): PneumaticValveFlowRateOutput {
    let PneumaticValve = new Module.PneumaticValve(input.inletPressure, input.outletPressure);
    let output: PneumaticValveFlowRateOutput = PneumaticValve.calculate();
    PneumaticValve.delete();
    return output;
  }

  pneumaticValve(input: PneumaticValve): PneumaticValveFlowCoefficient {
    let PneumaticValve = new Module.PneumaticValve(input.inletPressure, input.outletPressure, input.flowRate);
    let output: PneumaticValveFlowCoefficient = PneumaticValve.calculate();
    PneumaticValve.delete();
    return output;
  }

  bagMethod(input: BagMethodInput): BagMethodOutput {
    input.bagFillTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.bagFillTime);
    input.diameterOfBag = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.diameterOfBag);
    input.heightOfBag = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.heightOfBag);
    let BagMethod = new Module.BagMethod(input.operatingTime, input.bagFillTime, input.heightOfBag, input.diameterOfBag, input.numberOfUnits);
    let rawOutput = BagMethod.calculate();
    let output: BagMethodOutput = {
      flowRate: isNaN(rawOutput.flowRate)? undefined : rawOutput.flowRate,
      annualConsumption: isNaN(rawOutput.annualConsumption)? undefined : rawOutput.annualConsumption
    }
    BagMethod.delete();
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
  
    let chpOption = this.suiteApiHelperService.getCHPOptionEnum(input.option);
    let CHP = new Module.CHP(
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

    let output: CombinedHeatPowerOutput = CHP.getCostInfo();
    CHP.delete();
    return output;
  }

  usableAirCapacity(input: CalculateUsableCapacity): number {
    let ReceiverTank = new Module.ReceiverTank();
    input.tankSize = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.tankSize);
    input.airPressureIn = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airPressureIn);
    input.airPressureOut = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.airPressureOut);
    let output: number = ReceiverTank.calculateUsableCapacity(input.tankSize, input.airPressureIn, input.airPressureOut);
    ReceiverTank.delete();
    return output;
  }

  returnDoubleVector(doublesArray: Array<number>) {
    let doubleVector = new Module.DoubleVector();
    doublesArray.forEach(x => {
      doubleVector.push_back(x);
    });
    return doubleVector;
  }
}
