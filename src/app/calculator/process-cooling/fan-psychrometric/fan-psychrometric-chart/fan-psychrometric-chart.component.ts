import { Component, OnInit, HostListener, ViewChild, ElementRef, Input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { Subscription, BehaviorSubject } from 'rxjs';
import { DataPoint, SimpleChart, TraceCoordinates, TraceData } from '../../../../shared/models/plotting';
import { FormGroup } from '@angular/forms';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { PsychrometricResults, BaseGasDensity } from '../../../../shared/models/fans';
import { FanPsychrometricService } from '../fan-psychrometric.service';
import { PlotlyService } from 'angular-plotly.js';


const c8 = -1.0440397e4;
const c9 = -1.129465e1;
const c10 = -2.7022355e-2;
const c11 = 1.289036e-5;
const c12 = -2.4780681e-9;
const c13 = 6.5459673;

@Component({
  selector: 'app-fan-psychrometric-chart',
  templateUrl: './fan-psychrometric-chart.component.html',
  styleUrls: ['./fan-psychrometric-chart.component.css']
})
export class FanPsychrometricChartComponent implements OnInit {
  @Input()
  gasDensityForm: FormGroup;
  @Input()
  toggleCalculate: boolean;
  @Input()
  settings: Settings;

  // DOM
  @ViewChild("psychrometricChartDiv", { static: false }) psychrometricChartDiv: ElementRef;
  @ViewChild("ngChartContainer", {static: false}) ngChartContainer: ElementRef;
  tabPanelChartId: string = 'tabPanelDiv';
  expandedChartId: string = 'expandedChartDiv';
  currentChartId: string = 'tabPanelDiv';


  // Tooltips
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;
  expanded: boolean = false;

  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }

  plotlyTraceColors: Array<string> = [
    '#1f77b4',  // muted blue
    '#ff7f0e',  // safety orange
    '#2ca02c',  // cooked asparagus green
    '#d62728',  // brick red
    '#9467bd',  // muted purple
    '#8c564b',  // chestnut brown
    '#e377c2',  // raspberry yogurt pink
    '#7f7f7f',  // middle gray
    '#bcbd22',  // curry yellow-green
    '#17becf'   // blue-teal
  ];

  // Graphing
  selectedDataPoints: BehaviorSubject<Array<AirPoint>>;
  psychrometricChart: BehaviorSubject<SimpleChart>;
  traceNames = {
    0: 'Wet Bulb',
    1: 'Dry Bulb',
    2: 'Relative Humidity'
  };
  

  tempMotorPower: number;
  tempRpm: number;
  tempEfficiencyClass: string;
  tempVoltage: number;
  tempAmps: number;
  tempLineFrequency: string;
  airPointColors: Array<string>;
  resultData: Array<PsychrometricResults>;
  hasValidResults: boolean; 

  baseGasDensityData: BehaviorSubject<BaseGasDensity>;
  calculatedBaseGasDensity: BehaviorSubject<PsychrometricResults>;
  psychrometricResults: PsychrometricResults;

  resetFormSubscription: Subscription;
  calculatedBaseGasDensitySubscription: Subscription;
  constructor(private psychrometricService: FanPsychrometricService, private cd: ChangeDetectorRef, plotlyService: PlotlyService) { }

  ngOnInit(): void {
    this.calculatedBaseGasDensitySubscription = this.psychrometricService.calculatedBaseGasDensity.subscribe(results => {
      this.psychrometricResults = results;
      if (results) {
        let inputData: BaseGasDensity = this.psychrometricService.baseGasDensityData.getValue();
        this.psychrometricResults.barometricPressure = inputData.barometricPressure;
        this.psychrometricResults.dryBulbTemp = inputData.dryBulbTemp;
      }
    });
    // this.triggerInitialResize();
  }

  initChart() {
    let emptyChart: SimpleChart = this.getEmptyChart();
    this.psychrometricChart = new BehaviorSubject<SimpleChart>(emptyChart);
    
    let selectedDataPoints = new Array<AirPoint>();
    this.selectedDataPoints = new BehaviorSubject<Array<AirPoint>>(selectedDataPoints);
  }

  buildLineData(gasDensityForm: FormGroup, settings: Settings): Array<TraceCoordinates> {
    let relHumidity20: TraceCoordinates = {x: [], y: []};
    let relHumidity40: TraceCoordinates = {x: [], y: []};
    let relHumidity60: TraceCoordinates = {x: [], y: []};
    let relHumidity80: TraceCoordinates = {x: [], y: []};
    let relHumidity100: TraceCoordinates = {x: [], y: []};

    for (let i = 35; i <= 130; i = i + 5) {
      let barometricPressure = this.psychrometricResults.barometricPressure;
      let relativeHumidity = this.psychrometricResults.relativeHumidity;

      relHumidity20.x.push(i);
      relHumidity20.y.push(this.calculateHumidityRatio(i, relativeHumidity, barometricPressure));
      relHumidity40.x.push(i);
      relHumidity40.y.push(this.calculateHumidityRatio(i, relativeHumidity, barometricPressure));
      relHumidity60.x.push(i);
      relHumidity60.y.push(this.calculateHumidityRatio(i, relativeHumidity, barometricPressure));
      relHumidity80.x.push(i);
      relHumidity80.y.push(this.calculateHumidityRatio(i, relativeHumidity, barometricPressure));
      relHumidity100.x.push(i);
      relHumidity100.y.push(this.calculateHumidityRatio(i, relativeHumidity, barometricPressure));
    }
    return [relHumidity20, relHumidity40, relHumidity60, relHumidity80, relHumidity100];
  }


  calculateHumidityRatio(dryBulbTemp: number, relativeHumidity: number, barometricPressure: number) {
    var t = dryBulbTemp + 459.67;
    var lnOfSatPress = c8 / t + c9 + c10 * t + c11 * Math.pow(t, 2) + c12 * Math.pow(t, 3) + c13 * Math.log(t);
    var satPress = Math.exp(lnOfSatPress);
    var humidRatio = (0.621945 * satPress) / (barometricPressure - satPress);
    return humidRatio;
  }

  
  getTraceDataFromPoint(selectedPoint: DataPoint): TraceData {
    let trace: TraceData = {
      //selectedPoint parameter necessary? other graphs don't have that parameter
      x: [selectedPoint.x],
      y: [selectedPoint.y],
      type: 'scatter',
      name: '',
      showlegend: false,
      mode: 'markers',
      hoverinfo: 'skip',
      marker: {
        color: selectedPoint.pointColor,
        size: 14,
      },
    };
    return trace;
  }

  getEmptyTrace(): TraceData {
    let trace: TraceData =   {
      x: [],
      y: [],
      name: '',
      showlegend: true,
      type: 'scatter',
      line: {
        shape: 'spline',
        color: '',
      }
    };
    return trace;
  }

  getEmptyChart(): SimpleChart {
    return {
      name: 'Psychrometric Graph',
      data: [],
      layout: {
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
            text: "Drey Bulb Temperature (F)"
          },
          showticksuffix: 'all',
          tickangle: -60,
          tickmode: 'array',
          hoverformat: '%{x}%',
          range: [35, 130],
          tickvals: [35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130],
        },
        yaxis: {
          autorange: true,
          type: 'linear',
          showgrid: false,
          title: {
            text: "Humidity Ratio"
          },
          range: [0, 0.1],
          tickvals: [0, 0.02, 0.04, 0.06, 0.08, 0.1],
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
      },
      config: {
        modeBarButtonsToRemove: ['lasso2d', 'pan2d', 'select2d', 'hoverClosestCartesian', 'toggleSpikelines', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      }
    };
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes.toggleCalculate && !changes.toggleCalculate.firstChange && this.gasDensityForm.valid) {
  //       this.initRenderChart();
  //   }
  // }

  // triggerInitialResize() {
  //   window.dispatchEvent(new Event('resize'));
  //   setTimeout(() => {
  //     this.initRenderChart();
  //   }, 25)
  // }

  // resizeGraph() {
  //   let expandedChart = this.ngChartContainer.nativeElement;
  //   if (expandedChart) {
  //     if (this.expanded) {
  //       this.currentChartId = this.expandedChartId;
  //     }
  //     else {
  //       this.currentChartId = this.tabPanelChartId;
  //     }
  //     this.initRenderChart();
  //   }
  // }

  // initRenderChart() {
  //   Plotly.purge(this.currentChartId);
  //   this.initChartSetup();
  //   this.drawTraces();
  //   if (this.validPlot && this.psychrometricResults !== undefined) {
  //     this.plotPoint(this.psychrometricResults.dryBulbTemp, this.psychrometricResults.humidityRatio);
  //   }

  //   let chartLayout = JSON.parse(JSON.stringify(this.gasDensityForm.layout));
  //   Plotly.newPlot(this.currentChartId, this.psychrometricChart.data, chartLayout, this.psychrometricChart.config)
  //   this.save();
  // }

  // plotPoint(dryBulbTemp: number, humidityRatio: number) {
  //   let pointTrace = this.getTraceDataFromPoint();
  //   pointTrace.marker.color = graphColors[0];
  //   pointTrace.x = [dryBulbTemp];
  //   pointTrace.y = [humidityRatio];
  //   pointTrace.hovertemplate

  // }

  // initChartSetup() {
  //   this.psychrometricService.initPsychrometricChartData();
  //   this.graphColors = graphColors;
  //   this.psychrometricChart = this.psychrometricService.psychrometricChart.getValue();
  //   this.selectedDataPoints = this.psychrometricService.selectedDataPoints.getValue();
  // }

  drawTraces() {
    let allLineData: Array<TraceCoordinates> = this.buildLineData(this.gasDensityForm, this.settings);
    allLineData.forEach((data, index) => {
      let trace = this.getEmptyTrace();
      trace.x = data.x;
      trace.y = data.y;
      trace.name = this.traceNames[index];
      trace.hovertemplate = '%{y:.2r}%';
      trace.line.color = this.plotlyTraceColors[(index) % this.plotlyTraceColors.length]
      // this.performanceChart.data[index] = trace;
    });
  }

  // addSelectedPointTraces(graphData) {
  //   let currentPointIndex: number = graphData.points[0].pointIndex;
  //   let selectedAirPoint: AirPoint = this.getAirPoint(currentPointIndex, graphData.points[0]);
  //   let currentColor = this.graphColors[(this.psychrometricChart.data.length - 1) % this.graphColors.length]
  //   this.psychrometricChart.data.forEach((trace, i) => {
  //     // Create points for 3 default line traces
  //     if (i < 3) {
  //       let point: AirPoint = {
  //         pointColor: currentColor,
  //         dryBulbTemp: selectedAirPoint.dryBulbTemp,
  //         humidityRatio: selectedAirPoint.humidityRatio,
  //         wetBulbTemp: selectedAirPoint.wetBulbTemp,
  //         relHumidity: selectedAirPoint.relHumidity,
  //         x: Number(trace.x[currentPointIndex]),
  //         y: Number(trace.y[currentPointIndex])
  //       };
  //       let pointTrace = this.psychrometricService.getTraceDataFromPoint(point);
  //       Plotly.addTraces(this.currentChartId, pointTrace);
  //     }
  //   });
  //   selectedAirPoint.pointColor = currentColor;
  //   this.selectedDataPoints.push(selectedAirPoint);
  //   this.cd.detectChanges();
  //   this.save();
  // }


  // getAirPoint(currentPointIndex: number, currentPoint): AirPoint {
  //   let relativeCoordinate = {
  //     dryBulbTemp: Number(this.psychrometricChart.data[0].x[currentPointIndex]),
  //     humidityRatio: Number(this.psychrometricChart.data[0].y[currentPointIndex]),
  //     wetBulbTemp: Number(this.psychrometricChart.data[1].y[currentPointIndex]),
  //     relHumidity: Number(this.psychrometricChart.data[2].y[currentPointIndex]),
  //     x: currentPoint.x,
  //     y: currentPoint.y
  //   }
  //   return relativeCoordinate;
  // }

  // save() {
  //   this.psychrometricService.psychrometricChart.next(this.psychrometricChart);
  //   this.psychrometricService.selectedDataPoints.next(this.selectedDataPoints);
  // }

  // deleteDataPoint(point: DataPoint, index: number) {
  //   let deleteTraceIndex: number = this.psychrometricChart.data.findIndex(trace => trace.x[0] == point.x && trace.y[0] == point.y);
  //   // ignore default motorpoint trace
  //   if (deleteTraceIndex == -1) {
  //     deleteTraceIndex = this.psychrometricChart.data.length - 3;
  //   }
  //   let traces = [deleteTraceIndex, deleteTraceIndex + 1, deleteTraceIndex + 2];
  //   Plotly.deleteTraces(this.currentChartId, traces);
  //   this.selectedDataPoints.splice(index, 1);
  //   this.cd.detectChanges();
  //   this.save();
  // }

  // toggleGrid() {
  //   let showingGridX: boolean = this.psychrometricChart.layout.xaxis.showgrid;
  //   let showingGridY: boolean = this.psychrometricChart.layout.yaxis.showgrid;
  //   this.psychrometricChart.layout.xaxis.showgrid = !showingGridX;
  //   this.psychrometricChart.layout.yaxis.showgrid = !showingGridY;

  //   let chartLayout = JSON.parse(JSON.stringify(this.psychrometricChart.layout));
  //   Plotly.update(this.currentChartId, this.psychrometricChart.data, chartLayout);
  //   this.save();
  // }

  // updateTableString() {
  //   this.dataSummaryTableString = this.dataSummaryTable.nativeElement.innerText;
  // }

  expandChart() {
    this.expanded = true;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      // this.resizeGraph();
    }, 100);
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
    else if (btnType === 'btnGridLines') {
      this.hoverBtnGridLines = false;
      this.displayGridLinesTooltip = false;
    }
  }

  initTooltip(btnType: string) {
    if (btnType === 'btnExpandChart') {
      this.hoverBtnExpand = true;
    }
    else if (btnType === 'btnCollapseChart') {
      this.hoverBtnCollapse = true;
    }
    else if (btnType === 'btnGridLines') {
      this.hoverBtnGridLines = true;
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
    else if (btnType === 'btnGridLines') {
      if (this.hoverBtnGridLines) {
        this.displayGridLinesTooltip = true;
      }
      else {
        this.displayGridLinesTooltip = false;
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

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      // this.resizeGraph();
    }, 200);
  }

}

export interface HoverGroupData {
  hoverPoints: Array<DataPoint>,
  dryBulbTemp?: DataPoint
};

export interface AirPoint extends DataPoint {
  dryBulbTemp: number,
  humidityRatio: number,
  wetBulbTemp: number,
  relHumidity: number
};
