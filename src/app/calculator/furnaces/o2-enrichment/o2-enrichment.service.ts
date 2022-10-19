import { Injectable } from '@angular/core';
import { EnrichmentOutput, EnrichmentInput, EnrichmentInputData, RawO2Output, SuiteInputAdapter } from '../../../shared/models/phast/o2Enrichment';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { PhastService } from '../../../phast/phast.service';
import { OperatingHours } from '../../../shared/models/operations';
import { SelectedDataPoint, SimpleChart, TraceData, TraceCoordinates } from '../../../shared/models/plotting';
import { BehaviorSubject } from 'rxjs';
import { O2EnrichmentFormService } from './o2-enrichment-form.service';

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

  constructor(private phastService: PhastService, 
              private o2FormService: O2EnrichmentFormService) {
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
    let defaultBaseline: EnrichmentInputData = this.o2FormService.getResetData();
    let baselineInput: EnrichmentInput = {
      inputData: defaultBaseline
    }
    let emptyEnrichmentInput: Array<EnrichmentInput> = [baselineInput];
    this.enrichmentInputs.next(emptyEnrichmentInput);
  }

  addModification(form: UntypedFormGroup) {
    let enrichmentCopy = this.o2FormService.getObjFromForm(form);
    enrichmentCopy.name = 'Modification';
    enrichmentCopy.isBaseline = false;
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
    let updatedChart = this.enrichmentChart.getValue();
    updatedChart.removeIndex = currentIndex;
    this.enrichmentChart.next(updatedChart);

    this.enrichmentInputs.next(enrichmentInputs);
    this.currentEnrichmentIndex.next(currentIndex - 1);
  }

  checkValidInputData(settings, inputs: Array<EnrichmentInput>): boolean {
    inputs.forEach(input => {
      let form = this.o2FormService.initFormFromObj(settings, input.inputData);
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
      enrichmentInputs.forEach((currentInput: EnrichmentInput) => {
        let rawResult: RawO2Output = this.phastService.o2Enrichment(currentInput.adapter, settings);
        let currentOutput: EnrichmentOutput = {
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
          currentOutput.outputData.fuelConsumption = currentInput.inputData.fuelConsumption;
          currentOutput.outputData.annualFuelCost = currentInput.inputData.fuelCost * currentInput.inputData.operatingHours * currentInput.inputData.fuelConsumption;
          currentOutput.outputData.availableHeatInput = rawResult.availableHeatInput;
        } else {
          let baselineOutput = enrichmentOutputs[0].outputData;
          currentOutput.outputData.availableHeatInput = rawResult.availableHeatEnriched;
          currentOutput.outputData.annualFuelCost = currentInput.inputData.fuelCost * currentInput.inputData.operatingHours * rawResult.fuelConsumptionEnriched;
          currentOutput.outputData.fuelConsumption = rawResult.fuelConsumptionEnriched;
          currentOutput.outputData.fuelSavings = rawResult.fuelSavingsEnriched;
          currentOutput.outputData.annualCostSavings = baselineOutput.annualFuelCost - currentOutput.outputData.annualFuelCost;
        }
        currentOutput.inputData = currentInput.inputData;
        enrichmentOutputs.push(currentOutput);
      });
      this.enrichmentOutputs.next(enrichmentOutputs);
    }
  }

  // Adapt display models to original input model (interface O2Enrichment)
  setInputAdapter(inputs: Array<EnrichmentInput>): Array<EnrichmentInput> {
    inputs.forEach((enrichmentInput: EnrichmentInput) => {
      let suiteInputAdapter: SuiteInputAdapter;
      let baselineEnrichment: EnrichmentInput = inputs[0];
      if (enrichmentInput.inputData.isBaseline) {
        suiteInputAdapter = {
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
        suiteInputAdapter = {
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
      enrichmentInput.adapter = suiteInputAdapter;
    });
    return inputs;
  }

  getGraphData(settings: Settings, inputData: EnrichmentInputData, selectedAxis: number): {data: TraceCoordinates, xAxis: Axis} {
    let graphData: TraceCoordinates = {x: [], y: []};
    let line = this.getEnrichmentLine(inputData);
    let point = this.getEnrichmentPoint(inputData, line);
    let xAxis: Axis = this.getAxis(point, selectedAxis, settings);

    line.fuelSavings = 0.0;
    for (let i = xAxis.axisStartValue; i <= xAxis.termination; i += xAxis.increment) {
      point[xAxis.propertyName] = i;
      let output = this.phastService.o2Enrichment(point, settings);
      let fuelSavings = output.fuelSavingsEnriched;
      if (fuelSavings > 0 && fuelSavings < 100) {
        if (fuelSavings > line.fuelSavings) {
          line.fuelSavings = fuelSavings;
        }
        graphData.x.push(i);
        graphData.y.push(fuelSavings);
      } else {
        // iteration has no y/savings
        if (!graphData.x.length && !graphData.y.length) {
          graphData.x.push(i);
          graphData.y.push(0);
        }
      }
    }
    return {data: graphData, xAxis: xAxis};  
  }

  getAxis(point, selectedAxis: number, settings: Settings): Axis {
    let temperatureUnit = '&#8457;';
    if (settings.unitsOfMeasure == 'Metric') {
      temperatureUnit = '&#8451;';
    }
    let axes: { [selected: number]: Axis } = {
      0: {
        propertyName: "o2CombAirEnriched",
        pointPropertyName: "o2CombAir",
        hoverTemplate: `O<sub>2</sub> in Air: %{x:.2r}%<br>Fuel Savings: %{y:.1r}%<br>`,
        propertyStartValue: point.o2CombAirEnriched,
        axisStartValue: 21,
        increment: 0.5,
        termination: 100,
        title: 'O<sub>2</sub> in Air (%)'
      },
      1: {
        propertyName: "combAirTempEnriched",
        pointPropertyName: "combAirTemp",
        hoverTemplate: `Combustion Air Preheat Temperature: %{x:.2r} ${temperatureUnit}<br>Fuel Savings: %{y:.1r}%<br>`,
        propertyStartValue: point.combAirTempEnriched,
        axisStartValue: 50,
        increment: 10,
        termination: 2000,
        title: 'Combustion Air Preheat Temperature'

      },
      2: {
        propertyName: "flueGasTempEnriched",
        pointPropertyName: "flueGasTemp",
        hoverTemplate: `Flue Gas Temperature: %{x:.2r} ${temperatureUnit}<br>Fuel Savings: %{y:.1r}%<br>`,
        propertyStartValue: point.flueGasTempEnriched,
        axisStartValue: 100,
        increment: 10,
        termination: 3000,
        title: 'Flue Gas Temperature'

      },
      3: {
        propertyName: "o2FlueGasEnriched",
        pointPropertyName: "o2FlueGas",
        hoverTemplate: `O<sub>2</sub> in Flue Gases: %{x:.2r}%<br>Fuel Savings: %{y:.1r}%<br>`,
        propertyStartValue: point.o2FlueGasEnriched,
        axisStartValue: 0,
        increment: 0.1,
        // increment: 0.5,
        termination: 20,
        title: 'O<sub>2</sub> in Flue Gases'

      },
    };
    return axes[selectedAxis];
  }

  getEnrichmentLine(input: EnrichmentInputData) {
    let baselineInput
    if (!input.isBaseline) {
      let enrichmentInputs = this.enrichmentInputs.getValue();
      baselineInput = enrichmentInputs[0].inputData;
    } else {
      baselineInput = input;
    }
    let line = {
      o2CombAir: baselineInput.o2CombAir,
      o2CombAirEnriched: input.o2CombAir,
      flueGasTemp: baselineInput.flueGasTemp,
      flueGasTempEnriched: input.flueGasTemp,
      o2FlueGas: baselineInput.o2FlueGas,
      o2FlueGasEnriched: input.o2FlueGas,
      combAirTemp: baselineInput.combAirTemp,
      combAirTempEnriched: input.combAirTemp,
      fuelConsumption: baselineInput.fuelConsumption,
      fuelSavings: 0
    };
    return line;
  }

  getEnrichmentPoint(input: EnrichmentInputData, currentEnrichmentLine) {
    let baselineInput
    if (!input.isBaseline) {
      let enrichmentInputs = this.enrichmentInputs.getValue();
      baselineInput = enrichmentInputs[0].inputData;
    } else {
      baselineInput = input;
    }
    let point = {
      operatingHours: baselineInput.operatingHours,
      operatingHoursEnriched: input.operatingHours,
      o2CombAir: baselineInput.o2CombAir,
      o2CombAirEnriched: input.o2CombAir,
      flueGasTemp: baselineInput.flueGasTemp,
      flueGasTempEnriched: currentEnrichmentLine.flueGasTempEnriched,
      o2FlueGas: baselineInput.o2FlueGas,
      o2FlueGasEnriched: currentEnrichmentLine.o2FlueGasEnriched,
      combAirTemp: baselineInput.combAirTemp,
      combAirTempEnriched: currentEnrichmentLine.combAirTempEnriched,
      fuelConsumption: baselineInput.fuelConsumption,
      fuelCost: baselineInput.fuelCost,
      fuelCostEnriched: input.fuelCost
    };
    return point;
  }

  getLineTrace(): TraceData {
    let trace: TraceData = {
      x: [],
      y: [],
      name: '',
      showlegend: true,
      type: 'scatter',
      hovertemplate: `O<sub>2</sub> in Air: %{x}%<br>Fuel Savings: %{y:.2r}%<br>`,
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
      hovertemplate: `O<sub>2</sub> in Air: %{x}%<br>Fuel Savings: %{y:.2r}%<br>`,
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
          range: [20, 40, 60, 80, 100],
          showticksuffix: 'all',
          tickangle: -60
        },
        yaxis: {
          autorange: true,
          type: 'auto',
          showgrid: showGrid,
          title: {
            text: "Fuel Savings (%)"
          },
          showticksuffix: 'all'
        },
        margin: {
          t: 50,
          b: 50,
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
      inputCount: 0,
      removeIndex: undefined
    };
  }

}

export interface DisplayPoint extends SelectedDataPoint {
  combAirTemp: number,
  o2FlueGas: number,
  flueGasTemp: number,
  name?: string
}

export interface Axis {
  propertyName: string,
  pointPropertyName: string,
  hoverTemplate: string,
  propertyStartValue: number,
  axisStartValue: number,
  increment: number,
  termination: number,
  title: string,
}
