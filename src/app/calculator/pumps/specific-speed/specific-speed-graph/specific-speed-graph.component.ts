import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { FormGroup } from '@angular/forms';
import { SpecificSpeedService} from '../specific-speed.service';

import * as Plotly from 'plotly.js';
import { SelectedDataPoint, SimpleChart, TraceData } from '../../../../shared/models/plotting';

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

  @ViewChild("ngChartContainer", { static: false }) ngChartContainer: ElementRef;
  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  dataSummaryTableString: any;
  
  tabPanelChartId: string = 'tabPanelDiv';
  expandedChartId: string = 'expandedChartDiv';
  currentChartId: string = 'tabPanelDiv';
  
  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }
  
  selectedDataPoints: Array<SelectedDataPoint>;
  pointColors: Array<string>;
  specificSpeedChart: SimpleChart;
  firstChange: boolean = true;
  validCurrentSpeed: boolean = false;
  currentPumpType: number;
  expanded: boolean;
  hoverBtnExpand: boolean;
  displayExpandTooltip: boolean;
  hoverBtnCollapse: boolean;
  hoverBtnGridLines: any;
  displayGridLinesTooltip: boolean;
  displayCollapseTooltip: boolean;

  constructor(private psatService: PsatService, 
              private specificSpeedService: SpecificSpeedService,
              private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.currentPumpType = this.speedForm.controls.pumpType.value;
    this.triggerInitialResize();
  }

  triggerInitialResize() {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => {
      this.initRenderChart();
    }, 25)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.resetData) {
        this.specificSpeedService.initChartData();
        this.initRenderChart();
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

  initRenderChart() {
    Plotly.purge(this.currentChartId);
    
    this.initChartSetup();
    this.setCalculatedTrace();

    let chartLayout = JSON.parse(JSON.stringify(this.specificSpeedChart.layout));
    Plotly.newPlot(this.currentChartId, this.specificSpeedChart.data, chartLayout, this.specificSpeedChart.config)
      .then(chart => {
        chart.on('plotly_click', (graphData) => {
          this.createSelectedDataPoint(graphData);
        });
      });
    this.save();
    
  }

  updateChart() {
    let chartLayout = JSON.parse(JSON.stringify(this.specificSpeedChart.layout));
    this.setCalculatedTrace();
    Plotly.update(this.currentChartId, this.specificSpeedChart.data, chartLayout, [1]);
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

    let calculatedPoint: SelectedDataPoint = {
      pointColor: '#000',
      pointX: specificSpeed,
      pointY: efficiencyCorrection
    }

    let resultCoordinateTrace: TraceData = this.specificSpeedService.getTraceDataFromPoint(calculatedPoint);
    resultCoordinateTrace.name = "Current Specific Speed";

    if (!isNaN(calculatedPoint.pointX)) {
      this.validCurrentSpeed = true;
      this.specificSpeedChart.data[1] = resultCoordinateTrace;
      this.selectedDataPoints.splice(0, 1, calculatedPoint);
      this.cd.detectChanges();
    } else {
      this.validCurrentSpeed = false;
    }
  }

  createSelectedDataPoint(graphData) {
    let selectedPoint: SelectedDataPoint = {
      pointColor: this.pointColors[(this.specificSpeedChart.data.length + 1) % this.pointColors.length],
      pointX: graphData.points[0].x,
      pointY: graphData.points[0].y
    }

    let selectedPointTrace = this.specificSpeedService.getTraceDataFromPoint(selectedPoint);
    Plotly.addTraces(this.currentChartId, selectedPointTrace);
    this.selectedDataPoints.push(selectedPoint);
    this.cd.detectChanges();
    this.save();
  }

  checkReplotMethod() {
    let fromVerticalTurbine = this.currentPumpType == 9 && this.speedForm.controls.pumpType.value != 9;
    let ToVerticalTurbine = this.currentPumpType != 9 && this.speedForm.controls.pumpType.value == 9;

    if (fromVerticalTurbine || ToVerticalTurbine) {
      this.initRenderChart();
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

  deleteDataPoint(point: SelectedDataPoint) {
    let traceCount: number = this.specificSpeedChart.data.length;
    let deleteTraceIndex: number = this.specificSpeedChart.data.findIndex(trace => trace.x[0] == point.pointX && trace.y[0] == point.pointY);
    // ignore default traces
    if (traceCount > 2 && deleteTraceIndex != -1) {
      Plotly.deleteTraces(this.currentChartId, [deleteTraceIndex]);
      this.selectedDataPoints.splice(deleteTraceIndex - 1, 1);
      this.cd.detectChanges();
      this.save();
    }
  }

  getSpecificSpeed(): number {
    return this.speedForm.controls.pumpRPM.value * Math.pow(this.speedForm.controls.flowRate.value, 0.5) / Math.pow(this.speedForm.controls.head.value, .75);
  }

  updateTableString() {
    this.dataSummaryTableString = this.dataSummaryTable.nativeElement.innerText;
  }

  resizeGraph() {
    let expandedChart = this.ngChartContainer.nativeElement;
    if (expandedChart) {
      if (this.expanded) {
        this.currentChartId = this.expandedChartId;
      }
      else {
        this.currentChartId = this.tabPanelChartId;
      }
      if (this.speedForm.valid) {
        this.initRenderChart();
      }
    }
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
      this.resizeGraph();
    }, 100);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.resizeGraph();
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
