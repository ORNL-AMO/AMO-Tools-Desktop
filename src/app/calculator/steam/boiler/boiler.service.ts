import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BoilerInput } from '../../../shared/models/steam/steam-inputs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { SteamService } from '../steam.service';

@Injectable()
export class BoilerService {
  
  boilerInput: BoilerInput;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private steamService: SteamService) { }

  initForm(settings: Settings): FormGroup {
    let ranges: BoilerRanges = this.getRangeValues(settings, 1);
    let form: FormGroup = this.formBuilder.group({
      deaeratorPressure: ['', [Validators.required, Validators.min(ranges.deaeratorPressureMin), Validators.max(ranges.deaeratorPressureMax)]],
      combustionEfficiency: ['', [Validators.required, Validators.min(ranges.combustionEfficiencyMin), Validators.max(ranges.combustionEfficiencyMax)]],
      blowdownRate: ['', [Validators.required, Validators.min(ranges.blowdownRateMin), Validators.max(ranges.blowdownRateMax)]],
      steamPressure: ['', [Validators.required, Validators.min(ranges.steamPressureMin), Validators.max(ranges.steamPressureMax)]],
      thermodynamicQuantity: [1, [Validators.required]],
      quantityValue: ['', [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      steamMassFlow: ['', [Validators.required, Validators.min(ranges.steamMassFlowMin)]],
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
      steamMassFlow: [inputs.steamMassFlow, [Validators.required, Validators.min(ranges.steamMassFlowMin)]],
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
    let quantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(settings, thermodynamicQuantity);
    let ranges: BoilerRanges = {
      deaeratorPressureMax: Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      deaeratorPressureMin: Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      combustionEfficiencyMax: 100,
      combustionEfficiencyMin: 50,
      blowdownRateMax: 25,
      blowdownRateMin: 0,
      steamPressureMax: Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      steamPressureMin: Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      quantityValueMax: quantityMinMax.max,
      quantityValueMin: quantityMinMax.min,
      steamMassFlowMax: Number(this.convertUnitsService.value(10000).from('klb').to(settings.steamMassFlowMeasurement).toFixed(0)),
      steamMassFlowMin: 0
    }
    return ranges;
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