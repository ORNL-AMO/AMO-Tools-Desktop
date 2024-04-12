
import { Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { PlotlyService } from 'angular-plotly.js';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { DataPoint, SimpleChart, TraceData } from '../../../../shared/models/plotting';
import { Settings } from '../../../../shared/models/settings';
import { FanPsychrometricService } from '../fan-psychrometric.service';
import { Subscription } from 'rxjs';
import { BaseGasDensity, PsychrometricResults } from '../../../../shared/models/fans';
import { GasDensityFormService } from '../../../fans/fan-analysis/fan-analysis-form/gas-density-form/gas-density-form.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

@Component({
  selector: 'app-fan-psychrometric-chart',
  templateUrl: './fan-psychrometric-chart.component.html',
  styleUrls: ['./fan-psychrometric-chart.component.css']
})
export class FanPsychrometricChartComponent implements OnInit {
  @Input()
  gasDensityForm: UntypedFormGroup;
  @Input()
  settings: Settings;
  @Input()  
  selectedDataPoints: Array<TraceData>;

  @ViewChild("expandedChartDiv", { static: false }) expandedChartDiv: ElementRef;
  @ViewChild("panelChartDiv", { static: false }) panelChartDiv: ElementRef;
  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  dataSummaryTableString: any;
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
  relativeHumidities: Array<number> = [0, 20, 40, 60, 80, 100];

  temperatureUnits: string;
  humidityRatioUnits: string;
  wetBulbAxisText: Array<string>;
  lineCreationData: LineCreationData;
  graphColors: Array<string>;

  constructor(private plotlyService: PlotlyService, private psychrometricService: FanPsychrometricService, private convertUnitsService: ConvertUnitsService,
    private gasDensityFormService: GasDensityFormService) { }

  ngOnInit() {
    this.graphColors = graphColors;
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
    this.selectedDataPoints.forEach(trace => {
      this.chart.data.push(trace);
    });
    let form: UntypedFormGroup = this.gasDensityFormService.getGasDensityFormFromObj(this.inputData, this.settings);
    if (form.valid && this.psychrometricResults) {
      let relativeHumiditiesCurves: Array<TraceData> = this.addRelativeHumidityCurves();
      let topCurveTraceData: TraceData = relativeHumiditiesCurves[relativeHumiditiesCurves.length - 1]; 
      this.addWetBulbLines();
      this.addWetBulbTopAxis(topCurveTraceData);
      this.addVerticalGridLines(topCurveTraceData);
      if (this.inputData.dryBulbTemp && this.psychrometricResults && this.psychrometricResults.humidityRatio !== undefined) {
        this.addUserPlot(topCurveTraceData);
      }
    }
    
    if (this.expanded && this.expandedChartDiv) {
      this.plotlyService.newPlot(this.expandedChartDiv.nativeElement, this.chart.data, this.chart.layout, this.chart.config)
      .then(chart => {
        chart.on('plotly_click', chartData => {
          this.addSelectedPointTraces(chartData);
        });
      });

    } else if (!this.expanded && this.panelChartDiv) {
      this.plotlyService.newPlot(this.panelChartDiv.nativeElement, this.chart.data, this.chart.layout, this.chart.config)
      .then(chart => {
        chart.on('plotly_click', chartData => {
          this.addSelectedPointTraces(chartData);
        });
      });
    }
  }

  roundVal(num: number): number {
    return Number(num.toFixed(3));
  }

  addSelectedPointTraces(graphData) {
    let pointColor: string = this.graphColors[(this.selectedDataPoints.length + 2) % this.graphColors.length];
    let userPointTrace: TraceData = this.getEmptyPointTrace('', pointColor);
    userPointTrace.x.push(graphData.points[0].x);
    userPointTrace.y.push(this.roundVal(graphData.points[0].y));
    userPointTrace.name = graphData.points[0].fullData.name;
    this.selectedDataPoints.push(userPointTrace);    
    this.initRenderChart();
    this.save();
  }

  save(){      
    this.psychrometricService.selectedDataPoints.next(this.selectedDataPoints);
  }

  deleteDataPoint(index: number) {
    this.selectedDataPoints.splice(index, 1); 
    this.initRenderChart();
    this.save();  
  }

  addRelativeHumidityCurves(): Array<TraceData> {
    let xRange: Array<number> = this.getLineXRange();
    let relativeHumiditiesCurves: Array<TraceData> = [];
    let humidityRatiosY: Array<number>;
    this.relativeHumidities.forEach(relativeHumidity => {
      let trace = this.getEmptyTrace('Relative Humidity', 'black');
      trace.x = xRange;
      humidityRatiosY = [];
      xRange.forEach((x, index) => {
        let relativeHumidityInput: BaseGasDensity = this.psychrometricService.getDefaultData(this.settings);
        relativeHumidityInput.dryBulbTemp = x;
        relativeHumidityInput.relativeHumidity = relativeHumidity;
        relativeHumidityInput.inputType = 'relativeHumidity';
        relativeHumidityInput.barometricPressure = this.inputData.barometricPressure;
        if (relativeHumidityInput.dryBulbTemp && relativeHumidityInput.relativeHumidity && relativeHumidityInput.barometricPressure) {
          let results: PsychrometricResults = this.psychrometricService.calcDensityRelativeHumidity(relativeHumidityInput, this.settings);
          if (results) {
            humidityRatiosY.push(results.humidityRatio);
          }
        }
        
      });

      trace.y = humidityRatiosY;
      this.chart.data.push(trace);
      relativeHumiditiesCurves.push(trace);
    });

    return relativeHumiditiesCurves;
  }

  addUserRelativeHumidityCurve() {
    let xRange = this.getLineXRange();
    let trace = this.getEmptyTrace('Relative Humidity', 'blue');
    let humidityRatiosY = [];
    let invalidIndicies: Array<number> = [];
    xRange.forEach((x, index) => {
      if (this.psychrometricResults.relativeHumidity >= 0) {
        let relativeHumidityInput: BaseGasDensity = this.psychrometricService.getDefaultData(this.settings);
        relativeHumidityInput.dryBulbTemp = x;
        relativeHumidityInput.relativeHumidity = this.psychrometricResults.relativeHumidity;
        relativeHumidityInput.barometricPressure = this.inputData.barometricPressure;
        relativeHumidityInput.inputType = 'relativeHumidity';
        let results: PsychrometricResults = this.psychrometricService.calcDensityRelativeHumidity(relativeHumidityInput, this.settings);
        if (results) {
          humidityRatiosY.push(results.humidityRatio);
        }
      } else {
        invalidIndicies.push(index);
      }
    });
    xRange = xRange.filter((x: number, index: number) => !invalidIndicies.includes(index));
    trace.x = xRange;
    trace.y = humidityRatiosY;
    this.chart.data.push(trace);
  }

  addWetBulbLines(): Array<TraceData> {
    let wetbulbTempsX: Array<number> = this.getLineXRange();
    let xRange: Array<number> = this.getLineXRange();
    let wetBulbLines: Array<TraceData> = [];
    let humidityRatios: Array<number> = [];

    wetbulbTempsX.forEach((wetBulbTemp, i) => {
      let trace = this.getEmptyTrace('Wet Bulb', 'darkgrey');
      humidityRatios = [];
      let invalidIndicies: Array<number> = [];
      // X endpoint value follows Wet bulb axis - as we iterate over x, remove endpoint via shift()
      if (i > 0) {
        xRange.shift();
      }
      xRange.forEach(x => {
        let wetBulb: number = wetBulbTemp;
        let relativeHumidityInput: BaseGasDensity = this.psychrometricService.getDefaultData(this.settings);
        relativeHumidityInput.dryBulbTemp = x;
        relativeHumidityInput.wetBulbTemp = wetBulb;
        relativeHumidityInput.barometricPressure = this.inputData.barometricPressure;
        relativeHumidityInput.inputType = 'wetBulb';
        let results: PsychrometricResults = this.psychrometricService.calcDensityWetBulb(relativeHumidityInput, this.settings);
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

      let validXCoordinates = JSON.parse(JSON.stringify(xRange)).filter((x: number, index: number) => !invalidIndicies.includes(index));

      trace.x = validXCoordinates;
      trace.y = humidityRatios;

      wetBulbLines.push(trace);
    });

    wetBulbLines.forEach(trace => this.chart.data.push(trace));
    this.chart.layout = this.getLayout(xRange, humidityRatios);
    return wetBulbLines;
  }

  addUserWetBulbLines(wetBulbTopTrace: TraceData): void {
    let xConstraints: Array<number> = [];
    let xCoordinates: Array<number> = [];

    let highResolutionIncrement: number = 1;
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
      let results: PsychrometricResults = this.psychrometricService.calcDensityWetBulb(relativeHumidityInput, this.settings);
      if (results) {
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
    let xRange: number[] = wetBulbTopTrace.x.map(x => Number(x));
    let yRange: number[] = wetBulbTopTrace.y.map(y => Number(y));
    this.chart.layout = this.getLayout(xRange, yRange);
  }

  addWetBulbTopAxis(wetBulbTopTrace: TraceData) {
    let xCoordinates: Array<number> = [];
    let yCoordinates: Array<number> = [];
    for (let index = 1; index < wetBulbTopTrace.x.length; index += 2) {
      xCoordinates.push(Number(wetBulbTopTrace.x[index]));
      yCoordinates.push(Number(wetBulbTopTrace.y[index]));
    }
    let trace = {
      x: xCoordinates,
      y: yCoordinates,
      mode: 'text',
      text: this.wetBulbAxisText,
      textposition: 'top',
      type: 'scatter',
      showlegend: false,
    }
    this.chart.data.push(trace);
  }

  addUserPlot(wetBulbTopTrace: TraceData) {
    let userPointTrace: TraceData = this.getEmptyPointTrace('', 'black');
    userPointTrace.x.push(this.inputData.dryBulbTemp);
    userPointTrace.y.push(this.psychrometricResults.humidityRatio);
    this.chart.data.push(userPointTrace);

    this.addUserRelativeHumidityCurve();
    this.addUserWetBulbLines(wetBulbTopTrace);
  }

  addVerticalGridLines(wetBulbTopTrace: TraceData) {
    let verticalGridTraces: Array<TraceData> = [];
    wetBulbTopTrace.y.forEach((y, index) => {
      let trace = this.getEmptyTrace('Grid', 'black');
      trace.x = [wetBulbTopTrace.x[index], wetBulbTopTrace.x[index]];
      trace.y = [0, y];
      verticalGridTraces.push(trace);
      this.chart.data.push(trace)
    });
  }

  getLineXRange() {
    let lineRange: Array<number> = [];
    for (let i = this.lineCreationData.start; i <= this.lineCreationData.end; i += this.lineCreationData.increment) {
      lineRange.push(i);
    }
    return lineRange;
  }

  setChartUnits() {
    this.temperatureUnits = '&#8457;';
    this.humidityRatioUnits = '(lb<sub>v</sub>/lb<sub>a</sub>)';
    this.wetBulbAxisText = ImperialWetBulbAxisText;
    this.lineCreationData = ImperialLineData;
    if (this.settings.fanTemperatureMeasurement === 'C' || this.settings.fanTemperatureMeasurement === 'K') {
      this.lineCreationData = MetricLineData;
      this.wetBulbAxisText = MetricWetBulbAxisText;
      this.temperatureUnits = '&#8451;';
      this.humidityRatioUnits = '(kg<sub>v</sub>/kg<sub>a</sub>)';
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
    let topAxisText: string = `Wet Bulb Temperature ${this.temperatureUnits}`;
    let xAxisText: string = `Dry Bulb Temperature ${this.temperatureUnits}`;
    let yAxisText: string = `Humidity Ratio ${this.humidityRatioUnits}`;
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
        tickvals: this.wetBulbAxisText
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
          size: 14
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

  updateTableString() {
    this.dataSummaryTableString = this.dataSummaryTable.nativeElement.innerText;
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

export const ImperialWetBulbAxisText = ['40', '50', '60', '70', '80', '90', '100', '110', '120', '130'];
export const MetricWetBulbAxisText = ['6', '12', '18', '24', '30', '36', '42', '48', '54', '60'];

interface LineCreationData {
  start: number,
  end: number,
  increment: number
}
