import { Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { TurbineInput } from '../../../shared/models/steam/steam-inputs';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SteamService } from '../steam.service';
@Injectable()
export class TurbineService {
  turbineInput: TurbineInput;

  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService, private steamService: SteamService) { }

  initOutletForm(settings: Settings): UntypedFormGroup {
    let tmpInletPressure = 66.4;
    let tmpInletQuantityValue = 897.5;
    let tmpMassFlowOrPowerOut = 98.8;
    let tmpOutletSteamPressure = 32;
    let tmpOutletQuantityValue = 1135.3;
    if (settings.steamPressureMeasurement !== 'psig') {
      tmpInletPressure = Math.round(this.convertUnitsService.value(tmpInletPressure).from('psig').to(settings.steamPressureMeasurement) * 100) / 100;
      tmpOutletSteamPressure = Math.round(this.convertUnitsService.value(tmpOutletSteamPressure).from('psig').to(settings.steamPressureMeasurement) * 100) / 100;
    }
    if (settings.steamTemperatureMeasurement !== 'F') {
      tmpInletQuantityValue = Math.round(this.convertUnitsService.value(tmpInletQuantityValue).from('F').to(settings.steamTemperatureMeasurement) * 100) / 100;
      tmpOutletQuantityValue = Math.round(this.convertUnitsService.value(tmpOutletQuantityValue).from('F').to(settings.steamTemperatureMeasurement) * 100) / 100;
    }
    if (settings.steamMassFlowMeasurement !== 'klb') {
      tmpMassFlowOrPowerOut = Math.round(this.convertUnitsService.value(tmpMassFlowOrPowerOut).from('klb').to(settings.steamMassFlowMeasurement) * 100) / 100;
    }
    let ranges: TurbineRanges = this.getRangeValues(settings, 0, 0);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      solveFor: [0, Validators.required], // (outlet properties = 0, isentropicEfficiency = 1) - unknown to solve for
      inletPressure: [tmpInletPressure, [Validators.required, Validators.min(ranges.inletPressureMin), Validators.max(ranges.inletPressureMax)]],
      inletQuantity: [0, Validators.required],
      inletQuantityValue: [tmpInletQuantityValue, [Validators.required, Validators.min(ranges.inletQuantityValueMin), Validators.max(ranges.inletQuantityValueMax)]],
      turbineProperty: [0, Validators.required], // massFlow = 0, powerOut = 1
      isentropicEfficiency: [68.6, [Validators.min(ranges.isentropicEfficiencyMin), Validators.max(ranges.isentropicEfficiencyMax)]],
      generatorEfficiency: [81.4, [Validators.required, Validators.min(ranges.generatorEfficiencyMin), Validators.max(ranges.generatorEfficiencyMax)]],
      massFlowOrPowerOut: [tmpMassFlowOrPowerOut, [Validators.required, Validators.min(ranges.massFlowOrPowerOutMin)]],
      outletSteamPressure: [tmpOutletSteamPressure, [Validators.required, Validators.min(ranges.outletSteamPressureMin), Validators.max(ranges.outletSteamPressureMax)]],
      outletQuantity: [0, Validators.required],
      outletQuantityValue: [tmpOutletQuantityValue, [Validators.min(ranges.outletQuantityValueMin), Validators.max(ranges.outletQuantityValueMax)]],
    });
    return tmpForm;
  }

  initIsentropicForm(settings: Settings): UntypedFormGroup {
    let tmpInletPressure = 847.5;
    let tmpInletQuantityValue = 1221.4;
    let tmpMassFlowOrPowerOut = 38.2;
    let tmpOutletSteamPressure = 619.4;
    let tmpOutletQuantityValue = 1135.3;
    if (settings.steamPressureMeasurement !== 'psig') {
      tmpInletPressure = Math.round(this.convertUnitsService.value(tmpInletPressure).from('psig').to(settings.steamPressureMeasurement) * 100) / 100;
      tmpOutletSteamPressure = Math.round(this.convertUnitsService.value(tmpOutletSteamPressure).from('psig').to(settings.steamPressureMeasurement) * 100) / 100;
    }
    if (settings.steamTemperatureMeasurement !== 'F') {
      tmpInletQuantityValue = Math.round(this.convertUnitsService.value(tmpInletQuantityValue).from('F').to(settings.steamTemperatureMeasurement) * 100) / 100;
      tmpOutletQuantityValue = Math.round(this.convertUnitsService.value(tmpOutletQuantityValue).from('F').to(settings.steamTemperatureMeasurement) * 100) / 100;
    }
    if (settings.steamMassFlowMeasurement !== 'klb') {
      tmpMassFlowOrPowerOut = Math.round(this.convertUnitsService.value(tmpMassFlowOrPowerOut).from('klb').to(settings.steamMassFlowMeasurement) * 100) / 100;
    }
    let ranges: TurbineRanges = this.getRangeValues(settings, 0, 0);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      solveFor: [1, Validators.required], // (outlet properties = 0, isentropicEfficiency = 1) - unknown to solve for
      inletPressure: [tmpInletPressure, [Validators.required, Validators.min(ranges.inletPressureMin), Validators.max(ranges.inletPressureMax)]],
      inletQuantity: [0, Validators.required],
      inletQuantityValue: [tmpInletQuantityValue, [Validators.required, Validators.min(ranges.inletQuantityValueMin), Validators.max(ranges.inletQuantityValueMax)]],
      turbineProperty: [0, Validators.required], // massFlow = 0, powerOut = 1
      isentropicEfficiency: [68.6, [Validators.min(ranges.isentropicEfficiencyMin), Validators.max(ranges.isentropicEfficiencyMax)]],
      generatorEfficiency: [81.4, [Validators.required, Validators.min(ranges.generatorEfficiencyMin), Validators.max(ranges.generatorEfficiencyMax)]],
      massFlowOrPowerOut: [tmpMassFlowOrPowerOut, [Validators.required, Validators.min(ranges.massFlowOrPowerOutMin)]],
      outletSteamPressure: [tmpOutletSteamPressure, [Validators.required, Validators.min(ranges.outletSteamPressureMin), Validators.max(ranges.outletSteamPressureMax)]],
      outletQuantity: [0],
      outletQuantityValue: [tmpOutletQuantityValue, [Validators.min(ranges.outletQuantityValueMin), Validators.max(ranges.outletQuantityValueMax)]],
    });
    return tmpForm;
  }

  resetForm(settings: Settings): UntypedFormGroup {
    let ranges: TurbineRanges = this.getRangeValues(settings, 0, 0);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      solveFor: [0, Validators.required], // (outlet properties = 0, isentropicEfficiency = 1) - unknown to solve for
      inletPressure: [0, [Validators.required, Validators.min(ranges.inletPressureMin), Validators.max(ranges.inletPressureMax)]],
      inletQuantity: [0, Validators.required],
      inletQuantityValue: [0, [Validators.required, Validators.min(ranges.inletQuantityValueMin), Validators.max(ranges.inletQuantityValueMax)]],
      turbineProperty: [0, Validators.required], // massFlow = 0, powerOut = 1
      isentropicEfficiency: [0, [Validators.min(ranges.isentropicEfficiencyMin), Validators.max(ranges.isentropicEfficiencyMax)]],
      generatorEfficiency: [0, [Validators.required, Validators.min(ranges.generatorEfficiencyMin), Validators.max(ranges.generatorEfficiencyMax)]],
      massFlowOrPowerOut: [0, [Validators.required, Validators.min(ranges.massFlowOrPowerOutMin)]],
      outletSteamPressure: [0, [Validators.required, Validators.min(ranges.outletSteamPressureMin), Validators.max(ranges.outletSteamPressureMax)]],
      outletQuantity: [0],
      outletQuantityValue: [0, [Validators.min(ranges.outletQuantityValueMin), Validators.max(ranges.outletQuantityValueMax)]],
    });
    return tmpForm;
  }

  getFormFromObj(inputObj: TurbineInput, settings: Settings): UntypedFormGroup {
    let ranges: TurbineRanges = this.getRangeValues(settings, inputObj.inletQuantity, inputObj.outletQuantity);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      solveFor: [inputObj.solveFor, Validators.required], // (outlet properties = 0, isentropicEfficiency = 1) - unknown to solve for
      inletPressure: [inputObj.inletPressure, [Validators.required, Validators.min(ranges.inletPressureMin), Validators.max(ranges.inletPressureMax)]],
      inletQuantity: [inputObj.inletQuantity, Validators.required],
      inletQuantityValue: [inputObj.inletQuantityValue, [Validators.required, Validators.min(ranges.inletQuantityValueMin), Validators.max(ranges.inletQuantityValueMax)]],
      turbineProperty: [inputObj.turbineProperty, Validators.required], // massFlow = 0, powerOut = 1
      isentropicEfficiency: [inputObj.isentropicEfficiency, [Validators.min(ranges.isentropicEfficiencyMin), Validators.max(ranges.isentropicEfficiencyMax)]],
      generatorEfficiency: [inputObj.generatorEfficiency, [Validators.required, Validators.min(ranges.generatorEfficiencyMin), Validators.max(ranges.generatorEfficiencyMax)]],
      massFlowOrPowerOut: [inputObj.massFlowOrPowerOut, [Validators.required, Validators.min(ranges.massFlowOrPowerOutMin)]],
      outletSteamPressure: [inputObj.outletSteamPressure, [Validators.required, Validators.min(ranges.outletSteamPressureMin), Validators.max(ranges.outletSteamPressureMax)]],
      outletQuantity: [inputObj.outletQuantity],
      outletQuantityValue: [inputObj.outletQuantityValue, [Validators.min(ranges.outletQuantityValueMin), Validators.max(ranges.outletQuantityValueMax)]],
    });
    return tmpForm;
  }

  getObjFromForm(form: UntypedFormGroup): TurbineInput {
    let input: TurbineInput = {
      inletPressure: form.controls.inletPressure.value,
      solveFor: form.controls.solveFor.value,
      inletQuantity: form.controls.inletQuantity.value,
      inletQuantityValue: form.controls.inletQuantityValue.value,
      turbineProperty: form.controls.turbineProperty.value,
      isentropicEfficiency: form.controls.isentropicEfficiency.value,
      generatorEfficiency: form.controls.generatorEfficiency.value,
      massFlowOrPowerOut: form.controls.massFlowOrPowerOut.value,
      outletSteamPressure: form.controls.outletSteamPressure.value,
      outletQuantity: form.controls.outletQuantity.value,
      outletQuantityValue: form.controls.outletQuantityValue.value,
    };
    return input;
  }

  getRangeValues(settings: Settings, inletThermodynamicQuantity: number, outletThermodynamicQuantity: number): TurbineRanges {
    let inletQuantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(settings, inletThermodynamicQuantity);
    let outletQuantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(settings, outletThermodynamicQuantity);
    let ranges: TurbineRanges = {
      inletPressureMin: Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      inletPressureMax: Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      massFlowOrPowerOutMin: 0,
      massFlowOrPowerOutMax: Number(this.convertUnitsService.value(10000).from('klb').to(settings.steamMassFlowMeasurement).toFixed(0)),
      inletQuantityValueMin: inletQuantityMinMax.min,
      inletQuantityValueMax: inletQuantityMinMax.max,
      isentropicEfficiencyMin: 20,
      isentropicEfficiencyMax: 100,
      generatorEfficiencyMin: 50,
      generatorEfficiencyMax: 100,
      outletSteamPressureMin: Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      outletSteamPressureMax: Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      outletQuantityValueMin: outletQuantityMinMax.min,
      outletQuantityValueMax: outletQuantityMinMax.max
    };
    return ranges;
  }
}

export interface TurbineRanges {
  inletPressureMin: number;
  inletPressureMax: number;
  inletQuantityValueMin: number;
  inletQuantityValueMax: number;
  isentropicEfficiencyMin: number;
  isentropicEfficiencyMax: number;
  generatorEfficiencyMin: number;
  generatorEfficiencyMax: number;
  massFlowOrPowerOutMin: number;
  massFlowOrPowerOutMax: number;
  outletSteamPressureMin: number;
  outletSteamPressureMax: number;
  outletQuantityValueMin: number;
  outletQuantityValueMax: number;
}
