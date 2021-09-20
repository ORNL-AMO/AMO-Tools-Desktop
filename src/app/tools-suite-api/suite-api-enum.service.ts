import { Injectable } from '@angular/core';
import { pumpTypesConstant, motorEfficiencyConstants, driveConstants } from '../psat/psatConstants';
import { FanTypes } from '../fsat/fanOptions';
import * as _ from 'lodash';

//wasm module
declare var Module: any;
@Injectable()
export class SuiteApiEnumService {

  constructor() {
    console.log('init');
    // var Module = {
    // 	onRuntimeInitialized: function () {
    // 		console.log('Tools Suite Module Initialized');
    // 	}
    // }
    // fetch("assets/client.js");
    // let config: WebAssembly.Module = {

    // }

    // WebAssembly.instantiateStreaming(fetch("assets/client.wasm"), { }).then(results => {
    //   console.log(results);
    // });
  }
  getPumpStyleEnum(pumpStyle: number): any {
    switch (pumpStyle) {
      case 0:
        return Module.PumpStyle.END_SUCTION_SLURRY;
      case 1:
        return Module.PumpStyle.END_SUCTION_SEWAGE;
      case 2:
        return Module.PumpStyle.END_SUCTION_STOCK;
      case 3:
        return Module.PumpStyle.END_SUCTION_SUBMERSIBLE_SEWAGE;
      case 4:
        return Module.PumpStyle.API_DOUBLE_SUCTION;
      case 5:
        return Module.PumpStyle.MULTISTAGE_BOILER_FEED;
      case 6:
        return Module.PumpStyle.END_SUCTION_ANSI_API;
      case 7:
        return Module.PumpStyle.AXIAL_FLOW;
      case 8:
        return Module.PumpStyle.DOUBLE_SUCTION;
      case 9:
        return Module.PumpStyle.VERTICAL_TURBINE;
      case 10:
        return Module.PumpStyle.LARGE_END_SUCTION;
      case 11:
        return Module.PumpStyle.SPECIFIED_OPTIMAL_EFFICIENCY;
    }
  }

  getPistonTypeEnum(pistonType: number): any {
    switch (pistonType) {
      case 0:
        return Module.PistonType.SingleActing;
      case 1:
        return Module.PistonType.DoubleActing;
    }
  }

  getLineFrequencyEnum(lineFreq: number) {
    let lineFrequency = Module.LineFrequency.FREQ50;
    if (lineFreq == 60) {
      lineFrequency = Module.LineFrequency.FREQ60;
    }

    return lineFrequency;
  }

  // Frontend forms use values 50, 60. Backend uses 0,1
  getLineFrequencyFromSuiteEnumValue(lineFrequency: number): number {
    switch (lineFrequency) {
      case 0:
        return 50;
      case 1:
        return 60;
    }
  }

  getMotorEfficiencyEnum(motorEffVal: number): any {
    switch (motorEffVal) {
      case 0:
        return Module.MotorEfficiencyClass.STANDARD;
      case 1:
        return Module.MotorEfficiencyClass.ENERGY_EFFICIENT;
      case 2:
        return Module.MotorEfficiencyClass.PREMIUM;
      case 3:
        return Module.MotorEfficiencyClass.SPECIFIED;
    }
  }

  getDriveEnum(drive: number) {
    switch (drive) {
      case 0:
        return Module.Drive.DIRECT_DRIVE;
      case 1:
        return Module.Drive.V_BELT_DRIVE;
      case 2:
        return Module.Drive.N_V_BELT_DRIVE;
      case 3:
        return Module.Drive.S_BELT_DRIVE;
      case 4:
        return Module.Drive.SPECIFIED;
    }
  }

  getFixedSpeedEnum(fixedSpeed: number) {
    if (fixedSpeed == 0) {
      return Module.SpecificSpeed.FIXED_SPEED;
    } else {
      return Module.SpecificSpeed.NOT_FIXED_SPEED;
    }
  }

  getLoadEstimationMethod(method: number) {
    if (method == 0) {
      return Module.LoadEstimationMethod.POWER;
    } else {
      return Module.LoadEstimationMethod.CURRENT;
    }
  }

  getBasGensityInputTypeEnum(type: string) {
    if (type == 'relativeHumidity') {
      return Module.BaseGasDensityInputType.RelativeHumidity;
    } else if (type == 'wetBulb') {
      return Module.BaseGasDensityInputType.WetBulbTemp;
    } else if (type == 'dewPoint') {
      return Module.BaseGasDensityInputType.DewPoint;
    } else if (type == 'custom') {
      return;
    }
  }
  getGasTypeEnum(type: string) {
    if (type == 'AIR') {
      return Module.GasType.AIR;
    } else if (type == 'OTHER') {
      return Module.GasType.OTHER;
    }
  }

  getCHPOptionEnum(option: number) {
    if (option === 0) {
      return Module.CHPOption.PercentAvgkWhElectricCostAvoided;
    } else if (option === 1) {
      return Module.CHPOption.StandbyRate;
    }
  }

  getFanTypeEnum(fanType: number) {
    switch (fanType) {
      case 0:
        return Module.FanType.AirfoilSISW;
      case 1:
        return Module.FanType.BackwardCurvedSISW;
      case 2:
        return Module.FanType.RadialSISW;
      case 3:
        return Module.FanType.RadialTipSISW;
      case 4:
        return Module.FanType.BackwardInclinedSISW;
      case 5:
        return Module.FanType.AirfoilDIDW;
      case 6:
        return Module.FanType.BackwardCurvedDIDW;
      case 7:
        return Module.FanType.BackwardInclinedDIDW;
      case 8:
        return Module.FanType.VaneAxial;
    }
  }

  getFlowCalculationGasTypeEnum(gasType: number) {
    switch (gasType) {
      case 0:
        return Module.Gas.AIR;
      case 1:
        return Module.Gas.AMMONIA_DISSOCIATED;
      case 2:
        return Module.Gas.ARGON;
      case 3:
        return Module.Gas.BUTANE;
      case 4:
        return Module.Gas.ENDOTHERMIC_AMMONIA;
      case 5:
        return Module.Gas.EXOTHERMIC_CRACKED_LEAN;
      case 6:
        return Module.Gas.EXOTHERMIC_CRACKED_RICH;
      case 7:
        return Module.Gas.HELIUM;
      case 8:
        return Module.Gas.NATURAL_GAS;
      case 9:
        return Module.Gas.NITROGEN;
      case 10:
        return Module.Gas.OXYGEN;
      case 11:
        return Module.Gas.PROPANE;
      case 12:
        return Module.Gas.OTHER;
    }
  }

  getOpeningShapeEnum(openingShape: number) {
    switch (openingShape) {
      case 0:
        return Module.OpeningShape.CIRCULAR;
      case 1:
        return Module.OpeningShape.SQUARE;
    }
  }

  getFlowCalculationSectionEnum(section: number) {
    switch (section) {
      case 0:
        return Module.Section.SQUARE_EDGE;
      case 1:
        return Module.Section.SHARP_EDGE;
      case 2:
        return Module.Section.VENTURI;
    }
  }

  getMaterialThermicReactionType(thermicReactionType: number) {
    switch (thermicReactionType) {
      case 0:
        return Module.ThermicReactionType.ENDOTHERMIC;
      case 1:
        return Module.ThermicReactionType.EXOTHERMIC;
      case 2:
        return Module.ThermicReactionType.NONE;
    }
  }

  getCoolingTowerFanControlSpeedType(speedType: number) {
    switch (speedType) {
      case 0:
        return Module.FanControlSpeedType.One;
      case 1:
        return Module.FanControlSpeedType.Two;
      case 2:
        return Module.FanControlSpeedType.Variable;

    }
  }

  getCoolingTowerChillerType(chillerType: number) {
    switch (chillerType) {
      case 0:
        return Module.ChillerType.Centrifugal;
      case 1:
        return Module.ChillerType.Screw;

    }
  }

  getCoolingTowerCondenserCoolingType(condenserType: number) {
    switch (condenserType) {
      case 0:
        return Module.CondenserCoolingType.Water;
      case 1:
        return Module.CondenserCoolingType.Air;

    }
  }

  getCoolingTowerCompressorConfigType(configType: number) {
    switch (configType) {
      case 0:
        return Module.CompressorConfigType.NoVFD;
      case 1:
        return Module.CompressorConfigType.VFD;
      case 2:
        return Module.CompressorConfigType.MagneticBearing;
    }
  }

  returnDoubleVector(doublesArray: Array<number>) {
    let doubleVector = new Module.DoubleVector();
    doublesArray.forEach(x => {
      doubleVector.push_back(x);
    });
    return doubleVector;
  }

  convertNullInputsForObjectConstructor(inputObj: Object, inputField?: number | string) {
    for (var prop in inputObj) {
      if (inputObj.hasOwnProperty(prop) && inputObj[prop] === null || inputObj[prop] === undefined) {
        inputObj[prop] = 0;
      }
    }
    return inputObj;
  }

  convertNullInputValueForObjectConstructor(inputValue: number | string): number {
    let validInput: number;
    if (inputValue === null || inputValue === undefined) {
      validInput = 0;
    } else if (typeof inputValue === 'string' && inputValue == '') {
      // There are various number type properties in PHAST that 
      // get set to '' in places that aren't clear
      validInput = 0;
    } else {
      validInput = Number(inputValue);
    }
    return validInput;
  }
  
}
