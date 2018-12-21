import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { EfficiencyImprovementInputs } from '../../../shared/models/phast/efficiencyImprovement';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LessThanValidator } from '../../../shared/validators/less-than';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class EfficiencyImprovementService {
  efficiencyImprovementInputs: EfficiencyImprovementInputs;
  constructor(private convertUnitsService: ConvertUnitsService, private formBuilder: FormBuilder) { }

  getFormFromObj(inputObj: EfficiencyImprovementInputs): FormGroup {
    let tmpForm: FormGroup = this.formBuilder.group({
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

  getObjFromForm(form: FormGroup): EfficiencyImprovementInputs {
    this.efficiencyImprovementInputs = {
      currentFlueGasOxygen: form.controls.currentFlueGasOxygen.value,
      newFlueGasOxygen: form.controls.newFlueGasOxygen.value,
      currentFlueGasTemp: form.controls.currentFlueGasTemp.value,
      currentCombustionAirTemp: form.controls.currentCombustionAirTemp.value,
      newCombustionAirTemp: form.controls.newCombustionAirTemp.value,
      currentEnergyInput: form.controls.currentEnergyInput.value,
      newFlueGasTemp: form.controls.newFlueGasTemp.value,
    }
    return this.efficiencyImprovementInputs;
  }
  
  updateFormValidators(form: FormGroup, inputObj: EfficiencyImprovementInputs): void {
    form.controls.currentCombustionAirTemp.setValidators([Validators.required, LessThanValidator.lessThan(inputObj.currentFlueGasTemp)]);
    form.controls.newCombustionAirTemp.setValidators([Validators.required, LessThanValidator.lessThan(inputObj.newFlueGasTemp)]);
  }

  initDefaultValues(settings: Settings): EfficiencyImprovementInputs {
    if (settings.unitsOfMeasure == 'Metric') {
      return {
        currentFlueGasOxygen: 6,
        newFlueGasOxygen: 2,
        currentFlueGasTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(80).from('F').to('C'), 2),
        currentCombustionAirTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(80).from('F').to('C'), 2),
        newCombustionAirTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(750).from('F').to('C'), 2),
        currentEnergyInput: this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('MMBtu').to('GJ'), 2),
        newFlueGasTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(1600).from('F').to('C'), 2)
      }
    }
    else {
      return {
        currentFlueGasOxygen: 6,
        newFlueGasOxygen: 2,
        currentFlueGasTemp: 80,
        currentCombustionAirTemp: 80,
        newCombustionAirTemp: 750,
        currentEnergyInput: 10,
        newFlueGasTemp: 1600
      }
    }
  }

}
