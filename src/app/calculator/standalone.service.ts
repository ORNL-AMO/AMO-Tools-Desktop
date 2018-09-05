import { Injectable } from '@angular/core';
declare var standaloneAddon: any;
import {
  CombinedHeatPower, CombinedHeatPowerOutput, PneumaticAirRequirementInput, PneumaticAirRequirementOutput,
  ReceiverTankGeneral, ReceiverTankDedicatedStorage, ReceiverTankBridgingCompressor, ReceiverTankMeteredStorage,
  OperatingCostInput, OperatingCostOutput, AirSystemCapacityInput, AirSystemCapacityOutput, AirVelocityInput, PipeSizes,
  PipeSizingOutput, PipeSizingInput, PneumaticValve, BagMethodInput, BagMethodOutput, CalculateUsableCapacity
} from '../shared/models/standalone';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';


@Injectable()
export class StandaloneService {


  constructor(private convertUnitsService: ConvertUnitsService) { }
  // for use with PneumaticAirRequirement
  getPistonType(pistonType: string) {
    if (pistonType === 'Single Acting') {
      return 0;
    }
    return 1; // Double Acting
  }

  pneumaticAirRequirement(input: PneumaticAirRequirementInput): PneumaticAirRequirementOutput {
    return standaloneAddon.pneumaticAirRequirement(input);
  }

  getReceiverTankCalculationMethod(method: string) {
    if (method === 'General') {
      return 0;
    } else if (method === 'Dedicated Storage') {
      return 1;
    } else if (method === 'Bridging Compressor Reaction Delay') {
      return 2;
    }
    return 3; // Metered Storage
  }

  receiverTankSizeGeneral(input: ReceiverTankGeneral, settings: Settings): number {
    let inputCpy: ReceiverTankGeneral = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure == 'Metric') {
      //metric:m3 imperial:ft3
      inputCpy.airDemand = this.convertUnitsService.value(inputCpy.airDemand).from('m3').to('ft3');
      //metric:psi imperial:kpa
      inputCpy.allowablePressureDrop = this.convertUnitsService.value(inputCpy.allowablePressureDrop).from('psi').to('kPa');
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('psi').to('kPa');
      let requiredStorage: number = standaloneAddon.receiverTank(inputCpy);
      //result required storage (gal)
      requiredStorage = this.convertUnitsService.value(requiredStorage).from('m3').to('gal');
      return requiredStorage;
    } else {
      return standaloneAddon.receiverTank(inputCpy);
    }
  }

  receiverTankSizeDedicatedStorage(input: ReceiverTankDedicatedStorage, settings: Settings): number {
    let inputCpy: ReceiverTankDedicatedStorage = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure == 'Metric') {
      //metric:m3 imperial:ft3
      inputCpy.airFlowRequirement = this.convertUnitsService.value(inputCpy.airFlowRequirement).from('m3').to('ft3');
      //metric:kPa imperial: psi
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPa').to('psi');
      inputCpy.initialTankPressure = this.convertUnitsService.value(inputCpy.initialTankPressure).from('kPa').to('psi');
      inputCpy.finalTankPressure = this.convertUnitsService.value(inputCpy.finalTankPressure).from('kPa').to('psi');
      //metric:m3 imperial:gal
      let calcVolume: number = standaloneAddon.receiverTank(inputCpy);
      calcVolume = this.convertUnitsService.value(calcVolume).from('gal').to('m3');
      return calcVolume;
    } else {
      return standaloneAddon.receiverTank(inputCpy);
    }
  }

  receiverTankSizeBridgingCompressor(input: ReceiverTankBridgingCompressor, settings: Settings): number {
    let inputCpy: ReceiverTankBridgingCompressor = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure == 'Metric') {
      //metric: m imperial: ft 
      inputCpy.distanceToCompressorRoom = this.convertUnitsService.value(inputCpy.distanceToCompressorRoom).from('m').to('ft');
      inputCpy.speedOfAir = this.convertUnitsService.value(inputCpy.speedOfAir).from('m').to('ft');
      // metric: m3 imperial:scfm (ft3)
      inputCpy.airDemand = this.convertUnitsService.value(inputCpy.airDemand).from('m3').to('ft3');
      //metric:kPa imperial: psi
      inputCpy.allowablePressureDrop = this.convertUnitsService.value(inputCpy.allowablePressureDrop).from('kPa').to('psi');
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPa').to('psi');
      //metric: m3 imperial: gal
      let calcVolume: number = standaloneAddon.receiverTank(inputCpy);
      calcVolume = this.convertUnitsService.value(calcVolume).from('gal').to('m3');
      return calcVolume;
    } else {
      return standaloneAddon.receiverTank(inputCpy);
    }
  }

  receiverTankSizeMeteredStorage(input: ReceiverTankMeteredStorage, settings: Settings): number {
    let inputCpy: ReceiverTankMeteredStorage = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure == 'Metric') {
      //metric: m imperial: ft 
      inputCpy.airFlowRequirement = this.convertUnitsService.value(inputCpy.airFlowRequirement).from('m3').to('ft3');
      inputCpy.meteredControl = this.convertUnitsService.value(inputCpy.meteredControl).from('m3').to('ft3');
      //metric:kPa imperial: psi
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPa').to('psi');
      inputCpy.initialTankPressure = this.convertUnitsService.value(inputCpy.initialTankPressure).from('kPa').to('psi');
      inputCpy.finalTankPressure = this.convertUnitsService.value(inputCpy.finalTankPressure).from('kPa').to('psi');
      //metric: m3 imperial: gal
      let calcVolume: number = standaloneAddon.receiverTank(inputCpy);
      calcVolume = this.convertUnitsService.value(calcVolume).from('gal').to('m3');
      return calcVolume;
    } else {
      return standaloneAddon.receiverTank(inputCpy);
    }
  }

  operatingCost(input: OperatingCostInput): OperatingCostOutput {
    return standaloneAddon.operatingCost(input);
  }

  airSystemCapacity(input: AirSystemCapacityInput): AirSystemCapacityOutput {
    return standaloneAddon.airSystemCapacity(input);
  }

  airVelocity(input: AirVelocityInput): PipeSizes {
    return standaloneAddon.airVelocity(input);
  }

  pipeSizing(input: PipeSizingInput): PipeSizingOutput {
    return standaloneAddon.pipeSizing(input);
  }

  // calculate flow rate
  pneumaticValveCalculateFlowRate(inletPressure: number, outletPressure: number): number {
    return standaloneAddon.pneumaticValve({ inletPressure: inletPressure, outletPressure: outletPressure }).flowRate;
  }

  // calculate flow coefficient
  pneumaticValve(input: PneumaticValve): number {
    return standaloneAddon.pneumaticValve(input).flowCoefficient;
  }

  bagMethod(input: BagMethodInput): BagMethodOutput {
    return standaloneAddon.bagMethod(input);
  }

  CHPcalculator(inputs: CombinedHeatPower): CombinedHeatPowerOutput {
    return standaloneAddon.CHPcalculator(inputs);
  }

  usableAirCapacity(input: CalculateUsableCapacity, settings: Settings): number {
    let inputCpy: CalculateUsableCapacity = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure == 'Metric') {
      //metric: m3 imperial: gal
      inputCpy.tankSize = this.convertUnitsService.value(inputCpy.tankSize).from('m3').to('gal');
      //metric:kPa imperial: psi
      inputCpy.airPressureIn = this.convertUnitsService.value(inputCpy.airPressureIn).from('kPa').to('psi');
      inputCpy.airPressureOut = this.convertUnitsService.value(inputCpy.airPressureOut).from('kPa').to('psi');
      //metric: m3 imperial: ft3
      let calcTankCapacity: number = standaloneAddon.usableAirCapacity(inputCpy);
      calcTankCapacity = this.convertUnitsService.value(calcTankCapacity).from('ft3').to('m3');
      return calcTankCapacity;
    } else {
      return standaloneAddon.usableAirCapacity(inputCpy);
    }
  }
}
