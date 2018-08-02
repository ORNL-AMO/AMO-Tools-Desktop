import { Injectable } from '@angular/core';
declare var standaloneAddon: any;
import {
  CombinedHeatPower, CombinedHeatPowerOutput, PneumaticAirRequirementInput, PneumaticAirRequirementOutput,
  ReceiverTankGeneral, ReceiverTankDedicatedStorage, ReceiverTankBridgingCompressor, ReceiverTankMeteredStorage,
  OperatingCostInput, OperatingCostOutput, AirSystemCapacityInput, AirSystemCapacityOutput, AirVelocityInput, PipeSizes,
  PipeSizingOutput, PipeSizingInput, PneumaticValve, BagMethodInput, BagMethodOutput, CalculateUsableCapacity
} from '../shared/models/standalone';


@Injectable()
export class StandaloneService {
  // for use with PneumaticAirRequirement
  static getPistonType(pistonType: string) {
    if (pistonType === 'Single Acting') {
      return 0;
    }
    return 1; // Double Acting
  }

  static pneumaticAirRequirement(input: PneumaticAirRequirementInput): PneumaticAirRequirementOutput {
    return standaloneAddon.pneumaticAirRequirement(input);
  }

  static getReceiverTankCalculationMethod(method: string) {
    if (method === 'General') {
      return 0;
    } else if (method === 'Dedicated Storage') {
      return 1;
    } else if (method === 'Bridging Compressor Reaction Delay') {
      return 2;
    }
    return 3; // Metered Storage
  }

  static receiverTankSizeGeneral(input: ReceiverTankGeneral): number {
    return standaloneAddon.receiverTank(input);
  }

  static receiverTankSizeDedicatedStorage(input: ReceiverTankDedicatedStorage): number {
    return standaloneAddon.receiverTank(input);
  }

  static receiverTankSizeBridgingCompressor(input: ReceiverTankBridgingCompressor): number {
    return standaloneAddon.receiverTank(input);
  }

  static receiverTankSizeMeteredStorage(input: ReceiverTankMeteredStorage): number {
    return standaloneAddon.receiverTank(input);
  }

  static operatingCost(input: OperatingCostInput): OperatingCostOutput {
    return standaloneAddon.operatingCost(input);
  }

  static airSystemCapacity(input: AirSystemCapacityInput): AirSystemCapacityOutput {
    console.log(input);
    return standaloneAddon.airSystemCapacity(input);
  }

  static airVelocity(input: AirVelocityInput): PipeSizes {
    return standaloneAddon.airVelocity(input);
  }

  static pipeSizing(input: PipeSizingInput): PipeSizingOutput {
    return standaloneAddon.pipeSizing(input);
  }

  // calculate flow rate
  static pneumaticValveCalculateFlowRate(inletPressure: number, outletPressure: number): number {
    return standaloneAddon.pneumaticValve({inletPressure: inletPressure, outletPressure: outletPressure}).flowRate;
  }

  // calculate flow coefficient
  static pneumaticValve(input: PneumaticValve): number {
    return standaloneAddon.pneumaticValve(input).flowCoefficient;
  }

  static bagMethod(input: BagMethodInput): BagMethodOutput {
    return standaloneAddon.bagMethod(input);
  }

  static CHPcalculator(inputs: CombinedHeatPower): CombinedHeatPowerOutput {
    return standaloneAddon.CHPcalculator(inputs);
  }

  static  usableAirCapacity(input: CalculateUsableCapacity): number {
    return standaloneAddon.usableAirCapacity(input);
  }
  constructor() { }
}
