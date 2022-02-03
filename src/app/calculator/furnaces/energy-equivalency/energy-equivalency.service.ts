import { Injectable } from '@angular/core';
import { EnergyEquivalencyElectric, EnergyEquivalencyFuel } from '../../../shared/models/phast/energyEquivalency';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class EnergyEquivalencyService {
  energyEquivalencyElectric: EnergyEquivalencyElectric;
  energyEquivalencyFuel: EnergyEquivalencyFuel;
  constructor(private convertUnitsService: ConvertUnitsService, private formBuilder: FormBuilder) { }

  getElectricFormFromObj(inputObj: EnergyEquivalencyElectric): FormGroup {
    let tmpForm: FormGroup = this.formBuilder.group({
      electricallyHeatedEfficiency: [inputObj.electricallyHeatedEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      fuelFiredEfficiency: [inputObj.fuelFiredEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      fuelFiredHeatInput: [inputObj.fuelFiredHeatInput, [Validators.required, Validators.min(0)]]
    });
    return tmpForm;
  }

  getElectricObjFromForm(form: FormGroup): EnergyEquivalencyElectric {
    this.energyEquivalencyElectric = {
      fuelFiredEfficiency: form.controls.fuelFiredEfficiency.value,
      electricallyHeatedEfficiency: form.controls.electricallyHeatedEfficiency.value,
      fuelFiredHeatInput: form.controls.fuelFiredHeatInput.value,
    };
    return this.energyEquivalencyElectric;
  }

  getFuelFormFromObj(inputObj: EnergyEquivalencyFuel): FormGroup {
    let tmpForm: FormGroup = this.formBuilder.group({
      electricallyHeatedEfficiency: [inputObj.electricallyHeatedEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      fuelFiredEfficiency: [inputObj.fuelFiredEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      electricalHeatInput: [inputObj.electricalHeatInput, [Validators.required, Validators.min(0)]]
    });
    return tmpForm;
  }

  getFuelObjFromForm(form: FormGroup): EnergyEquivalencyFuel {
    this.energyEquivalencyFuel = {
      fuelFiredEfficiency: form.controls.fuelFiredEfficiency.value,
      electricallyHeatedEfficiency: form.controls.electricallyHeatedEfficiency.value,
      electricalHeatInput: form.controls.electricalHeatInput.value,
    };
    return this.energyEquivalencyFuel;
  }


  getDefaultElectricData(settings: Settings): EnergyEquivalencyElectric {
    
    this.energyEquivalencyElectric = {
      fuelFiredEfficiency: 60,
      electricallyHeatedEfficiency: 90,
      fuelFiredHeatInput: this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('MMBtu').to(settings.phastRollupFuelUnit), 2)
    };
    return this.energyEquivalencyElectric;    
  
  }

  getDefaultFuelData(settings: Settings): EnergyEquivalencyFuel {
    this.energyEquivalencyFuel = {
      electricallyHeatedEfficiency: 90,
      fuelFiredEfficiency: 60,
      electricalHeatInput: this.convertUnitsService.roundVal(this.convertUnitsService.value(1800).from('kWh').to(settings.phastRollupElectricityUnit), 2)
    };
    return this.energyEquivalencyFuel;
  }

  getResetElectricData(): EnergyEquivalencyElectric {
    return {
      fuelFiredEfficiency: 0,
      electricallyHeatedEfficiency: 0,
      fuelFiredHeatInput: 0
    };
  }

  getResetFuelData(): EnergyEquivalencyFuel {
    return {
      electricallyHeatedEfficiency: 0,
      fuelFiredEfficiency: 0,
      electricalHeatInput: 0
    };
  }
}
