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

}
