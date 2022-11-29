import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BoilerInput } from '../../../shared/models/steam/steam-inputs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { SteamService } from '../steam.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class BoilerService {

  boilerInput: BoilerInput;
  modalOpen: BehaviorSubject<boolean>;
  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService, private steamService: SteamService) { 
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }

  initForm(settings: Settings): UntypedFormGroup {
    let tmpDeaeratorPressure = 2;
    let tmpSteamPressure = 462.1;
    let tmpQuantityValue = 740.6;
    let tmpSteamMassFlow = 95.8;
    if (settings.steamPressureMeasurement !== 'psig') {
      tmpDeaeratorPressure = Math.round(this.convertUnitsService.value(tmpDeaeratorPressure).from('psig').to(settings.steamPressureMeasurement) * 100) / 100;
      tmpSteamPressure = Math.round(this.convertUnitsService.value(tmpSteamPressure).from('psig').to(settings.steamPressureMeasurement) * 100) / 100;
    }
    if (settings.steamTemperatureMeasurement !== 'F') {
      tmpQuantityValue = Math.round(this.convertUnitsService.value(tmpQuantityValue).from('F').to(settings.steamTemperatureMeasurement) * 100) / 100;
    }
    if (settings.steamMassFlowMeasurement !== 'klb') {
      tmpSteamMassFlow = Math.round(this.convertUnitsService.value(tmpSteamMassFlow).from('klb').to(settings.steamMassFlowMeasurement) * 100) / 100;
    }
    let ranges: BoilerRanges = this.getRangeValues(settings, 1);
    let form: UntypedFormGroup = this.formBuilder.group({
      deaeratorPressure: [tmpDeaeratorPressure, [Validators.required, Validators.min(ranges.deaeratorPressureMin), Validators.max(ranges.deaeratorPressureMax)]],
      combustionEfficiency: [70.6, [Validators.required, Validators.min(ranges.combustionEfficiencyMin), Validators.max(ranges.combustionEfficiencyMax)]],
      blowdownRate: [1.7, [Validators.required, Validators.min(ranges.blowdownRateMin), Validators.max(ranges.blowdownRateMax)]],
      steamPressure: [tmpSteamPressure, [Validators.required, Validators.min(ranges.steamPressureMin), Validators.max(ranges.steamPressureMax)]],
      thermodynamicQuantity: [0, [Validators.required]],
      quantityValue: [tmpQuantityValue, [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      steamMassFlow: [tmpSteamMassFlow, [Validators.required, Validators.min(ranges.steamMassFlowMin)]],
    });
    return form;
  }

  resetForm(settings: Settings): UntypedFormGroup {
    let ranges: BoilerRanges = this.getRangeValues(settings, 1);
    let form: UntypedFormGroup = this.formBuilder.group({
      deaeratorPressure: [0, [Validators.required, Validators.min(ranges.deaeratorPressureMin), Validators.max(ranges.deaeratorPressureMax)]],
      combustionEfficiency: [0, [Validators.required, Validators.min(ranges.combustionEfficiencyMin), Validators.max(ranges.combustionEfficiencyMax)]],
      blowdownRate: [0, [Validators.required, Validators.min(ranges.blowdownRateMin), Validators.max(ranges.blowdownRateMax)]],
      steamPressure: [0, [Validators.required, Validators.min(ranges.steamPressureMin), Validators.max(ranges.steamPressureMax)]],
      thermodynamicQuantity: [0, [Validators.required]],
      quantityValue: [0, [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      steamMassFlow: [0, [Validators.required, Validators.min(ranges.steamMassFlowMin)]],
    });
    return form;
  }

  getFormFromObj(inputs: BoilerInput, settings: Settings): UntypedFormGroup {
    let ranges: BoilerRanges = this.getRangeValues(settings, inputs.thermodynamicQuantity);
    let form: UntypedFormGroup = this.formBuilder.group({
      deaeratorPressure: [inputs.deaeratorPressure, [Validators.required, Validators.min(ranges.deaeratorPressureMin), Validators.max(ranges.deaeratorPressureMax)]],
      combustionEfficiency: [inputs.combustionEfficiency, [Validators.required, Validators.min(ranges.combustionEfficiencyMin), Validators.max(ranges.combustionEfficiencyMax)]],
      blowdownRate: [inputs.blowdownRate, [Validators.required, Validators.min(ranges.blowdownRateMin), Validators.max(ranges.blowdownRateMax)]],
      steamPressure: [inputs.steamPressure, [Validators.required, Validators.min(ranges.steamPressureMin), Validators.max(ranges.steamPressureMax)]],
      thermodynamicQuantity: [inputs.thermodynamicQuantity, [Validators.required]],
      quantityValue: [inputs.quantityValue, [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      steamMassFlow: [inputs.steamMassFlow, [Validators.required, Validators.min(ranges.steamMassFlowMin)]],
    });
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): BoilerInput {
    let input: BoilerInput = {
      deaeratorPressure: form.controls.deaeratorPressure.value,
      combustionEfficiency: form.controls.combustionEfficiency.value,
      blowdownRate: form.controls.blowdownRate.value,
      steamPressure: form.controls.steamPressure.value,
      thermodynamicQuantity: form.controls.thermodynamicQuantity.value,
      quantityValue: form.controls.quantityValue.value,
      steamMassFlow: form.controls.steamMassFlow.value,
    };
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
    };
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
