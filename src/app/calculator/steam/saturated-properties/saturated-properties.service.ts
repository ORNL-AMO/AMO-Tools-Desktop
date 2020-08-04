import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SimpleChart, TraceData } from '../../../shared/models/plotting';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { IsothermData } from '../steam-isotherm-constants';
import { IsobarData } from '../steam-isobar-constants';
import { Settings } from '../../../shared/models/settings';
import { SaturatedPropertiesOutput } from '../../../shared/models/steam/steam-outputs';

@Injectable({
  providedIn: 'root'
})
export class SaturatedPropertiesService {

  entropyChart: BehaviorSubject<SimpleChart>;
  enthalpyChart: BehaviorSubject<SimpleChart>;

  isobarData;
  isobars: BehaviorSubject<Array<IsobarCoordinates>>;
  entropy: Array<number>;
  temperatures: Array<number>;
  
  isothermData;
  isotherms: BehaviorSubject<Array<IsothermCoordinates>>;
  vaporQualities: BehaviorSubject<Array<IsothermCoordinates>>;
  enthalpy: Array<number>;
  pressures: Array<number>;

  constructor(private convertUnitsService: ConvertUnitsService) { }

  initEntropyChartData() {
    this.initEntropyChartConstants();
    let emptyChart: SimpleChart = this.getEmptyChart();
    this.entropyChart = new BehaviorSubject<SimpleChart>(emptyChart);
  }

  initEnthalpyChartData() {
    this.initEnthalpyChartConstants();
    let emptyChart: SimpleChart = this.getEmptyChart();
    this.enthalpyChart = new BehaviorSubject<SimpleChart>(emptyChart);
  }

  initEntropyChartConstants() {
    // Isobar Data corresponds to Entropy (TS) chart
    this.isobarData = JSON.parse(JSON.stringify(IsobarData));
    this.isobars = new BehaviorSubject<Array<IsobarCoordinates>>(this.isobarData.coordinates);
    this.entropy = this.isobarData.entropy
    this.temperatures = this.isobarData.temperature;
  }


  initEnthalpyChartConstants() {
    // Isotherm Data corresponds to Enthalpy (PH) chart
    this.isothermData = JSON.parse(JSON.stringify(IsothermData));
    this.isotherms = new BehaviorSubject<Array<IsothermCoordinates>>(this.isothermData.coordinates);
    this.vaporQualities = new BehaviorSubject<Array<IsothermCoordinates>>(this.isothermData.vaporQualities);
    this.enthalpy = this.isothermData.enthalpy
    this.pressures = this.isothermData.pressure;

  }

  setEntropyChartConfig(settings: Settings) {
    let chart = this.entropyChart.getValue();
    let temperatureUnit = this.convertUnitsService.getUnit(settings.steamTemperatureMeasurement).unit.name.display;
    let entropyUnit = this.convertUnitsService.getUnit(settings.steamSpecificEntropyMeasurement).unit.name.display;
    chart.layout.xaxis.title.text = `Entropy ${entropyUnit}`;
    chart.layout.yaxis.title.text = `Temperature ${temperatureUnit}`;
    // Set range from constants - isobars will skew the autorange
    chart.layout.yaxis.range = this.isobarData.ranges[settings.steamTemperatureMeasurement].y;
    chart.layout.xaxis.autorange = true;
    this.entropyChart.next(chart);
  }

  setEnthalpyChartConfig(settings: Settings) {
    let chart = this.enthalpyChart.getValue();
    let pressureUnit = this.getDisplayUnit(settings.steamPressureMeasurement);
    let enthalpyUnit = this.getDisplayUnit(settings.steamSpecificEnthalpyMeasurement);
    chart.layout.xaxis.title.text = `Enthalpy ${enthalpyUnit}`;
    chart.layout.yaxis.title.text = `Pressure ${pressureUnit}`;
    chart.layout.xaxis.range = this.isothermData.ranges[settings.steamSpecificEnthalpyMeasurement].x;
    
    chart.layout.yaxis.type ='log';
    chart.layout.yaxis.autorange = true;
    chart.layout.yaxis.rangemode = 'normal';
    chart.layout.yaxis.tickmode = 'array';
    chart.layout.yaxis.tickvals = this.isothermData.logTicks;
    this.enthalpyChart.next(chart);
  }

  getDisplayUnit(unit: string) {
    return this.convertUnitsService.getUnit(unit).unit.name.display;
  }

  getHoverTemplate(xMeasure: string, yMeasure: string, isEntropyChart) {
    let xDisplayUnit = this.getDisplayUnit(xMeasure);
    let yDisplayUnit = this.getDisplayUnit(yMeasure);
    if (isEntropyChart) {
      return `Entropy ${xDisplayUnit}: %{x:.2r}<br>Temperature ${yDisplayUnit}: %{y:.2r}`
    } else {
      return `Enthalpy ${xDisplayUnit}: %{x:.2r}<br>Pressure ${yDisplayUnit}: %{y:.2r}`;
    }
  }

  getEmptyChart(): SimpleChart {
    let showGrid = true;
    return {
      name: 'Steam Properties',
      data: [],
      layout: {
        hovermode: 'closest',
        xaxis: {
          autorange: false,
          type: 'auto',
          showgrid: showGrid,
          title: {
            text: `Entropy (Btu/lb F)`
          },
          showticksuffix: 'all',
        },
        yaxis: {
          autorange: false,
          type: 'auto',
          showgrid: showGrid,
          showticksuffix: 'all',
          title: {
            text: `Temperature (F)`
          },
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
      existingPoint: false
    };
  }
  
  getEmptyTrace(): TraceData {
    let trace: TraceData = {
      x: [],
      y: [],
      name: '',
      showlegend: false,
      type: 'scatter',
      mode: 'lines',
      hovertemplate: '',
      line: {
        shape: 'spline',
        color: '#FFA500',
        width: 1,
      },
    };
    return trace;
  }

  getPointTrace(): TraceData {
    let trace: TraceData = {
      x: [],
      y: [],
      type: 'scatter',
      name: '',
      showlegend: false,
      hovertemplate: ``,
      mode: 'markers',
      marker: {
        color: '',
        size: 12,
        line: {
          color: '',
          width: 4
        }
      },
    }
    return trace;
  }

  getLineTrace(x, y): TraceData {
    let trace: TraceData = {
      x: x,
      y: y,
      type: 'scatter',
      name: '',
      showlegend: false,
      hovertemplate: ``,
      mode: 'lines+markers',
      marker: {
        color: '',
        size: 10,
        line: {
          color: '',
          width: 4
        }
      },
    }
    return trace;
  }
}


export interface IsobarCoordinates {
  temp: number[],
  entropy: number[],
  pressureValue: number
}

export interface IsothermCoordinates {
  pressure: number[],
  enthalpy: number[],
  temperature: number
}