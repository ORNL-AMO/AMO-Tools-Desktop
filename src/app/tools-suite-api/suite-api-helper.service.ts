import { Injectable } from '@angular/core';
import * as _ from 'lodash';

//wasm module
declare var Module: any;
@Injectable()
export class SuiteApiHelperService {

  constructor() {}
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

  getThermodynamicQuantityType(thermodynamicQuantity: number) {
    switch (thermodynamicQuantity) {
      case 0:
        return Module.ThermodynamicQuantity.TEMPERATURE;
      case 1:
        return Module.ThermodynamicQuantity.ENTHALPY;
      case 2:
        return Module.ThermodynamicQuantity.ENTROPY;
      case 3:
        return Module.ThermodynamicQuantity.QUALITY;
    }
  }

  getCondensingTurbineOperation(option: number) {
    switch (option) {
      case 0:
        return Module.CondensingTurbineOperation.STEAM_FLOW;
      case 1:
        return Module.CondensingTurbineOperation.POWER_GENERATION;

    }
  }

  getPressureTurbineOperation(option: number) {
    switch (option) {
      case 0:
        return Module.PressureTurbineOperation.STEAM_FLOW;
      case 1:
        return Module.PressureTurbineOperation.POWER_GENERATION;
      case 2:
        return Module.PressureTurbineOperation.BALANCE_HEADER;
      case 3:
        return Module.PressureTurbineOperation.POWER_RANGE;
      case 4:
        return Module.PressureTurbineOperation.FLOW_RANGE;
    }
  }

  getTurbineProperty(turbineProperty: number) {
    switch (turbineProperty) {
      case 0:
        return Module.TurbineProperty.MassFlow;
      case 1:
        return Module.TurbineProperty.PowerOut;
    }
  }

  getSolveForMethod(solve: number) {
    switch (solve) {
      case 0:
        return Module.Solve.OutletProperties;
      case 1:
        return Module.Solve.IsentropicEfficiency;
    }
  }


  getCompressorTypeEnum(compressorType: number) {
    switch (compressorType) {
      case 0:
        return Module.CompressorType.Centrifugal;
      case 1:
        return Module.CompressorType.Screw;
      case 2:
        return Module.CompressorType.Reciprocating;
    }
  }

  getControlTypeEnum(controlType: number) {
    switch (controlType) {
      case 0:
        return Module.ControlType.LoadUnload;
      case 1:
        return Module.ControlType.ModulationUnload;
      case 2:
        return Module.ControlType.BlowOff;
      case 3:
        return Module.ControlType.ModulationWOUnload;
      case 4:
        return Module.ControlType.StartStop;
      case 5:
        return Module.ControlType.VariableDisplacementUnload;
      case 6:
        return Module.ControlType.MultiStepUnloading;
      case 7:
        return Module.ControlType.VFD;
    }
  }

  getLubricantEnum(lubricant: number) {
    switch (lubricant) {
      case 0:
        return Module.Lubricant.Injected;
      case 1:
        return Module.Lubricant.Free;
      case 2:
        return Module.Lubricant.None;
    }
  }

  getStageEnum(stage: number) {
    switch (stage) {
      case 0:
        return Module.Stage.Single;
      case 1:
        return Module.Stage.Two;
      case 2:
        return Module.Stage.Multiple;
    }
  }

  getComputeFromEnum(computeFrom: number) {
    switch (computeFrom) {
      case 0:
        return Module.ComputeFrom.PercentagePower;
      case 1:
        return Module.ComputeFrom.PercentageCapacity;
      case 2:
        return Module.ComputeFrom.PowerMeasured;
      case 3:
        return Module.ComputeFrom.CapacityMeasured;
      case 4:
        return Module.ComputeFrom.PowerFactor;
    }
  }


  returnDoubleVector(doublesArray: Array<number>) {
    let doubleVector = new Module.DoubleVector();
    doublesArray.forEach(x => {
      doubleVector.push_back(x);
    });
    return doubleVector;
  }

  returnIntVector(intsArray: Array<number>) {
    let intVector = new Module.IntVector();
    intsArray.forEach(x => {
      intVector.push_back(x);
    });
    return intVector;
  }


  returnDoubleVector2d(doubles2dArray: Array<Array<number>>) {
    let doubleVector2d = new Module.DoubleVector2D();
    let doubleVectors: Array<any> = [];
    for (let i = 0; i < doubles2dArray.length; i++) {
      let innerArray = doubles2dArray[i];
      let doubleVector = this.returnDoubleVector(innerArray);
      doubleVector2d.push_back(doubleVector);
      doubleVectors.push(doubleVector);
    }
    doubleVectors.forEach(vector => vector.delete());
    return doubleVector2d;
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
        return Module.SteamConditionType.Superheated;
      case 1:
        return Module.SteamConditionType.Saturated;
    }
  }

  getPowerFactorModeEnum(mode: number): any {
    switch (mode) {
      case 1:
        return Module.PowerFactorModeType.ApparentPower_RealPower;
      case 2:
        return Module.PowerFactorModeType.ApparentPower_ReactivePower;
      case 3:
        return Module.PowerFactorModeType.ApparentPower_PhaseAngle;
      case 4:
        return Module.PowerFactorModeType.ApparentPower_PowerFactor;
      case 5:
        return Module.PowerFactorModeType.RealPower_ReactivePower;
      case 6:
        return Module.PowerFactorModeType.RealPower_PhaseAngle;
      case 7:
        return Module.PowerFactorModeType.RealPower_PowerFactor;
      case 8:
        return Module.PowerFactorModeType.ReactivePower_PhaseAngle;
      case 9:
        return Module.PowerFactorModeType.ReactivePower_PowerFactor;
    }
  }

  getProcessCoolingFanTypeEnum(fanType: number | string) {
    if (fanType === 0 || fanType === 'AxialFan') return Module.CellFanType.AxialFan;
    if (fanType === 1 || fanType === 'CentrifugalFan') return Module.CellFanType.CentrifugalFan;
  }

  getProcessCoolingRefrigerantTypeEnum(type: number | string) {
    switch (type) {
      case 0:
      case 'R_11': return Module.RefrigerantType.R_11;
      case 1:
      case 'R_123': return Module.RefrigerantType.R_123;
      case 2:
      case 'R_12': return Module.RefrigerantType.R_12;
      case 3:
      case 'R_134a': return Module.RefrigerantType.R_134a;
      case 4:
      case 'R_22': return Module.RefrigerantType.R_22;
      case 5:
      case 'R_717': return Module.RefrigerantType.R_717;
    }
  }

  getProcessCoolingCoolingAirSourceEnum(loc: number | string) {
    if (loc === 0 || loc === 'Inside') return Module.ACSourceLocation.Inside;
    if (loc === 1 || loc === 'Outside') return Module.ACSourceLocation.Outside;
  }

  getProcessCoolingCoolingSystemTypeEnum(type: number | string) {
    if (type === 0 || type === 'Water') return Module.CoolingSystemType.Water;
    if (type === 1 || type === 'Air') return Module.CoolingSystemType.Air;
  }

  getProcessCoolingTowerSizedByEnum(val: number | string) {
    if (val === 0 || val === 'Tonnage') return Module.TowerSizedBy.Tonnage;
    if (val === 1 || val === 'Fan_HP') return Module.TowerSizedBy.Fan_HP;
  }

  
  /**
   * Returns the corresponding `ChillerCompressorType` enum value from the provided type.
   *
   * @param type - The compressor type, either as a numeric code or a string label.
   *   - `0` or `'Centrifugal'` returns `ChillerCompressorType.Centrifugal`
   *   - `1` or `'Screw'` returns `ChillerCompressorType.Screw`
   *   - `2` or `'Reciprocating'` returns `ChillerCompressorType.Reciprocating`
   *
   * @remarks
   * In the CWSAT, the value `1` represents the "RECIPROCATING" compressor type.
   * In the suite API, RECIPROCATING is value `2`. Use "Screw" or `1` for HELICAL ROTARY
   * until the suite API is updated to reflect this distinction.
   */
  getProcessCoolingChillerCompressorTypeEnum(type: number | string) {
    if (type === 0 || type === 'Centrifugal') return Module.ChillerCompressorType.Centrifugal;
    // This is actually HELICAL ROTARY in the old app but is referenced as 'Screw' in the suite
    if (type === 1 || type === 'Screw') return Module.ChillerCompressorType.Screw;
    if (type === 2 || type === 'Reciprocating') return Module.ChillerCompressorType.Reciprocating;
  }

  getProcessCoolingFanMotorSpeedTypeEnum(type: number | string) {
    if (type === 0 || type === 'One') return Module.FanMotorSpeedType.One;
    if (type === 1 || type === 'Two') return Module.FanMotorSpeedType.Two;
    if (type === 2 || type === 'Variable') return Module.FanMotorSpeedType.Variable;
  }




}
