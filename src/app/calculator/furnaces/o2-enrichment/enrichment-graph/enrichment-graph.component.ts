import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, ChangeDetectorRef, KeyValueDiffers, OnChanges, SimpleChanges, DoCheck } from '@angular/core';
import { O2EnrichmentOutput, O2Enrichment } from '../../../../shared/models/phast/o2Enrichment';
import { Settings } from '../../../../shared/models/settings';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

import { SelectedDataPoint, SimpleChart, TraceCoordinates, TraceData } from '../../../../shared/models/plotting';
import * as Plotly from 'plotly.js';
import { O2EnrichmentService, EnrichmentPoint } from '../o2-enrichment.service';
import { PhastService } from '../../../../phast/phast.service';
import { SvgToPngService } from '../../../../shared/helper-services/svg-to-png.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Subscription } from 'rxjs';

interface HoverGroupData {
  lineGroup: Array<EnrichmentPoint>,
  lineGroupData: Array<any>,
};

@Component({
  selector: 'app-enrichment-graph',
  templateUrl: './enrichment-graph.component.html',
  styleUrls: ['./enrichment-graph.component.css']
})
export class EnrichmentGraphComponent implements OnInit, OnChanges, DoCheck {

  @Input()
  o2EnrichmentOutput: O2EnrichmentOutput;
  // input data
  @Input()
  o2Enrichment: O2Enrichment;
  @Input()
  lines: any;
  @Input()
  settings: Settings;

  o2EnrichmentPoint: any;

  @Input()
  toggleCalculate: boolean;
  @Input()
  toggleResetData: boolean;
  @Input()
  toggleExampleData: boolean;

  @ViewChild("ngChartContainer", { static: false }) ngChartContainer: ElementRef;
  @ViewChild('dataSummaryTable', { static: false }) dataSummaryTable: ElementRef;
  dataSummaryTableString: any;
  tabPanelChartId: string = 'tabPanelDiv';
  expandedChartId: string = 'expandedChartDiv';
  currentChartId: string = 'tabPanelDiv';

  selectedDataPoints: Array<EnrichmentPoint>;
  pointColors: Array<string>;
  enrichmentChart: SimpleChart;

  xAxisTitle: string = "Flow Rate (gpm)";
  defaultPointCount: number = 1;
  defaultPointOutlineColor = 'rgba(0, 0, 0, .6)';
  defaultPointColor = 'rgba(0, 0, 0, 0)';

  firstChange: boolean = true;
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;
  expanded: boolean = false;
  differ: any;
  change: boolean;
  maxFuelSavings: number;
  isFirstChange: boolean = true;

  mainLine: any;
  baselineChange: boolean;
  makePlotSub: Subscription;

  hoverGroupData: HoverGroupData;
  updatedTraces: Array<number>;

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
    private differs: KeyValueDiffers,
    private svgToPngService: SvgToPngService,
    private convertUnitsService: ConvertUnitsService) {
    this.differ = differs.find({}).create();
  }

  ngOnInit() {
    this.triggerInitialResize();
    this.makePlotSub = this.o2EnrichmentService.makePlot.subscribe(makePlot => {
      if(makePlot) {
        this.addTrace();
      }
    });
  }

  ngOnDestroy() {
    this.makePlotSub.unsubscribe();
  }

  ngDoCheck() {
    const baseline = {
      o2CombAir: null,
      flueGasTemp: null,
      o2FlueGas: null,
      combAirTemp: null
    };

    const changes = this.differ.diff(this.o2Enrichment);
    if (changes) {
      changes.forEachChangedItem(r => {
        (r.key in baseline) ? this.baselineChange = true : this.baselineChange = false;
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleResetData && !changes.toggleResetData.firstChange) {
      console.log('toggleResetData', changes)
      this.o2EnrichmentService.initChartData();
      this.initRenderChart();
    }
    else if (changes.toggleExampleData && !changes.toggleExampleData.firstChange) {
      console.log('togglExampleData', changes)
      this.o2EnrichmentService.initChartData();
      this.initRenderChart();
    }
    else if (!this.isFirstChange && changes) {
      // this.checkReplotMethod();
      console.log('updateChart', this.firstChange);
      this.updateChart();
    } else {
      console.log('initRenderChart', this.firstChange)
      this.o2EnrichmentService.initChartData();
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
      // TODO valid condition?
      // if (this.checkForm()) {
        this.initRenderChart();
      // }
    }
  }

  save() {
    this.o2EnrichmentService.enrichmentChart.next(this.enrichmentChart);
    this.o2EnrichmentService.selectedDataPoints.next(this.selectedDataPoints);
  }

  initRenderChart() {
    this.initChartSetup();
    this.setDefaultTraces();
    // this.setCalculatedTraces();

    let chartLayout = JSON.parse(JSON.stringify(this.enrichmentChart.layout));
    Plotly.newPlot(this.currentChartId, this.enrichmentChart.data, chartLayout, this.enrichmentChart.config)
      .then(chart => {
        chart.on('plotly_hover', hoverData => {
          this.initHoverGroupData(hoverData);
        });
        chart.on('plotly_unhover', unhoverData => {
          this.removeHoverGroupData();
        });
      });
    this.save();
  }

  updateChart() {
    let chartLayout = JSON.parse(JSON.stringify(this.enrichmentChart.layout));
    // this.setDefaultTraces(true);
    this.updateUserTrace();
    let updatedTraces = this.updatedTraces || [0, 1];
    console.log('updated traces', updatedTraces);
    Plotly.update(this.currentChartId, this.enrichmentChart.data, chartLayout, updatedTraces);
    this.save();
  }

  initChartSetup() {
    Plotly.purge(this.currentChartId);

    this.change = true;
    this.maxFuelSavings = 0.0;
    this.pointColors = graphColors;
    this.hoverGroupData = {
      lineGroupData: [],
      lineGroup: []
    }
    this.updatedTraces = [0, 1];
    this.enrichmentChart = this.o2EnrichmentService.enrichmentChart.getValue();
    this.selectedDataPoints = this.o2EnrichmentService.selectedDataPoints.getValue();

    this.mainLine = {
      o2CombAir: this.o2Enrichment.o2CombAir,
      o2CombAirEnriched: this.o2Enrichment.o2CombAirEnriched,
      flueGasTemp: this.o2Enrichment.flueGasTemp,
      flueGasTempEnriched: this.o2Enrichment.flueGasTempEnriched,
      o2FlueGas: this.o2Enrichment.o2FlueGas,
      o2FlueGasEnriched: this.o2Enrichment.o2FlueGasEnriched,
      combAirTemp: this.o2Enrichment.combAirTemp,
      combAirTempEnriched: this.o2Enrichment.combAirTempEnriched,
      fuelConsumption: this.o2Enrichment.fuelConsumption,
      color: '#000000',
      fuelSavings: 0,
      data: [],
      x: null,
      y: null
    };

    this.checkLineFuelSavings(this.mainLine);

    this.o2EnrichmentPoint = {
      operatingHours: this.o2Enrichment.operatingHours,
      operatingHoursEnriched: this.o2Enrichment.operatingHoursEnriched,
      o2CombAir: this.o2Enrichment.o2CombAir,
      o2CombAirEnriched: 0,
      flueGasTemp: this.o2Enrichment.flueGasTemp,
      flueGasTempEnriched: this.mainLine.flueGasTempEnriched,
      o2FlueGas: this.o2Enrichment.o2FlueGas,
      o2FlueGasEnriched: this.mainLine.o2FlueGasEnriched,
      combAirTemp: this.o2Enrichment.combAirTemp,
      combAirTempEnriched: this.mainLine.combAirTempEnriched,
      fuelConsumption: this.o2Enrichment.fuelConsumption,
      fuelCost: this.o2Enrichment.fuelCost,
      fuelCostEnriched: this.o2Enrichment.fuelCostEnriched
    };

    this.hoverGroupData.lineGroupData.push(this.mainLine);

  }

  checkLineFuelSavings(enrichmentLine) {
    if (enrichmentLine.fuelSavings > this.maxFuelSavings) {
      this.maxFuelSavings = enrichmentLine.fuelSavings;
    }
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].fuelSavings > this.maxFuelSavings) {
        this.maxFuelSavings = this.lines[i].fuelSavings;
      }
    }
  }


  setDefaultTraces(update = false) {
    console.log('setDefault o2Enrichment', this.o2Enrichment);
    let graphData: { data: TraceCoordinates, onGraph: boolean } = this.o2EnrichmentService.getGraphData(this.settings, this.o2EnrichmentPoint, this.mainLine);

    this.enrichmentChart.data[0].x = graphData.data.x;
    this.enrichmentChart.data[0].y = graphData.data.y;

    let fuelSavings = this.phastService.o2Enrichment(this.mainLine, this.settings).fuelSavingsEnriched;
    this.enrichmentChart.data[1].x = [this.mainLine.o2CombAirEnriched];
    this.enrichmentChart.data[1].y = [fuelSavings];
    this.enrichmentChart.data[1].marker.color = this.defaultPointColor;
    this.enrichmentChart.data[1].marker.line = {
      color: this.defaultPointOutlineColor,
      width: 4
    };

    if (!update) {
      let mainTrace: EnrichmentPoint = {
        pointColor: this.pointColors[(this.enrichmentChart.data.length + 1) % this.pointColors.length],
        pointX: this.mainLine.o2CombAirEnriched,
        pointY: fuelSavings,
        combustionTemp: this.mainLine.combAirTemp,
        flueOxygen: this.mainLine.o2FlueGas,
        fuelTemp: this.mainLine.flueGasTemp
      }
      this.hoverGroupData.lineGroup.push(mainTrace);
    } 
  }

  updateUserTrace() {
    console.log('update o2Enrichment', this.o2Enrichment);
    // let currentEnrichmentLine = {
    //   o2CombAir: this.o2Enrichment.o2CombAir,
    //   o2CombAirEnriched: this.o2Enrichment.o2CombAirEnriched,
    //   flueGasTemp: this.o2Enrichment.flueGasTemp,
    //   flueGasTempEnriched: this.o2Enrichment.flueGasTempEnriched,
    //   o2FlueGas: this.o2Enrichment.o2FlueGas,
    //   o2FlueGasEnriched: this.o2Enrichment.o2FlueGasEnriched,
    //   combAirTemp: this.o2Enrichment.combAirTemp,
    //   combAirTempEnriched: this.o2Enrichment.combAirTempEnriched,
    //   fuelConsumption: this.o2Enrichment.fuelConsumption,
    //   color: this.getRandomColor(),
    //   fuelSavings: 0,
    //   data: [],
    //   x: null,
    //   y: null
    // };
    this.mainLine = {
      o2CombAir: this.o2Enrichment.o2CombAir,
      o2CombAirEnriched: this.o2Enrichment.o2CombAirEnriched,
      flueGasTemp: this.o2Enrichment.flueGasTemp,
      flueGasTempEnriched: this.o2Enrichment.flueGasTempEnriched,
      o2FlueGas: this.o2Enrichment.o2FlueGas,
      o2FlueGasEnriched: this.o2Enrichment.o2FlueGasEnriched,
      combAirTemp: this.o2Enrichment.combAirTemp,
      combAirTempEnriched: this.o2Enrichment.combAirTempEnriched,
      fuelConsumption: this.o2Enrichment.fuelConsumption,
      color: this.getRandomColor(),
      fuelSavings: 0,
      data: [],
      x: null,
      y: null
    }
  
    // currentEnrichmentLine = this.checkLineFuelSavings(currentEnrichmentLine);
    this.checkLineFuelSavings(this.mainLine);

    let graphData: { data: TraceCoordinates, onGraph: boolean } = this.o2EnrichmentService.getGraphData(this.settings, this.o2EnrichmentPoint, this.mainLine);
    let currentLine = this.enrichmentChart.data.length - 1;
    this.updatedTraces.push(currentLine);
    console.log('currentLine', currentLine);
    console.log('current chart', this.enrichmentChart);
    this.enrichmentChart.data[currentLine].x = graphData.data.x;
    this.enrichmentChart.data[currentLine].y = graphData.data.y;
    this.hoverGroupData.lineGroupData[currentLine - 1] = this.mainLine;

    console.log('hovergroupdata', this.hoverGroupData);


    // let fuelSavings = this.phastService.o2Enrichment(currentEnrichmentLine, this.settings).fuelSavingsEnriched;
    // let fuelSavings = this.phastService.o2Enrichment(this.mainLine, this.settings).fuelSavingsEnriched;
    // this.enrichmentChart.data[currentLine].x = [this.mainLine.o2CombAirEnriched];
    // this.enrichmentChart.data[currentLine].y = [fuelSavings];
    // this.enrichmentChart.data[currentLine].line = {
    //   color: this.defaultPointOutlineColor,
    //   shape: 'spline'
    // };

    // if (!update) {
    //   let mainTrace: EnrichmentPoint = {
    //     pointColor: this.pointColors[(this.enrichmentChart.data.length + 1) % this.pointColors.length],
    //     pointX: this.mainLine.o2CombAirEnriched,
    //     pointY: fuelSavings,
    //     combustionTemp: this.mainLine.combAirTemp,
    //     flueOxygen: this.mainLine.o2FlueGas,
    //     fuelTemp: this.mainLine.flueGasTemp
    //   }
    //   this.hoverGroupData.lineGroup.push(mainTrace);
    // } 
    
  }

  addTrace() {
    let newLineTrace: TraceData = JSON.parse(JSON.stringify(this.enrichmentChart.data[0]));
    // let newPointTrace: TraceData = JSON.parse(JSON.stringify(this.enrichmentChart.data[1]));
    
    // if (this.change && (!this.lines.length || !this.baselineChange)) {
      let newLineEnrichment = {
        o2CombAir: this.o2Enrichment.o2CombAir,
        o2CombAirEnriched: this.o2Enrichment.o2CombAirEnriched,
        flueGasTemp: this.o2Enrichment.flueGasTemp,
        flueGasTempEnriched: this.o2Enrichment.flueGasTempEnriched,
        o2FlueGas: this.o2Enrichment.o2FlueGas,
        o2FlueGasEnriched: this.o2Enrichment.o2FlueGasEnriched,
        combAirTemp: this.o2Enrichment.combAirTemp,
        combAirTempEnriched: this.o2Enrichment.combAirTempEnriched,
        fuelConsumption: this.o2Enrichment.fuelConsumption,
        fuelSavings: 0,
        color: this.getRandomColor(),
        data: [],
        x: null,
        y: null
      };
      
      this.change = false;
      
      let graphData: { data: TraceCoordinates, onGraph: boolean } = this.o2EnrichmentService.getGraphData(this.settings, this.o2EnrichmentPoint, newLineEnrichment);
      console.log(graphData.data);
      newLineTrace.x = graphData.data.x;
      newLineTrace.y = graphData.data.y;
      newLineTrace.line.color = this.getRandomColor();
      console.log('newLineTrace', newLineTrace);
      
      let fuelSavings = this.phastService.o2Enrichment(this.mainLine, this.settings).fuelSavingsEnriched;
      // newPointTrace.x = [newLine.o2CombAirEnriched];
      // newPointTrace.y = [fuelSavings];
      // newPointTrace.marker.color = this.defaultPointColor;
      // newPointTrace.marker.line = {
      //   color: this.defaultPointOutlineColor,
      //   width: 4
      // };
      console.log('newLine x: y', newLineEnrichment.o2CombAirEnriched, fuelSavings);
      let newTrace: EnrichmentPoint = {
        pointColor: this.pointColors[(this.enrichmentChart.data.length + 1) % this.pointColors.length],
        pointX: newLineEnrichment.o2CombAirEnriched,
        pointY: fuelSavings,
        combustionTemp: newLineEnrichment.combAirTemp,
        flueOxygen: newLineEnrichment.o2FlueGas,
        fuelTemp: newLineEnrichment.flueGasTemp
      }
      
      Plotly.addTraces(this.currentChartId, [newLineTrace]);
      // this.selectedDataPoints.push(newTrace);
      this.hoverGroupData.lineGroupData.push(newLineEnrichment);
      this.hoverGroupData.lineGroup.push(newTrace);
      let updateTraceIndex = this.enrichmentChart.data.length - 1;
      console.log('updateTraceIndex', updateTraceIndex);
      console.log('this.enrichmentChart', this.enrichmentChart);
      console.log('this.enrichmentChart', this.hoverGroupData.lineGroup);
      console.log('this.enrichmentChart', this.hoverGroupData.lineGroupData);
      this.updatedTraces.push(updateTraceIndex);
      this.o2EnrichmentService.makePlot.next(false);
      this.cd.detectChanges();
      this.save();
    // }
    
  }

  initHoverGroupData(hoverEventData) {
    let hoverIndex = hoverEventData.points[0].pointIndex;

    this.hoverGroupData.lineGroup.forEach((line, index) => {
      console.log('hoverIndex, lineGroup index', hoverIndex, index);
      line.pointX = Number(this.enrichmentChart.data[index].x[hoverIndex]);
      line.pointY = Number(this.enrichmentChart.data[index].y[hoverIndex]);
      console.log(line.pointX, line.pointY);
    })
    // let systemX = this.enrichmentChart.data[this.traces.system].x;
    // let systemY = this.enrichmentChart.data[this.traces.system].y;
    // let baselineX = this.enrichmentChart.data[this.traces.baseline].x;
    // let baselineY = this.enrichmentChart.data[this.traces.baseline].y;

    // this.currentHoverData = {
    //   system: {
    //     pointX: Number(systemX[currentPointIndex]),
    //     pointY: Number(systemY[currentPointIndex]),
    //     pointColor: 'red'
    //   },
    //   baseline: {
    //     pointX: Number(baselineX[currentPointIndex]),
    //     pointY: Number(baselineY[currentPointIndex]),
    //     pointColor: this.pointColors[0]
    //   },
    //   fluidPower: this.fluidPowerData[currentPointIndex]
    // };

    // if (this.isEquipmentModificationShown) {
    //   let modificationX = this.enrichmentChart.data[this.traces.modification].x;
    //   let modificationY = this.enrichmentChart.data[this.traces.modification].y;
    //   this.currentHoverData.modification = {
    //     pointX: Number(modificationX[currentPointIndex]),
    //     pointY: Number(modificationY[currentPointIndex]),
    //     pointColor: this.pointColors[1]
    //   };
    // }
    console.log(this.hoverGroupData);
    this.cd.detectChanges();
  }

  removeHoverGroupData() {
    // this.currentHoverData = {
    //   system: {
    //     pointX: 0,
    //     pointY: 0,
    //     pointColor: ''
    //   },
    //   baseline: {
    //     pointX: 0,
    //     pointY: 0,
    //     pointColor: ''
    //   },
    //   fluidPower: 0
    // };

    // if (this.isEquipmentModificationShown) {
    //   this.currentHoverData.modification = {
    //     pointX: 0,
    //     pointY: 0,
    //     pointColor: ''
    //   }
    // }
    this.cd.detectChanges();
  }

  // checkReplotMethod() {
  //   if (this.efficiencyForm.controls.pumpType.value !== this.currentPumpType) {
  //     this.currentPumpType = this.efficiencyForm.controls.pumpType.value;
  //     this.o2EnrichmentService.initChartData();
  //     this.initRenderChart();
  //   } else {
  //     this.updateChart();
  //   }
  // }

  deleteDataPoint(point: SelectedDataPoint) {
    let traceCount: number = this.enrichmentChart.data.length;
    let deleteTraceIndex: number = this.enrichmentChart.data.findIndex(trace => trace.x[0] == point.pointX && trace.y[0] == point.pointY);
    
    // ignore default traces
    if (traceCount > this.defaultPointCount && deleteTraceIndex != -1) {
      Plotly.deleteTraces(this.currentChartId, [deleteTraceIndex]);
      this.selectedDataPoints.splice(deleteTraceIndex - this.defaultPointCount, 1);
      this.cd.detectChanges();
      this.save();
    }
  }

  updateTableString() {
    this.dataSummaryTableString = this.dataSummaryTable.nativeElement.innerText;
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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
    // this.updateChart();
  }


}
