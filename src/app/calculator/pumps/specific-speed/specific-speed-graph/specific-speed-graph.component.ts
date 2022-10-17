import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { UntypedFormGroup } from '@angular/forms';
import { SpecificSpeedService } from '../specific-speed.service';

import { DataPoint, SimpleChart, TraceData } from '../../../../shared/models/plotting';
import { PlotlyService } from 'angular-plotly.js';

@Component({
  selector: 'app-specific-speed-graph',
  templateUrl: './specific-speed-graph.component.html',
  styleUrls: ['./specific-speed-graph.component.css']
})
export class SpecificSpeedGraphComponent implements OnInit {
  @Input()
  speedForm: UntypedFormGroup;
  @Input()
  inPsat: boolean;
  @Input()
  resetData: boolean;
  @Input()
  toggleCalculate: boolean;

  @ViewChild("expandedChartDiv", { static: false }) expandedChartDiv: ElementRef;
  @ViewChild("panelChartDiv", { static: false }) panelChartDiv: ElementRef;
  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  dataSummaryTableString: any;

  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }

  // Update conditions/data
  selectedDataPoints: Array<DataPoint>;
  pointColors: Array<string>;
  specificSpeedChart: SimpleChart;
  firstChange: boolean = true;
  validCurrentSpeed: boolean = false;
  currentPumpType: number;

  // Tooltips
  expanded: boolean;
  hoverBtnExpand: boolean;
  displayExpandTooltip: boolean;
  hoverBtnCollapse: boolean;
  hoverBtnGridLines: any;
  displayGridLinesTooltip: boolean;
  displayCollapseTooltip: boolean;
  dataPointTraces: Array<TraceData>;
  constructor(private psatService: PsatService,
    private specificSpeedService: SpecificSpeedService,
    private cd: ChangeDetectorRef,
    private plotlyService: PlotlyService) { }

  ngOnInit() {
    this.currentPumpType = this.speedForm.controls.pumpType.value;
  }

  ngAfterViewInit() {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.resetData) {
        this.specificSpeedService.initChartData();
        this.renderChart();
      }
      if (changes.toggleCalculate && !changes.resetData) {
        if (this.speedForm.valid) {
          this.checkReplotMethod();
        }
      }
    } else {
      this.firstChange = false;
    }
  }

  save() {
    this.specificSpeedService.specificSpeedChart.next(this.specificSpeedChart);
    this.specificSpeedService.selectedDataPoints.next(this.selectedDataPoints);
  }

  renderChart() {
    this.initChartSetup();
    this.dataPointTraces = new Array();
    this.selectedDataPoints = new Array();
    this.setCalculatedTrace();
    this.newPlot();
    this.save();
  }

  newPlot() {
    let traceData: Array<TraceData> = new Array();
    this.specificSpeedChart.data.forEach((trace, i) => {
      traceData.push(trace);
    });
    this.dataPointTraces.forEach(trace => {
      traceData.push(trace);
    })
    let chartLayout = JSON.parse(JSON.stringify(this.specificSpeedChart.layout));
    if (this.expanded && this.expandedChartDiv) {
      this.plotlyService.newPlot(this.expandedChartDiv.nativeElement, traceData, chartLayout, this.specificSpeedChart.config)
        .then(chart => {
          chart.on('plotly_click', (graphData) => {
            this.createDataPoint(graphData);
          });
        });
    } else if (!this.expanded && this.panelChartDiv) {
      this.plotlyService.newPlot(this.panelChartDiv.nativeElement, traceData, chartLayout, this.specificSpeedChart.config)
        .then(chart => {
          chart.on('plotly_click', (graphData) => {
            this.createDataPoint(graphData);
          });
        });
    }
  }

  updateChart() {
    this.setCalculatedTrace();
    this.newPlot();
    this.save();
  }

  initChartSetup() {
    let currentData = this.getLineTraceData();
    this.pointColors = graphColors;
    this.specificSpeedChart = this.specificSpeedService.specificSpeedChart.getValue();
    this.selectedDataPoints = this.specificSpeedService.selectedDataPoints.getValue();

    // lineTrace
    this.specificSpeedChart.data[0].x = currentData.x;
    this.specificSpeedChart.data[0].y = currentData.y;
  }

  setCalculatedTrace() {
    let specificSpeed = Math.round(this.getSpecificSpeed());
    let efficiencyCorrection = this.psatService.achievableEfficiency(this.speedForm.controls.pumpType.value, specificSpeed);

    let calculatedPoint: DataPoint = {
      pointColor: '#000',
      x: specificSpeed,
      y: efficiencyCorrection
    }

    let resultCoordinateTrace: TraceData = this.specificSpeedService.getTraceDataFromPoint(calculatedPoint);
    resultCoordinateTrace.name = "Current Specific Speed";

    if (!isNaN(calculatedPoint.x)) {
      this.validCurrentSpeed = true;
      this.specificSpeedChart.data[1] = resultCoordinateTrace;
      this.selectedDataPoints.splice(0, 1, calculatedPoint);
      this.cd.detectChanges();
    } else {
      this.validCurrentSpeed = false;
    }
  }

  createDataPoint(graphData) {
    let selectedPoint: DataPoint = {
      pointColor: this.pointColors[(this.dataPointTraces.length + 1) % this.pointColors.length],
      x: graphData.points[0].x,
      y: graphData.points[0].y
    }

    let selectedPointTrace = this.specificSpeedService.getTraceDataFromPoint(selectedPoint);
    this.dataPointTraces.push(selectedPointTrace);
    this.selectedDataPoints.push(selectedPoint);
    this.newPlot();
    this.cd.detectChanges();
    this.save();
  }

  checkReplotMethod() {
    let fromVerticalTurbine = this.currentPumpType == 9 && this.speedForm.controls.pumpType.value != 9;
    let ToVerticalTurbine = this.currentPumpType != 9 && this.speedForm.controls.pumpType.value == 9;

    if (fromVerticalTurbine || ToVerticalTurbine) {
      this.renderChart();
    } else {
      this.updateChart();
    }
    this.currentPumpType = this.speedForm.controls.pumpType.value;
  }

  getLineTraceData(): { x: Array<number>, y: Array<number> } {
    let traceCoordinates: { x: Array<number>, y: Array<number> } = {
      x: new Array<number>(),
      y: new Array<number>()
    };

    let curveType: any;
    if (this.speedForm.controls.pumpType.value === 9) {
      // Vertical Turbine
      curveType = {
        init: 1720,
        end: 16350,
        step: 25
      };
    }
    else {
      curveType = {
        init: 680,
        end: 7300,
        step: 25
      };
    }

    for (let i = curveType.init; i < curveType.end; i += curveType.step) {
      let efficiencyCorrection: number = this.psatService.achievableEfficiency(this.speedForm.controls.pumpType.value, i);
      if (efficiencyCorrection <= 5.5) {
        traceCoordinates.x.push(i);
        traceCoordinates.y.push(efficiencyCorrection);
      }
    }

    return traceCoordinates;
  }

  deleteDataPoint(point: DataPoint, index: number) {
    this.dataPointTraces = this.dataPointTraces.filter(trace => { return trace.marker.color != point.pointColor });
    this.selectedDataPoints.splice(index, 1);
    this.newPlot();
    this.cd.detectChanges();
    this.save();
  }

  getSpecificSpeed(): number {
    return this.speedForm.controls.pumpRPM.value * Math.pow(this.speedForm.controls.flowRate.value, 0.5) / Math.pow(this.speedForm.controls.head.value, .75);
  }

  updateTableString() {
    this.dataSummaryTableString = this.dataSummaryTable.nativeElement.innerText;
  }

  toggleGrid() {
    let showingGridX: boolean = this.specificSpeedChart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.specificSpeedChart.layout.yaxis.showgrid;
    this.specificSpeedChart.layout.xaxis.showgrid = !showingGridX;
    this.specificSpeedChart.layout.yaxis.showgrid = !showingGridY;
    this.updateChart();
  }

  expandChart() {
    this.expanded = true;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.newPlot();
    }, 100);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.newPlot();
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

}
