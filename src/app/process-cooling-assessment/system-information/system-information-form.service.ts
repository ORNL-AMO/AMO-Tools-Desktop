// (TowerForm and methods moved into class below)
import { Injectable } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Operations, PumpInput, AirCooledSystemInput, WaterCooledSystemInput, TowerInput, CondenserCoolingMethod, SystemInformation } from '../../shared/models/process-cooling-assessment';


@Injectable()
export class SystemInformationFormService {

  constructor(private formBuilder: FormBuilder) { }

  getOperationsForm(operations: Operations): FormGroup<OperationsForm> {
    return this.formBuilder.group({
      annualOperatingHours: [operations.annualOperatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      fuelCost: [operations.fuelCost, [Validators.required, Validators.min(0)]],
      electricityCost: [operations.electricityCost, [Validators.required, Validators.min(0)]],
      chilledWaterSupplyTemp: [operations.chilledWaterSupplyTemp, Validators.required],
      condenserCoolingMethod: [operations.condenserCoolingMethod, Validators.required],
      doChillerLoadSchedulesVary: [operations.doChillerLoadSchedulesVary, Validators.required],
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
      variableFlow: [pumpInput.variableFlow, Validators.required],
      flowRate: [pumpInput.flowRate, [Validators.required, Validators.min(0)]],
      efficiency: [pumpInput.efficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      motorSize: [pumpInput.motorSize, [Validators.required, Validators.min(0)]],
      motorEfficiency: [pumpInput.motorEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
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
      outdoorAirTemp: [input.outdoorAirTemp, [Validators.required]],
      airCoolingSource: [input.airCoolingSource, [Validators.required]],
      indoorTemp: [input.indoorTemp, [Validators.required]],
      followingTempDifferential: [input.followingTempDifferential, [Validators.required]],
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
      isConstantCondenserWaterTemp: [input.isConstantCondenserWaterTemp, [Validators.required]],
      condenserWaterTemp: [input.condenserWaterTemp, [Validators.required]],
      followingTempDifferential: [input.followingTempDifferential, [Validators.required]],
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
      usesFreeCooling: [input.usesFreeCooling, Validators.required],
      isHEXRequired: [input.isHEXRequired],
      HEXApproachTemp: [input.HEXApproachTemp, [Validators.required, Validators.min(0)]],
      numberOfTowers: [input.numberOfTowers, [Validators.required, Validators.min(1)]],
      towerType: [input.towerType],
      numberOfFans: [input.numberOfFans, [Validators.required, Validators.min(1)]],
      fanSpeedType: [input.fanSpeedType],
      towerSizeMetric: [input.towerSizeMetric],
      fanType: [input.fanType],
      towerSize: [input.towerSize, [Validators.required, Validators.min(0)]],
    });
  }

  public getTowerInput(formValue: Partial<TowerInput>, currentInput: TowerInput): TowerInput {
    return {
      ...currentInput,
      ...formValue,
    };
  }

  public isValid(systemInformationInput: SystemInformation): boolean {
    let isValid: boolean = true;
    const operationsForm = this.getOperationsForm(systemInformationInput.operations);
    const pumpForm = this.getPumpInputForm(systemInformationInput.condenserWaterPumpInput);
    const towerForm = this.getTowerForm(systemInformationInput.towerInput);
    let systemInputForm: FormGroup<any>;
    if (operationsForm.controls.condenserCoolingMethod.value === CondenserCoolingMethod.Water) {
      systemInputForm = this.getWaterCooledSystemInputForm(systemInformationInput.waterCooledSystemInput);
    } else {
      systemInputForm = this.getAirCooledSystemInputForm(systemInformationInput.airCooledSystemInput);
    }

    isValid = operationsForm.valid && pumpForm.valid && systemInputForm.valid && towerForm.valid;
    return isValid;
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