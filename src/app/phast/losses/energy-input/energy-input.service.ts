import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { EnergyInputEAF } from '../../../shared/models/phast/losses/energyInputEAF';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class EnergyInputService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) {
  }
  initForm(lossNum: number, settings: Settings): FormGroup {
    let coalHeatingDefault: number = 12000;
    let electrodeHeatingDefault: number = 14000;
    if (settings.unitsOfMeasure != 'Imperial') {
      coalHeatingDefault = this.convertUnitsService.value(coalHeatingDefault).from('btuLb').to('kJkg');
      electrodeHeatingDefault = this.convertUnitsService.value(electrodeHeatingDefault).from('btuLb').to('kJkg');
    }
    return this.formBuilder.group({
      naturalGasHeatInput: ['', Validators.required],
      flowRateInput: [''],
      coalCarbonInjection: ['', Validators.required],
      coalHeatingValue: [coalHeatingDefault, Validators.required],
      electrodeUse: ['', Validators.required],
      electrodeHeatingValue: [electrodeHeatingDefault, Validators.required],
      otherFuels: ['', Validators.required],
      electricityInput: ['', Validators.required],
      name: ['Loss #' + lossNum]
    })
  }

  getLossFromForm(form: FormGroup): EnergyInputEAF {
    let tmpEnergyInput: EnergyInputEAF = {
      naturalGasHeatInput: form.controls.naturalGasHeatInput.value,
      flowRateInput: form.controls.flowRateInput.value,
      coalCarbonInjection: form.controls.coalCarbonInjection.value,
      coalHeatingValue: form.controls.coalHeatingValue.value,
      electrodeUse: form.controls.electrodeUse.value,
      electrodeHeatingValue: form.controls.electrodeHeatingValue.value,
      otherFuels: form.controls.otherFuels.value,
      electricityInput: form.controls.electricityInput.value,
      name: form.controls.name.value
    }
    return tmpEnergyInput;
  }

  getFormFromLoss(loss: EnergyInputEAF, minElectricityInput: number): FormGroup {
    let electricityInputValidators = this.getElectricityInputValidators(minElectricityInput);
    return this.formBuilder.group({
      naturalGasHeatInput: [loss.naturalGasHeatInput, Validators.required],
      flowRateInput: [loss.flowRateInput],
      coalCarbonInjection: [loss.coalCarbonInjection, Validators.required],
      coalHeatingValue: [loss.coalHeatingValue, Validators.required],
      electrodeUse: [loss.electrodeUse, Validators.required],
      electrodeHeatingValue: [loss.electrodeHeatingValue, Validators.required],
      otherFuels: [loss.otherFuels, Validators.required],
      electricityInput: [loss.electricityInput, electricityInputValidators],
      name: [loss.name]
    })
  }

  getElectricityInputValidators(minElectricityInput: number){
    let electricityInputValidators = [];
    if(minElectricityInput != undefined){
      electricityInputValidators = [Validators.required, GreaterThanValidator.greaterThan(minElectricityInput)];
    }
    return electricityInputValidators;
  }

  calculateHeatInputFromFlowRate(flowRate: number, settings: Settings) {
    if (settings.unitsOfMeasure == 'Imperial') {
      return this.convertUnitsService.roundVal(flowRate * (1020 / (Math.pow(10, 6))), 3);
    } else {
      let convertedFlowRate: number = this.convertUnitsService.value(flowRate).from('m3').to('ft3');
      let heatInput: number = convertedFlowRate * (1020 / (Math.pow(10, 6)));
      let convertedHeatInput: number = this.convertUnitsService.value(heatInput).from('MMBtu').to('GJ');
      return this.convertUnitsService.roundVal(convertedHeatInput, 3);
    }
  }
}
