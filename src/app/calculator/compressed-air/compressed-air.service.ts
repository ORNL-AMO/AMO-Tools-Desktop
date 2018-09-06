import { Injectable } from '@angular/core';
import { AirVelocityInput, BagMethodInput, PneumaticValve, OperatingCostInput, PipeSizingInput, PneumaticAirRequirementInput, CalculateUsableCapacity, ReceiverTankDedicatedStorage, ReceiverTankBridgingCompressor, ReceiverTankGeneral, ReceiverTankMeteredStorage, AirSystemCapacityInput } from '../../shared/models/standalone';

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
      operatingHours: 0
    }

  pnuematicValveInputs: PneumaticValve = {
    inletPressure: 0,
    outletPressure: 0,
    flowRate: 0
  };

  operatingCostInput: OperatingCostInput = {
    motorBhp: 0,
    bhpUnloaded: 0,
    annualOperatingHours: 0,
    runTimeLoaded: 0,
    runTimeUnloaded: 0,
    efficiencyLoaded: 0,
    efficiencyUnloaded: 0,
    costOfElectricity: 0,

  };

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

  bridgeCompressorInputs:ReceiverTankBridgingCompressor = {
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
  constructor() { }
}
