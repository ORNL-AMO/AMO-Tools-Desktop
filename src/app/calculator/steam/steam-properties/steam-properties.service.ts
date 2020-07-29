import { Injectable } from '@angular/core';
import { SimpleChart, TraceData } from '../../../shared/models/plotting';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { IsobarData} from './steam-properties-constants';

@Injectable({
  providedIn: 'root'
})
export class SteamPropertiesService {

  propertiesChart: BehaviorSubject<SimpleChart>;
  isobars: BehaviorSubject<Array<IsobarCoordinates>>;
  entropy: Array<number>;
  temperatures: Array<number>;
  isobarData;

  constructor(private convertUnitsService: ConvertUnitsService) { }

  initChartData() {
    this.isobarData = JSON.parse(JSON.stringify(IsobarData))
    let isobars = this.isobarData.coordinates;
    this.isobars = new BehaviorSubject<Array<IsobarCoordinates>>(isobars);

    this.entropy = this.isobarData.entropy
    this.temperatures = this.isobarData.temperature;
    let emptyChart: SimpleChart = this.getEmptyChart();
    this.propertiesChart = new BehaviorSubject<SimpleChart>(emptyChart);
  }

  convertIsobarTemperature(settings: Settings, defaultTempUnit) {
      let isobars = this.isobars.getValue();
      this.temperatures = this.convertArray(this.temperatures, defaultTempUnit, settings.steamTemperatureMeasurement);
      isobars.map((line: IsobarCoordinates) => {
        line.temp = this.convertArray(line.temp, defaultTempUnit, settings.steamTemperatureMeasurement);
      });
      this.isobars.next(isobars);
  }

  convertIsobarEntropy(settings: Settings, defaultEntropyUnit) {
      let isobars = this.isobars.getValue();
      this.entropy = this.convertArray(this.entropy, defaultEntropyUnit, settings.steamSpecificEntropyMeasurement);
      isobars.map((line: IsobarCoordinates) => {
        line.entropy = this.convertArray(line.entropy, defaultEntropyUnit, settings.steamSpecificEntropyMeasurement);
      });
      this.isobars.next(isobars);
  }

  convertIsobarPressure(settings: Settings, defaultPressureUnit) {
    let isobars = this.isobars.getValue();
    isobars.map((line: IsobarCoordinates) => {
      let converted = this.convertVal(line.pressureValue, defaultPressureUnit, settings.steamPressureMeasurement);
      converted = this.roundVal(converted, 2);
      line.pressureValue = converted;

    });
    this.isobars.next(isobars);
}
  convertArray(oldArray: Array<number>, from: string, to: string): Array<number> {
    let convertedArray = new Array<number>();
    for (let i = 0; i < oldArray.length; i++) {
      convertedArray.push(this.convertVal(oldArray[i], from, to));
    }

    return convertedArray;
  }

  convertVal(val: number, from: string, to: string) {
    if (val !== undefined) {
      val = this.convertUnitsService.value(val).from(from).to(to);
    }

    return val;
  }
  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  setChartConfig(settings: Settings) {
    let chart = this.propertiesChart.getValue();
    let temperatureUnit = this.convertUnitsService.getUnit(settings.steamTemperatureMeasurement).unit.name.display;
    let entropyUnit = this.convertUnitsService.getUnit(settings.steamSpecificEntropyMeasurement).unit.name.display;
    chart.layout.xaxis.title.text = `Entropy ${entropyUnit}`;
    chart.layout.yaxis.title.text = `Temperature ${temperatureUnit}`;

    if (settings.unitsOfMeasure == 'Metric') {
      chart.layout.xaxis.range = this.isobarData.ranges.metric.x;
      chart.layout.yaxis.range = this.isobarData.ranges.metric.y;
    }
    this.propertiesChart.next(chart);
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
          range: this.isobarData.ranges.imperial.x,
          showgrid: showGrid,
          title: {
            text: `Entropy (Btu/lb F)`
          },
          showticksuffix: 'all',
        },
        yaxis: {
          autorange: false,
          range: this.isobarData.ranges.imperial.y,
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
      name: `Saturated Point`,
      showlegend: false,
      hovertemplate: `Saturated Point`,
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


}


export interface IsobarCoordinates {
  temp: number[],
  entropy: number[],
  pressureValue: number
}