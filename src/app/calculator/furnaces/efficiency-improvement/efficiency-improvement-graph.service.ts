import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PhastService } from '../../../phast/phast.service';
import { EfficiencyImprovementInputs } from '../../../shared/models/phast/efficiencyImprovement';
import { SelectedDataPoint, SimpleChart, TraceCoordinates, TraceData } from '../../../shared/models/plotting';
import { Settings } from '../../../shared/models/settings';

@Injectable({
  providedIn: 'root'
})
export class EfficiencyImprovementGraphService {

  efficiencyChart: BehaviorSubject<SimpleChart>;
  selectedDataPoints: BehaviorSubject<Array<DisplayPoint>>;
  constructor(private phastService: PhastService) { }

  initChartData() {
    let emptyChart: SimpleChart = this.getEmptyChart();
    let dataPoints = new Array<DisplayPoint>();
    this.efficiencyChart = new BehaviorSubject<SimpleChart>(emptyChart);
    this.selectedDataPoints = new BehaviorSubject<Array<DisplayPoint>>(dataPoints);
  }

  getGraphData(settings: Settings, inputData: EfficiencyImprovementInputs, selectedAxis: number, isBaseline: boolean): {data: TraceCoordinates, xAxis: Axis} {
    let graphData: TraceCoordinates = {x: [], y: []};
    inputData.fuelCost = settings.fuelCost;
    inputData.currentO2CombAir = 21;
    inputData.newO2CombAir = 21;
    let line = this.getEnrichmentLine(inputData, isBaseline);
    let point = this.getEnrichmentPoint(inputData, isBaseline);
    let xAxis: Axis = this.getAxis(point, selectedAxis, settings);
    line.fuelSavings = 0.0;

    if (selectedAxis == 0) {
      xAxis.termination = Math.max(inputData.currentFlueGasTemp, inputData.newFlueGasTemp);
    }

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
        propertyName: "combAirTempEnriched",
        pointPropertyName: "currentCombustionAirTemp",
        pointModificationName: "newCombustionAirTemp",
        hoverName: "combAirTemp",
        hoverTemplate: `Combustion Air Preheat Temperature: %{x:.2r} ${temperatureUnit}<br>Fuel Savings: %{y:.1r}%<br>`,
        propertyStartValue: point.combAirTempEnriched,
        axisStartValue: 0,
        increment: 10,
        termination: 2000,
        title: 'Combustion Air Preheat Temperature'

      },
      1: {
        propertyName: "flueGasTempEnriched",
        pointPropertyName: "currentFlueGasTemp",
        pointModificationName: "newFlueGasTemp",
        hoverName: "flueGasTemp",
        hoverTemplate: `Flue Gas Temperature: %{x:.2r} ${temperatureUnit}<br>Fuel Savings: %{y:.1r}%<br>`,
        propertyStartValue: point.flueGasTempEnriched,
        axisStartValue: 100,
        increment: 10,
        termination: 3000,
        title: 'Flue Gas Temperature'

      },
      2: {
        propertyName: "o2FlueGasEnriched",
        pointPropertyName: "currentFlueGasOxygen",
        pointModificationName: "newFlueGasOxygen",
        hoverName: "o2FlueGas",
        hoverTemplate: `O<sub>2</sub> in Flue Gases: %{x:.2r}%<br>Fuel Savings: %{y:.2r}%<br>`,
        propertyStartValue: point.o2FlueGasEnriched,
        axisStartValue: 0,
        increment: 0.1,
        termination: 20,
        title: 'O<sub>2</sub> in Flue Gases'

      },
    };
    return axes[selectedAxis];
  }

  getEnrichmentLine(input: EfficiencyImprovementInputs, isBaseline: boolean) {
    let line;
    if (!isBaseline) {
      line = {
        o2CombAir: input.currentO2CombAir,
        o2CombAirEnriched: input.newO2CombAir,
        flueGasTemp: input.currentFlueGasTemp,
        flueGasTempEnriched: input.newFlueGasTemp,
        o2FlueGas: input.currentFlueGasOxygen,
        o2FlueGasEnriched: input.newFlueGasOxygen,
        combAirTemp: input.currentCombustionAirTemp,
        combAirTempEnriched: input.newCombustionAirTemp,
        fuelConsumption: input.currentEnergyInput,
        fuelSavings: 0
      };
    } else {
      // use baseline values for current and new/mod
      line = {
        o2CombAir: input.currentO2CombAir,
        o2CombAirEnriched: input.currentO2CombAir,
        flueGasTemp: input.currentFlueGasTemp,
        flueGasTempEnriched: input.currentFlueGasTemp,
        o2FlueGas: input.currentFlueGasOxygen,
        o2FlueGasEnriched: input.currentFlueGasOxygen,
        combAirTemp: input.currentCombustionAirTemp,
        combAirTempEnriched: input.currentCombustionAirTemp,
        fuelConsumption: input.currentEnergyInput,
        fuelSavings: 0
      };
    }
    return line;
  }

  getEnrichmentPoint(input: EfficiencyImprovementInputs, isBaseline: boolean) {
    let point;
    if (!isBaseline) {
      point = {
        operatingHours: input.currentOperatingHours,
        operatingHoursEnriched: input.newOperatingHours,
        o2CombAir: input.currentO2CombAir,
        o2CombAirEnriched: input.newO2CombAir,
        flueGasTemp: input.currentFlueGasTemp,
        flueGasTempEnriched: input.newFlueGasTemp,
        o2FlueGas: input.currentFlueGasOxygen,
        o2FlueGasEnriched: input.newFlueGasOxygen,
        combAirTemp: input.currentCombustionAirTemp,
        combAirTempEnriched: input.newCombustionAirTemp,
        fuelConsumption: input.currentEnergyInput,
        fuelCost: input.fuelCost,
        fuelCostEnriched: input.fuelCost
      };
    } else {
      // use baseline values for current and new/mod
      point = {
        operatingHours: input.currentOperatingHours,
        operatingHoursEnriched: input.currentOperatingHours,
        o2CombAir: input.currentO2CombAir,
        o2CombAirEnriched: input.currentO2CombAir,
        flueGasTemp: input.currentFlueGasTemp,
        flueGasTempEnriched: input.currentFlueGasTemp,
        o2FlueGas: input.currentFlueGasOxygen,
        o2FlueGasEnriched: input.currentFlueGasOxygen,
        combAirTemp: input.currentCombustionAirTemp,
        combAirTempEnriched: input.currentCombustionAirTemp,
        fuelConsumption: input.currentEnergyInput,
        fuelCost: input.fuelCost,
        fuelCostEnriched: input.fuelCost
      };
    }
    return point;
  }

  getLineTrace(): TraceData {
    let trace: TraceData = {
      x: [],
      y: [],
      name: '',
      showlegend: true,
      type: 'scatter',
      hovertemplate: ``,
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
      hovertemplate: ``,
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
      name: 'Efficiency Improvement',
      data: [],
      layout: {
        hovermode: 'closest',
        xaxis: {
          autorange: true,
          type: 'linear',
          showgrid: showGrid,
          showspikes: true,
          spikemode: 'across',
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
  pointModificationName: string,
  hoverName: string,
  hoverTemplate: string,
  propertyStartValue: number,
  axisStartValue: number,
  increment: number,
  termination: number,
  title: string,
}
