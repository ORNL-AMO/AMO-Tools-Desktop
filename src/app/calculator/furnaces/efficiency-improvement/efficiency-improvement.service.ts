import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { EfficiencyImprovementInputs } from '../../../shared/models/phast/efficiencyImprovement';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { LessThanValidator } from '../../../shared/validators/less-than';
import { OperatingHours } from '../../../shared/models/operations';

@Injectable()
export class EfficiencyImprovementService {
  efficiencyImprovementInputs: EfficiencyImprovementInputs;
  operatingHours: OperatingHours;
  constructor(private convertUnitsService: ConvertUnitsService, private formBuilder: UntypedFormBuilder) { }

  getFormFromObj(inputObj: EfficiencyImprovementInputs): UntypedFormGroup {
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
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

  getObjFromForm(form: UntypedFormGroup): EfficiencyImprovementInputs {
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

  updateFormValidators(form: UntypedFormGroup, inputObj: EfficiencyImprovementInputs): void {
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

}
