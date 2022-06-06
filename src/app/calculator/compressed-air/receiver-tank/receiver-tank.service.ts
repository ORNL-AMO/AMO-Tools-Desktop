import { Injectable } from '@angular/core';
import { ReceiverTankDedicatedStorage, ReceiverTankBridgingCompressor, ReceiverTankGeneral, ReceiverTankMeteredStorage, AirSystemCapacityInput, CalculateUsableCapacity, ReceiverTankCompressorCycle } from '../../../shared/models/standalone';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class ReceiverTankService {
  dedicatedStorageInputs: ReceiverTankDedicatedStorage;

  bridgeCompressorInputs: ReceiverTankBridgingCompressor;
  generalMethodInputs: ReceiverTankGeneral;
  meteredStorageInputs: ReceiverTankMeteredStorage;
  compressorCycleInputs: ReceiverTankCompressorCycle;
  receiverTankMethod: number;
  airCapacityInputs: CalculateUsableCapacity;
  setForm: BehaviorSubject<boolean>;
  inputs: BehaviorSubject<ReceiverTankInputs>;
  currentField: BehaviorSubject<string>;
  inAssessmentCalculator: boolean = false;

  constructor(private convertUnitsService: ConvertUnitsService) {
    this.setForm = new BehaviorSubject<boolean>(true);
    this.currentField = new BehaviorSubject<string>('default');
    this.setDefaults();
    this.setAirCapacityDefault();
  }
  
  setAssessmentCalculatorSubject() {
    this.inAssessmentCalculator = true;
    this.inputs = new BehaviorSubject(
      {
        dedicatedStorageInputs: undefined,
        airCapacityInputs: undefined,
        generalMethodInputs: undefined,
        meteredStorageInputs: undefined,
        bridgeCompressorInputs: undefined,
        compressorCycleInputs: undefined
      }
    );
  }

  setDefaults() {
    this.receiverTankMethod = 0;
    this.dedicatedStorageInputs = this.getDedicatedStorageDefaults();
    this.bridgeCompressorInputs = this.getBridgeCompressorDefault();
    this.generalMethodInputs = this.getGeneralMethodDefaults();
    this.meteredStorageInputs = this.getMeteredStorageDefaults();
    this.compressorCycleInputs = this.getCompressorCycleDefaults()
    // this.systemCapacityInputs = this.getSystemCapacityDefaults();
  }

  setAirCapacityDefault() {
    this.airCapacityInputs = this.getAirCapacityDefaults();
  }

  setExampleData(settings: Settings) {
    this.dedicatedStorageInputs = this.getDedicatedStorageExamples();
    this.dedicatedStorageInputs = this.convertDedicatedStorageExample(this.dedicatedStorageInputs, settings);

    this.bridgeCompressorInputs = this.getBridgeCompressorExample();
    this.bridgeCompressorInputs = this.convertTankBridgingCompressorExample(this.bridgeCompressorInputs, settings);

    this.generalMethodInputs = this.getGeneralMethodExample();
    this.generalMethodInputs = this.convertGeneralMethodExample(this.generalMethodInputs, settings);

    this.meteredStorageInputs = this.getMeteredStorageExample();
    this.meteredStorageInputs = this.convertTankMeteredStorageExample(this.meteredStorageInputs, settings);

    this.compressorCycleInputs = this.getCompressorCycleExample();
    this.compressorCycleInputs = this.convertCompressorCycleExample(this.compressorCycleInputs, settings);

  }

  setAirCapacityExample(settings: Settings) {
    this.airCapacityInputs = this.getAirCapacityExample();
    this.airCapacityInputs = this.convertCalculateUsableCapacityExample(this.airCapacityInputs, settings);
  }

  //dedicated storage
  getDedicatedStorageDefaults(): ReceiverTankDedicatedStorage {
    return {
      method: 1,
      atmosphericPressure: 14.7,
      lengthOfDemand: 0,
      airFlowRequirement: 0,
      initialTankPressure: 0,
      finalTankPressure: 0
    }
  }

  getDedicatedStorageExamples(): ReceiverTankDedicatedStorage {
    return {
      method: 1,
      atmosphericPressure: 14.7,
      lengthOfDemand: 1,
      airFlowRequirement: 1000,
      initialTankPressure: 110,
      finalTankPressure: 100
    };
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

  //bridge compressor
  getBridgeCompressorDefault(): ReceiverTankBridgingCompressor {
    return {
      method: 3,
      distanceToCompressorRoom: 0,
      speedOfAir: 0,
      airDemand: 0,
      allowablePressureDrop: 0,
      atmosphericPressure: 14.7
    };
  }

  getBridgeCompressorExample(): ReceiverTankBridgingCompressor {
    return {
      method: 3,
      distanceToCompressorRoom: 1000,
      speedOfAir: 250,
      airDemand: 600,
      allowablePressureDrop: 2,
      atmosphericPressure: 14.7
    };
  }

  convertTankBridgingCompressorExample(inputs: ReceiverTankBridgingCompressor, settings: Settings) {
    let tmpInputs: ReceiverTankBridgingCompressor = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.distanceToCompressorRoom = Math.round(this.convertUnitsService.value(tmpInputs.distanceToCompressorRoom).from('ft').to('m') * 100) / 100;
      tmpInputs.speedOfAir = Math.round(this.convertUnitsService.value(tmpInputs.speedOfAir).from('ft').to('m') * 100) / 100;
      tmpInputs.allowablePressureDrop = Math.round(this.convertUnitsService.value(tmpInputs.allowablePressureDrop).from('psig').to('kPa') * 100) / 100;
      tmpInputs.atmosphericPressure = Math.round(this.convertUnitsService.value(tmpInputs.atmosphericPressure).from('psia').to('kPaa') * 100) / 100;
      tmpInputs.airDemand = Math.round(this.convertUnitsService.value(tmpInputs.airDemand).from('ft3').to('m3') * 100) / 100;
    }
    return tmpInputs;
  }

  //general method
  getGeneralMethodDefaults(): ReceiverTankGeneral {
    return {
      airDemand: 0,
      allowablePressureDrop: 0,
      method: 0,
      atmosphericPressure: 14.7,
    };
  }

  getGeneralMethodExample(): ReceiverTankGeneral {
    return {
      airDemand: 150,
      allowablePressureDrop: 3,
      method: 0,
      atmosphericPressure: 14.7,
    };
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

  //metered storage
  getMeteredStorageDefaults(): ReceiverTankMeteredStorage {
    return {
      method: 2,
      lengthOfDemand: 0,
      airFlowRequirement: 0,
      atmosphericPressure: 14.7,
      initialTankPressure: 0,
      finalTankPressure: 0,
      meteredControl: 0,
    };
  }

  getMeteredStorageExample(): ReceiverTankMeteredStorage {
    return {
      method: 2,
      lengthOfDemand: 1.5,
      airFlowRequirement: 900,
      atmosphericPressure: 14.7,
      initialTankPressure: 100,
      finalTankPressure: 70,
      meteredControl: 45,
    };
  }

  convertTankMeteredStorageExample(inputs: ReceiverTankMeteredStorage, settings: Settings) {
    let tmpInputs: ReceiverTankMeteredStorage = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.airFlowRequirement = Math.round(this.convertUnitsService.value(tmpInputs.airFlowRequirement).from('m3').to('ft3') * 100) / 100;
      tmpInputs.meteredControl = Math.round(this.convertUnitsService.value(tmpInputs.meteredControl).from('m3').to('ft3') * 100) / 100;
      tmpInputs.initialTankPressure = Math.round(this.convertUnitsService.value(tmpInputs.initialTankPressure).from('psi').to('kPa') * 100) / 100;
      tmpInputs.finalTankPressure = Math.round(this.convertUnitsService.value(tmpInputs.finalTankPressure).from('psi').to('kPa') * 100) / 100;
      tmpInputs.atmosphericPressure = Math.round(this.convertUnitsService.value(tmpInputs.atmosphericPressure).from('psia').to('kPaa') * 100) / 100;
    }
    return tmpInputs;
  }

 
  //air capacity
  getAirCapacityDefaults(): CalculateUsableCapacity {
    return {
      tankSize: 0,
      airPressureIn: 0,
      airPressureOut: 0,
      leakRateInput: {
        dischargeTime: 0,
        atmosphericPressure: 0
      }
    };
  }

  getAirCapacityExample(): CalculateUsableCapacity {
    return {
      tankSize: 1000,
      airPressureIn: 110,
      airPressureOut: 100,
      leakRateInput: {
        dischargeTime: 120,
        atmosphericPressure: 14.7
      }
    };
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

  getCompressorCycleExample(): ReceiverTankCompressorCycle {
    return {
      method: 2,
      atmosphericPressure: 14.5,
      loadTime: 34,
      unloadTime: 27,
      compressorCapacity: 430,
      fullLoadPressure: 100,
      unloadPressure: 110
    };
  }

  getCompressorCycleDefaults(): ReceiverTankCompressorCycle {
    return {
      method: 2,
      atmosphericPressure: 14.5,
      loadTime: 0,
      unloadTime: 0,
      compressorCapacity: 0,
      fullLoadPressure: 0,
      unloadPressure: 0
    };
  }

  convertCompressorCycleExample(inputs: ReceiverTankCompressorCycle, settings: Settings) {
    let tmpInputs: ReceiverTankCompressorCycle = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.atmosphericPressure = Math.round(tmpInputs.atmosphericPressure = this.convertUnitsService.value(tmpInputs.atmosphericPressure).from('psia').to('kPaa') * 100) / 100;
      tmpInputs.compressorCapacity = Math.round(this.convertUnitsService.value(tmpInputs.compressorCapacity).from('ft3/min').to('m3/min') * 100) / 100;
      tmpInputs.fullLoadPressure = Math.round(this.convertUnitsService.value(tmpInputs.fullLoadPressure).from('psi').to('kPa') * 100) / 100;
      tmpInputs.unloadPressure = Math.round(this.convertUnitsService.value(tmpInputs.unloadPressure).from('psi').to('kPa') * 100) / 100;
    }
    return tmpInputs;
  }

}

export interface ReceiverTankInputs {
  dedicatedStorageInputs?: ReceiverTankDedicatedStorage,
  airCapacityInputs?: CalculateUsableCapacity,
  generalMethodInputs?: ReceiverTankGeneral,
  meteredStorageInputs?: ReceiverTankMeteredStorage,
  bridgeCompressorInputs?: ReceiverTankBridgingCompressor,
  compressorCycleInputs?: ReceiverTankCompressorCycle
}