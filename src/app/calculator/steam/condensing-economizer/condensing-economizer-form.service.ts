import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { MaterialInputProperties } from '../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../shared/models/settings';
import { CondensingEconomizerInput } from '../../../shared/models/steam/condensingEconomizer';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class CondensingEconomizerFormService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  getCondensingEconomizerForm(inputObj: CondensingEconomizerInput, settings: Settings): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      fuelCost: [inputObj.fuelCost, [Validators.required, Validators.min(0)]],
      flueGasTemperature:[inputObj.flueGasTemperature, Validators.required],
      modifiedFlueGasTemperature:[inputObj.modifiedFlueGasTemperature, this.getModifiedFlueGasValidator(settings)],
      ambientAirTemperature:[inputObj.ambientAirTemperature, Validators.required],
      fuelTemp:[inputObj.fuelTemp, Validators.required],
      materialTypeId: [inputObj.materialTypeId],
      oxygenCalculationMethod: [inputObj.oxygenCalculationMethod, Validators.required],
      flueGasO2:[inputObj.flueGasO2, Validators.required],
      excessAir:[inputObj.excessAir, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      combustionAirTemperature:[inputObj.combustionAirTemperature, Validators.required],
      moistureInCombustionAir:[inputObj.moistureInCombustionAir, [Validators.required, Validators.min(0), Validators.max(100)]],
      heatInput:[inputObj.heatInput, [Validators.required, Validators.min(0)]],
      substance: [inputObj.substance, Validators.required],
      CH4: [inputObj.CH4, Validators.required],
      C2H6: [inputObj.C2H6, Validators.required],
      N2: [inputObj.N2, Validators.required],
      H2: [inputObj.H2, Validators.required],
      C3H8: [inputObj.C3H8, Validators.required],
      C4H10_CnH2n: [inputObj.C4H10_CnH2n, Validators.required],
      H2O: [inputObj.H2O, Validators.required],
      CO: [inputObj.CO, Validators.required],
      CO2: [inputObj.CO2, Validators.required],
      SO2: [inputObj.SO2, Validators.required],
      O2: [inputObj.O2, Validators.required],
    });

    return form;
  }

  getModifiedFlueGasValidator(settings: Settings): Array<ValidatorFn> {
      let maxTemp: number = 130;
      if (settings.unitsOfMeasure != 'Imperial') {
        maxTemp = this.convertUnitsService.value(maxTemp).from('F').to('C');
        maxTemp = Math.round(maxTemp);
      }
      return [Validators.required, Validators.max(maxTemp)];
  }

  

  getCondensingEconomizerInput(form: FormGroup): CondensingEconomizerInput {
    let obj: CondensingEconomizerInput = {
      operatingHours: form.controls.operatingHours.value,
      fuelCost: form.controls.fuelCost.value,
      flueGasTemperature: form.controls.flueGasTemperature.value,
      modifiedFlueGasTemperature: form.controls.modifiedFlueGasTemperature.value,
      fuelTemp: form.controls.fuelTemp.value,
      materialTypeId: form.controls.materialTypeId.value,
      oxygenCalculationMethod: form.controls.oxygenCalculationMethod.value,
      flueGasO2: form.controls.flueGasO2.value,
      excessAir: form.controls.excessAir.value,
      combustionAirTemperature: form.controls.combustionAirTemperature.value,
      ambientAirTemperature: form.controls.ambientAirTemperature.value,
      moistureInCombustionAir: form.controls.moistureInCombustionAir.value,
      heatInput: form.controls.heatInput.value,
      substance: form.controls.substance.value,
      CH4: form.controls.CH4.value,
      C2H6: form.controls.C2H6.value,
      N2: form.controls.N2.value,
      H2: form.controls.H2.value,
      C3H8: form.controls.C3H8.value,
      C4H10_CnH2n: form.controls.C4H10_CnH2n.value,
      H2O: form.controls.H2O.value,
      CO: form.controls.CO.value,
      CO2: form.controls.CO2.value,
      SO2: form.controls.SO2.value,
      O2: form.controls.O2.value,
    };
    return obj;
  }

  getMaterialInputProperties(form: FormGroup): MaterialInputProperties {
    let input: MaterialInputProperties;
      input = {
        CH4: form.controls.CH4.value,
        C2H6: form.controls.C2H6.value,
        N2: form.controls.N2.value,
        H2: form.controls.H2.value,
        C3H8: form.controls.C3H8.value,
        C4H10_CnH2n: form.controls.C4H10_CnH2n.value,
        H2O: form.controls.H2O.value,
        CO: form.controls.CO.value,
        CO2: form.controls.CO2.value,
        SO2: form.controls.SO2.value,
        O2: form.controls.O2.value,
        o2InFlueGas: form.controls.flueGasO2.value,
        excessAir: form.controls.excessAir.value
      };

    return input;
  }

  checkWarnings(form: FormGroup, settings: Settings): CondensingEconomizerWarnings {
    if (form) {
      return {
        moistureInCombustionAir: this.checkMoistureInCombustionAir(form),
        o2Warning: this.checkO2Warning(form)
      }
    } else {
      return {
        moistureInCombustionAir: null,
        o2Warning: null
      }
    }
  }

  checkMoistureInCombustionAir(form: FormGroup): string {
    if (form.value.moistureInCombustionAir) {
      if (form.value.moistureInCombustionAir > 1) {
        return `Moisture In Combustion Air is usually 1 or lower`;
      }
    }
    return null;
  }

  checkO2Warning(form: FormGroup): string {
    if (form.controls.flueGasO2.value < 0 || form.controls.flueGasO2.value >= 21) {
      return 'Oxygen levels in Flue Gas must be greater than or equal to 0 and less than 21 percent';
    } else {
      return null;
    }
  }

}

export interface CondensingEconomizerWarnings {
  moistureInCombustionAir: string,
  o2Warning: string,
}