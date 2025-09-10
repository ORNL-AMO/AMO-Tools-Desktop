import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ToolsSuiteApiService } from './tools-suite-api.service';

@Injectable()
export class SuiteApiHelperService {

  constructor(private toolsSuiteApiService: ToolsSuiteApiService) {}
  getPumpStyleEnum(pumpStyle: number): any {
    switch (pumpStyle) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.PumpStyle.END_SUCTION_SLURRY;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.PumpStyle.END_SUCTION_SEWAGE;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.PumpStyle.END_SUCTION_STOCK;
      case 3:
        return this.toolsSuiteApiService.ToolsSuiteModule.PumpStyle.END_SUCTION_SUBMERSIBLE_SEWAGE;
      case 4:
        return this.toolsSuiteApiService.ToolsSuiteModule.PumpStyle.API_DOUBLE_SUCTION;
      case 5:
        return this.toolsSuiteApiService.ToolsSuiteModule.PumpStyle.MULTISTAGE_BOILER_FEED;
      case 6:
        return this.toolsSuiteApiService.ToolsSuiteModule.PumpStyle.END_SUCTION_ANSI_API;
      case 7:
        return this.toolsSuiteApiService.ToolsSuiteModule.PumpStyle.AXIAL_FLOW;
      case 8:
        return this.toolsSuiteApiService.ToolsSuiteModule.PumpStyle.DOUBLE_SUCTION;
      case 9:
        return this.toolsSuiteApiService.ToolsSuiteModule.PumpStyle.VERTICAL_TURBINE;
      case 10:
        return this.toolsSuiteApiService.ToolsSuiteModule.PumpStyle.LARGE_END_SUCTION;
      case 11:
        return this.toolsSuiteApiService.ToolsSuiteModule.PumpStyle.SPECIFIED_OPTIMAL_EFFICIENCY;
    }
  }

  getPistonTypeEnum(pistonType: number): any {
    switch (pistonType) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.PistonType.SingleActing;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.PistonType.DoubleActing;
    }
  }

  getLineFrequencyEnum(lineFreq: number) {
    let lineFrequency = this.toolsSuiteApiService.ToolsSuiteModule.LineFrequency.FREQ50;
    if (lineFreq == 60) {
      lineFrequency = this.toolsSuiteApiService.ToolsSuiteModule.LineFrequency.FREQ60;
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
        return this.toolsSuiteApiService.ToolsSuiteModule.MotorEfficiencyClass.STANDARD;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.MotorEfficiencyClass.ENERGY_EFFICIENT;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.MotorEfficiencyClass.PREMIUM;
      case 3:
        return this.toolsSuiteApiService.ToolsSuiteModule.MotorEfficiencyClass.SPECIFIED;
    }
  }

  getDriveEnum(drive: number) {
    switch (drive) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.Drive.DIRECT_DRIVE;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.Drive.V_BELT_DRIVE;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.Drive.N_V_BELT_DRIVE;
      case 3:
        return this.toolsSuiteApiService.ToolsSuiteModule.Drive.S_BELT_DRIVE;
      case 4:
        return this.toolsSuiteApiService.ToolsSuiteModule.Drive.SPECIFIED;
    }
  }

  getFixedSpeedEnum(fixedSpeed: number) {
    if (fixedSpeed == 0) {
      return this.toolsSuiteApiService.ToolsSuiteModule.SpecificSpeed.FIXED_SPEED;
    } else {
      return this.toolsSuiteApiService.ToolsSuiteModule.SpecificSpeed.NOT_FIXED_SPEED;
    }
  }

  getLoadEstimationMethod(method: number) {
    if (method == 0) {
      return this.toolsSuiteApiService.ToolsSuiteModule.LoadEstimationMethod.POWER;
    } else {
      return this.toolsSuiteApiService.ToolsSuiteModule.LoadEstimationMethod.CURRENT;
    }
  }

  getBasGensityInputTypeEnum(type: string) {
    if (type == 'relativeHumidity') {
      return this.toolsSuiteApiService.ToolsSuiteModule.BaseGasDensityInputType.RelativeHumidity;
    } else if (type == 'wetBulb') {
      return this.toolsSuiteApiService.ToolsSuiteModule.BaseGasDensityInputType.WetBulbTemp;
    } else if (type == 'dewPoint') {
      return this.toolsSuiteApiService.ToolsSuiteModule.BaseGasDensityInputType.DewPoint;
    } else if (type == 'custom') {
      return;
    }
  }
  getGasTypeEnum(type: string) {
    if (type == 'AIR') {
      return this.toolsSuiteApiService.ToolsSuiteModule.GasType.AIR;
    } else if (type == 'OTHER') {
      return this.toolsSuiteApiService.ToolsSuiteModule.GasType.OTHER;
    }
  }

  getCHPOptionEnum(option: number) {
    if (option === 0) {
      return this.toolsSuiteApiService.ToolsSuiteModule.CHPOption.PercentAvgkWhElectricCostAvoided;
    } else if (option === 1) {
      return this.toolsSuiteApiService.ToolsSuiteModule.CHPOption.StandbyRate;
    }
  }

  getFanTypeEnum(fanType: number) {
    switch (fanType) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.FanType.AirfoilSISW;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.FanType.BackwardCurvedSISW;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.FanType.RadialSISW;
      case 3:
        return this.toolsSuiteApiService.ToolsSuiteModule.FanType.RadialTipSISW;
      case 4:
        return this.toolsSuiteApiService.ToolsSuiteModule.FanType.BackwardInclinedSISW;
      case 5:
        return this.toolsSuiteApiService.ToolsSuiteModule.FanType.AirfoilDIDW;
      case 6:
        return this.toolsSuiteApiService.ToolsSuiteModule.FanType.BackwardCurvedDIDW;
      case 7:
        return this.toolsSuiteApiService.ToolsSuiteModule.FanType.BackwardInclinedDIDW;
      case 8:
        return this.toolsSuiteApiService.ToolsSuiteModule.FanType.VaneAxial;
    }
  }

  getFlowCalculationGasTypeEnum(gasType: number) {
    switch (gasType) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.Gas.AIR;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.Gas.AMMONIA_DISSOCIATED;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.Gas.ARGON;
      case 3:
        return this.toolsSuiteApiService.ToolsSuiteModule.Gas.BUTANE;
      case 4:
        return this.toolsSuiteApiService.ToolsSuiteModule.Gas.ENDOTHERMIC_AMMONIA;
      case 5:
        return this.toolsSuiteApiService.ToolsSuiteModule.Gas.EXOTHERMIC_CRACKED_LEAN;
      case 6:
        return this.toolsSuiteApiService.ToolsSuiteModule.Gas.EXOTHERMIC_CRACKED_RICH;
      case 7:
        return this.toolsSuiteApiService.ToolsSuiteModule.Gas.HELIUM;
      case 8:
        return this.toolsSuiteApiService.ToolsSuiteModule.Gas.NATURAL_GAS;
      case 9:
        return this.toolsSuiteApiService.ToolsSuiteModule.Gas.NITROGEN;
      case 10:
        return this.toolsSuiteApiService.ToolsSuiteModule.Gas.OXYGEN;
      case 11:
        return this.toolsSuiteApiService.ToolsSuiteModule.Gas.PROPANE;
      case 12:
        return this.toolsSuiteApiService.ToolsSuiteModule.Gas.OTHER;
    }
  }

  getOpeningShapeEnum(openingShape: number) {
    switch (openingShape) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.OpeningShape.CIRCULAR;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.OpeningShape.SQUARE;
    }
  }

  getFlowCalculationSectionEnum(section: number) {
    switch (section) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.Section.SQUARE_EDGE;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.Section.SHARP_EDGE;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.Section.VENTURI;
    }
  }

  getMaterialThermicReactionType(thermicReactionType: number) {
    switch (thermicReactionType) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.ThermicReactionType.ENDOTHERMIC;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.ThermicReactionType.EXOTHERMIC;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.ThermicReactionType.NONE;
    }
  }

  getCoolingTowerFanControlSpeedType(speedType: number) {
    switch (speedType) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.FanControlSpeedType.One;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.FanControlSpeedType.Two;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.FanControlSpeedType.Variable;

    }
  }

  getCoolingTowerChillerType(chillerType: number) {
    switch (chillerType) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.ChillerType.Centrifugal;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.ChillerType.Screw;

    }
  }

  getCoolingTowerCondenserCoolingType(condenserType: number) {
    switch (condenserType) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.CondenserCoolingType.Water;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.CondenserCoolingType.Air;

    }
  }

  getCoolingTowerCompressorConfigType(configType: number) {
    switch (configType) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.CompressorConfigType.NoVFD;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.CompressorConfigType.VFD;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.CompressorConfigType.MagneticBearing;
    }
  }

  getThermodynamicQuantityType(thermodynamicQuantity: number) {
    switch (thermodynamicQuantity) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.ThermodynamicQuantity.TEMPERATURE;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.ThermodynamicQuantity.ENTHALPY;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.ThermodynamicQuantity.ENTROPY;
      case 3:
        return this.toolsSuiteApiService.ToolsSuiteModule.ThermodynamicQuantity.QUALITY;
    }
  }

  getCondensingTurbineOperation(option: number) {
    switch (option) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.CondensingTurbineOperation.STEAM_FLOW;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.CondensingTurbineOperation.POWER_GENERATION;

    }
  }

  getPressureTurbineOperation(option: number) {
    switch (option) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.PressureTurbineOperation.STEAM_FLOW;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.PressureTurbineOperation.POWER_GENERATION;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.PressureTurbineOperation.BALANCE_HEADER;
      case 3:
        return this.toolsSuiteApiService.ToolsSuiteModule.PressureTurbineOperation.POWER_RANGE;
      case 4:
        return this.toolsSuiteApiService.ToolsSuiteModule.PressureTurbineOperation.FLOW_RANGE;
    }
  }

  getTurbineProperty(turbineProperty: number) {
    switch (turbineProperty) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.TurbineProperty.MassFlow;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.TurbineProperty.PowerOut;
    }
  }

  getSolveForMethod(solve: number) {
    switch (solve) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.Solve.OutletProperties;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.Solve.IsentropicEfficiency;
    }
  }


  getCompressorTypeEnum(compressorType: number) {
    switch (compressorType) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.CompressorType.Centrifugal;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.CompressorType.Screw;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.CompressorType.Reciprocating;
    }
  }

  getControlTypeEnum(controlType: number) {
    switch (controlType) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.ControlType.LoadUnload;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.ControlType.ModulationUnload;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.ControlType.BlowOff;
      case 3:
        return this.toolsSuiteApiService.ToolsSuiteModule.ControlType.ModulationWOUnload;
      case 4:
        return this.toolsSuiteApiService.ToolsSuiteModule.ControlType.StartStop;
      case 5:
        return this.toolsSuiteApiService.ToolsSuiteModule.ControlType.VariableDisplacementUnload;
      case 6:
        return this.toolsSuiteApiService.ToolsSuiteModule.ControlType.MultiStepUnloading;
      case 7:
        return this.toolsSuiteApiService.ToolsSuiteModule.ControlType.VFD;
    }
  }

  getLubricantEnum(lubricant: number) {
    switch (lubricant) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.Lubricant.Injected;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.Lubricant.Free;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.Lubricant.None;
    }
  }

  getStageEnum(stage: number) {
    switch (stage) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.Stage.Single;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.Stage.Two;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.Stage.Multiple;
    }
  }

  getComputeFromEnum(computeFrom: number) {
    switch (computeFrom) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PercentagePower;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PercentageCapacity;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PowerMeasured;
      case 3:
        return this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.CapacityMeasured;
      case 4:
        return this.toolsSuiteApiService.ToolsSuiteModule.ComputeFrom.PowerFactor;
    }
  }


  returnDoubleVector(doublesArray: Array<number>) {
    let doubleVector = new this.toolsSuiteApiService.ToolsSuiteModule.DoubleVector();
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

  getSteamCondition(steamCondition: number) {
    switch (steamCondition) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.SteamConditionType.Superheated;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.SteamConditionType.Saturated;
    }
  }

  getPowerFactorModeEnum(mode: number): any {
    switch (mode) {
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.PowerFactorModeType.ApparentPower_RealPower;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.PowerFactorModeType.ApparentPower_ReactivePower;
      case 3:
        return this.toolsSuiteApiService.ToolsSuiteModule.PowerFactorModeType.ApparentPower_PhaseAngle;
      case 4:
        return this.toolsSuiteApiService.ToolsSuiteModule.PowerFactorModeType.ApparentPower_PowerFactor;
      case 5:
        return this.toolsSuiteApiService.ToolsSuiteModule.PowerFactorModeType.RealPower_ReactivePower;
      case 6:
        return this.toolsSuiteApiService.ToolsSuiteModule.PowerFactorModeType.RealPower_PhaseAngle;
      case 7:
        return this.toolsSuiteApiService.ToolsSuiteModule.PowerFactorModeType.RealPower_PowerFactor;
      case 8:
        return this.toolsSuiteApiService.ToolsSuiteModule.PowerFactorModeType.ReactivePower_PhaseAngle;
      case 9:
        return this.toolsSuiteApiService.ToolsSuiteModule.PowerFactorModeType.ReactivePower_PowerFactor;
    }
  }

}
