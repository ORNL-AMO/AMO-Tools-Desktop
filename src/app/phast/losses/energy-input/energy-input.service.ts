import { Injectable } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { EnergyInputEAF } from '../../../shared/models/phast/losses/energyInputEAF';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PHAST, PhastResults } from '../../../shared/models/phast/phast';
import { EnergyInputWarnings, PhastResultsService } from '../../phast-results.service';

@Injectable()
export class EnergyInputService {

  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) {
  }
  initForm(lossNum: number, settings: Settings): UntypedFormGroup {
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

  getLossFromForm(form: UntypedFormGroup): EnergyInputEAF {
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

  getFormFromLoss(loss: EnergyInputEAF, minElectricityInput: number): UntypedFormGroup {
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

  getElectricityInputValidators(minElectricityInput: number) {
    let electricityInputValidators = [];
    if (minElectricityInput != undefined) {
      minElectricityInput = this.convertUnitsService.roundVal(minElectricityInput, 2)
      electricityInputValidators = [Validators.required, Validators.min(minElectricityInput)];
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
  

  getMinElectricityInputRequirement(phast: PHAST, results: PhastResults, settings: Settings): number {
    if (phast.losses) {
      return results.totalInput + results.exothermicHeat - results.energyInputTotalChemEnergy;
    } else {
      return undefined;
    }
  }

  checkWarnings(phast: PHAST, results: PhastResults, settings: Settings): EnergyInputWarnings {
    return {
      electricityInputWarning: this.checkElectricityInputWarning(phast, results),
      energyInputHeatDelivered: this.checkEnergyInputWarnings(results.energyInputHeatDelivered)
    };
  }

  checkEnergyInputWarnings(energyInputHeatDelivered: number): string {
    if (energyInputHeatDelivered < 0) {
      return 'More heat than necessary is being delivered via burners. Check fuel inputs or estimate other losses.';
    } else {
      return null;
    }
  }


  checkElectricityInputWarning(phast: PHAST, results: PhastResults): string {
    if (phast.losses) {
      if( results.totalExhaustGasEAF >= results.energyInputTotalChemEnergy){
        return 'Exhaust Gas Losses must be less than Chemical Energy Delivered. Please check Electricity Input value.';
      } else {
        return null;
      }
    } else {
      return null;
    }
    
  }
}
