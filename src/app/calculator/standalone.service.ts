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

  pneumaticAirRequirement(input: PneumaticAirRequirementInput, settings: Settings): PneumaticAirRequirementOutput {
    let inputCpy: PneumaticAirRequirementInput = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure == 'Metric') {
      //metric: cm imperial: in
      inputCpy.cylinderDiameter = this.convertUnitsService.value(inputCpy.cylinderDiameter).from('cm').to('in');
      inputCpy.cylinderStroke = this.convertUnitsService.value(inputCpy.cylinderStroke).from('cm').to('in');
      inputCpy.pistonRodDiameter = this.convertUnitsService.value(inputCpy.pistonRodDiameter).from('cm').to('in');
      //metric: kPa imperial: psi
      inputCpy.airPressure = this.convertUnitsService.value(inputCpy.airPressure).from('kPa').to('psi');
      let output: PneumaticAirRequirementOutput = standaloneAddon.pneumaticAirRequirement(inputCpy);
      //metric: m3 imperial: ft3
      output.airRequirementPneumaticCylinder = this.convertUnitsService.value(output.airRequirementPneumaticCylinder).from('ft3').to('m3');
      //metric: m3 imperial: ft3
      output.volumeAirIntakePiston = this.convertUnitsService.value(output.volumeAirIntakePiston).from('ft3').to('m3');
      return output
    }
    else {
      return standaloneAddon.pneumaticAirRequirement(inputCpy);
    }
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
      //metric:kpa imperial:psi
      inputCpy.allowablePressureDrop = this.convertUnitsService.value(inputCpy.allowablePressureDrop).from('kPa').to('psi');
      //metric:kpaa imperial:psia
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPaa').to('psia');
      let requiredStorage: number = standaloneAddon.receiverTank(inputCpy);
      //metric:m3 imperial:gal
      requiredStorage = this.convertUnitsService.value(requiredStorage).from('gal').to('m3');
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
      //metric:kPaa imperial: psia
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPaa').to('psia');
      //metric:kpa imperial:psi
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
      //metric:kpaa imperial:psia
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPaa').to('psia');
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
      //metric:kPaa imperial: psia
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPaa').to('psia');
      //metric:kpa imperial:psi
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

  operatingCost(input: OperatingCostInput, settings: Settings): OperatingCostOutput {
    let inputCpy: OperatingCostInput = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure == 'Metric') {
      inputCpy.motorBhp = this.convertUnitsService.value(inputCpy.motorBhp).from('kW').to('hp');
    }
    return standaloneAddon.operatingCost(inputCpy);
  }

  airSystemCapacity(input: AirSystemCapacityInput, settings: Settings): AirSystemCapacityOutput {
    let inputCpy: AirSystemCapacityInput = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure == 'Metric') {
      //convert input data
      for (let key in inputCpy) {
        if (key != 'customPipes' && key != 'receiverCapacities') {
          inputCpy[key] = this.convertUnitsService.value(inputCpy[key]).from('m').to('ft');
        }
      }
      //convert input data and get custom volumes
      let customPipeVolume: number = 0;
      inputCpy.customPipes.forEach((pipe: { pipeSize: number, pipeLength: number }) => {
        pipe.pipeSize = this.convertUnitsService.value(pipe.pipeSize).from('cm').to('in');
        pipe.pipeLength = this.convertUnitsService.value(pipe.pipeLength).from('m').to('ft');
        customPipeVolume += this.calculatePipeVolume(pipe.pipeSize, pipe.pipeLength);
      })
      let tmpCapacities: Array<number> = new Array<number>();
      inputCpy.receiverCapacities.forEach(
        reciever => {
          tmpCapacities.push(this.convertUnitsService.value(reciever).from('m3').to('gal')
          )
        })
      inputCpy.receiverCapacities = tmpCapacities;
      //add custom volumes to calculated result
      let outputs: AirSystemCapacityOutput = standaloneAddon.airSystemCapacity(inputCpy);

      outputs.totalCapacityOfCompressedAirSystem += customPipeVolume;
      outputs.totalPipeVolume += customPipeVolume;
      //outputs.totalReceiverVolume += customRecieverVolume;
      //convert result
      outputs.totalReceiverVolume = this.convertUnitsService.value(outputs.totalReceiverVolume).from('ft3').to('m3');
      outputs.totalPipeVolume = this.convertUnitsService.value(outputs.totalPipeVolume).from('ft3').to('m3');
      outputs.totalCapacityOfCompressedAirSystem = this.convertUnitsService.value(outputs.totalCapacityOfCompressedAirSystem).from('ft3').to('m3');
      return outputs;
    } else {
      let customPipeVolume: number = 0;
      inputCpy.customPipes.forEach((pipe: { pipeSize: number, pipeLength: number }) => {
        customPipeVolume += this.calculatePipeVolume(pipe.pipeSize, pipe.pipeLength);
      })
      //add custom volumes to calculated result
      let outputs: AirSystemCapacityOutput = standaloneAddon.airSystemCapacity(inputCpy);
      outputs.totalCapacityOfCompressedAirSystem += customPipeVolume;
      outputs.totalPipeVolume += customPipeVolume;
      return outputs;
    }
  }
  //imperial: (diameter: inches, length: ft)
  calculatePipeVolume(diameter: number, length: number): number {
    let volume: number = Math.pow((diameter / 24), 2) * Math.PI * length;
    return volume;
  }

  airVelocity(input: AirVelocityInput, settings: Settings): PipeSizes {
    let inputCpy: AirVelocityInput = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure == 'Metric') {
      //metric: m3 imperial: ft3
      inputCpy.airFlow = this.convertUnitsService.value(inputCpy.airFlow).from('m3').to('ft3')
      //metric: kPaa imperial: psia
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPaa').to('psia')
      //metric: kPa imperial: psi
      inputCpy.pipePressure = this.convertUnitsService.value(inputCpy.pipePressure).from('kPa').to('psi')
      let output: PipeSizes = standaloneAddon.airVelocity(inputCpy);
      //all sizes metric: cm imperial: in
      for (let key in output) {
        output[key] = this.convertUnitsService.value(output[key]).from('in').to('cm')
      }
      return output;
    }
    return standaloneAddon.airVelocity(inputCpy);
  }

  pipeSizing(input: PipeSizingInput, settings: Settings): PipeSizingOutput {
    let inputCpy: PipeSizingInput = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure == 'Metric') {
      //metric: m3 imperial: ft3
      inputCpy.airFlow = this.convertUnitsService.value(inputCpy.airFlow).from('m3').to('ft3');
      //metric: kPa imperial: psi
      inputCpy.airlinePressure = this.convertUnitsService.value(inputCpy.airlinePressure).from('kPa').to('psi');
      //metric:kpaa imperial:psia
      inputCpy.atmosphericPressure = this.convertUnitsService.value(inputCpy.atmosphericPressure).from('kPaa').to('psia');
      //metric: m imperial: ft
      inputCpy.designVelocity = this.convertUnitsService.value(inputCpy.designVelocity).from('m').to('ft');
      let outputs: PipeSizingOutput = standaloneAddon.pipeSizing(inputCpy);
      //metric: cm2 imperial: in2
      outputs.crossSectionalArea = this.convertUnitsService.value(outputs.crossSectionalArea).from('in2').to('cm2');
      //metric: cm imperial: in
      outputs.pipeDiameter = this.convertUnitsService.value(outputs.pipeDiameter).from('in').to('cm');
      return outputs;
    } else {
      return standaloneAddon.pipeSizing(inputCpy);
    }
  }

  // calculate flow rate
  pneumaticValveCalculateFlowRate(inletPressure: number, outletPressure: number, settings: Settings): number {
    let inletPressureCpy: number = JSON.parse(JSON.stringify(inletPressure));
    let outletPressureCpy: number = JSON.parse(JSON.stringify(outletPressure));
    if (settings.unitsOfMeasure == 'Metric') {
      inletPressureCpy = this.convertUnitsService.value(inletPressureCpy).from('kPa').to('psi');
      outletPressureCpy = this.convertUnitsService.value(outletPressureCpy).from('kPa').to('psi');
      let flowRate: number = standaloneAddon.pneumaticValve({ inletPressure: inletPressureCpy, outletPressure: outletPressureCpy }).flowRate;
      flowRate = this.convertUnitsService.value(flowRate).from('ft3').to('m3');
      return flowRate;
    } else {
      return standaloneAddon.pneumaticValve({ inletPressure: inletPressureCpy, outletPressure: outletPressureCpy }).flowRate;
    }
  }

  // calculate flow coefficient
  pneumaticValve(input: PneumaticValve, settings: Settings): number {
    let inputCpy: PneumaticValve = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure == 'Metric') {
      inputCpy.inletPressure = this.convertUnitsService.value(inputCpy.inletPressure).from('kPa').to('psi');
      inputCpy.outletPressure = this.convertUnitsService.value(inputCpy.outletPressure).from('kPa').to('psi');
      inputCpy.flowRate = this.convertUnitsService.value(inputCpy.flowRate).from('m3').to('ft3');
      let flowCoefficient: number = standaloneAddon.pneumaticValve(inputCpy).flowCoefficient;
      flowCoefficient = this.convertUnitsService.value(flowCoefficient).from('ft3').to('m3');
      return flowCoefficient;
    } else {
      return standaloneAddon.pneumaticValve(inputCpy).flowCoefficient;
    }
  }

  bagMethod(input: BagMethodInput, settings: Settings): BagMethodOutput {
    let inputCpy: BagMethodInput = JSON.parse(JSON.stringify(input));
    if (settings.unitsOfMeasure == 'Metric') {
      //metric: cm imperial: in
      inputCpy.heightOfBag = this.convertUnitsService.value(inputCpy.heightOfBag).from('cm').to('in');
      inputCpy.diameterOfBag = this.convertUnitsService.value(inputCpy.diameterOfBag).from('cm').to('in');
      let results: BagMethodOutput = standaloneAddon.bagMethod(inputCpy);
      //metric: m3 imperial: ft3
      results.flowRate = this.convertUnitsService.value(results.flowRate).from('ft3').to('m3');
      results.annualConsumption = this.convertUnitsService.value(results.annualConsumption).from('ft3').to('m3');
      return results;
    } else {
      return standaloneAddon.bagMethod(inputCpy);
    }
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
