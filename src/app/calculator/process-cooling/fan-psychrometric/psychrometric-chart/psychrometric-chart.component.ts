import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { PlotlyService } from 'angular-plotly.js';
import { TraceData, TraceCoordinates, SimpleChart, DataPoint } from '../../../../shared/models/plotting';
import { PsychrometricResults, BaseGasDensity } from '../../../../shared/models/fans';
import { Subscription } from 'rxjs';
import { FanPsychrometricService } from '../fan-psychrometric.service';

  const c8 = -1.0440397e4;
  const c9 = -1.129465e1;
  const c10 = -2.7022355e-2;
  const c11 = 1.289036e-5;
  const c12 = -2.4780681e-9;
  const c13 = 6.5459673;

@Component({
  selector: 'app-psychrometric-chart',
  templateUrl: './psychrometric-chart.component.html',
  styleUrls: ['./psychrometric-chart.component.css']
})
  

export class PsychrometricChartComponent implements OnInit {
  @ViewChild('psychrometricChart', {static: false}) psychrometricChart: ElementRef;

  

  psychrometricResults: PsychrometricResults;
  calculatedBaseGasDensitySubscription: Subscription;

  constructor(private plotlyService: PlotlyService, private psychrometricService: FanPsychrometricService) { }

  ngOnInit(): void {
    this.calculatedBaseGasDensitySubscription = this.psychrometricService.calculatedBaseGasDensity.subscribe(results => {
      this.psychrometricResults = results;
      if (results) {
        debugger;
        let inputData: BaseGasDensity = this.psychrometricService.baseGasDensityData.getValue();
        this.psychrometricResults.barometricPressure = inputData.barometricPressure;
        this.psychrometricResults.dryBulbTemp = inputData.dryBulbTemp;
      }
    });
  }

  ngAfterViewInit() {
    this.drawChart();
    window.dispatchEvent(new Event("resize"));
  }


  drawChart() {
    let traceData:Array<TraceData> = new Array();
    if (this.psychrometricChart) {

      // let xData1: Array<number> = [40, 55];
      // let yData1: Array<number> = [.006, .012];

      // let traceOne: TraceData = this.getTrace(xData1, yData1, 'this is trace one', '#1f77b4', 'solid');
      // traceData.push(traceOne);

      let trace1 = {
        x: [45, 60, 70],
        y: [.006, .010, .016],
        name: "using normal bottom x-axis",
        type: "scatter",
      };

      let trace2 = {
        x: [55, 75, 90],
        y: [.004, .014, .020],
        name: "using top x-axis",
        xaxis: "x2",
        type: "scatter",
      };
      traceData.push(trace1);
      traceData.push(trace2);
      let data = [trace1, trace2];

      let layoutWithSecondXAxis = {
        yaxis: { title: "yaxis title" },
        xaxis2: {
          title: "xaxis2 title",
          titlefont: { color: "rgb(148, 103, 189)" },
          tickfont: { color: "rgb(148, 103, 189)" },
          overlaying: "x",
          side: "top",
        },
      };
  

      let layout = {
        legend: {
          orientation: 'h',
          font: {
            size: 12,
          },
          x: 0,
          y: -.25
        },
        hovermode: 'x',
        xaxis: {
          autorange: false,
          showgrid: false,
          title: {
            text:"Dry Bulb Temperature (F)"
          },
          showticksuffix: 'all',
          tickangle: 0,
          tickmode: 'array',
          hoverformat: '%{x}%',
          range: [35, 130],
          tickvals: [35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130],
        },
        xaxis2: {
          autorange: false,
          showgrid: false,
          title: {
            text:"Wet Bulb (F)"
          },
          side: 'top',
          overlaying: 'x',
          xaxis: 'x2',
          showticksuffix: 'all',
          tickmode: 'array',
          hoverformat: '%{x}%',
          range: [30, 130],
          tickvals: [30, 40, 50 , 60, 70, 80, 90, 100, 110, 120, 130]
          // tickvals: [35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130],
        },
        yaxis: {
          autorange: true,
          type: 'linear',
          showgrid: false,
          side: 'right',
          title: {
            text: "Humidity Ratio(Lbv/Lba)"
          },
          range: [0, 0.1],
          tickvals: [0, 0.004, 0.008, 0.012, 0.016, 0.020, 0.024, 0.028],
          //ticktext: ['0', '20%', '40%', '60%', '80%', '100%', '120%'],
          rangemode: 'tozero',
          showticksuffix: 'all'
        },
        margin: {
          t: 50,
          b: 75,
          l: 75,
          r: 50
        }
      }
      var config = {
        responsive: true,
        displaylogo: false
      };
      this.plotlyService.newPlot(this.psychrometricChart.nativeElement, traceData, layout, config);

  
    
    } else {
        let xData1: Array<number> = [20, 40, 60, 80, 10, 30, 140];
        let yData1: Array<number> = [.004, .008, .012, .016, .020, .024, .028];
        let trace2: TraceData = this.getTrace(xData1, yData1, 'this is trace 2', '#1f77b4', 'soild');
        traceData.push(trace2);
      }

    let layout = {
      legend: {
        orientation: 'h',
        font: {
          size: 12,
        },
        x: 0,
        y: -.25
      },
      hovermode: 'x',
      xaxis: {
        autorange: false,
        showgrid: false,
        title: {
          text:"Drey Bulb Temperature (F)"
        },
        showticksuffix: 'all',
        tickangle: 0,
        tickmode: 'array',
        hoverformat: '%{x}%',
        range: [35, 130],
        tickvals: [35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130],
      },
      xaxis2: {
        autorange: false,
        showgrid: false,
        title: {
          text:"Wet Bulb (F)"
        },
        side: 'left',
        anchor: 'free',
        overlaying: 'x',
        xaxis: 'x2',
        showticksuffix: 'all',
        tickmode: 'array',
        hoverformat: '%{x}%',
        range: [30, 130],
        tickvals: [30, 40, 50 , 60, 70, 80, 90, 100, 110, 120, 130]
        // tickvals: [35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130],
      },
      yaxis: {
        autorange: true,
        type: 'linear',
        showgrid: false,
        side: 'right',
        title: {
          text: "Humidity Ratio(Lbv/Lba)"
        },
        range: [0, 0.1],
        tickvals: [0, 0.004, 0.008, 0.012, 0.016, 0.020, 0.024, 0.028],
        //ticktext: ['0', '20%', '40%', '60%', '80%', '100%', '120%'],
        rangemode: 'tozero',
        showticksuffix: 'all'
      },
      margin: {
        t: 50,
        b: 75,
        l: 75,
        r: 50
      }
    }
    var config = {
      responsive: true,
      displaylogo: false
    };
    // this.plotlyService.newPlot(this.psychrometricChart.nativeElement, traceData, layout, config);
  } 

  // drawLines() {
  //   let
  //   isotherms.forEach((line: IsothermCoordinates) => {
  //     let trace = this.saturatedPropertiesService.getEmptyTrace();
  //     trace.x = line.enthalpy;
  //     trace.y = line.pressure;
  //     let temperatureUnit = this.saturatedPropertiesService.getDisplayUnit(this.settings.steamTemperatureMeasurement);
  //     trace.hovertemplate = `Isotherm ${line.temperature} ${temperatureUnit}`;
  //     this.enthalpyChart.data.push(trace);
  //   });
  // }

  getTrace(xData: Array<number>, yData: Array<number>, name: string, color: string, dash: string): TraceData {
    let trace: TraceData = {
      x: xData.map(data => { return data }),
      y: yData.map(data => { return data }),
      type: 'scatter',
      name: name,
      hovertemplate: "(Dry bulb temp: %{x:.2f} F, Humidity ratio: %{y:.2f} Lbv/Lba<extra></extra>",
      mode: 'lines',
      line: {
        shape: 'spline',
        dash: dash,
        color: color
      },
      marker: {
        size: 12,
      },
      fillcolor: color
    };

    return trace;

  }

  
}
