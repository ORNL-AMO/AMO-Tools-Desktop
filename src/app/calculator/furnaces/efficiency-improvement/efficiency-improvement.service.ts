import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { EfficiencyImprovement, EfficiencyImprovementInputData, EfficiencyImprovementInputs } from '../../../shared/models/phast/efficiencyImprovement';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LessThanValidator } from '../../../shared/validators/less-than';
import { OperatingHours } from '../../../shared/models/operations';

@Injectable()
export class EfficiencyImprovementService {
  efficiencyImprovement: EfficiencyImprovement;
  efficiencyImprovementInputs: EfficiencyImprovementInputs;
  efficiencyImprovementInputData: EfficiencyImprovementInputData;
  operatingHours: OperatingHours;
  constructor(private convertUnitsService: ConvertUnitsService, private formBuilder: FormBuilder) { }

  getFormFromObj(inputObj: EfficiencyImprovementInputs): FormGroup {
    let tmpForm: FormGroup = this.formBuilder.group({
      currentOperatingHours: [inputObj.currentOperatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      newOperatingHours: [inputObj.newOperatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      currentFlueGasOxygen: [inputObj.currentFlueGasOxygen, [Validators.required, Validators.min(0), Validators.max(100)]],
      newFlueGasOxygen: [inputObj.newFlueGasOxygen, [Validators.required, Validators.min(0), Validators.max(100)]],
      currentFlueGasTemp: [inputObj.currentFlueGasTemp, [Validators.required]],
      currentCombustionAirTemp: [inputObj.currentCombustionAirTemp, [Validators.required, LessThanValidator.lessThan(inputObj.currentFlueGasTemp)]],
      newCombustionAirTemp: [inputObj.newCombustionAirTemp, [Validators.required, LessThanValidator.lessThan(inputObj.newFlueGasTemp)]],
      currentEnergyInput: [inputObj.currentEnergyInput, [Validators.required]],
      newFlueGasTemp: [inputObj.newFlueGasTemp, [Validators.required]]
    });
    return tmpForm;
  }

  getFormFromObjInputData(inputObj: EfficiencyImprovementInputData): FormGroup {
    let tmpForm: FormGroup = this.formBuilder.group({
      annualOperatingHours: [inputObj.annualOperatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      fuelType: [inputObj.fuelType, Validators.required],
      utilityCost: [inputObj.utilityCost, [Validators.required, Validators.min(0), Validators.max(8760)]],
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      flueGasOxygen: [inputObj.flueGasOxygen, [Validators.required, Validators.min(0), Validators.max(100)]],
      flueGasTemp: [inputObj.flueGasTemp, [Validators.required]],
      combustionAirTemp: [inputObj.combustionAirTemp, [Validators.required, LessThanValidator.lessThan(inputObj.flueGasTemp)]],
      energyInput: [inputObj.energyInput, [Validators.required]]
    });
    return tmpForm;
  }

  getObjFromForm(form: FormGroup): EfficiencyImprovementInputs {
    this.efficiencyImprovementInputs = {
      currentOperatingHours: form.controls.currentOperatingHours.value,
      newOperatingHours: form.controls.newOperatingHours.value,
      currentFlueGasOxygen: form.controls.currentFlueGasOxygen.value,
      newFlueGasOxygen: form.controls.newFlueGasOxygen.value,
      currentFlueGasTemp: form.controls.currentFlueGasTemp.value,
      currentCombustionAirTemp: form.controls.currentCombustionAirTemp.value,
      newCombustionAirTemp: form.controls.newCombustionAirTemp.value,
      currentEnergyInput: form.controls.currentEnergyInput.value,
      newFlueGasTemp: form.controls.newFlueGasTemp.value,
    };
    return this.efficiencyImprovementInputs;
  }

  getObjInputDataFromForm(form: FormGroup): EfficiencyImprovementInputData {
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

  updateFormValidators(form: FormGroup, inputObj: EfficiencyImprovementInputs): void {
    if (inputObj.newFlueGasTemp != undefined) {
      form.controls.newCombustionAirTemp.setValidators([Validators.required, LessThanValidator.lessThan(inputObj.newFlueGasTemp)]);
    } else {
      form.controls.newCombustionAirTemp.setValidators([Validators.required]);
    }
    if (inputObj.currentFlueGasTemp != undefined) {
      form.controls.currentCombustionAirTemp.setValidators([Validators.required, LessThanValidator.lessThan(inputObj.currentFlueGasTemp)]);
    } else {
      form.controls.currentCombustionAirTemp.setValidators([Validators.required]);
    }
  }

  generateExample(settings: Settings): EfficiencyImprovementInputs {
    if (settings.unitsOfMeasure === 'Metric') {
      return {
        currentFlueGasOxygen: 6,
        newFlueGasOxygen: 2,
        currentOperatingHours: 8640,
        newOperatingHours: 8760,
        currentFlueGasTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(1600).from('F').to('C'), 2),
        currentCombustionAirTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(80).from('F').to('C'), 2),
        newCombustionAirTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(750).from('F').to('C'), 2),
        currentEnergyInput: this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('MMBtu').to('GJ'), 2),
        newFlueGasTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(1600).from('F').to('C'), 2)
      };
    }
    else {
      return {
        currentFlueGasOxygen: 6,
        newFlueGasOxygen: 2,
        currentOperatingHours: 8640,
        newOperatingHours: 8760,
        currentFlueGasTemp: 1600,
        currentCombustionAirTemp: 80,
        newCombustionAirTemp: 750,
        currentEnergyInput: 10,
        newFlueGasTemp: 1600
      };
    }
  }

  generateExampleNewObj(settings: Settings): EfficiencyImprovement {
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

  getResetData(): EfficiencyImprovementInputs {
    return {
      currentOperatingHours: 8640,
      newOperatingHours: 8640,
      currentFlueGasOxygen: 0,
      newFlueGasOxygen: 0,
      currentFlueGasTemp: 0,
      currentCombustionAirTemp: 0,
      newCombustionAirTemp: 0,
      currentEnergyInput: 0,
      newFlueGasTemp: 0
    }
  }

  getRestDataNewObj(settings: Settings): EfficiencyImprovement {
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

  getInputsFromObj( efficiencyImprovement: EfficiencyImprovement): EfficiencyImprovementInputs {
    let efficiencyImprovementInputs: EfficiencyImprovementInputs = {
      currentOperatingHours: efficiencyImprovement.baseline.operatingHours,
      newOperatingHours: efficiencyImprovement.modification.operatingHours,
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
