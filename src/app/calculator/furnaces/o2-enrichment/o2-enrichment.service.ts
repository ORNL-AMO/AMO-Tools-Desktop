import { Injectable } from '@angular/core';
import { O2Enrichment, O2EnrichmentOutput } from '../../../shared/models/phast/o2Enrichment';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PhastService } from '../../../phast/phast.service';
import { OperatingHours } from '../../../shared/models/operations';
import { SelectedDataPoint, SimpleChart, TraceData, TraceCoordinates } from '../../../shared/models/plotting';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class O2EnrichmentService {
  o2Enrichment: O2Enrichment;
  operatingHours: OperatingHours;

  enrichmentChart: BehaviorSubject<SimpleChart>;
  selectedDataPoints: BehaviorSubject<Array<DisplayPoint>>;
  hoverGroupData: BehaviorSubject<any>;

  enrichmentInputs: BehaviorSubject<Array<O2Enrichment>>;
  enrichmentOutputs: BehaviorSubject<Array<O2EnrichmentOutput>>;
  currentEnrichmentIndex: BehaviorSubject<number>;
  currentField: BehaviorSubject<string>;

  resetData: BehaviorSubject<boolean>;
  generatedExample: BehaviorSubject<boolean>;

  constructor(private phastService: PhastService, private convertUnitsService: ConvertUnitsService, private formBuilder: FormBuilder) {
    this.enrichmentInputs = new BehaviorSubject<Array<O2Enrichment>>(undefined);
    this.enrichmentOutputs = new BehaviorSubject<Array<O2EnrichmentOutput>>(undefined);
    this.currentEnrichmentIndex = new BehaviorSubject<number>(0);
    this.currentField = new BehaviorSubject<string>(undefined);

    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generatedExample = new BehaviorSubject<boolean>(undefined);
    this.initChartData();
  }

  initChartData() {
    let emptyChart: SimpleChart = this.getEmptyChart();
    let dataPoints = new Array<DisplayPoint>();
    let hoverGroupData = {
      lineGroupData: [],
      lineGroup: []
    }
    this.enrichmentChart = new BehaviorSubject<SimpleChart>(emptyChart);
    this.selectedDataPoints = new BehaviorSubject<Array<DisplayPoint>>(dataPoints);
    this.hoverGroupData = new BehaviorSubject<any>(hoverGroupData);
  }

  initDefaultEmptyInputs(settings: Settings) {
    let initialForm = this.initForm(settings);
    let defaultBaseline = this.getObjFromForm(initialForm);
    let defaultMod = this.getObjFromForm(initialForm);
    defaultBaseline.name = 'Baseline';
    defaultMod.name = 'Modification';
    let emptyEnrichmentInput: Array<O2Enrichment> = [defaultBaseline];
    this.enrichmentInputs.next(emptyEnrichmentInput);
  }

  resetInputs(settings: Settings) {
    let defaultBaseline: O2Enrichment = this.getResetData();
    let emptyEnrichmentInput: Array<O2Enrichment> = [defaultBaseline];
    this.enrichmentInputs.next(emptyEnrichmentInput);
  }

  initForm(settings: Settings): FormGroup {
    let defaultO2Enrichment: O2Enrichment = {
      name: 'New Line',
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
      name: [defaultO2Enrichment.name, [Validators.required]],
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
      name: [obj.name, [Validators.required]],
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
      name: form.controls.name.value,
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

  setRanges(o2Form: FormGroup, settings: Settings): FormGroup {
    let tmpO2Enrichment: O2Enrichment = this.getObjFromForm(o2Form);
    let tmpRanges: O2EnrichmentMinMax = this.getMinMaxRanges(settings, tmpO2Enrichment);
    let combAirTempDirty: boolean = o2Form.controls.combAirTempEnriched.dirty;
    let o2CombAirDirty: boolean = o2Form.controls.o2CombAir.dirty;
    let combAirTempEnrichedDirty: boolean = o2Form.controls.combAirTemp.dirty;

    o2Form.controls.combAirTempEnriched.setValidators([Validators.required, Validators.min(tmpRanges.combAirTempEnrichedMin), Validators.max(tmpRanges.combAirTempEnrichedMax)]);
    o2Form.controls.combAirTempEnriched.reset(o2Form.controls.combAirTempEnriched.value);

    o2Form.controls.o2CombAir.setValidators([Validators.required, Validators.max(tmpRanges.o2CombAirMax)]);
    o2Form.controls.o2CombAir.reset(o2Form.controls.o2CombAir.value);

    o2Form.controls.combAirTemp.setValidators([Validators.required, Validators.min(tmpRanges.combAirTempMin), Validators.max(tmpRanges.combAirTempMax)]);
    o2Form.controls.combAirTemp.reset(o2Form.controls.combAirTemp.value);

    if (combAirTempDirty) {
      o2Form.controls.combAirTempEnriched.markAsDirty();
    }
    if (o2CombAirDirty) {
      o2Form.controls.o2CombAir.markAsDirty();
    }
    if (combAirTempEnrichedDirty) {
      o2Form.controls.combAirTemp.markAsDirty();
    }
    return o2Form;
  }

  checkValidInputData(settings, cases: Array<O2Enrichment>): boolean {
    cases.forEach(data => {
      let form = this.initFormFromObj(settings, data);
      if (!form.valid) {
        return false;
      }
    });
    return true;
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: O2EnrichmentOutput = {
      availableHeatEnriched: 0.0,
      availableHeatInput: 0.0,
      fuelConsumptionEnriched: 0.0,
      fuelSavingsEnriched: 0.0,
      annualFuelCost: 0.0,
      annualFuelCostEnriched: 0.0
    };
    let outputs: Array<O2EnrichmentOutput> = [emptyOutput];
    this.enrichmentOutputs.next(outputs);
  }

  calculate(settings: Settings) {
    let enrichmentInputs = JSON.parse(JSON.stringify(this.enrichmentInputs.getValue()));
    let validInputs: boolean = this.checkValidInputData(settings, enrichmentInputs);

    if (!validInputs) {
      this.initDefaultEmptyOutputs();
    } else {
      if (enrichmentInputs.length > 1) {
        enrichmentInputs = this.processModificationInputs(enrichmentInputs);
      }
      let enrichmentOutputs = []
      enrichmentInputs.forEach((input: O2Enrichment, index) => {
        let output: O2EnrichmentOutput = this.phastService.o2Enrichment(input, settings);
        output.name = input.name;
        output.annualFuelCost = input.fuelCost * input.operatingHours * input.fuelConsumption;

        if (index == 0) {
          // Displaying baseline in results table - overwrite 'enriched'/mod properties
          output.availableHeatEnriched = output.availableHeatInput;
          output.annualFuelCostEnriched = output.annualFuelCost;
          output.fuelConsumptionEnriched = input.fuelConsumption;
          output.fuelSavingsEnriched = undefined;
        } else {
          output.annualFuelCostEnriched = input.fuelCostEnriched * input.operatingHoursEnriched * output.fuelConsumptionEnriched
          output.annualCostSavings = output.annualFuelCost - output.annualFuelCostEnriched;
        }
        output.input = input;
        enrichmentOutputs.push(output);
      });
      console.log(enrichmentOutputs);
      this.enrichmentOutputs.next(enrichmentOutputs);
    }
  }

  processModificationInputs(inputs: Array<O2Enrichment>) {
    // For mod inputs, Swap non-enriched properties (baseline) over to mod
    let baselineEnrichment: O2Enrichment = inputs[0];
    inputs.forEach((input: O2Enrichment, index) => {
      if (index != 0) {
        input.combAirTempEnriched = input.combAirTemp;
        input.o2CombAirEnriched = input.o2CombAir;
        input.flueGasTempEnriched = input.flueGasTemp;
        input.o2FlueGasEnriched = input.o2FlueGas
        input.fuelCostEnriched = input.fuelCost;
        input.operatingHoursEnriched = input.operatingHours;
        // Swap in baseline
        input.combAirTemp = baselineEnrichment.combAirTemp;
        input.o2CombAir = baselineEnrichment.o2CombAir;
        input.flueGasTemp = baselineEnrichment.flueGasTemp;
        input.o2FlueGas = baselineEnrichment.o2FlueGas;
        input.fuelCost = baselineEnrichment.fuelCost;
        input.operatingHours = baselineEnrichment.operatingHours;
      }
    });
    return inputs;
  }

  generateExample(settings: Settings) {
    let tmpFlueGasTemp: number = 1800;
    let tmpFlueGasTempEnriched: number = 1800;
    let tmpCombAirTemp: number = 80;
    let tmpCombAirTempEnriched: number = 300;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpFlueGasTemp = this.convertUnitsService.roundVal(this.convertUnitsService.value(tmpFlueGasTemp).from('F').to('C'), 2);
      tmpFlueGasTempEnriched = this.convertUnitsService.roundVal(this.convertUnitsService.value(tmpFlueGasTempEnriched).from('F').to('C'), 2);
      tmpCombAirTemp = this.convertUnitsService.roundVal(this.convertUnitsService.value(tmpCombAirTemp).from('F').to('C'), 2);
      tmpCombAirTempEnriched = this.convertUnitsService.roundVal(this.convertUnitsService.value(tmpCombAirTempEnriched).from('F').to('C'), 2);
    }
    let tmpFuelConsumption: number = this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('MMBtu').to(settings.energyResultUnit), 100);
    let example: O2Enrichment = {
      name: 'Example Baseline',
      operatingHours: 8640,
      operatingHoursEnriched: 8640,
      o2CombAir: 21,
      o2CombAirEnriched: 100,
      flueGasTemp: tmpFlueGasTemp,
      flueGasTempEnriched: tmpFlueGasTempEnriched,
      o2FlueGas: 5,
      o2FlueGasEnriched: 1,
      combAirTemp: tmpCombAirTemp,
      combAirTempEnriched: tmpCombAirTempEnriched,
      fuelConsumption: tmpFuelConsumption,
      fuelCost: settings.fuelCost,
      fuelCostEnriched: settings.fuelCost,
    };
    let modExample = JSON.parse(JSON.stringify(example));
    modExample.name = 'Example Modification';
    modExample.combAirTemp = 400;
    let exampleEnrichment: Array<O2Enrichment> = [example, modExample];
    this.enrichmentInputs.next(exampleEnrichment);
    this.currentEnrichmentIndex.next(1);
  }

  getResetData(): O2Enrichment {
    return {
      name: 'Baseline',
      operatingHours: 0,
      operatingHoursEnriched: 0,
      fuelCost: 0,
      fuelCostEnriched: 0,
      o2CombAir: 21,
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

  getGraphData(settings: Settings, o2EnrichmentPoint: any, line: any): { data: TraceCoordinates, onGraph: boolean } {
    line.fuelSavings = 0.0;
    let data = { x: [], y: [] };
    let onGraph = false;
    let returnObj: { data: TraceCoordinates, onGraph: boolean };

    for (let i = 21; i <= 100; i += .5) {
      o2EnrichmentPoint.o2CombAirEnriched = i;
      // const fuelSavings = this.phastService.o2Enrichment(o2EnrichmentPoint, settings).fuelSavingsEnriched;
      const output = this.phastService.o2Enrichment(o2EnrichmentPoint, settings);
      console.log('output', output);
      const fuelSavings = output.fuelSavingsEnriched;
      if (fuelSavings > 0 && fuelSavings < 100) {
        if (fuelSavings > line.fuelSavings) {
          line.fuelSavings = fuelSavings;
        }
        if (!data.x.length && !data.y.length) {
          data.x.push(i - .001);
          data.y.push(0);
        }
        onGraph = true;
        data.x.push(i);
        data.y.push(fuelSavings);
      }
    }
    returnObj = {
      data: data,
      onGraph: onGraph
    };
    return returnObj;
  }

  getLineTrace(): TraceData {
    let trace: TraceData = {
      x: [],
      y: [],
      name: '',
      showlegend: false,
      type: 'scatter',
      hovertemplate: `O<sub>2</sub> in Air: %{x}%<br>Fuel Savings: %{y}%<br>`,
      line: {
        shape: 'spline',
        color: '#000'
      }
    };
    return trace;
  }

  getPointTrace(selectedPoint: SelectedDataPoint): TraceData {
    let trace: TraceData = {
      x: [selectedPoint.pointX],
      y: [selectedPoint.pointY],
      type: 'scatter',
      name: ``,
      showlegend: false,
      hovertemplate: `O<sub>2</sub> in Air: %{x}%<br>Fuel Savings: %{y}%<br>`,
      mode: 'markers',
      marker: {
        color: selectedPoint.pointColor,
        size: 14,
        line: {
          color: '',
          width: 4
        }
      },
    }
    return trace;
  }

  getEmptyChart(): SimpleChart {
    let showGrid = true;
    return {
      name: 'O<sub>2</sub> Enrichment',
      data: [],
      layout: {
        hovermode: 'closest',
        xaxis: {
          autorange: true,
          type: 'linear',
          showgrid: showGrid,
          showspikes: true,
          spikemode: 'across',
          title: {
            text: "O<sub>2</sub> in Air (%)"
          },
          // rangemode: 'tozero',
          range: [20, 40, 60, 80, 100],
          showticksuffix: 'all',
          // tickmode: 'array',
          // tickvals: [20, 40, 60, 80, 100],
          tickangle: -60
        },
        yaxis: {
          autorange: true,
          type: 'auto',
          showgrid: showGrid,
          title: {
            text: "Fuel Savings (%)"
          },
          // rangemode: 'tozero',
          showticksuffix: 'all'
        },
        margin: {
          t: 50,
          b: 75,
          l: 75,
          r: 50
        }
      },
      config: {
        modeBarButtonsToRemove: ['lasso2d', 'pan2d', 'select2d', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      },
      inputCount: 0
    };
  }

}

export interface DisplayPoint extends SelectedDataPoint {
  combustionTemp: number,
  flueOxygen: number,
  fuelTemp: number,
  name?: string
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
