import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { FormGroup } from '@angular/forms';
import { SpecificSpeedService } from '../specific-speed.service';

import * as Plotly from 'plotly.js';

export interface SelectedDataPoint {
  pointColor: string;
  pointX: number;
  pointY: number;
}

@Component({
  selector: 'app-specific-speed-graph',
  templateUrl: './specific-speed-graph.component.html',
  styleUrls: ['./specific-speed-graph.component.css']
})
export class SpecificSpeedGraphComponent implements OnInit {
  @Input()
  speedForm: FormGroup;
  @Input()
  inPsat: boolean;
  @Input()
  resetData: boolean;
  @Input()
  toggleCalculate: boolean;

  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  dataSummaryTableString: any;
  @ViewChild('specificSpeedLine', { static: false }) specSpeedChart: ElementRef;
  chartId: string;


  selectedDataPoints: Array<SelectedDataPoint>;
  pointColors: Array<string>;
  specificSpeedChart;
  firstChange: boolean = true;
  tmpPumpType: boolean;
  // TODO what is this?
  curveChanged: boolean;


  constructor(private psatService: PsatService, 
              private specificSpeedService: SpecificSpeedService,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
   this.chartId = 'plotlyDiv';
   this.curveChanged = false;
   this.tmpPumpType = this.speedForm.controls.pumpType.value;
   this.initRenderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.resetData) {
        this.reset();
        this.initRenderChart();
      }
      if (changes.toggleCalculate && !changes.resetData) {
        this.checkShouldUpdateRender();
      }
    } else {
      this.firstChange = false;
    }
  }

  checkShouldUpdateRender() {
    if (this.notSpecifiedEfficiency()) {
      if (this.speedForm.controls.pumpType.value != this.tmpPumpType) {
        this.curveChanged = true;
      }
      this.tmpPumpType = this.speedForm.controls.pumpType.value;
      this.updateRenderChart()
    }
  }

  ngOnDestroy() {
    // this.specificSpeedService.specificSpeedChart.next(undefined);
  }

  initRenderChart() {
    Plotly.purge(this.chartId);
    
    this.initChartSetup();
    this.setCalculatedTrace();

    let chartLayout = JSON.parse(JSON.stringify(this.specificSpeedChart.layout));
    Plotly.newPlot(this.chartId, this.specificSpeedChart.data, chartLayout, this.specificSpeedChart.config)
      .then(chart => {
        chart.on('plotly_click', (graphData) => {
          this.createSelectedDataPoint(graphData);
        });
      });
  }

  updateRenderChart() {
    let chartLayout = JSON.parse(JSON.stringify(this.specificSpeedChart.layout));
    this.setCalculatedTrace();
    Plotly.update(this.chartId, this.specificSpeedChart.data, chartLayout, [1]
    );
  }

  initChartSetup() {
    let currentData = this.getSplineTraceData();
    this.pointColors = graphColors;
    this.selectedDataPoints = new Array<SelectedDataPoint>();
    this.specificSpeedChart = this.specificSpeedService.initEmptyChart();
    
    // splineTrace
    this.specificSpeedChart.data[0].x = currentData.x;
    this.specificSpeedChart.data[0].y = currentData.y;
  }

  setCalculatedTrace() {
    let specificSpeed = this.psatService.roundVal(this.getSpecificSpeed(), 3);
    let efficiencyCorrection = this.psatService.achievableEfficiency(this.speedForm.controls.pumpType.value, specificSpeed);
    let hoverTemplate = 'Specific Speed' + ': %{x:.2r} <br>' + 'Efficiency Correction' + ': %{y:.2r}%' + '<extra></extra>';

    let calculatedPoint: SelectedDataPoint = {
      pointColor: '#000',
      pointX: specificSpeed,
      pointY: efficiencyCorrection
    }

    let resultCoordinateTrace = {
      x: [calculatedPoint.pointX],
      y: [calculatedPoint.pointY],
      type: 'scatter',
      name: 'Calculated Specific Speed',
      hovertemplate: hoverTemplate,
      mode: 'markers',
      marker: {
        color: '#000',
        size: 14,
      }
    }
    
    if (!isNaN(calculatedPoint.pointX)) {
      this.specificSpeedChart.data[1] = resultCoordinateTrace;
      this.selectedDataPoints.splice(0, 1, calculatedPoint);
      this.cd.detectChanges();
    }
  }

  createSelectedDataPoint(graphData) {
    let selectedPoint: SelectedDataPoint = {
      pointColor: this.pointColors[(this.specificSpeedChart.data.length + 1) % this.pointColors.length],
      pointX: graphData.points[0].x,
      pointY: graphData.points[0].y
    }
    
    let hoverTemplate = 'Specific Speed' + ': %{x:.2r} <br>' + 'Efficiency Correction' + ': %{y:.2r}%' + '<extra></extra>';
    let selectedPointTrace = {
      x: [selectedPoint.pointX],
      y: [selectedPoint.pointY],
      type: 'scatter',
      name: `${selectedPoint.pointX}, ${selectedPoint.pointY}`,
      hovertemplate: hoverTemplate,
      mode: 'markers',
      marker: {
        color: selectedPoint.pointColor,
        size: 14,
      },
    }
    
    Plotly.addTraces(this.chartId, selectedPointTrace);
    this.selectedDataPoints.push(selectedPoint);
    this.cd.detectChanges();
  }

  deleteDataPoint(point: SelectedDataPoint) {
    let traceCount = this.specificSpeedChart.data.length;
    let deleteTraceIndex: number = this.specificSpeedChart.data.findIndex(trace => trace.x[0] == point.pointX && trace.y[0] == point.pointY);
    // ignore default traces
    if (traceCount > 2 && deleteTraceIndex != -1) {
      Plotly.deleteTraces(this.chartId, [deleteTraceIndex]);
      this.selectedDataPoints.splice(deleteTraceIndex - 1, 1);
      this.cd.detectChanges();
    }
  }

  reset() {
    this.pointColors = new Array<string>();
    this.specificSpeedChart = undefined;
  }

  getEfficiencyCorrection() {
    if (this.notSpecifiedEfficiency()) {
      return this.psatService.achievableEfficiency(this.speedForm.controls.pumpType.value, this.getSpecificSpeed());
    } else {
      return 0;
    }
  }
  getSpecificSpeed(): number {
    if (this.notSpecifiedEfficiency()) {
      return this.speedForm.controls.pumpRPM.value * Math.pow(this.speedForm.controls.flowRate.value, 0.5) / Math.pow(this.speedForm.controls.head.value, .75);
    } else {
      return 0;
    }
  }

  notSpecifiedEfficiency(): boolean {
    if (
      this.speedForm.valid &&
      this.speedForm.controls.pumpType.value !== 11
    ) {
      return true;
    } else {
      return false;
    }
  }

  getSplineTraceData(): { x: Array<number>, y: Array<number> } {
    let data: { x: Array<number>, y: Array<number> } = {
      x: new Array<number>(),
      y: new Array<number>()
    };

    // Spec speed range constants
    let range: any;
    if (this.speedForm.controls.pumpType.value === 9) {
      //vertical turbine
      range = {
        init: 1720,
        end: 16350,
        step: 25
      };
    }
    else {
      range = {
        init: 680,
        end: 7300,
        step: 25
      };
    }

    for (let i = range.init; i < range.end; i += range.step) {
      let efficiencyCorrection: number = this.psatService.achievableEfficiency(this.speedForm.controls.pumpType.value, i);
      if (efficiencyCorrection <= 5.5) {
        data.x.push(i);
        data.y.push(efficiencyCorrection);
      }
    }

    return data;
  }

  updateTableString() {
    this.dataSummaryTableString = this.dataSummaryTable.nativeElement.innerText;
    console.log(this.dataSummaryTableString);
  }

}
