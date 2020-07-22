import { Injectable } from '@angular/core';
import { EnrichmentOutput, EnrichmentInput, EnrichmentInputData, RawO2Output, SuiteInputAdapter } from '../../../shared/models/phast/o2Enrichment';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PhastService } from '../../../phast/phast.service';
import { OperatingHours } from '../../../shared/models/operations';
import { SelectedDataPoint, SimpleChart, TraceData, TraceCoordinates } from '../../../shared/models/plotting';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class O2EnrichmentService {
  operatingHours: OperatingHours;

  enrichmentChart: BehaviorSubject<SimpleChart>;
  selectedDataPoints: BehaviorSubject<Array<DisplayPoint>>;
  hoverGroupData: BehaviorSubject<any>;

  enrichmentInputs: BehaviorSubject<Array<EnrichmentInput>>;
  enrichmentOutputs: BehaviorSubject<Array<EnrichmentOutput>>;
  currentEnrichmentIndex: BehaviorSubject<number>;
  currentField: BehaviorSubject<string>;

  resetData: BehaviorSubject<boolean>;
  generatedExample: BehaviorSubject<boolean>;

  constructor(private phastService: PhastService, private convertUnitsService: ConvertUnitsService, private formBuilder: FormBuilder) {
    this.enrichmentInputs = new BehaviorSubject<Array<EnrichmentInput>>(undefined);
    this.enrichmentOutputs = new BehaviorSubject<Array<EnrichmentOutput>>(undefined);
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
    let baselineData: EnrichmentInputData = {
          name: 'Baseline',
          isBaseline: true,
          operatingHours: 8640,
          o2CombAir: 21,
          flueGasTemp: 1800,
          o2FlueGas: 5,
          combAirTemp: 100,
          fuelConsumption: 10,
          fuelCost: settings.fuelCost,
        };
    let baselineInput: EnrichmentInput = {
      inputData: baselineData
    }
    let emptyEnrichmentInput: Array<EnrichmentInput> = [baselineInput];
    this.enrichmentInputs.next(emptyEnrichmentInput);
  }

  resetInputs(settings: Settings) {
    let defaultBaseline: EnrichmentInputData = this.getResetData();
    let baselineInput: EnrichmentInput = {
      inputData: defaultBaseline
    }
    let emptyEnrichmentInput: Array<EnrichmentInput> = [baselineInput];
    this.enrichmentInputs.next(emptyEnrichmentInput);
  }

  initFormFromObj(settings: Settings, inputData: EnrichmentInputData): FormGroup {
    let tmpObj = JSON.parse(JSON.stringify(inputData));
    let ranges: O2EnrichmentMinMax = this.getMinMaxRanges(settings, tmpObj);
    if (!tmpObj.isBaseline) {
      // Use modification ranges
      ranges.combAirTempMax = ranges.combAirTempEnrichedMax;
      ranges.flueGasTempMin = ranges.flueGasTempEnrichedMin;
      ranges.flueGasTempMax = ranges.flueGasTempEnrichedMax;
      ranges.o2FlueGasMin = ranges.o2FlueGasEnrichedMin;
      ranges.o2FlueGasMax = ranges.o2FlueGasEnrichedMax;
    }
    let form = this.formBuilder.group({
      name: [inputData.name, [Validators.required]],
      operatingHours: [inputData.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      o2CombAir: [inputData.o2CombAir, [Validators.required, Validators.min(ranges.o2CombAirEnrichedMin), Validators.max(ranges.o2CombAirEnrichedMin)]],
      flueGasTemp: [inputData.flueGasTemp, [Validators.required, Validators.min(ranges.flueGasTempMin), Validators.max(ranges.flueGasTempMax)]],
      o2FlueGas: [inputData.o2FlueGas, [Validators.required, Validators.min(ranges.o2FlueGasMin), Validators.max(ranges.o2FlueGasMax)]],
      combAirTemp: [inputData.combAirTemp, [Validators.required, Validators.min(ranges.combAirTempMin), Validators.max(ranges.combAirTempMax)]],
      fuelConsumption: [inputData.fuelConsumption, Validators.required],
      fuelCost: [inputData.fuelCost, [Validators.required, Validators.min(0)]],
    });
    return form;
  }

  getObjFromForm(form: FormGroup): EnrichmentInputData {
    return {
      name: form.controls.name.value,
      operatingHours: form.controls.operatingHours.value,
      o2CombAir: form.controls.o2CombAir.value,
      flueGasTemp: form.controls.flueGasTemp.value,
      o2FlueGas: form.controls.o2FlueGas.value,
      combAirTemp: form.controls.combAirTemp.value,
      fuelConsumption: form.controls.fuelConsumption.value,
      fuelCost: form.controls.fuelCost.value,
    };
  }

  
  setRanges(o2Form: FormGroup, settings: Settings): FormGroup {
    let tmpInput: EnrichmentInputData = this.getObjFromForm(o2Form);
    let tmpRanges: O2EnrichmentMinMax = this.getMinMaxRanges(settings, tmpInput);
    o2Form.controls.o2CombAir.setValidators([Validators.required, Validators.max(tmpRanges.o2CombAirMax)]);
    o2Form.controls.o2CombAir.reset(o2Form.controls.o2CombAir.value);
    
    if (tmpInput.isBaseline) {
      o2Form.controls.combAirTemp.setValidators([Validators.required, Validators.min(tmpRanges.combAirTempMin), Validators.max(tmpRanges.combAirTempMax)]);
      o2Form.controls.combAirTemp.reset(o2Form.controls.combAirTemp.value);
    } else {
      o2Form.controls.combAirTemp.setValidators([Validators.required, Validators.min(tmpRanges.combAirTempEnrichedMin), Validators.max(tmpRanges.combAirTempEnrichedMax)]);
      o2Form.controls.combAirTemp.reset(o2Form.controls.combAirTemp.value);
    }

    return o2Form;
  }

  addModification(form: FormGroup) {
    let enrichmentCopy = this.getObjFromForm(form);
    enrichmentCopy.name = 'Modification';
    let enrichmentInputs: Array<EnrichmentInput> = this.enrichmentInputs.getValue();
    let modificationInput: EnrichmentInput = {
      inputData: enrichmentCopy
    }
    enrichmentInputs.push(modificationInput);
    this.enrichmentInputs.next(enrichmentInputs);
    this.currentEnrichmentIndex.next(enrichmentInputs.length - 1);
  }

  removeModification(currentIndex: number) {
    let enrichmentInputs: Array<EnrichmentInput> = this.enrichmentInputs.getValue();
    enrichmentInputs.splice(currentIndex, 1);
    this.enrichmentInputs.next(enrichmentInputs);
    this.currentEnrichmentIndex.next(currentIndex - 1);
  }

  checkValidInputData(settings, inputs: Array<EnrichmentInput>): boolean {
    inputs.forEach(input => {
      let form = this.initFormFromObj(settings, input.inputData);
      if (!form.valid) {
        return false;
      }
    });
    return true;
  }

  initDefaultEmptyOutputs() {
    let emptyBaselineOutput: EnrichmentOutput = {
      outputData: {
        isBaseline: true,
        availableHeatInput: 0,
        annualFuelCost: 0,
        fuelConsumption: 0,
        fuelSavings: 0,
        annualCostSavings: 0
      }
    };
    let outputs: Array<EnrichmentOutput> = [emptyBaselineOutput];
    this.enrichmentOutputs.next(outputs);
  }

  calculate(settings: Settings) {
    let enrichmentInputs = JSON.parse(JSON.stringify(this.enrichmentInputs.getValue()));
    let validInputs: boolean = this.checkValidInputData(settings, enrichmentInputs);
    if (!validInputs) {
      this.initDefaultEmptyOutputs();
    } else {
      enrichmentInputs = this.setInputAdapter(enrichmentInputs);
      let enrichmentOutputs = [];
      enrichmentInputs.forEach((currentInput: EnrichmentInput, index) => {
        let rawResult: RawO2Output = this.phastService.o2Enrichment(currentInput.adapter, settings);
        let enrichmentOutput: EnrichmentOutput = {
          outputData: {
            name: currentInput.inputData.name,
            annualFuelCost: 0,
            availableHeatInput: 0,
            fuelConsumption: 0,
            fuelSavings: 0,
            annualCostSavings: 0
          }
        }
        if (currentInput.inputData.isBaseline) {
          enrichmentOutput.outputData.fuelConsumption = currentInput.inputData.fuelConsumption;
          enrichmentOutput.outputData.annualFuelCost = currentInput.inputData.fuelCost * currentInput.inputData.operatingHours * currentInput.inputData.fuelConsumption
          enrichmentOutput.outputData.availableHeatInput = rawResult.availableHeatInput
        } else {
          let baselineOutput = enrichmentOutputs[0].outputData;
          enrichmentOutput.outputData.availableHeatInput = rawResult.availableHeatEnriched;
          enrichmentOutput.outputData.annualFuelCost = currentInput.inputData.fuelCost * currentInput.inputData.operatingHours * rawResult.fuelConsumptionEnriched
          enrichmentOutput.outputData.fuelConsumption = rawResult.fuelConsumptionEnriched;
          enrichmentOutput.outputData.fuelSavings = rawResult.fuelSavingsEnriched;
          enrichmentOutput.outputData.annualCostSavings = baselineOutput.annualFuelCost - enrichmentOutput.outputData.annualFuelCost;
        }
        enrichmentOutput.inputData = currentInput.inputData;
        enrichmentOutputs.push(enrichmentOutput);
      });
      this.enrichmentOutputs.next(enrichmentOutputs);
    }
  }

  // Adapt display models to original input model (interface O2Enrichment)
  setInputAdapter(inputs: Array<EnrichmentInput>): Array<EnrichmentInput> {
    inputs.forEach((enrichmentInput: EnrichmentInput, index) => {
      let backendAdapter: SuiteInputAdapter;
      let baselineEnrichment: EnrichmentInput = inputs[0];
      if (enrichmentInput.inputData.isBaseline) {
        backendAdapter = {
          operatingHours: baselineEnrichment.inputData.operatingHours,
          operatingHoursEnriched: 0,
          o2CombAir: baselineEnrichment.inputData.o2CombAir,
          o2CombAirEnriched: 0,
          flueGasTemp: baselineEnrichment.inputData.flueGasTemp,
          flueGasTempEnriched: 0,
          o2FlueGas: baselineEnrichment.inputData.o2FlueGas,
          o2FlueGasEnriched: 0,
          combAirTemp: baselineEnrichment.inputData.combAirTemp,
          combAirTempEnriched: 0,
          fuelCost: baselineEnrichment.inputData.fuelCost,
          fuelCostEnriched: 0,
          fuelConsumption: baselineEnrichment.inputData.fuelConsumption,
        };
      } else {
        backendAdapter = {
          operatingHours: baselineEnrichment.inputData.operatingHours,
          operatingHoursEnriched: enrichmentInput.inputData.operatingHours,
          o2CombAir: baselineEnrichment.inputData.o2CombAir,
          o2CombAirEnriched: enrichmentInput.inputData.o2CombAir,
          flueGasTemp: baselineEnrichment.inputData.flueGasTemp,
          flueGasTempEnriched: enrichmentInput.inputData.flueGasTemp,
          o2FlueGas: baselineEnrichment.inputData.o2FlueGas,
          o2FlueGasEnriched: enrichmentInput.inputData.o2FlueGas,
          combAirTemp: baselineEnrichment.inputData.combAirTemp,
          combAirTempEnriched: enrichmentInput.inputData.combAirTemp,
          fuelCost: baselineEnrichment.inputData.fuelCost,
          fuelCostEnriched: enrichmentInput.inputData.fuelCost,
          fuelConsumption: baselineEnrichment.inputData.fuelConsumption,
        };
      }
      enrichmentInput.adapter = backendAdapter;
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
          flueGasTemp: tmpFlueGasTempEnriched,
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
          flueGasTemp: tmpFlueGasTempEnriched,
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
          flueGasTemp: tmpFlueGasTempEnriched,
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
          flueGasTemp: tmpFlueGasTempEnriched,
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
          flueGasTemp: tmpFlueGasTempEnriched,
          o2FlueGas: 5,
          combAirTemp: 600,
          fuelCost: settings.fuelCost,
        }
      },
    ];
    this.enrichmentInputs.next(exampleInputs);
    this.currentEnrichmentIndex.next(1);
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
      combAirTempEnrichedMax: modificationCombAirMax
    };
    return tmpO2EnrichmentMinMax;
  }

  getGraphData(settings: Settings, o2EnrichmentPoint: any, line: any): { data: TraceCoordinates, onGraph: boolean } {
    o2EnrichmentPoint = JSON.parse(JSON.stringify(o2EnrichmentPoint));
    line.fuelSavings = 0.0;
    let data = { x: [], y: [] };
    let onGraph = false;
    let returnObj: { data: TraceCoordinates, onGraph: boolean };
    let startingEnrichment = 21;
    for (let i = startingEnrichment; i <= 100; i += .5) {
      o2EnrichmentPoint.o2CombAirEnriched = i;
      let output = this.phastService.o2Enrichment(o2EnrichmentPoint, settings);
      let fuelSavings = output.fuelSavingsEnriched;
      if (fuelSavings > 0 && fuelSavings < 100) {
        if (fuelSavings > line.fuelSavings) {
          line.fuelSavings = fuelSavings;
        }
        onGraph = true;
        data.x.push(i);
        data.y.push(fuelSavings);
      } else {
        // Case has no y/savings
        if (!data.x.length && !data.y.length) {
          data.x.push(i);
          data.y.push(0);
        }
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
