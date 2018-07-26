import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BoilerInput } from '../../../shared/models/steam';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class BoilerService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  initForm(settings: Settings): FormGroup {
    let ranges: BoilerRanges = this.getRangeValues(settings, 1);
    let form: FormGroup = this.formBuilder.group({
      deaeratorPressure: ['', [Validators.required, Validators.min(ranges.deaeratorPressureMin), Validators.max(ranges.deaeratorPressureMax)]],
      combustionEfficiency: ['', [Validators.required, Validators.min(ranges.combustionEfficiencyMin), Validators.max(ranges.combustionEfficiencyMax)]],
      blowdownRate: ['', [Validators.required, Validators.min(ranges.blowdownRateMin), Validators.max(ranges.blowdownRateMax)]],
      steamPressure: ['', [Validators.required, Validators.min(ranges.steamPressureMin), Validators.max(ranges.steamPressureMax)]],
      thermodynamicQuantity: [1, [Validators.required]],
      quantityValue: ['', [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      steamMassFlow: ['', [Validators.required, Validators.min(ranges.steamMassFlowMin), Validators.max(ranges.steamMassFlowMax)]],
    })
    return form;
  }

  getFormFromObj(inputs: BoilerInput, settings: Settings): FormGroup {
    let ranges: BoilerRanges = this.getRangeValues(settings, inputs.thermodynamicQuantity);
    let form: FormGroup = this.formBuilder.group({
      deaeratorPressure: [inputs.deaeratorPressure, [Validators.required, Validators.min(ranges.deaeratorPressureMin), Validators.max(ranges.deaeratorPressureMax)]],
      combustionEfficiency: [inputs.combustionEfficiency, [Validators.required, Validators.min(ranges.combustionEfficiencyMin), Validators.max(ranges.combustionEfficiencyMax)]],
      blowdownRate: [inputs.blowdownRate, [Validators.required, Validators.min(ranges.blowdownRateMin), Validators.max(ranges.blowdownRateMax)]],
      steamPressure: [inputs.steamPressure, [Validators.required, Validators.min(ranges.steamPressureMin), Validators.max(ranges.steamPressureMax)]],
      thermodynamicQuantity: [inputs.thermodynamicQuantity, [Validators.required]],
      quantityValue: [inputs.quantityValue, [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      steamMassFlow: [inputs.steamMassFlow, [Validators.required, Validators.min(ranges.steamMassFlowMin), Validators.max(ranges.steamMassFlowMax)]],
    })
    return form;
  }

  getObjFromForm(form: FormGroup): BoilerInput {
    let input: BoilerInput = {
      deaeratorPressure: form.controls.deaeratorPressure.value,
      combustionEfficiency: form.controls.combustionEfficiency.value,
      blowdownRate: form.controls.blowdownRate.value,
      steamPressure: form.controls.steamPressure.value,
      thermodynamicQuantity: form.controls.thermodynamicQuantity.value,
      quantityValue: form.controls.quantityValue.value,
      steamMassFlow: form.controls.steamMassFlow.value,
    }
    return input;
  }


  getRangeValues(settings: Settings, thermodynamicQuantity: number): BoilerRanges {
    let quantityMinMax: { min: number, max: number } = this.getQuantityRange(settings, thermodynamicQuantity);
    let ranges: BoilerRanges = {
      deaeratorPressureMax: Number(this.convertUnitsService.value(3185).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      deaeratorPressureMin: Number(this.convertUnitsService.value(-14.5).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      combustionEfficiencyMax: 100,
      combustionEfficiencyMin: 50,
      blowdownRateMax: 25,
      blowdownRateMin: 0,
      steamPressureMax: Number(this.convertUnitsService.value(14489).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      steamPressureMin: Number(this.convertUnitsService.value(-14.5).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      quantityValueMax: quantityMinMax.max,
      quantityValueMin: quantityMinMax.min,
      steamMassFlowMax: Number(this.convertUnitsService.value(10000).from('klb').to(settings.steamMassFlowMeasurement).toFixed(0)),
      steamMassFlowMin: 0
    }
    return ranges;
  }

  getQuantityRange(settings: Settings, thermodynamicQuantity: number): { min: number, max: number } {
    let _min: number = 0;
    let _max: number = 1;
    //temp
    if (thermodynamicQuantity == 0) {
      _min = Number(this.convertUnitsService.value(32).from('F').to(settings.steamTemperatureMeasurement).toFixed(0));
      _max = Number(this.convertUnitsService.value(1472).from('F').to(settings.steamTemperatureMeasurement).toFixed(0));
    }
    //enthalpy
    else if (thermodynamicQuantity == 1) {
      _min = Number(this.convertUnitsService.value(50).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement).toFixed(0));
      _max = Number(this.convertUnitsService.value(3700).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement).toFixed(0));
    }
    //entropy
    else if (thermodynamicQuantity == 2) {
      _min = Number(this.convertUnitsService.value(0).from('kJkgK').to(settings.steamSpecificEntropyMeasurement).toFixed(0));
      _max = Number(this.convertUnitsService.value(6.52).from('kJkgK').to(settings.steamSpecificEntropyMeasurement).toFixed(0));
    }
    return { min: _min, max: _max };
  }
}


export interface BoilerRanges {
  deaeratorPressureMax: number;
  deaeratorPressureMin: number;
  combustionEfficiencyMax: number;
  combustionEfficiencyMin: number;
  blowdownRateMax: number;
  blowdownRateMin: number;
  steamPressureMax: number;
  steamPressureMin: number;
  quantityValueMax: number;
  quantityValueMin: number;
  steamMassFlowMax: number;
  steamMassFlowMin: number;
}