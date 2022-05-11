
import { Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PlotlyService } from 'angular-plotly.js';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SimpleChart, TraceData } from '../../../../shared/models/plotting';
import { Settings } from '../../../../shared/models/settings';
import { FanPsychrometricService } from '../fan-psychrometric.service';
import { Subscription } from 'rxjs';
import { BaseGasDensity, PsychrometricResults } from '../../../../shared/models/fans';
import { GasDensityFormService } from '../../../fans/fan-analysis/fan-analysis-form/gas-density-form/gas-density-form.service';

@Component({
  selector: 'app-fan-psychrometric-chart',
  templateUrl: './fan-psychrometric-chart.component.html',
  styleUrls: ['./fan-psychrometric-chart.component.css']
})
export class FanPsychrometricChartComponent implements OnInit {

  @Input()
  gasDensityForm: FormGroup;

  @Input()
  settings: Settings;

  @ViewChild("expandedChartDiv", { static: false }) expandedChartDiv: ElementRef;
  @ViewChild("panelChartDiv", { static: false }) panelChartDiv: ElementRef;
  ngChartContainer: ElementRef;
  chart: SimpleChart;

  psychrometricResults: PsychrometricResults;
  calculatedBaseGasDensitySubscription: Subscription;
  inputData: BaseGasDensity;
  expanded: boolean = false;
  hoverBtnExpand: boolean;
  displayExpandTooltip: boolean;
  hoverBtnCollapse: boolean;
  displayCollapseTooltip: boolean;
  temperatureUnits: string = 'F';
  useImperialUnits: boolean = true;
  lineCreationData: LineCreationData = ImperialLineData;

  constructor(private plotlyService: PlotlyService, private psychrometricService: FanPsychrometricService, private convertUnitsService: ConvertUnitsService,
    private gasDensityFormService: GasDensityFormService) { }

  ngOnInit() {
    this.triggerInitialResize();
    this.setChartUnits();
    this.calculatedBaseGasDensitySubscription = this.psychrometricService.calculatedBaseGasDensity.subscribe(results => {
      this.psychrometricResults = results;
      this.inputData = this.psychrometricService.baseGasDensityData.getValue();
      this.initRenderChart();
    });
  }


  ngOnDestroy() {
    this.calculatedBaseGasDensitySubscription.unsubscribe();
  }


  initRenderChart() {
    this.chart = this.getEmptyChart();
    let form: FormGroup = this.gasDensityFormService.getGasDensityFormFromObj(this.inputData, this.settings);
    if (form.valid && this.psychrometricResults) {
      let blueTraces: Array<TraceData> = this.addBlueTraces();
      this.addRedTraces();
      this.addTopAxisTrace(blueTraces[blueTraces.length - 1]);
      this.addVerticalGridLines(blueTraces[blueTraces.length - 1]);
      if (this.inputData.dryBulbTemp && this.psychrometricResults && this.psychrometricResults.humidityRatio !== undefined) {
        this.addUserPoint(blueTraces[blueTraces.length - 1]);
      }
    }
    
    if (this.expanded && this.expandedChartDiv) {
      this.plotlyService.newPlot(this.expandedChartDiv.nativeElement, this.chart.data, this.chart.layout, this.chart.config)

    } else if (!this.expanded && this.panelChartDiv) {
      this.plotlyService.newPlot(this.panelChartDiv.nativeElement, this.chart.data, this.chart.layout, this.chart.config)
    }
  }


  addBlueTraces(): Array<TraceData> {
    let xCoordinates = [];
    for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
      xCoordinates.push(i);
    }
    let relativeHumidities: Array<number> = [];
    for (let i = 0; i <= 100; i += 20) {
      relativeHumidities.push(i);
    }

    let blueTraces: Array<TraceData> = [];
    let humidityRatios: Array<number>;
    relativeHumidities.forEach(relativeHumidity => {
      let trace = this.getEmptyTrace('Relative Humidity', 'black');
      trace.x = xCoordinates;
      humidityRatios = [];
      xCoordinates.forEach(x => {
        let relativeHumidityInput: BaseGasDensity = this.psychrometricService.getDefaultData(this.settings);
        relativeHumidityInput.dryBulbTemp = x;
        relativeHumidityInput.relativeHumidity = relativeHumidity;
        relativeHumidityInput.inputType = 'relativeHumidity';
        relativeHumidityInput.barometricPressure = this.inputData.barometricPressure;
        if (relativeHumidityInput.dryBulbTemp && relativeHumidityInput.relativeHumidity && relativeHumidityInput.barometricPressure) {
          let results: PsychrometricResults = this.psychrometricService.calcDensityRelativeHumidity(relativeHumidityInput, this.settings, true);
          if (results) {
            humidityRatios.push(results.humidityRatio);
          }
        }
      });
      trace.y = humidityRatios;
      this.chart.data.push(trace);

      blueTraces.push(trace);
    });

    return blueTraces;
  }

  addUserBlueTrace(): Array<TraceData> {
    let xCoordinates = [];
    for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
      xCoordinates.push(i);
    }
    let relativeHumidities: Array<number> = [];
    for (let i = 0; i <= 100; i += 20) {
      relativeHumidities.push(i);
    }

    let blueTraces: Array<TraceData> = [];
    relativeHumidities.forEach(relativeHumidity => {
      let trace = this.getEmptyTrace('Relative Humidity', 'blue');
      let humidityRatios = [];
      let invalidIndicies: Array<number> = [];
      xCoordinates.forEach((x, index) => {
        if (this.psychrometricResults.relativeHumidity >= 0) {
          let relativeHumidityInput: BaseGasDensity = this.psychrometricService.getDefaultData(this.settings);
          relativeHumidityInput.dryBulbTemp = x;
          relativeHumidityInput.relativeHumidity = this.psychrometricResults.relativeHumidity;
          relativeHumidityInput.barometricPressure = this.inputData.barometricPressure;
          relativeHumidityInput.inputType = 'relativeHumidity';
          let results: PsychrometricResults = this.psychrometricService.calcDensityRelativeHumidity(relativeHumidityInput, this.settings, true);
          if (results) {
            humidityRatios.push(results.humidityRatio);
          }
        } else {
          invalidIndicies.push(index);
        }
      });
      xCoordinates = xCoordinates.filter((x: number, index: number) => !invalidIndicies.includes(index));
      trace.x = xCoordinates;
      trace.y = humidityRatios;
      this.chart.data.push(trace);

      blueTraces.push(trace);
    });

    return blueTraces;

  }

  addRedTraces(): Array<TraceData> {
    let wetBulbTemps: Array<number> = [];
    for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
      wetBulbTemps.push(i);
    }

    let redTraces: Array<TraceData> = [];
    let humidityRatios: Array<number> = [];
    let xCoordinates: Array<number> = [];
    wetBulbTemps.forEach(wetBulbTemp => {
      xCoordinates = [];
      for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
        if (i >= wetBulbTemp) {
          xCoordinates.push(i);
        }
      }
      let trace = this.getEmptyTrace('Wet Bulb', 'darkgrey');
      humidityRatios = [];
      let invalidIndicies: Array<number> = [];
      xCoordinates.forEach(x => {
        let wetBulb: number = wetBulbTemp;
        let relativeHumidityInput: BaseGasDensity = this.psychrometricService.getDefaultData(this.settings);
        relativeHumidityInput.dryBulbTemp = x;
        relativeHumidityInput.wetBulbTemp = wetBulb;
        relativeHumidityInput.barometricPressure = this.inputData.barometricPressure;
        relativeHumidityInput.inputType = 'wetBulb';
        let results: PsychrometricResults = this.psychrometricService.calcDensityWetBulb(relativeHumidityInput, this.settings, true);
        if (results) {
          humidityRatios.push(results.humidityRatio);
        }
      });
      
      humidityRatios = humidityRatios.filter((ratio: number, index: number) => {
        if (ratio < 0) {
          invalidIndicies.push(index);
        } else {
          return ratio;
        }
      });
      xCoordinates = xCoordinates.filter((x: number, index: number) => !invalidIndicies.includes(index));

      trace.x = xCoordinates;
      trace.y = humidityRatios;

      redTraces.push(trace);
    });
    redTraces.forEach(trace => this.chart.data.push(trace));
    this.chart.layout = this.getLayout(xCoordinates, humidityRatios);
    return redTraces;
  }

  addUserRedTrace(topAxisBlueTrace: TraceData): void {
    let xConstraints: Array<number> = [];
    let xCoordinates: Array<number> = [];

    let highResolutionIncrement: number = .02;
    // Use higher res increment than other red lines to find xrange constraints against the 'top axis'/top blue trace
    for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += highResolutionIncrement) {
      if (i >= this.psychrometricResults.wetBulbTemp) {
        xConstraints.push(i);
      }
    }
    let traceX: number[] = [];
    let traceY: number[] = [];
    // Only create start and end point
    xCoordinates = [xConstraints[0], xConstraints[xConstraints.length - 1]];
    xCoordinates.forEach(x => {
      let relativeHumidityInput: BaseGasDensity = this.psychrometricService.getDefaultData(this.settings);
      relativeHumidityInput.dryBulbTemp = x;
      relativeHumidityInput.wetBulbTemp = this.psychrometricResults.wetBulbTemp;
      relativeHumidityInput.barometricPressure = this.inputData.barometricPressure;
      relativeHumidityInput.inputType = 'wetBulb';
      let results: PsychrometricResults = this.psychrometricService.calcDensityWetBulb(relativeHumidityInput, this.settings, true);
      if (results) {
        // TODO This may no longer be needed
        if (results.humidityRatio >= 0) {
          traceX.push(x);
          traceY.push(results.humidityRatio);
        }
      }
    });

    let trace = this.getEmptyTrace('Wet Bulb', 'red');
    trace.x = traceX;
    trace.y = traceY;
    this.chart.data.push(trace);
    let xRange: number[] = topAxisBlueTrace.x.map(x => Number(x));
    let yRange: number[] = topAxisBlueTrace.y.map(y => Number(y));
    this.chart.layout = this.getLayout(xRange, yRange);
  }

  addTopAxisTrace(blueTraces) {
    let xCoordinates: Array<number> = [];
    let yCoordinates: Array<number> = [];
    let xAxisText = ['40', '50', '60', '70', '80', '90', '100', '110', '120', '130'];
    if (!this.useImperialUnits) {
      xAxisText = ['6', '12', '18', '24', '30', '36', '42', '48', '54', '60']
    }
    for (let index = 1; index < blueTraces.x.length; index += 2) {
      xCoordinates.push(blueTraces.x[index]);
    }

    for (let index = 1; index < blueTraces.y.length; index += 2) {
      yCoordinates.push(blueTraces.y[index]);
    }

    let trace = {
      x: xCoordinates,
      y: yCoordinates,
      mode: 'text',
      text: xAxisText,
      textposition: 'top',
      type: 'scatter',
      showlegend: false,
    }
    this.chart.data.push(trace);
  }

  addUserPoint(blueTraces) {
    let trace = this.getEmptyPointTrace('', 'black');
    let dryBulbTemperature = this.inputData.dryBulbTemp;
    trace.x.push(dryBulbTemperature);
    trace.y.push(this.psychrometricResults.humidityRatio);
    this.chart.data.push(trace);

    this.addUserBlueTrace();
    this.addUserRedTrace(blueTraces);
  }

  addVerticalGridLines(blueTraces) {
    let blackTraces: Array<TraceData> = [];
    let xCoordinates: Array<number> = [];
    let wetBulbTemps: Array<number> = [];
    let humidityRatios: Array<number> = [];

    for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
      wetBulbTemps.push(i);
    }
    for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
      xCoordinates.push(i);
    }

    for (let index = 0; index < wetBulbTemps.length; index++) {
      let newTrace = this.getEmptyTrace('', 'black');
      let xValues: Array<number> = [];
      let yValues: Array<number> = [];

      xValues.push(xCoordinates[index], xCoordinates[index]);
      yValues.push(0, blueTraces.y[index]);

      newTrace.x = xValues;
      newTrace.y = yValues;

      blackTraces.push(newTrace);
    }

    blackTraces.forEach(trace => this.chart.data.push(trace));
    humidityRatios = blueTraces.y;
    this.chart.layout = this.getLayout(xCoordinates, humidityRatios);
  }

  setChartUnits() {
    if (this.settings.fanTemperatureMeasurement === 'C' || this.settings.fanTemperatureMeasurement === 'K') {
      this.lineCreationData = MetricLineData;
      this.useImperialUnits = false;
      this.temperatureUnits = 'C';
    }
  }

  getEmptyTrace(name: string, color: string): TraceData {
    let trace: TraceData = {
      x: [],
      y: [],
      name: name,
      showlegend: false,
      type: 'scatter',
      mode: 'lines',
      hovertemplate: '',
      line: {
        shape: 'spline',
        color: color,
        width: 1,
      },
    };
    return trace;
  }

  getEmptyPointTrace(name: string, color: string): TraceData {
    let trace: TraceData = {
      x: [],
      y: [],
      name: name,
      showlegend: false,
      type: 'scatter',
      mode: 'markers',
      hovertemplate: '',
      line: {
        shape: 'spline',
        color: color,
        width: 1,
      },
      marker: {
        size: 10
      }
    };
    return trace;
  }

  getLayout(xticks: Array<number>, yticks: Array<number>) {
    let xUnits = '&#8457;';
    let yUnits = '(lb<sub>v</sub>/lb<sub>a</sub>)';
    let topAxisText: string = `Wet Bulb Temperature ${xUnits}`;
    let xAxisText: string = `Dry Bulb Temperature ${xUnits}`;
    let yAxisText: string = `Humidity Ratio ${yUnits}`;
    let xTicksVal = [40, 50, 60, 70, 80, 90, 100, 110, 120, 130];
    if (!this.useImperialUnits) {
      xUnits = '&#8451;';
      yUnits = '(kg<sub>v</sub>/kg<sub>a</sub>)';
      topAxisText = `Wet Bulb Temperature ${xUnits}`;
      xAxisText = `Dry Bulb Temperature ${xUnits}`;
      yAxisText = `Humidity Ratio ${yUnits}`;
      xTicksVal = [6, 12, 18, 24, 30, 36, 42, 48, 54, 60];
    }
    return {
      legend: {
        orientation: 'h',
        font: {
          size: 12,
        },
      },
      hovermode: 'false',
      xaxis: {
        autorange: true,
        showgrid: false,
        title: {
          text: xAxisText
        },
        showticksuffix: 'all',
        tickangle: 0,
        tickmode: 'array',
        tickvals: xTicksVal
      },
      yaxis: {
        autorange: true,
        showgrid: false,
        side: 'right',
        title: {
          text: yAxisText
        },
        autotick: true,
        rangemode: 'tozero',
        showticksuffix: 'all'
      },
      margin: {
        t: 50,
        b: 75,
        l: 25,
        r: 75
      },
      // TODO need to better represent what these annotations coords are
      annotations: [{
        x: xticks[12],
        y: yticks[12],
        xref: 'x',
        yref: 'y',
        text: topAxisText,
        font: {
          size: 12
        },
        showarrow: false,
        textangle: -35,
        height: 45,
        xshift: -40,
        yshift: 40
      }
      ]
    }
  }

  getEmptyChart() {
    return {
      name: 'Psychrometric Chart',
      data: [],
      layout: {
        hovermode: 'false',
        xaxis: {
          autorange: false,
          type: 'auto',
          showgrid: true,
          title: {
            text: ``
          },
          showticksuffix: 'all',
        },
        yaxis: {
          autorange: false,
          type: 'auto',
          showgrid: true,
          showticksuffix: 'all',
          title: {
            text: ``
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
        modeBarButtonsToRemove: ['autoScale2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      },
    };
  }



  triggerInitialResize() {
    window.dispatchEvent(new Event("resize"));
    setTimeout(() => {
      this.initRenderChart();
    }, 100);
  }

  @HostListener("document:keyup", ["$event"])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === "Escape") {
        this.contractChart();
      }
    }
  }

  expandChart() {
    this.expanded = true;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.initRenderChart();
    }, 200);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.initRenderChart();
    }, 200);
  }

  hideTooltip(btnType: string) {
    if (btnType === 'btnExpandChart') {
      this.hoverBtnExpand = false;
      this.displayExpandTooltip = false;
    }
    else if (btnType === 'btnCollapseChart') {
      this.hoverBtnCollapse = false;
      this.displayCollapseTooltip = false;
    }
  }

  initTooltip(btnType: string) {
    if (btnType === 'btnExpandChart') {
      this.hoverBtnExpand = true;
    }
    else if (btnType === 'btnCollapseChart') {
      this.hoverBtnCollapse = true;
    }
    setTimeout(() => {
      this.checkHover(btnType);
    }, 200);
  }

  checkHover(btnType: string) {
    if (btnType === 'btnExpandChart') {
      if (this.hoverBtnExpand) {
        this.displayExpandTooltip = true;
      }
      else {
        this.displayExpandTooltip = false;
      }
    }
    else if (btnType === 'btnCollapseChart') {
      if (this.hoverBtnCollapse) {
        this.displayCollapseTooltip = true;
      }
      else {
        this.displayCollapseTooltip = false;
      }
    }
  }
}


export const ImperialLineData: LineCreationData = {
  start: 35,
  end: 130,
  increment: 5
}

export const MetricLineData: LineCreationData = {
  start: 3,
  end: 60,
  increment: 3
}

interface LineCreationData {
  start: number,
  end: number,
  increment: number
}