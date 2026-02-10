// (TowerForm and methods moved into class below)
import { Injectable } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Operations, PumpInput, AirCooledSystemInput, WaterCooledSystemInput, TowerInput, CondenserCoolingMethod, SystemInformation, TowerType, AirCoolingSource, TowerSizeMetric } from '../../shared/models/process-cooling-assessment';
import { PROCESS_COOLING_VALIDATION } from '../constants/process-cooling-validation-rules';
import { ConvertValue } from '../../shared/convert-units/ConvertValue';
import { Settings } from '../../shared/models/settings';
import { PROCESS_COOLING_UNITS } from '../constants/units';


@Injectable()
export class SystemInformationFormService {

  constructor(private formBuilder: FormBuilder) { }

  getOperationsForm(operations: Operations, settings: Settings): FormGroup<OperationsForm> {
    let chilledWaterSupplyTempMin: number;
    let chilledWaterSupplyTempMax: number;
    if (settings.unitsOfMeasure === 'Metric') {
      chilledWaterSupplyTempMin = new ConvertValue(
        PROCESS_COOLING_VALIDATION.chilledWaterSupplyTemp.min,
        PROCESS_COOLING_UNITS.temperature.imperial,
        PROCESS_COOLING_UNITS.temperature.metric
      ).convertedValue;
      chilledWaterSupplyTempMax = new ConvertValue(
        PROCESS_COOLING_VALIDATION.chilledWaterSupplyTemp.max,
        PROCESS_COOLING_UNITS.temperature.imperial,
        PROCESS_COOLING_UNITS.temperature.metric
      ).convertedValue;
    }

    return this.formBuilder.group({
      annualOperatingHours: [operations.annualOperatingHours, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.annualOperatingHours.min),
        Validators.max(PROCESS_COOLING_VALIDATION.annualOperatingHours.max)
      ]],
      fuelCost: [operations.fuelCost, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.fuelCost.min)
      ]],
      electricityCost: [operations.electricityCost, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.electricityCost.min)
      ]],
      chilledWaterSupplyTemp: [operations.chilledWaterSupplyTemp, [
        Validators.required,
        Validators.min(chilledWaterSupplyTempMin),
        Validators.max(chilledWaterSupplyTempMax)
      ]],
      condenserCoolingMethod: [operations.condenserCoolingMethod],
      doChillerLoadSchedulesVary: [operations.doChillerLoadSchedulesVary],
    });
  }

  // * spread all current values of operations and then apply the new values from the form, 
  // * since it is only a partial object
  getOperations(formValue: Partial<Operations>, currentOperations: Operations): Operations {
    return {
      ...currentOperations,
      ...formValue,
    };
  }

  getPumpInputForm(pumpInput: PumpInput, settings: Settings): FormGroup<PumpInputForm> {
    let flowRateMin = PROCESS_COOLING_VALIDATION.flowRate.min;
    let flowRateMax = PROCESS_COOLING_VALIDATION.flowRate.max;
    if (settings.unitsOfMeasure === 'Metric') {
      flowRateMin = new ConvertValue(
        PROCESS_COOLING_VALIDATION.flowRate.min,
        PROCESS_COOLING_UNITS.volumeFlowRate.imperial,
        PROCESS_COOLING_UNITS.volumeFlowRate.metric
      ).convertedValue;
      flowRateMax = new ConvertValue(
        PROCESS_COOLING_VALIDATION.flowRate.max,
        PROCESS_COOLING_UNITS.volumeFlowRate.imperial,
        PROCESS_COOLING_UNITS.volumeFlowRate.metric
      ).convertedValue;
    }
    return this.formBuilder.group({
      variableFlow: [pumpInput.variableFlow, [
        Validators.required
      ]],
      flowRate: [pumpInput.flowRate, [
        Validators.required,
        Validators.min(flowRateMin),
        Validators.max(flowRateMax)
      ]],
      efficiency: [pumpInput.efficiency, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.efficiency.min),
        Validators.max(PROCESS_COOLING_VALIDATION.efficiency.max)
      ]],
      motorSize: [pumpInput.motorSize, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.motorSize.min),
        Validators.max(PROCESS_COOLING_VALIDATION.motorSize.max)
      ]],
      motorEfficiency: [pumpInput.motorEfficiency, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.motorEfficiency.min),
        Validators.max(PROCESS_COOLING_VALIDATION.motorEfficiency.max)
      ]],
    });
  }

  getPumpInput(formValue: Partial<PumpInput>, currentPumpInput: PumpInput): PumpInput {
    return {
      ...currentPumpInput,
      ...formValue,
    };
  }

  getAirCooledSystemInputForm(input: AirCooledSystemInput, settings: Settings): FormGroup<AirCooledSystemInputForm> {
    let indoorTempMin = PROCESS_COOLING_VALIDATION.indoorTemp.min;
    let indoorTempMax = PROCESS_COOLING_VALIDATION.indoorTemp.max;
    let outdoorAirTempMin = PROCESS_COOLING_VALIDATION.outdoorAirTemp.min;
    let outdoorAirTempMax = PROCESS_COOLING_VALIDATION.outdoorAirTemp.max;
    let tempDiffMin = PROCESS_COOLING_VALIDATION.followingTempDifferential.min;
    let tempDiffMax = PROCESS_COOLING_VALIDATION.followingTempDifferential.max;
    if (settings.unitsOfMeasure === 'Metric') {
      indoorTempMin = new ConvertValue(
        PROCESS_COOLING_VALIDATION.indoorTemp.min,
        PROCESS_COOLING_UNITS.temperature.imperial,
        PROCESS_COOLING_UNITS.temperature.metric
      ).convertedValue;
      indoorTempMax = new ConvertValue(
        PROCESS_COOLING_VALIDATION.indoorTemp.max,
        PROCESS_COOLING_UNITS.temperature.imperial,
        PROCESS_COOLING_UNITS.temperature.metric
      ).convertedValue;
      outdoorAirTempMin = new ConvertValue(
        PROCESS_COOLING_VALIDATION.outdoorAirTemp.min,
        PROCESS_COOLING_UNITS.temperature.imperial,
        PROCESS_COOLING_UNITS.temperature.metric
      ).convertedValue;
      outdoorAirTempMax = new ConvertValue(
        PROCESS_COOLING_VALIDATION.outdoorAirTemp.max,
        PROCESS_COOLING_UNITS.temperature.imperial,
        PROCESS_COOLING_UNITS.temperature.metric
      ).convertedValue;
      tempDiffMin = new ConvertValue(
        PROCESS_COOLING_VALIDATION.followingTempDifferential.min,
        PROCESS_COOLING_UNITS.temperature.imperial,
        PROCESS_COOLING_UNITS.temperature.metric
      ).convertedValue;
      tempDiffMax = new ConvertValue(
        PROCESS_COOLING_VALIDATION.followingTempDifferential.max,
        PROCESS_COOLING_UNITS.temperature.imperial,
        PROCESS_COOLING_UNITS.temperature.metric
      ).convertedValue;
    }
    let indoorTempValidators = [];
    let tempDifferentialValidators = [];
    if (input.airCoolingSource === AirCoolingSource.Indoor) {
      indoorTempValidators = [
        Validators.required,
        Validators.min(indoorTempMin),
        Validators.max(indoorTempMax)
      ];
    }
    if (input.airCoolingSource === AirCoolingSource.Outdoor) {
      tempDifferentialValidators = [
        Validators.required,
        Validators.min(tempDiffMin),
        Validators.max(tempDiffMax)
      ];
    }
    return this.formBuilder.group({
      outdoorAirTemp: [input.outdoorAirTemp, [
        Validators.required,
        Validators.min(outdoorAirTempMin),
        Validators.max(outdoorAirTempMax)
      ]],
      airCoolingSource: [input.airCoolingSource, [
        Validators.required
      ]],
      indoorTemp: [input.indoorTemp, indoorTempValidators],
      followingTempDifferential: [input.followingTempDifferential, tempDifferentialValidators],
    });
  }

  getAirCooledSystemInput(formValue: Partial<AirCooledSystemInput>, currentInput: AirCooledSystemInput): AirCooledSystemInput {
    return {
      ...currentInput,
      ...formValue,
    };
  }

  getWaterCooledSystemInputForm(input: WaterCooledSystemInput, settings: Settings): FormGroup<WaterCooledSystemInputForm> {
    let condenserWaterTempMin = PROCESS_COOLING_VALIDATION.condenserWaterTemp.min;
    let condenserWaterTempMax = PROCESS_COOLING_VALIDATION.condenserWaterTemp.max;
    let tempDiffMin = PROCESS_COOLING_VALIDATION.followingTempDifferential.min;
    let tempDiffMax = PROCESS_COOLING_VALIDATION.followingTempDifferential.max;
    if (settings.unitsOfMeasure === 'Metric') {
      condenserWaterTempMin = new ConvertValue(
        PROCESS_COOLING_VALIDATION.condenserWaterTemp.min,
        PROCESS_COOLING_UNITS.temperature.imperial,
        PROCESS_COOLING_UNITS.temperature.metric
      ).convertedValue;
      condenserWaterTempMax = new ConvertValue(
        PROCESS_COOLING_VALIDATION.condenserWaterTemp.max,
        PROCESS_COOLING_UNITS.temperature.imperial,
        PROCESS_COOLING_UNITS.temperature.metric
      ).convertedValue;
      tempDiffMin = new ConvertValue(
        PROCESS_COOLING_VALIDATION.followingTempDifferential.min,
        PROCESS_COOLING_UNITS.temperature.imperial,
        PROCESS_COOLING_UNITS.temperature.metric
      ).convertedValue;
      tempDiffMax = new ConvertValue(
        PROCESS_COOLING_VALIDATION.followingTempDifferential.max,
        PROCESS_COOLING_UNITS.temperature.imperial,
        PROCESS_COOLING_UNITS.temperature.metric
      ).convertedValue;
    }
    return this.formBuilder.group({
      isConstantCondenserWaterTemp: [input.isConstantCondenserWaterTemp, [
        Validators.required
      ]],
      condenserWaterTemp: [input.condenserWaterTemp, input.isConstantCondenserWaterTemp ? [
        Validators.required,
        Validators.min(condenserWaterTempMin),
        Validators.max(condenserWaterTempMax)
      ] : []],
      followingTempDifferential: [input.followingTempDifferential, !input.isConstantCondenserWaterTemp ? [
        Validators.required,
        Validators.min(tempDiffMin),
        Validators.max(tempDiffMax)
      ] : []],
    });
  }

  getWaterCooledSystemInput(formValue: Partial<WaterCooledSystemInput>, currentInput: WaterCooledSystemInput): WaterCooledSystemInput {
    return {
      ...currentInput,
      ...formValue,
    };
  }

  public getTowerForm(input: TowerInput, settings: Settings): FormGroup<TowerForm> {
    let hexApproachTempMin = PROCESS_COOLING_VALIDATION.HEXApproachTemp.min;
    let hexApproachTempMax = PROCESS_COOLING_VALIDATION.HEXApproachTemp.max;
    if (settings.unitsOfMeasure === 'Metric') {
      hexApproachTempMin = new ConvertValue(
        PROCESS_COOLING_VALIDATION.HEXApproachTemp.min,
        PROCESS_COOLING_UNITS.temperature.imperial,
        PROCESS_COOLING_UNITS.temperature.metric
      ).convertedValue;
      hexApproachTempMax = new ConvertValue(
        PROCESS_COOLING_VALIDATION.HEXApproachTemp.max,
        PROCESS_COOLING_UNITS.temperature.imperial,
        PROCESS_COOLING_UNITS.temperature.metric
      ).convertedValue;
    }
    let hexApproachTempValidators = [];
    if (input.isHEXRequired) {
      hexApproachTempValidators = [
        Validators.required,
        Validators.min(hexApproachTempMin),
        Validators.max(hexApproachTempMax)
      ];
    }
    let towerSizeValidators = this.getTowerSizeValidators(input.towerSizeMetric);
    return this.formBuilder.group({
      usesFreeCooling: [input.usesFreeCooling, [
        Validators.required
      ]],
      isHEXRequired: [input.isHEXRequired],
      HEXApproachTemp: [input.HEXApproachTemp, hexApproachTempValidators],
      numberOfTowers: [input.numberOfTowers, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.numberOfTowers.min),
        Validators.max(PROCESS_COOLING_VALIDATION.numberOfTowers.max)
      ]],
      towerType: [input.towerType],
      numberOfFans: [input.numberOfFans, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.numberOfFans.min),
        Validators.max(PROCESS_COOLING_VALIDATION.numberOfFans.max)
      ]],
      fanSpeedType: [input.fanSpeedType],
      towerSizeMetric: [input.towerSizeMetric],
      fanType: [input.fanType],
      towerSize: [input.towerSize, towerSizeValidators],
    });
  }

  getTowerSizeValidators(towerSizeMetric: number): any[] {
    let validators = [];
    if (towerSizeMetric === TowerSizeMetric.Tons) {
      validators = [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.towerSizeTons.min),
        Validators.max(PROCESS_COOLING_VALIDATION.towerSizeTons.max)
      ];
    } else if (towerSizeMetric === TowerSizeMetric.HP) {
      validators = [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.towerSizeHP.min),
        Validators.max(PROCESS_COOLING_VALIDATION.towerSizeHP.max)
      ];
    }
    return validators;
  }

  public getTowerInput(formValue: Partial<TowerInput>, currentInput: TowerInput): TowerInput {
    return {
      ...currentInput,
      ...formValue,
    };
  }

   public getTowerTypeDependentValues(towerType: number): { numberOfFans: number; fanSpeedType: number; } {
      let dependentValues: { numberOfFans: number; fanSpeedType: number; } = { numberOfFans: 1, fanSpeedType: 1 };
      switch(towerType) {
        case TowerType.OneCellOneSpeed:
          dependentValues = { numberOfFans: 1, fanSpeedType: 1 };
          break;
        case TowerType.OneCellTwoSpeed:
          dependentValues = { numberOfFans: 1, fanSpeedType: 2 };
          break;
        case TowerType.TwoCellOneSpeed:
          dependentValues = { numberOfFans: 2, fanSpeedType: 1 };
          break;
        case TowerType.TwoCellTwoSpeed:
          dependentValues = { numberOfFans: 2, fanSpeedType: 2 };
          break;
        case TowerType.ThreeCellOneSpeed:
          dependentValues = { numberOfFans: 3, fanSpeedType: 1 };
          break;
        case TowerType.ThreeCellTwoSpeed:
          dependentValues = { numberOfFans: 3, fanSpeedType: 2 };
          break;
        case TowerType.VariableSpeed:
          //  todo 7641 unknown sideeffects
          break;
        default:
          dependentValues = { numberOfFans: 0, fanSpeedType: 0 };
      }
      return dependentValues;
    }

  public isSystemInformationValid(systemInformationInput: SystemInformation, settings: Settings): boolean {
    const isOperationsValid = this.isOperationsValid(systemInformationInput.operations, settings);
    const isPumpValid = this.isPumpValid(systemInformationInput, settings);
    const isCondenserValid = this.isCondenserSystemInputValid(systemInformationInput, settings);
    const isTowerValid = this.isTowerValid(systemInformationInput.towerInput, settings);
    const isValid: boolean = isOperationsValid && isPumpValid && isCondenserValid && isTowerValid;
    return isValid;
  }
  
  public isPumpValid(systemInformation: SystemInformation, settings: Settings): boolean {
    // todo are we sure this will always be condenserWaterPumpInput
    const pumpForm = this.getPumpInputForm(systemInformation.condenserWaterPumpInput, settings);
    return pumpForm.valid;
  }

  public isOperationsValid(operations: Operations, settings: Settings): boolean {
    const operationsForm = this.getOperationsForm(operations, settings);
    return operationsForm.valid;
  }

  public isTowerValid(towerInput: TowerInput, settings: Settings): boolean {
    const towerForm = this.getTowerForm(towerInput, settings);
    return towerForm.valid;
  }

  public isCondenserSystemInputValid(systemInformationInput: SystemInformation, settings: Settings): boolean {
    let systemInputForm: FormGroup<any>;
    if (systemInformationInput.operations.condenserCoolingMethod === CondenserCoolingMethod.Water) {
      systemInputForm = this.getWaterCooledSystemInputForm(systemInformationInput.waterCooledSystemInput, settings);
    } else {
      systemInputForm = this.getAirCooledSystemInputForm(systemInformationInput.airCooledSystemInput, settings);
    }
    return systemInputForm.valid;
  }
}

export interface TowerForm {
  usesFreeCooling: FormControl<boolean>;
  isHEXRequired: FormControl<boolean>;
  HEXApproachTemp: FormControl<number>;
  numberOfTowers: FormControl<number>;
  towerType: FormControl<number | null>;
  numberOfFans: FormControl<number>;
  fanSpeedType: FormControl<number>;
  towerSizeMetric: FormControl<number>;
  fanType: FormControl<number>;
  towerSize: FormControl<number>;
}


export interface OperationsForm {
  annualOperatingHours: FormControl<number>;
  fuelCost: FormControl<number>;
  electricityCost: FormControl<number>;
  chilledWaterSupplyTemp: FormControl<number>;
  condenserCoolingMethod: FormControl<number>;
  doChillerLoadSchedulesVary: FormControl<boolean>;
}

export interface PumpInputForm {
  variableFlow: FormControl<boolean>;
  flowRate: FormControl<number>;
  efficiency: FormControl<number>;
  motorSize: FormControl<number>;
  motorEfficiency: FormControl<number>;
}

export interface AirCooledSystemInputForm {
  outdoorAirTemp: FormControl<number>;
  airCoolingSource: FormControl<number>;
  indoorTemp: FormControl<number>;
  followingTempDifferential: FormControl<number>;
}

export interface WaterCooledSystemInputForm {
  isConstantCondenserWaterTemp: FormControl<boolean>;
  condenserWaterTemp: FormControl<number>;
  followingTempDifferential: FormControl<number>;
}