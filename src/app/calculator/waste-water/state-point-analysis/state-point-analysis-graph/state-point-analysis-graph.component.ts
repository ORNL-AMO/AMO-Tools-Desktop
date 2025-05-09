import { Component, OnInit, HostListener, ViewChild, ElementRef, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { SimpleChart, TraceCoordinates } from '../../../../shared/models/plotting';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

import { StatePointAnalysisService } from '../state-point-analysis.service';
import { Subscription } from 'rxjs';
import { StatePointAnalysisGraphService } from '../state-point-analysis-graph.service';
import { StatePointAnalysisOutput, StatePointAnalysisResults } from '../../../../shared/models/waste-water';
import { PlotlyService } from 'angular-plotly.js';

@Component({
    selector: 'app-state-point-analysis-graph',
    templateUrl: './state-point-analysis-graph.component.html',
    styleUrls: ['./state-point-analysis-graph.component.css'],
    standalone: false
})
export class StatePointAnalysisGraphComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  modificationExists: boolean;

  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code === 'Escape') {
        this.contractChart();
      }
    }
  }

  // DOM
  @ViewChild("expandedChartDiv", { static: false }) expandedChartDiv: ElementRef;
  @ViewChild("panelChartDiv", { static: false }) panelChartDiv: ElementRef;

  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  dataSummaryTableString: any;

  // Tooltips
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;
  expanded: boolean = false;

  outputSub: Subscription;

  // Graphing
  spaGraph: SimpleChart;
  graphData: { data: Array<StatePointAnalysisResults>, sviParameterName: string };
  traceNames = {
    0: 'SVIGN',
  };
  graphColors: Array<string>;
  spaColors: Array<string>;
  yUnits: string = 'lb/ft<sup>2</sup>d';

  constructor(private statePointAnalysisGraphService: StatePointAnalysisGraphService,
    private statePoinAnalysisService: StatePointAnalysisService,
    private plotlyService: PlotlyService
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.outputSub = this.statePoinAnalysisService.output.subscribe(output => {
      if (output) {
        this.setGraphData(output);
        this.initRenderChart();
      }
    });
  }

  ngOnDestroy() {
    this.outputSub.unsubscribe();
  }

  initRenderChart() {
    this.initChartSetup();
    this.drawTraces();

    let chartLayout = JSON.parse(JSON.stringify(this.spaGraph.layout));
    if (this.expanded && this.expandedChartDiv) {
      this.plotlyService.newPlot(this.expandedChartDiv.nativeElement, this.spaGraph.data, chartLayout, this.spaGraph.config);
    } else if (!this.expanded && this.panelChartDiv) {
      this.plotlyService.newPlot(this.panelChartDiv.nativeElement, this.spaGraph.data, chartLayout, this.spaGraph.config);
    }
    this.save();
  }

  initChartSetup() {
    this.graphColors = graphColors;
    this.statePointAnalysisGraphService.initChart();
    this.spaGraph = this.statePointAnalysisGraphService.spaGraph.getValue();
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.yUnits = 'kg/m<sup>2</sup>d';
      this.spaGraph.layout.yaxis.title.text = `Solids Flux (${this.yUnits})`;
    }
  }

  setGraphData(output: StatePointAnalysisOutput) {
    this.graphData = { data: [], sviParameterName: 'SVIGN' };
    this.graphData.data.push(output.baseline);
    this.graphData.sviParameterName = output.sviParameterName;
    if (output.modification) {
      this.graphData.data.push(output.modification);
    }
  }

  drawTraces() {
    let sviParameterTrace = this.statePointAnalysisGraphService.getEmptyTrace();
    let coordinates: TraceCoordinates = this.statePointAnalysisGraphService.getCoordinatePairs(this.graphData);

    sviParameterTrace.x = coordinates.x;
    sviParameterTrace.y = coordinates.y;
    sviParameterTrace.name = this.graphData.sviParameterName;

    sviParameterTrace.hovertemplate = `Concentration %{x:.2r} (g/L) <br>Flux %{y:.2r} (${this.yUnits})`;
    sviParameterTrace.line.color = this.graphColors[0 % this.graphColors.length]
    this.spaGraph.data[0] = sviParameterTrace;

    this.graphData.data.forEach((result: StatePointAnalysisResults, index: number) => {
      let resultType = 'Baseline';
      let traceIndex = 1;
      if (index == 1) {
        resultType = 'Modification';
        traceIndex += 3;
      }
      let underflowTrace = this.statePointAnalysisGraphService.getEmptyTrace();
      let underflowCoordinates: TraceCoordinates = this.statePointAnalysisGraphService.buildCoordinatesFromPoints([0, result.UnderFlowRateY1], [result.UnderFlowRateX2, 0]);
      underflowTrace.x = underflowCoordinates.x;
      underflowTrace.y = underflowCoordinates.y;

      underflowTrace.name = `Underflow Rate (${resultType})`;
      underflowTrace.legendGroup = `group${index}`;
      underflowTrace.hovertemplate = `Concentration %{x:.2r} (g/L) <br>Flux %{y:.2r} (${this.yUnits})`;
      underflowTrace.line.color = this.graphColors[traceIndex % this.graphColors.length]
      this.spaGraph.data[traceIndex] = underflowTrace;


      let statePointTrace = this.statePointAnalysisGraphService.getEmptyTrace();
      statePointTrace.x = [result.StatePointX];
      statePointTrace.y = [result.StatePointY];
      statePointTrace.name = `State Point (${resultType})`;
      statePointTrace.legendGroup = `group${index}`;
      statePointTrace.hovertemplate = `Concentration %{x:.2r} (g/L) <br>Flux %{y:.2r} (${this.yUnits})`;
      statePointTrace.mode = "markers";
      statePointTrace.marker = {
        size: 12,
      };

      let overflowTrace = this.statePointAnalysisGraphService.getEmptyTrace();
      let overflowCoordinates: TraceCoordinates = this.statePointAnalysisGraphService.buildCoordinatesFromPoints([0, 0], [result.OverFlowRateX2, result.OverFlowRateY2]);
      overflowTrace.x = overflowCoordinates.x;
      overflowTrace.y = overflowCoordinates.y;

      overflowTrace.name = `Overflow Rate (${resultType})`;
      overflowTrace.legendGroup = `group${index}`;
      overflowTrace.hovertemplate = `Concentration %{x:.2r} (g/L) <br>Flux %{y:.2r} (${this.yUnits})`;
      overflowTrace.line.color = this.graphColors[(traceIndex) % this.graphColors.length];
      overflowTrace.line.dash = 'dot';
      overflowTrace.line.width = 4;
      this.spaGraph.data[traceIndex + 1] = overflowTrace;


      statePointTrace.line.color = this.graphColors[(traceIndex) % this.graphColors.length]
      this.spaGraph.data[traceIndex + 2] = statePointTrace;
    });
  }


  save() {
    this.statePointAnalysisGraphService.spaGraph.next(this.spaGraph);
  }

  toggleGrid() {
    let showingGridX: boolean = this.spaGraph.layout.xaxis.showgrid;
    let showingGridY: boolean = this.spaGraph.layout.yaxis.showgrid;
    this.spaGraph.layout.xaxis.showgrid = !showingGridX;
    this.spaGraph.layout.yaxis.showgrid = !showingGridY;

    let chartLayout = JSON.parse(JSON.stringify(this.spaGraph.layout));
    if(this.expanded){
      this.plotlyService.update(this.expandedChartDiv.nativeElement, this.spaGraph.data, chartLayout);
    }else{
      this.plotlyService.update(this.panelChartDiv.nativeElement, this.spaGraph.data, chartLayout);
    }
    this.save();
  }


  expandChart() {
    this.expanded = true;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.initRenderChart();
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
      this.initRenderChart();
    }, 200);
  }

}
