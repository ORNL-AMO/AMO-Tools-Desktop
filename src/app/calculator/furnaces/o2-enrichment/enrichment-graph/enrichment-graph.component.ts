import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, ChangeDetectorRef, KeyValueDiffers, OnChanges, SimpleChanges, DoCheck } from '@angular/core';
import { O2EnrichmentOutput, O2Enrichment } from '../../../../shared/models/phast/o2Enrichment';
import { Settings } from '../../../../shared/models/settings';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

import { SelectedDataPoint, SimpleChart, TraceCoordinates, TraceData } from '../../../../shared/models/plotting';
import * as Plotly from 'plotly.js';
import { O2EnrichmentService, DisplayPoint } from '../o2-enrichment.service';
import { PhastService } from '../../../../phast/phast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-enrichment-graph',
  templateUrl: './enrichment-graph.component.html',
  styleUrls: ['./enrichment-graph.component.css']
})
export class EnrichmentGraphComponent implements OnInit, OnChanges {

  @Input()
  o2EnrichmentOutput: O2EnrichmentOutput;
  @Input()
  o2Enrichment: O2Enrichment;
  @Input()
  settings: Settings;
  @Input()
  toggleCalculate: boolean;
  @Input()
  toggleResetData: boolean;
  @Input()
  toggleExampleData: boolean;

  // DOM
  @ViewChild("ngChartContainer", { static: false }) ngChartContainer: ElementRef;
  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  dataSummaryTableString: any;
  tabPanelChartId: string = 'tabPanelDiv';
  expandedChartId: string = 'expandedChartDiv';
  currentChartId: string = 'tabPanelDiv';

  // Graph Data
  selectedDataPoints: Array<DisplayPoint>;
  defaultSelectedPointsData: Array<DisplayPoint>;
  pointColors: Array<string>;
  enrichmentChart: SimpleChart;

  // Trace Defaults
  defaultPointOutlineColor = 'rgba(0, 0, 0, .6)';
  defaultPointColor = 'rgba(0, 0, 0, 0)';
  defaultTraceCount: number = 1;

  // Tooltips
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;
  expanded: boolean = false;

  // Update conditions/data
  maxFuelSavings: number;
  firstChange: boolean = true;
  isFirstChange: boolean = true;
  hasModification: boolean = false;
  makePlotSub: Subscription;

  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }

  constructor(private o2EnrichmentService: O2EnrichmentService,
    private cd: ChangeDetectorRef,
    private phastService: PhastService,
    ) {
  }

  ngOnInit() {
    this.pointColors = graphColors;
    this.triggerInitialResize();
    this.makePlotSub = this.o2EnrichmentService.makePlot.subscribe(makePlot => {
      if(makePlot) {
        this.addTrace();
        this.hasModification = true;
      }
    });
  }

  ngOnDestroy() {
    this.makePlotSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleResetData && !changes.toggleResetData.firstChange) {
      this.o2EnrichmentService.initChartData();
      this.enrichmentChart = this.o2EnrichmentService.enrichmentChart.getValue();
      this.selectedDataPoints = this.o2EnrichmentService.selectedDataPoints.getValue();
      this.initRenderChart();
    }
    else if (changes.toggleExampleData && !changes.toggleExampleData.firstChange) {
      this.o2EnrichmentService.initChartData();
      this.initChartSetup();
      this.setDefaultTraces();
      this.initRenderChart();
    }
    else if (!this.isFirstChange && changes) {
      this.updateChart();
    } else {
      this.selectedDataPoints = this.o2EnrichmentService.selectedDataPoints.getValue();
      this.enrichmentChart = this.o2EnrichmentService.enrichmentChart.getValue();
      if (!this.selectedDataPoints) {
        this.o2EnrichmentService.initChartData();
        this.initChartSetup();
        this.setDefaultTraces();
      }
      this.initRenderChart();
      this.isFirstChange = false;
    }
  }

  triggerInitialResize() {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => {
      this.initRenderChart();
    }, 25)
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
      this.initRenderChart();
    }
  }

  save() {
    this.o2EnrichmentService.enrichmentChart.next(this.enrichmentChart);
    this.o2EnrichmentService.selectedDataPoints.next(this.selectedDataPoints);
  }

  initRenderChart() {
    Plotly.purge(this.currentChartId);
    let chartLayout = JSON.parse(JSON.stringify(this.enrichmentChart.layout));
    Plotly.newPlot(this.currentChartId, this.enrichmentChart.data, chartLayout, this.enrichmentChart.config)
      .then(chart => {
        chart.on('plotly_hover', hoverData => {
          this.displayHoverGroupData(hoverData);
        });
        chart.on('plotly_unhover', unhoverData => {
          this.removeHoverGroupData();
        });
      });
    this.save();
  }

  initChartSetup() {
    this.maxFuelSavings = 0.0;
    this.enrichmentChart = this.o2EnrichmentService.enrichmentChart.getValue();
    this.selectedDataPoints = this.o2EnrichmentService.selectedDataPoints.getValue();
    this.hasModification = false;
  }

  setDefaultTraces(isUpdate: boolean = false) {
    if (isUpdate) {
      console.log('baseline update o2Enrichment', this.o2Enrichment);
    }
    let o2Enrichment = JSON.parse(JSON.stringify(this.o2Enrichment));

    let defaultLine = this.getEnrichmentLine(o2Enrichment);
    let enrichmentPoint = this.getEnrichmentPoint(o2Enrichment, defaultLine);

    let graphData: { data: TraceCoordinates, onGraph: boolean } = this.o2EnrichmentService.getGraphData(this.settings, enrichmentPoint, defaultLine);
    this.enrichmentChart.data[0].x = graphData.data.x;
    this.enrichmentChart.data[0].y = graphData.data.y;

    let fuelSavings = this.phastService.o2Enrichment(defaultLine, this.settings).fuelSavingsEnriched;
    this.enrichmentChart.data[1].x = [defaultLine.o2CombAirEnriched];
    this.enrichmentChart.data[1].y = [fuelSavings];
    this.enrichmentChart.data[1].marker.color = this.defaultPointColor;
    this.enrichmentChart.data[1].marker.line = {
      color: this.defaultPointOutlineColor,
      width: 4
    };

    if (!isUpdate) {

      let mainTraceDataPoint: DisplayPoint = {
        pointColor: '#000',
        pointX: defaultLine.o2CombAirEnriched,
        pointY: fuelSavings,
        combustionTemp: defaultLine.combAirTemp,
        flueOxygen: defaultLine.o2FlueGas,
        fuelTemp: defaultLine.flueGasTemp
      }
      this.selectedDataPoints.push(mainTraceDataPoint);
    }
    this.save();
  }

  updateModificationTrace() {
    let currentPointIndex = this.enrichmentChart.data.length - 1;
    let currentLineIndex = this.enrichmentChart.data.length - 2;

    let currentEnrichmentLine: any = this.getEnrichmentLine(this.o2Enrichment);
    currentEnrichmentLine.color = this.getNextColor();
    let enrichmentPoint = this.getEnrichmentPoint(this.o2Enrichment, currentEnrichmentLine);

    let graphData: { data: TraceCoordinates, onGraph: boolean } = this.o2EnrichmentService.getGraphData(this.settings, enrichmentPoint, currentEnrichmentLine);
    this.enrichmentChart.data[currentLineIndex].x = graphData.data.x;
    this.enrichmentChart.data[currentLineIndex].y = graphData.data.y;

    let fuelSavings = this.phastService.o2Enrichment(currentEnrichmentLine, this.settings).fuelSavingsEnriched;
    this.enrichmentChart.data[currentPointIndex].x = [currentEnrichmentLine.o2CombAirEnriched];
    this.enrichmentChart.data[currentPointIndex].y = [fuelSavings];
    this.save();
  }

  addTrace() {
    let newLineTrace: TraceData = JSON.parse(JSON.stringify(this.enrichmentChart.data[0]));
    let newPointTrace: TraceData = JSON.parse(JSON.stringify(this.enrichmentChart.data[1]));

    console.log('new trace o2Enrichment', this.o2Enrichment);
    let newEnrichmentLine: any = this.getEnrichmentLine(this.o2Enrichment);
    newEnrichmentLine.color = this.getNextColor();
    let enrichmentPoint = this.getEnrichmentPoint(this.o2Enrichment, newEnrichmentLine)

    let graphData: { data: TraceCoordinates, onGraph: boolean } = this.o2EnrichmentService.getGraphData(this.settings, enrichmentPoint, newEnrichmentLine);
    newLineTrace.x = graphData.data.x;
    newLineTrace.y = graphData.data.y;
    newLineTrace.line.color = this.getNextColor();

    let fuelSavings = this.phastService.o2Enrichment(newEnrichmentLine, this.settings).fuelSavingsEnriched;
    newPointTrace.x = [newEnrichmentLine.o2CombAirEnriched];
    newPointTrace.y = [fuelSavings];
    newPointTrace.marker.color = this.getNextColor();
    newPointTrace.marker.line = {
      color: this.getNextColor(),
      width: 4
    };

    let displayDataPoint: DisplayPoint = {
      pointColor: this.getNextColor(),
      pointX: newEnrichmentLine.o2CombAirEnriched,
      pointY: fuelSavings,
      combustionTemp: newEnrichmentLine.combAirTemp,
      flueOxygen: newEnrichmentLine.o2FlueGas,
      fuelTemp: newEnrichmentLine.flueGasTemp
    }

    Plotly.addTraces(this.currentChartId, [newLineTrace, newPointTrace]);
    this.selectedDataPoints.push(displayDataPoint);
    this.o2EnrichmentService.makePlot.next(false);
    this.save();
    this.cd.detectChanges();
  }

  getEnrichmentLine(o2Enrichment: O2Enrichment) {
    // o2Enrichment = JSON.parse(JSON.stringify(o2Enrichment))
    let line: any = {
      o2CombAir: o2Enrichment.o2CombAir,
      o2CombAirEnriched: o2Enrichment.o2CombAirEnriched,
      flueGasTemp: o2Enrichment.flueGasTemp,
      flueGasTempEnriched: o2Enrichment.flueGasTempEnriched,
      o2FlueGas: o2Enrichment.o2FlueGas,
      o2FlueGasEnriched: o2Enrichment.o2FlueGasEnriched,
      combAirTemp: o2Enrichment.combAirTemp,
      combAirTempEnriched: o2Enrichment.combAirTempEnriched,
      fuelConsumption: o2Enrichment.fuelConsumption,
      color: '#000000',
      fuelSavings: 0,
      data: [],
      x: null,
      y: null
    };
    return line;
  }

  getEnrichmentPoint(o2Enrichment: O2Enrichment, currentEnrichmentLine) {
    // o2Enrichment = JSON.parse(JSON.stringify(o2Enrichment))
    let point = {
      operatingHours: o2Enrichment.operatingHours,
      operatingHoursEnriched: o2Enrichment.operatingHoursEnriched,
      o2CombAir: o2Enrichment.o2CombAir,
      o2CombAirEnriched: 0,
      flueGasTemp: o2Enrichment.flueGasTemp,
      flueGasTempEnriched: currentEnrichmentLine.flueGasTempEnriched,
      o2FlueGas: o2Enrichment.o2FlueGas,
      o2FlueGasEnriched: currentEnrichmentLine.o2FlueGasEnriched,
      combAirTemp: o2Enrichment.combAirTemp,
      combAirTempEnriched: currentEnrichmentLine.combAirTempEnriched,
      fuelConsumption: o2Enrichment.fuelConsumption,
      fuelCost: o2Enrichment.fuelCost,
      fuelCostEnriched: o2Enrichment.fuelCostEnriched
    };
    return point;
  }

  getNextColor(): string {
    return this.pointColors[(this.enrichmentChart.data.length + 1) % this.pointColors.length];
  }

  updateChart() {
    if (!this.hasModification) {
      this.setDefaultTraces(true);
    } else {
      this.updateModificationTrace();
    }
    let chartLayout = JSON.parse(JSON.stringify(this.enrichmentChart.layout));
    Plotly.update(this.currentChartId, this.enrichmentChart.data, chartLayout);
    this.save();
  }

  displayHoverGroupData(hoverEventData) {
    let hoverIndex = hoverEventData.points[0].pointIndex;
    // Save initial enrichment points to assign on un_hover
    this.defaultSelectedPointsData = JSON.parse(JSON.stringify(this.selectedDataPoints));
    console.log('this.selectedDataPoints', this.selectedDataPoints);

    this.selectedDataPoints.forEach((line, index) => {
      let splineTraceIndex = index + index;
      console.log('hoverIndex', hoverIndex);
      if (hoverIndex != 0) {
        line.pointX = Number(this.enrichmentChart.data[splineTraceIndex].x[hoverIndex]);
        line.pointY = Number(this.enrichmentChart.data[splineTraceIndex].y[hoverIndex]);
      } else {
      // Hovering over trace marker - assign x,y directly
        line.pointX = Number(hoverEventData.points[0].x);
        line.pointY = Number(hoverEventData.points[0].y);
      }
    });
    this.cd.detectChanges();
  }

  removeHoverGroupData() {
    this.selectedDataPoints = this.defaultSelectedPointsData;
    this.cd.detectChanges();
  }

  deleteDataPoint(point: SelectedDataPoint) {
    let traceCount: number = this.enrichmentChart.data.length;
    let deleteTraceIndex: number = this.enrichmentChart.data.findIndex(trace => trace.x[0] == point.pointX && trace.y[0] == point.pointY);
    
    // ignore default traces
    if (traceCount > this.defaultTraceCount) {
      if(deleteTraceIndex == -1) {
        Plotly.deleteTraces(this.currentChartId, [this.enrichmentChart.data.length - 1, this.enrichmentChart.data.length - 2]);
      } else {
        Plotly.deleteTraces(this.currentChartId, [deleteTraceIndex + 1, deleteTraceIndex + 2]);
      }
      this.selectedDataPoints.splice(deleteTraceIndex, 1);
      this.cd.detectChanges();
      this.save();
    }
  }

  updateTableString() {
    this.dataSummaryTableString = this.dataSummaryTable.nativeElement.innerText;
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

  toggleGrid() {
    let showingGridX: boolean = this.enrichmentChart.layout.xaxis.showgrid;
    let showingGridY: boolean = this.enrichmentChart.layout.yaxis.showgrid;
    this.enrichmentChart.layout.xaxis.showgrid = !showingGridX;
    this.enrichmentChart.layout.yaxis.showgrid = !showingGridY;
    this.updateChart();
  }


}
