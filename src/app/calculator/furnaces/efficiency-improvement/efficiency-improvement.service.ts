import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { EfficiencyImprovement, EfficiencyImprovementInputData, EfficiencyImprovementInputs } from '../../../shared/models/phast/efficiencyImprovement';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OperatingHours } from '../../../shared/models/operations';

@Injectable()
export class EfficiencyImprovementService {
  efficiencyImprovement: EfficiencyImprovement;
  efficiencyImprovementInputs: EfficiencyImprovementInputs;
  efficiencyImprovementInputData: EfficiencyImprovementInputData;
  operatingHours: OperatingHours;
  constructor(private convertUnitsService: ConvertUnitsService, private formBuilder: FormBuilder) { }

  getFormFromObj(inputObj: EfficiencyImprovementInputData): FormGroup {
    let tmpForm: FormGroup = this.formBuilder.group({
      annualOperatingHours: [inputObj.annualOperatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      fuelType: [inputObj.fuelType, Validators.required],
      utilityCost: [inputObj.utilityCost, [Validators.required, Validators.min(0), Validators.max(8760)]],
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      flueGasOxygen: [inputObj.flueGasOxygen, [Validators.required, Validators.min(0), Validators.max(100)]],
      flueGasTemp: [inputObj.flueGasTemp, [Validators.required]],
      combustionAirTemp: [inputObj.combustionAirTemp, [Validators.required, Validators.min(0)]],
      energyInput: [inputObj.energyInput, [Validators.required]]
    });
    tmpForm = this.setValidators(tmpForm);
    return tmpForm;
  }

  getObjFromForm(form: FormGroup): EfficiencyImprovementInputData {
    form = this.setValidators(form);
    this.efficiencyImprovementInputData = {
      annualOperatingHours: form.controls.annualOperatingHours.value,
      fuelType: form.controls.fuelType.value,
      utilityCost: form.controls.utilityCost.value,
      operatingHours: form.controls.operatingHours.value,
      flueGasOxygen: form.controls.flueGasOxygen.value,
      flueGasTemp: form.controls.flueGasTemp.value,
      combustionAirTemp: form.controls.combustionAirTemp.value,
      energyInput: form.controls.energyInput.value
    };
    return this.efficiencyImprovementInputData;
  }

  setValidators(formGroup: FormGroup): FormGroup {
    formGroup = this.setFlueGasTempValidators(formGroup);
    formGroup = this.setCombustionAirTempValidators(formGroup);

    return formGroup;
  }

  setCombustionAirTempValidators(formGroup: FormGroup) {
    let flueGasTemp = formGroup.controls.flueGasTemp.value;
    let validators = [Validators.required];
    if (flueGasTemp !== undefined) {
      validators.push(Validators.max(flueGasTemp));
    }
    formGroup.controls.combustionAirTemp.setValidators(validators);
    formGroup.controls.combustionAirTemp.markAsDirty();
    formGroup.controls.combustionAirTemp.updateValueAndValidity();
    return formGroup;
  }

  setFlueGasTempValidators(formGroup: FormGroup) {
    let combustionAirTemp = formGroup.controls.combustionAirTemp.value;
    let validators = [Validators.required];
    if (combustionAirTemp !== undefined) {
      validators.push(Validators.min(combustionAirTemp));
    }
    formGroup.controls.flueGasTemp.setValidators(validators);
    formGroup.controls.flueGasTemp.markAsDirty();
    formGroup.controls.flueGasTemp.updateValueAndValidity();
    return formGroup;
  }

  generateExample(settings: Settings): EfficiencyImprovement {
    let baselineInputData: EfficiencyImprovementInputData;
    let modInputData: EfficiencyImprovementInputData;
    if (settings.unitsOfMeasure === 'Metric'){
      baselineInputData = {
        annualOperatingHours: 8760,
        fuelType: 1,
        utilityCost: settings.fuelCost,
        flueGasOxygen: 6,
        operatingHours: 8760,
        flueGasTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(1600).from('F').to('C'), 2),
        combustionAirTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(80).from('F').to('C'), 2),
        energyInput: this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('MMBtu').to('GJ'), 2)
      }
      modInputData = {
        annualOperatingHours: 8760,
        fuelType: 1,
        utilityCost: settings.fuelCost,
        flueGasOxygen: 2,
        operatingHours: 8760,
        flueGasTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(1600).from('F').to('C'), 2),
        combustionAirTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(750).from('F').to('C'), 2)
      }
    } else{
      baselineInputData = {
        annualOperatingHours: 8760,
        fuelType: 1,
        utilityCost: settings.fuelCost,
        flueGasOxygen: 6,
        operatingHours: 8760,
        flueGasTemp: 1600,
        combustionAirTemp: 80,
        energyInput: 10
      }
      modInputData = {
        annualOperatingHours: 8760,
        fuelType: 1,
        utilityCost: settings.fuelCost,
        flueGasOxygen: 2,
        operatingHours: 8760,
        flueGasTemp: 1600,
        combustionAirTemp: 750
      }
    }
    let efficiencyImprovement: EfficiencyImprovement = {
      baseline: baselineInputData,
      modification: modInputData
    }
    return efficiencyImprovement;
  }
  
  getEmptyInputs(settings: Settings): EfficiencyImprovement {
    let baselineInputData: EfficiencyImprovementInputData;
    let modInputData: EfficiencyImprovementInputData;
    baselineInputData = {
      annualOperatingHours: 8760,
      fuelType: 1,
      utilityCost: settings.fuelCost,
      flueGasOxygen: 0,
      operatingHours: 8760,
      flueGasTemp: 0,
      combustionAirTemp: 0,
      energyInput: 0
    }
    modInputData = {
      annualOperatingHours: 8760,
      fuelType: 1,
      utilityCost: settings.fuelCost,
      flueGasOxygen: 0,
      operatingHours: 8760,
      flueGasTemp: 0,
      combustionAirTemp: 0
    }   
    
    let efficiencyImprovement: EfficiencyImprovement = {
      baseline: baselineInputData,
      modification: modInputData
    }
    return efficiencyImprovement;
  }

  getInputsForSuite( efficiencyImprovement: EfficiencyImprovement): EfficiencyImprovementInputs {
    let efficiencyImprovementInputs: EfficiencyImprovementInputs = {
      currentOperatingHours: efficiencyImprovement.baseline.annualOperatingHours,
      newOperatingHours: efficiencyImprovement.modification.annualOperatingHours,
      currentFlueGasOxygen: efficiencyImprovement.baseline.flueGasOxygen,
      newFlueGasOxygen: efficiencyImprovement.modification.flueGasOxygen,
      currentFlueGasTemp: efficiencyImprovement.baseline.flueGasTemp,
      currentCombustionAirTemp: efficiencyImprovement.baseline.combustionAirTemp,
      newCombustionAirTemp: efficiencyImprovement.modification.combustionAirTemp,
      currentEnergyInput: efficiencyImprovement.baseline.energyInput,
      newFlueGasTemp: efficiencyImprovement.modification.flueGasTemp,
      fuelCost: efficiencyImprovement.baseline.utilityCost
    };
    return efficiencyImprovementInputs;
  }

}
