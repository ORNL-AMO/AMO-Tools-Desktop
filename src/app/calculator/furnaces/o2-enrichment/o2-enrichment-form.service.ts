import { Injectable } from '@angular/core';
import { O2EnrichmentMinMax, EnrichmentInputData, EnrichmentInput } from '../../../shared/models/phast/o2Enrichment';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Injectable({
  providedIn: 'root'
})
export class O2EnrichmentFormService {

  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) { }

  initFormFromObj(settings: Settings, inputData: EnrichmentInputData): UntypedFormGroup {
    let tmpObj = JSON.parse(JSON.stringify(inputData));
    let ranges: O2EnrichmentMinMax = this.getMinMaxRanges(settings, tmpObj);
    if (!tmpObj.isBaseline) {
      // Use modification ranges
      ranges.combAirTempMax = ranges.combAirTempModificationMax;
      ranges.flueGasTempMin = ranges.flueGasTempModificationMin;
      ranges.flueGasTempMax = ranges.flueGasTempModificationMax;
      ranges.o2FlueGasMin = ranges.o2FlueGasModificationMin;
      ranges.o2FlueGasMax = ranges.o2FlueGasModificationMax;
    }
    let form = this.formBuilder.group({
      name: [inputData.name, [Validators.required]],
      isBaseline: [inputData.isBaseline],
      operatingHours: [inputData.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      o2CombAir: [inputData.o2CombAir, [Validators.required, Validators.min(ranges.o2CombAirModificationMin), Validators.max(ranges.o2CombAirModificationMin)]],
      flueGasTemp: [inputData.flueGasTemp, [Validators.required, Validators.min(ranges.flueGasTempMin), Validators.max(ranges.flueGasTempMax)]],
      o2FlueGas: [inputData.o2FlueGas, [Validators.required, Validators.min(ranges.o2FlueGasMin), Validators.max(ranges.o2FlueGasMax)]],
      combAirTemp: [inputData.combAirTemp, [Validators.required, Validators.min(ranges.combAirTempMin), Validators.max(ranges.combAirTempMax)]],
      fuelConsumption: [inputData.fuelConsumption, Validators.required],
      fuelCost: [inputData.fuelCost, [Validators.required, Validators.min(0)]],
    });
    return form;
  }

  getObjFromForm(form: UntypedFormGroup): EnrichmentInputData {
    return {
      name: form.controls.name.value,
      isBaseline: form.controls.isBaseline.value,
      operatingHours: form.controls.operatingHours.value,
      o2CombAir: form.controls.o2CombAir.value,
      flueGasTemp: form.controls.flueGasTemp.value,
      o2FlueGas: form.controls.o2FlueGas.value,
      combAirTemp: form.controls.combAirTemp.value,
      fuelConsumption: form.controls.fuelConsumption.value,
      fuelCost: form.controls.fuelCost.value,
    };
  }

  setRanges(o2Form: UntypedFormGroup, settings: Settings): UntypedFormGroup {
    let tmpInput: EnrichmentInputData = this.getObjFromForm(o2Form);
    let tmpRanges: O2EnrichmentMinMax = this.getMinMaxRanges(settings, tmpInput);
    o2Form.controls.o2CombAir.setValidators([Validators.required, Validators.max(tmpRanges.o2CombAirMax)]);
    o2Form.controls.o2CombAir.reset(o2Form.controls.o2CombAir.value);
    
    if (tmpInput.isBaseline) {
      o2Form.controls.combAirTemp.setValidators([Validators.required, Validators.min(tmpRanges.combAirTempMin), Validators.max(tmpRanges.combAirTempMax)]);
      o2Form.controls.combAirTemp.reset(o2Form.controls.combAirTemp.value);
    } else {
      o2Form.controls.combAirTemp.setValidators([Validators.required, Validators.min(tmpRanges.combAirTempModificationMin), Validators.max(tmpRanges.combAirTempModificationMax)]);
      o2Form.controls.combAirTemp.reset(o2Form.controls.combAirTemp.value);
    }

    return o2Form;
  }

  generateExample(settings: Settings): Array<EnrichmentInput> {
    let tmpFlueGasTemp: number = 1800;
    let tmpFlueGasTempModification: number = 1800;
    let tmpCombAirTemp: number = 80;
    let tmpCombAirTempEnriched: number = 300;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpFlueGasTemp = this.convertUnitsService.roundVal(this.convertUnitsService.value(tmpFlueGasTemp).from('F').to('C'), 2);
      tmpFlueGasTempModification = this.convertUnitsService.roundVal(this.convertUnitsService.value(tmpFlueGasTempModification).from('F').to('C'), 2);
      tmpCombAirTemp = this.convertUnitsService.roundVal(this.convertUnitsService.value(tmpCombAirTemp).from('F').to('C'), 2);
      tmpCombAirTempEnriched = this.convertUnitsService.roundVal(this.convertUnitsService.value(tmpCombAirTempEnriched).from('F').to('C'), 2);
    }
    let tmpFuelConsumption: number = this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('MMBtu').to(settings.energyResultUnit), 100);
    let exampleInputs: Array<EnrichmentInput> = [
      {
        inputData: {
          name: 'Baseline',
          isBaseline: true,
          operatingHours: 8640,
          o2CombAir: 21,
          flueGasTemp: tmpFlueGasTemp,
          o2FlueGas: 5,
          combAirTemp: 100,
          fuelConsumption: tmpFuelConsumption,
          fuelCost: settings.fuelCost,
        }
      },
      {
        inputData: {
          name: 'T = 200F',
          isBaseline: false,
          operatingHours: 8640,
          o2CombAir: 21,
          flueGasTemp: tmpFlueGasTempModification,
          o2FlueGas: 5,
          combAirTemp: 200,
          fuelCost: settings.fuelCost,
        }
      },
      {
        inputData: {
          name: 'T = 300F',
          isBaseline: false,
          operatingHours: 8640,
          o2CombAir: 21,
          flueGasTemp: tmpFlueGasTempModification,
          o2FlueGas: 5,
          combAirTemp: 300,
          fuelCost: settings.fuelCost,
        }
      },
      {
        inputData: {
          name: 'T = 400F',
          isBaseline: false,
          operatingHours: 8640,
          o2CombAir: 21,
          flueGasTemp: tmpFlueGasTempModification,
          o2FlueGas: 5,
          combAirTemp: 400,
          fuelCost: settings.fuelCost,
        }
      },
      {
        inputData: {
          name: 'T = 500F',
          isBaseline: false,
          operatingHours: 8640,
          o2CombAir: 21,
          flueGasTemp: tmpFlueGasTempModification,
          o2FlueGas: 5,
          combAirTemp: 500,
          fuelCost: settings.fuelCost,
        }
      },
      {
        inputData: {
          name: 'T = 600F',
          isBaseline: false,
          operatingHours: 8640,
          o2CombAir: 21,
          flueGasTemp: tmpFlueGasTempModification,
          o2FlueGas: 5,
          combAirTemp: 600,
          fuelCost: settings.fuelCost,
        }
      },
    ];

    if (settings.unitsOfMeasure == 'Metric') {
      exampleInputs = this.convertExampleInputs(exampleInputs);
    }
    return exampleInputs;
  }

  convertExampleInputs(inputs: Array<EnrichmentInput>): Array<EnrichmentInput> {
    inputs.map((input: EnrichmentInput)  => {
      input.inputData.combAirTemp = this.convertUnitsService.roundVal(this.convertUnitsService.value(input.inputData.combAirTemp).from('F').to('C'), 2);
      input.inputData.name = `T = ${this.convertUnitsService.roundVal(input.inputData.combAirTemp, 0)}C`;
    });
    return inputs;
  }

  getResetData(): EnrichmentInputData {
    return {
      name: 'Baseline',
      isBaseline: true,
      operatingHours: 0,
      fuelCost: 0,
      o2CombAir: 21,
      combAirTemp: 0,
      flueGasTemp: 0,
      o2FlueGas: 0,
      fuelConsumption: 0
    };
  }

  getMinMaxRanges(settings: Settings, inputData?: EnrichmentInputData): O2EnrichmentMinMax {
    let tmpTempMin: number = 0;
    let tmpFlueGasTempMax: number = 4000;
    let o2CombAirMax: number = 2000;
    let combAirMax: number = 2000;
    let modificationCombAirMax: number = 2000;

    if (settings.unitsOfMeasure === 'Metric') {
      tmpTempMin = this.convertUnitsService.roundVal(this.convertUnitsService.value(tmpTempMin).from('F').to('C'), 0);
      tmpFlueGasTempMax = this.convertUnitsService.roundVal(this.convertUnitsService.value(tmpFlueGasTempMax).from('F').to('C'), 0);
      o2CombAirMax = this.convertUnitsService.roundVal(this.convertUnitsService.value(o2CombAirMax).from('F').to('C'), 0);
      modificationCombAirMax = this.convertUnitsService.roundVal(this.convertUnitsService.value(modificationCombAirMax).from('F').to('C'), 0);
      combAirMax = this.convertUnitsService.roundVal(this.convertUnitsService.value(combAirMax).from('F').to('C'), 0);
    }

    if (inputData) {
      if (inputData.flueGasTemp && !inputData.isBaseline) {
        modificationCombAirMax = inputData.flueGasTemp;
      }
      if (inputData.o2CombAir && !inputData.isBaseline) {
        o2CombAirMax = inputData.o2CombAir;
      }
      if (inputData.flueGasTemp) {
        combAirMax = inputData.flueGasTemp;
      }
    }
    let tmpO2EnrichmentMinMax: O2EnrichmentMinMax = {
      o2CombAirMax: o2CombAirMax,
      o2CombAirModificationMin: 21,
      o2CombAirModificationMax: 100,
      flueGasTempMin: tmpTempMin,
      flueGasTempMax: tmpFlueGasTempMax,
      flueGasTempModificationMin: tmpTempMin,
      flueGasTempModificationMax: tmpFlueGasTempMax,
      o2FlueGasMin: 0,
      o2FlueGasMax: 100,
      o2FlueGasModificationMin: 0,
      o2FlueGasModificationMax: 100,
      combAirTempMin: tmpTempMin,
      combAirTempMax: combAirMax,
      combAirTempModificationMin: tmpTempMin,
      combAirTempModificationMax: modificationCombAirMax
    };
    return tmpO2EnrichmentMinMax;
  }

}
