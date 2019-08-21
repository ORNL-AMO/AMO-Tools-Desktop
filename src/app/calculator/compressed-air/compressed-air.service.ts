import { Injectable } from '@angular/core';
import { AirVelocityInput, BagMethodInput, PneumaticValve, OperatingCostInput, PipeSizingInput, PneumaticAirRequirementInput, CalculateUsableCapacity, ReceiverTankDedicatedStorage, ReceiverTankBridgingCompressor, ReceiverTankGeneral, ReceiverTankMeteredStorage, AirSystemCapacityInput } from '../../shared/models/standalone';
import { OperatingHours } from '../../shared/models/operations';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';

@Injectable()
export class CompressedAirService {

  airVelocityInputs: AirVelocityInput = {
    airFlow: 0,
    pipePressure: 0,
    atmosphericPressure: 0,
  };

  bagMethodInputs: {
    inputsArray: Array<BagMethodInput>,
    operatingHours: number
  } = {
      inputsArray: new Array<BagMethodInput>(),
      operatingHours: 8760
    };

  bagMethodOperatingHours: OperatingHours;

  pnuematicValveInputs: PneumaticValve = {
    inletPressure: 0,
    outletPressure: 0,
    flowRate: 0
  };

  operatingCostInput: OperatingCostInput = {
    motorBhp: 0,
    bhpUnloaded: 0,
    annualOperatingHours: 8760,
    runTimeLoaded: 0,
    efficiencyLoaded: 0,
    efficiencyUnloaded: 0,
    costOfElectricity: 0,
  };

  operatingCostOperatingHours: OperatingHours;

  pipeSizingInput: PipeSizingInput = {
    airFlow: 0,
    airlinePressure: 0,
    designVelocity: 20,
    atmosphericPressure: 14.7
  };

  pneumaticAirinputs: PneumaticAirRequirementInput = {
    pistonType: 0,
    cylinderDiameter: 0,
    cylinderStroke: 0,
    pistonRodDiameter: 0,
    airPressure: 0,
    cyclesPerMinute: 0
  };

  airCapacityInputs: CalculateUsableCapacity = {
    tankSize: 0,
    airPressureIn: 0,
    airPressureOut: 0,
  };

  dedicatedStorageInputs: ReceiverTankDedicatedStorage = {
    method: 1,
    atmosphericPressure: 14.7,
    lengthOfDemand: 0,
    airFlowRequirement: 0,
    initialTankPressure: 0,
    finalTankPressure: 0
  };

  bridgeCompressorInputs: ReceiverTankBridgingCompressor = {
    method: 3,
    distanceToCompressorRoom: 0,
    speedOfAir: 0,
    airDemand: 0,
    allowablePressureDrop: 0,
    atmosphericPressure: 14.7
  };
  generalMethodInputs: ReceiverTankGeneral = {
    airDemand: 0,
    allowablePressureDrop: 0,
    method: 0,
    atmosphericPressure: 14.7,
  };
  meteredStorageInputs: ReceiverTankMeteredStorage = {
    method: 2,
    lengthOfDemand: 0,
    airFlowRequirement: 0,
    atmosphericPressure: 14.7,
    initialTankPressure: 0,
    finalTankPressure: 0,
    meteredControl: 0,
  };
  recieverTankMethod: number = 0;
  systeCapacityInputs: AirSystemCapacityInput = {
    receiverCapacities: [0],
    customPipes: new Array<{ pipeSize: number, pipeLength: number }>(),
    oneHalf: 0,
    threeFourths: 0,
    one: 0,
    oneAndOneFourth: 0,
    oneAndOneHalf: 0,
    two: 0,
    twoAndOneHalf: 0,
    three: 0,
    threeAndOneHalf: 0,
    four: 0,
    five: 0,
    six: 0,
  };

  constructor(private convertUnitsService: ConvertUnitsService) {
  }

  convertAirVelocityExample(inputs: AirVelocityInput, settings: Settings) {
    let tmpInputs: AirVelocityInput = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs = {
        airFlow: Math.round(this.convertUnitsService.value(inputs.airFlow).from('ft3').to('m3') * 100) / 100,
        pipePressure: Math.round(this.convertUnitsService.value(inputs.pipePressure).from('psi').to('kPa') * 100) / 100,
        atmosphericPressure: Math.round(this.convertUnitsService.value(inputs.atmosphericPressure).from('psia').to('kPaa') * 100) / 100
      };
      return tmpInputs;
    }
    return tmpInputs;
  }

  convertLeakLossEstimatorExample(inputs: Array<BagMethodInput>, settings: Settings) {
    let tmpInputs: Array<BagMethodInput> = inputs;


    if (settings.unitsOfMeasure == 'Metric') {
      for (let i = 0; i < tmpInputs.length; i++) {
        tmpInputs[i].diameterOfBag = Math.round(this.convertUnitsService.value(tmpInputs[i].diameterOfBag).from('in').to('cm') * 100) / 100;
        tmpInputs[i].heightOfBag = Math.round(this.convertUnitsService.value(tmpInputs[i].heightOfBag).from('in').to('cm') * 100) / 100;
      }
      return tmpInputs;
    }
    return tmpInputs;
  }

  convertPneumaticCylinderAirExample(inputs: PneumaticAirRequirementInput, settings: Settings) {
    let tmpInputs: PneumaticAirRequirementInput = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.cylinderDiameter = Math.round(this.convertUnitsService.value(tmpInputs.cylinderDiameter).from('in').to('cm') * 100) / 100;
      tmpInputs.cylinderStroke = Math.round(this.convertUnitsService.value(tmpInputs.cylinderStroke).from('in').to('cm') * 100) / 100;
      tmpInputs.airPressure = Math.round(this.convertUnitsService.value(tmpInputs.airPressure).from('psi').to('kPa') * 100) / 100;
    }
    return tmpInputs;
  }

  convertGeneralMethodExample(inputs: ReceiverTankGeneral, settings: Settings) {
    let tmpInputs: ReceiverTankGeneral = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.airDemand = Math.round(this.convertUnitsService.value(tmpInputs.airDemand).from('ft3').to('m3') * 100) / 100;
      tmpInputs.allowablePressureDrop = Math.round(this.convertUnitsService.value(tmpInputs.allowablePressureDrop).from('psi').to('kPa') * 100) / 100;
      tmpInputs.atmosphericPressure = Math.round(this.convertUnitsService.value(tmpInputs.atmosphericPressure).from('psia').to('kPaa') * 100) / 100;
    }
    return tmpInputs;
  }

  convertDedicatedStorageExample(inputs: ReceiverTankDedicatedStorage, settings: Settings) {
    let tmpInputs: ReceiverTankDedicatedStorage = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.airFlowRequirement = Math.round(this.convertUnitsService.value(tmpInputs.airFlowRequirement).from('ft3').to('m3') * 100) / 100;
      tmpInputs.initialTankPressure = Math.round(this.convertUnitsService.value(tmpInputs.initialTankPressure).from('psi').to('kPa') * 100) / 100;
      tmpInputs.finalTankPressure = Math.round(this.convertUnitsService.value(tmpInputs.finalTankPressure).from('psi').to('kPa') * 100) / 100;
      tmpInputs.atmosphericPressure = Math.round(this.convertUnitsService.value(tmpInputs.atmosphericPressure).from('psia').to('kPaa') * 100) / 100;
    }
    return tmpInputs;
  }

  convertTankMeteredStorageExample(inputs: ReceiverTankMeteredStorage, settings: Settings) {
    let tmpInputs: ReceiverTankMeteredStorage = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.airFlowRequirement = Math.round(this.convertUnitsService.value(tmpInputs.airFlowRequirement).from('ft3').to('m3') * 100) / 100;
      tmpInputs.meteredControl = Math.round(this.convertUnitsService.value(tmpInputs.meteredControl).from('ft3').to('m3') * 100) / 100;
      tmpInputs.initialTankPressure = Math.round(this.convertUnitsService.value(tmpInputs.initialTankPressure).from('psi').to('kPa') * 100) / 100;
      tmpInputs.finalTankPressure = Math.round(this.convertUnitsService.value(tmpInputs.finalTankPressure).from('psi').to('kPa') * 100) / 100;
      tmpInputs.atmosphericPressure = Math.round(this.convertUnitsService.value(tmpInputs.atmosphericPressure).from('psia').to('kPaa') * 100) / 100;
    }
    return tmpInputs;
  }

  convertTankBridgingCompressorExample(inputs: ReceiverTankBridgingCompressor, settings: Settings) {
    let tmpInputs: ReceiverTankBridgingCompressor = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.distanceToCompressorRoom = Math.round(this.convertUnitsService.value(tmpInputs.distanceToCompressorRoom).from('ft3').to('m3') * 100) / 100;
      tmpInputs.speedOfAir = Math.round(this.convertUnitsService.value(tmpInputs.speedOfAir).from('ft').to('m') * 100) / 100;
      tmpInputs.allowablePressureDrop = Math.round(this.convertUnitsService.value(tmpInputs.allowablePressureDrop).from('psi').to('kPa') * 100) / 100;
      tmpInputs.atmosphericPressure = Math.round(this.convertUnitsService.value(tmpInputs.atmosphericPressure).from('psia').to('kPaa') * 100) / 100;
    }
    return tmpInputs;
  }

  convertCalculateUsableCapacityExample(inputs: CalculateUsableCapacity, settings: Settings) {
    let tmpInputs: CalculateUsableCapacity = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.tankSize = Math.round(this.convertUnitsService.value(tmpInputs.tankSize).from('gal').to('m3') * 100) / 100;
      tmpInputs.airPressureIn = Math.round(this.convertUnitsService.value(tmpInputs.airPressureIn).from('psi').to('kPa') * 100) / 100;
      tmpInputs.airPressureOut = Math.round(this.convertUnitsService.value(tmpInputs.airPressureOut).from('psi').to('kPa') * 100) / 100;
    }
    return tmpInputs;
  }

  convertPipeSizingExample(inputs: PipeSizingInput, settings: Settings) {
    let tmpInputs: PipeSizingInput = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.airFlow = Math.round(this.convertUnitsService.value(tmpInputs.airFlow).from('ft3').to('m3') * 100) / 100;
      tmpInputs.airlinePressure = Math.round(this.convertUnitsService.value(tmpInputs.airlinePressure).from('psi').to('kPa') * 100) / 100;
      tmpInputs.designVelocity = Math.round(this.convertUnitsService.value(tmpInputs.designVelocity).from('ft').to('m') * 100) / 100;
      tmpInputs.atmosphericPressure = Math.round(this.convertUnitsService.value(tmpInputs.atmosphericPressure).from('psia').to('kPaa') * 100) / 100;
    }
    return tmpInputs;
  }

  convertAirSystemCapacityExample(inputs: AirSystemCapacityInput, settings: Settings) {
    let tmpInputs: AirSystemCapacityInput = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.oneHalf = Math.round(this.convertUnitsService.value(tmpInputs.oneHalf).from('ft').to('m') * 100) / 100;
      tmpInputs.threeFourths = Math.round(this.convertUnitsService.value(tmpInputs.threeFourths).from('ft').to('m') * 100) / 100;
      tmpInputs.one = Math.round(this.convertUnitsService.value(tmpInputs.one).from('ft').to('m') * 100) / 100;
      tmpInputs.oneAndOneFourth = Math.round(this.convertUnitsService.value(tmpInputs.oneAndOneFourth).from('ft').to('m') * 100) / 100;
      tmpInputs.oneAndOneHalf = Math.round(this.convertUnitsService.value(tmpInputs.oneAndOneHalf).from('ft').to('m') * 100) / 100;
      tmpInputs.two = Math.round(this.convertUnitsService.value(tmpInputs.two).from('ft').to('m') * 100) / 100;
      tmpInputs.twoAndOneHalf = Math.round(this.convertUnitsService.value(tmpInputs.twoAndOneHalf).from('ft').to('m') * 100) / 100;
      tmpInputs.three = Math.round(this.convertUnitsService.value(tmpInputs.three).from('ft').to('m') * 100) / 100;
      tmpInputs.threeAndOneHalf = Math.round(this.convertUnitsService.value(tmpInputs.threeAndOneHalf).from('ft').to('m') * 100) / 100;
      tmpInputs.four = Math.round(this.convertUnitsService.value(tmpInputs.four).from('ft').to('m') * 100) / 100;
      tmpInputs.five = Math.round(this.convertUnitsService.value(tmpInputs.five).from('ft').to('m') * 100) / 100;
      tmpInputs.six = Math.round(this.convertUnitsService.value(tmpInputs.six).from('ft').to('m') * 100) / 100;
      for (let i = 0; i < tmpInputs.receiverCapacities.length; i++) {
        tmpInputs.receiverCapacities[i] = Math.round(this.convertUnitsService.value(tmpInputs.receiverCapacities[i]).from('gal').to('m3') * 100) / 100;
      }
    }
    return tmpInputs;
  }

  convertOperatingCostExample(inputs: OperatingCostInput, settings: Settings) {
    let tmpInputs: OperatingCostInput = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.motorBhp = Math.round(this.convertUnitsService.value(tmpInputs.motorBhp).from('hp').to('kW') * 100) / 100;
    }
    return tmpInputs;
  }

  initReceiverTankInputs() {
    this.airCapacityInputs = {
      tankSize: 0,
      airPressureIn: 0,
      airPressureOut: 0,
    };
    this.dedicatedStorageInputs = {
      method: 1,
      atmosphericPressure: 14.7,
      lengthOfDemand: 0,
      airFlowRequirement: 0,
      initialTankPressure: 0,
      finalTankPressure: 0
    };
    this.meteredStorageInputs = {
      method: 2,
      lengthOfDemand: 0,
      airFlowRequirement: 0,
      atmosphericPressure: 14.7,
      initialTankPressure: 0,
      finalTankPressure: 0,
      meteredControl: 0,
    };
    this.bridgeCompressorInputs = {
      method: 3,
      distanceToCompressorRoom: 0,
      speedOfAir: 0,
      airDemand: 0,
      allowablePressureDrop: 0,
      atmosphericPressure: 14.7
    };
    this.generalMethodInputs = {
      airDemand: 0,
      allowablePressureDrop: 0,
      method: 0,
      atmosphericPressure: 14.7,
    };
  }
}
