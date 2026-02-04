// (TowerForm and methods moved into class below)
import { Injectable } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Operations, PumpInput, AirCooledSystemInput, WaterCooledSystemInput, TowerInput, CondenserCoolingMethod, SystemInformation, TowerType } from '../../shared/models/process-cooling-assessment';
import { PROCESS_COOLING_VALIDATION } from '../validation/process-cooling-validation';


@Injectable()
export class SystemInformationFormService {

  constructor(private formBuilder: FormBuilder) { }

  getOperationsForm(operations: Operations): FormGroup<OperationsForm> {
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
        Validators.min(PROCESS_COOLING_VALIDATION.chilledWaterSupplyTemp.min),
        Validators.max(PROCESS_COOLING_VALIDATION.chilledWaterSupplyTemp.max)
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

  getPumpInputForm(pumpInput: PumpInput): FormGroup<PumpInputForm> {
    return this.formBuilder.group({
      variableFlow: [pumpInput.variableFlow, [
        Validators.required
      ]],
      flowRate: [pumpInput.flowRate, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.flowRate.min),
        Validators.max(PROCESS_COOLING_VALIDATION.flowRate.max)
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

  getAirCooledSystemInputForm(input: AirCooledSystemInput): FormGroup<AirCooledSystemInputForm> {
    return this.formBuilder.group({
      outdoorAirTemp: [input.outdoorAirTemp, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.outdoorAirTemp.min),
        Validators.max(PROCESS_COOLING_VALIDATION.outdoorAirTemp.max)
      ]],
      airCoolingSource: [input.airCoolingSource, [
        Validators.required
      ]],
      indoorTemp: [input.indoorTemp, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.indoorTemp.min),
        Validators.max(PROCESS_COOLING_VALIDATION.indoorTemp.max)
      ]],
      followingTempDifferential: [input.followingTempDifferential, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.followingTempDifferential.min),
        Validators.max(PROCESS_COOLING_VALIDATION.followingTempDifferential.max)
      ]],
    });
  }

  getAirCooledSystemInput(formValue: Partial<AirCooledSystemInput>, currentInput: AirCooledSystemInput): AirCooledSystemInput {
    return {
      ...currentInput,
      ...formValue,
    };
  }

  getWaterCooledSystemInputForm(input: WaterCooledSystemInput): FormGroup<WaterCooledSystemInputForm> {
    return this.formBuilder.group({
      isConstantCondenserWaterTemp: [input.isConstantCondenserWaterTemp, [
        Validators.required
      ]],
      condenserWaterTemp: [input.condenserWaterTemp, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.condenserWaterTemp.min),
        Validators.max(PROCESS_COOLING_VALIDATION.condenserWaterTemp.max)
      ]],
      followingTempDifferential: [input.followingTempDifferential, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.followingTempDifferential.min),
        Validators.max(PROCESS_COOLING_VALIDATION.followingTempDifferential.max)
      ]],
    });
  }

  getWaterCooledSystemInput(formValue: Partial<WaterCooledSystemInput>, currentInput: WaterCooledSystemInput): WaterCooledSystemInput {
    return {
      ...currentInput,
      ...formValue,
    };
  }

  public getTowerForm(input: TowerInput): FormGroup<TowerForm> {
    return this.formBuilder.group({
      usesFreeCooling: [input.usesFreeCooling, [
        Validators.required
      ]],
      isHEXRequired: [input.isHEXRequired],
      HEXApproachTemp: [input.HEXApproachTemp, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.HEXApproachTemp.min),
        Validators.max(PROCESS_COOLING_VALIDATION.HEXApproachTemp.max)
      ]],
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
      towerSize: [input.towerSize, [
        Validators.required,
        Validators.min(PROCESS_COOLING_VALIDATION.towerSize.min),
        Validators.max(PROCESS_COOLING_VALIDATION.towerSize.max)
      ]],
    });
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

  public isSystemInformationValid(systemInformationInput: SystemInformation): boolean {
    const isOperationsValid = this.isOperationsValid(systemInformationInput.operations);
    const isPumpValid = this.isPumpValid(systemInformationInput);
    const isSystemInputValid = this.isCondenserSystemInputValid(systemInformationInput);
    const isTowerValid = this.isTowerValid(systemInformationInput.towerInput);
    const isValid: boolean = isOperationsValid && isPumpValid && isSystemInputValid && isTowerValid;
    return isValid;
  }
  
  public isPumpValid(systemInformation: SystemInformation): boolean {
    // todo are we sure this will always be condenserWaterPumpInput
    const pumpForm = this.getPumpInputForm(systemInformation.condenserWaterPumpInput);
    return pumpForm.valid;
  }

  public isOperationsValid(operations: Operations): boolean {
    const operationsForm = this.getOperationsForm(operations);
    return operationsForm.valid;
  }

  public isTowerValid(towerInput: TowerInput): boolean {
    const towerForm = this.getTowerForm(towerInput);
    return towerForm.valid;
  }

  public isCondenserSystemInputValid(systemInformationInput: SystemInformation): boolean {
    let systemInputForm: FormGroup<any>;
    if (systemInformationInput.operations.condenserCoolingMethod === CondenserCoolingMethod.Water) {
      systemInputForm = this.getWaterCooledSystemInputForm(systemInformationInput.waterCooledSystemInput);
    } else {
      systemInputForm = this.getAirCooledSystemInputForm(systemInformationInput.airCooledSystemInput);
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