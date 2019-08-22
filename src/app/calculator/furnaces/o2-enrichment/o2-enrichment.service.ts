import { Injectable } from '@angular/core';
import { O2Enrichment } from '../../../shared/models/phast/o2Enrichment';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PhastService } from '../../../phast/phast.service';
import { OperatingHours } from '../../../shared/models/operations';

@Injectable()
export class O2EnrichmentService {
  o2Enrichment: O2Enrichment;
  lines: Array<any> = [];
  operatingHours: OperatingHours;
  constructor(private phastService: PhastService, private convertUnitsService: ConvertUnitsService, private formBuilder: FormBuilder) { }

  initForm(settings: Settings): FormGroup {
    let defaultO2Enrichment: O2Enrichment = {
      operatingHours: 8640,
      operatingHoursEnriched: 8640,
      o2CombAir: 21,
      o2CombAirEnriched: 100,
      flueGasTemp: 1800,
      flueGasTempEnriched: 1800,
      o2FlueGas: 5,
      o2FlueGasEnriched: 1,
      combAirTemp: 900,
      combAirTempEnriched: 80,
      fuelConsumption: 10,
      fuelCost: settings.fuelCost,
      fuelCostEnriched: settings.fuelCost
    };
    if (settings.unitsOfMeasure === 'Metric') {
      defaultO2Enrichment.flueGasTemp = this.convertUnitsService.roundVal(this.convertUnitsService.value(defaultO2Enrichment.flueGasTemp).from('F').to('C'), 2);
      defaultO2Enrichment.flueGasTempEnriched = this.convertUnitsService.roundVal(this.convertUnitsService.value(defaultO2Enrichment.flueGasTempEnriched).from('F').to('C'), 2);
      defaultO2Enrichment.combAirTemp = this.convertUnitsService.roundVal(this.convertUnitsService.value(defaultO2Enrichment.combAirTemp).from('F').to('C'), 2);
      defaultO2Enrichment.combAirTempEnriched = this.convertUnitsService.roundVal(this.convertUnitsService.value(defaultO2Enrichment.combAirTempEnriched).from('F').to('C'), 2);
      defaultO2Enrichment.fuelConsumption = this.convertUnitsService.roundVal(this.convertUnitsService.value(defaultO2Enrichment.fuelConsumption).from('MMBtu').to('GJ'), 2);
    }

    let ranges: O2EnrichmentMinMax = this.getMinMaxRanges(settings);

    return this.formBuilder.group({
      operatingHours: [defaultO2Enrichment.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      operatingHoursEnriched: [defaultO2Enrichment.operatingHoursEnriched, [Validators.required, Validators.min(0), Validators.max(8760)]],
      o2CombAir: [defaultO2Enrichment.o2CombAir, Validators.required],
      o2CombAirEnriched: [defaultO2Enrichment.o2CombAirEnriched, [Validators.required, Validators.min(ranges.o2CombAirEnrichedMin), Validators.max(ranges.o2CombAirEnrichedMax)]],
      flueGasTemp: [defaultO2Enrichment.flueGasTemp, [Validators.required, Validators.min(ranges.flueGasTempMin), Validators.max(ranges.flueGasTempMax)]],
      flueGasTempEnriched: [defaultO2Enrichment.flueGasTempEnriched, [Validators.required, Validators.min(ranges.flueGasTempEnrichedMin), Validators.max(ranges.flueGasTempEnrichedMax)]],
      o2FlueGas: [defaultO2Enrichment.o2FlueGas, [Validators.required, Validators.min(ranges.o2FlueGasMin), Validators.max(ranges.o2FlueGasMax)]],
      o2FlueGasEnriched: [defaultO2Enrichment.o2FlueGasEnriched, [Validators.required, Validators.min(ranges.o2FlueGasEnrichedMin), Validators.max(ranges.o2FlueGasEnrichedMax)]],
      combAirTemp: [defaultO2Enrichment.combAirTemp, [Validators.required, Validators.min(ranges.combAirTempMin), Validators.max(ranges.combAirTempMax)]],
      combAirTempEnriched: [defaultO2Enrichment.combAirTempEnriched, [Validators.required, Validators.min(ranges.combAirTempEnrichedMin), Validators.max(ranges.combAirTempEnrichedMax)]],
      fuelConsumption: [defaultO2Enrichment.fuelConsumption, Validators.required],
      fuelCost: [settings.fuelCost, [Validators.required, Validators.min(0)]],
      fuelCostEnriched: [settings.fuelCost, [Validators.required, Validators.min(0)]]
    });
  }

  initFormFromObj(settings: Settings, obj: O2Enrichment): FormGroup {
    let ranges: O2EnrichmentMinMax = this.getMinMaxRanges(settings, JSON.parse(JSON.stringify(obj)));
    return this.formBuilder.group({
      operatingHours: [obj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      operatingHoursEnriched: [obj.operatingHoursEnriched, [Validators.required, Validators.min(0), Validators.max(8760)]],
      o2CombAir: [obj.o2CombAir, Validators.required],
      o2CombAirEnriched: [obj.o2CombAirEnriched, [Validators.required, Validators.min(ranges.o2CombAirEnrichedMin), Validators.max(ranges.o2CombAirEnrichedMax)]],
      flueGasTemp: [obj.flueGasTemp, [Validators.required, Validators.min(ranges.flueGasTempMin), Validators.max(ranges.flueGasTempMax)]],
      flueGasTempEnriched: [obj.flueGasTempEnriched, [Validators.required, Validators.min(ranges.flueGasTempEnrichedMin), Validators.max(ranges.flueGasTempEnrichedMax)]],
      o2FlueGas: [obj.o2FlueGas, [Validators.required, Validators.min(ranges.o2FlueGasMin), Validators.max(ranges.o2FlueGasMax)]],
      o2FlueGasEnriched: [obj.o2FlueGasEnriched, [Validators.required, Validators.min(ranges.o2FlueGasEnrichedMin), Validators.max(ranges.o2FlueGasEnrichedMax)]],
      combAirTemp: [obj.combAirTemp, [Validators.required, Validators.min(ranges.combAirTempMin), Validators.max(ranges.combAirTempMax)]],
      combAirTempEnriched: [obj.combAirTempEnriched, [Validators.required, Validators.min(ranges.combAirTempEnrichedMin), Validators.max(ranges.combAirTempEnrichedMax)]],
      fuelConsumption: [obj.fuelConsumption, Validators.required],
      fuelCost: [obj.fuelCost, [Validators.required, Validators.min(0)]],
      fuelCostEnriched: [obj.fuelCostEnriched, [Validators.required, Validators.min(0)]]
    });
  }

  getObjFromForm(form: FormGroup): O2Enrichment {
    return {
      operatingHours: form.controls.operatingHours.value,
      operatingHoursEnriched: form.controls.operatingHoursEnriched.value,
      o2CombAir: form.controls.o2CombAir.value,
      o2CombAirEnriched: form.controls.o2CombAirEnriched.value,
      flueGasTemp: form.controls.flueGasTemp.value,
      flueGasTempEnriched: form.controls.flueGasTempEnriched.value,
      o2FlueGas: form.controls.o2FlueGas.value,
      o2FlueGasEnriched: form.controls.o2FlueGasEnriched.value,
      combAirTemp: form.controls.combAirTemp.value,
      combAirTempEnriched: form.controls.combAirTempEnriched.value,
      fuelConsumption: form.controls.fuelConsumption.value,
      fuelCost: form.controls.fuelCost.value,
      fuelCostEnriched: form.controls.fuelCostEnriched.value
    };
  }

  getDefaultData(settings: Settings): O2Enrichment {
    let tmpFlueGasTemp: number = this.convertUnitsService.roundVal(this.convertUnitsService.value(1800).from('F').to(settings.temperatureMeasurement), 2);
    let tmpFlueGasTempEnriched: number = this.convertUnitsService.roundVal(this.convertUnitsService.value(1800).from('F').to(settings.temperatureMeasurement), 2);
    let tmpCombAirTemp: number = this.convertUnitsService.roundVal(this.convertUnitsService.value(900).from('F').to(settings.temperatureMeasurement), 2);
    let tmpCombAirTempEnriched: number = this.convertUnitsService.roundVal(this.convertUnitsService.value(80).from('F').to(settings.temperatureMeasurement), 2);
    let tmpFuelConsumption: number = this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('MMBtu').to(settings.energyResultUnit), 100);
    return {
      operatingHours: 8640,
      operatingHoursEnriched: 8640,
      fuelCost: settings.fuelCost,
      fuelCostEnriched: settings.fuelCost,
      o2CombAir: 21,
      o2CombAirEnriched: 100,
      combAirTemp: tmpCombAirTemp,
      combAirTempEnriched: tmpCombAirTempEnriched,
      flueGasTemp: tmpFlueGasTemp,
      flueGasTempEnriched: tmpFlueGasTempEnriched,
      o2FlueGas: 5,
      o2FlueGasEnriched: 1,
      fuelConsumption: tmpFuelConsumption
    };
  }

  getResetData(): O2Enrichment {
    return {
      operatingHours: 0,
      operatingHoursEnriched: 0,
      fuelCost: 0,
      fuelCostEnriched: 0,
      o2CombAir: 0,
      o2CombAirEnriched: 0,
      combAirTemp: 0,
      combAirTempEnriched: 0,
      flueGasTemp: 0,
      flueGasTempEnriched: 0,
      o2FlueGas: 0,
      o2FlueGasEnriched: 0,
      fuelConsumption: 0
    };
  }

  getMinMaxRanges(settings: Settings, o2Enrichment?: O2Enrichment): O2EnrichmentMinMax {
    let tmpTempMin: number = 0;
    let tmpFlueGasTempMax: number = 4000;
    let o2CombAirMax: number = 2000;
    let combAirMax: number = 2000;
    let combAirEnrichedMax: number = 2000;

    if (settings.unitsOfMeasure === 'Metric') {
      tmpTempMin = this.convertUnitsService.roundVal(this.convertUnitsService.value(tmpTempMin).from('F').to('C'), 0);
      tmpFlueGasTempMax = this.convertUnitsService.roundVal(this.convertUnitsService.value(tmpFlueGasTempMax).from('F').to('C'), 0);
      o2CombAirMax = this.convertUnitsService.roundVal(this.convertUnitsService.value(o2CombAirMax).from('F').to('C'), 0);
      combAirEnrichedMax = this.convertUnitsService.roundVal(this.convertUnitsService.value(combAirEnrichedMax).from('F').to('C'), 0);
      combAirMax = this.convertUnitsService.roundVal(this.convertUnitsService.value(combAirMax).from('F').to('C'), 0);
    }

    if (o2Enrichment) {
      if (o2Enrichment.flueGasTempEnriched) {
        combAirEnrichedMax = o2Enrichment.flueGasTempEnriched;
      }
      if (o2Enrichment.o2CombAirEnriched) {
        o2CombAirMax = o2Enrichment.o2CombAirEnriched;
      }
      if (o2Enrichment.flueGasTemp) {
        combAirMax = o2Enrichment.flueGasTemp;
      }
    }
    let tmpO2EnrichmentMinMax: O2EnrichmentMinMax = {
      //o2CombAirEnriched
      o2CombAirMax: o2CombAirMax,
      //o2CombAirEnriched
      o2CombAirEnrichedMin: 21,
      o2CombAirEnrichedMax: 100,
      //flueGasTemp
      flueGasTempMin: tmpTempMin,
      flueGasTempMax: tmpFlueGasTempMax,
      //flueGasTempEnriched
      flueGasTempEnrichedMin: tmpTempMin,
      flueGasTempEnrichedMax: tmpFlueGasTempMax,
      //o2FlueGas
      o2FlueGasMin: 0,
      o2FlueGasMax: 100,
      //o2FlueGasEnriched
      o2FlueGasEnrichedMin: 0,
      o2FlueGasEnrichedMax: 100,
      //combAirTemp
      combAirTempMin: tmpTempMin,
      combAirTempMax: combAirMax,
      //combAirTempEnriched
      combAirTempEnrichedMin: tmpTempMin,
      combAirTempEnrichedMax: combAirEnrichedMax
    };
    return tmpO2EnrichmentMinMax;
  }


  getGraphData(settings: Settings, o2EnrichmentPoint: any, line: any): { data: Array<any>, onGraph: boolean } {
    line.fuelSavings = 0.0;
    let data = [];
    let onGraph = false;
    let returnObj: { data: Array<any>, onGraph: boolean };

    for (let i = 0; i <= 100; i += .5) {
      o2EnrichmentPoint.o2CombAirEnriched = i;
      const fuelSavings = this.phastService.o2Enrichment(o2EnrichmentPoint, settings).fuelSavingsEnriched;
      if (fuelSavings > 0 && fuelSavings < 100) {
        if (fuelSavings > line.fuelSavings) {
          line.fuelSavings = fuelSavings;
        }
        if (!data.length) {
          data.push({
            x: i - .001,
            y: 0
          });
        }
        onGraph = true;
        data.push({
          x: i,
          y: fuelSavings
        });
      }
    }
    returnObj = {
      data: data,
      onGraph: onGraph
    };
    return returnObj;
  }


}


export interface O2EnrichmentMinMax {
  o2CombAirMax: number;
  o2CombAirEnrichedMin: number;
  o2CombAirEnrichedMax: number;
  flueGasTempMin: number;
  flueGasTempMax: number;
  flueGasTempEnrichedMin: number;
  flueGasTempEnrichedMax: number;
  o2FlueGasMin: number;
  o2FlueGasMax: number;
  o2FlueGasEnrichedMin: number;
  o2FlueGasEnrichedMax: number;
  combAirTempMin: number;
  combAirTempMax: number;
  combAirTempEnrichedMin: number;
  combAirTempEnrichedMax: number;
}
