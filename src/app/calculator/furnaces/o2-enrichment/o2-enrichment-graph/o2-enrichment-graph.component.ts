import { Component, OnInit, Input, SimpleChanges, DoCheck, KeyValueDiffers, ViewChild, ElementRef, HostListener } from '@angular/core';
import { PhastService } from '../../../../phast/phast.service';
import { O2Enrichment, O2EnrichmentOutput } from '../../../../shared/models/phast/o2Enrichment';
import * as d3 from 'd3';
import { Settings } from '../../../../shared/models/settings';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';
import { LineChartHelperService } from '../../../../shared/line-chart-helper/line-chart-helper.service';
import { O2EnrichmentService } from '../o2-enrichment.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

@Component({
  selector: 'app-o2-enrichment-graph',
  templateUrl: './o2-enrichment-graph.component.html',
  styleUrls: ['./o2-enrichment-graph.component.css']
})
export class O2EnrichmentGraphComponent implements OnInit, DoCheck {
  // results
  @Input()
  o2EnrichmentOutput: O2EnrichmentOutput;
  // input data
  @Input()
  o2Enrichment: O2Enrichment;
  @Input()
  lines: any;
  @Input()
  settings: Settings;

  @ViewChild("ngChartContainer") ngChartContainer: ElementRef;
  @ViewChild("ngChart") ngChart: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeGraph();
  }
  exportName: string;

  o2EnrichmentPoint: O2Enrichment;

  lineColors = [
    '#84B641',
    '#7030A0',
    '#E1CD00',
    '#A03123',
    '#2ABDDA',
    '#DE762D',
    '#306DBE',
    '#1E7640'
  ];

  svg: d3.Selection<any>;
  xAxis: d3.Selection<any>;
  yAxis: d3.Selection<any>;
  x: any;
  y: any;
  width: number;
  height: number;
  margin: any;
  point: any;
  isGridToggled: boolean;

  plotBtn: any;
  change: any;
  baselineChange: any;
  differ: any;
  mainLine: any;
  guideLine: any;
  xPosition: any = null;

  maxFuelSavings: any;
  removeLines: any = true;
  isFirstChange: any = true;
  fontSize: string;

  canvasWidth: number;
  canvasHeight: number;

  //booleans for tooltip
  hoverBtnExport: boolean = false;
  displayExportTooltip: boolean = false;
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;
  hoverBtnExpand: boolean = false;
  displayExpandTooltip: boolean = false;
  hoverBtnCollapse: boolean = false;
  displayCollapseTooltip: boolean = false;

  //add this boolean to keep track if graph has been expanded
  expanded: boolean = false;

  columnTitles: Array<string>;
  rowData: Array<Array<string>>;
  keyColors: Array<{ borderColor: string, fillColor: string }>;
  deleteCount: number = 0;
  graphColors: Array<string>;

  @Input()
  toggleCalculate: boolean;
  @Input()
  toggleResetData: boolean;
  constructor(private o2EnrichmentService: O2EnrichmentService, private lineChartHelperService: LineChartHelperService, private phastService: PhastService, private differs: KeyValueDiffers, private svgToPngService: SvgToPngService) {
    this.differ = differs.find({}).create();
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

  ngOnInit() {
    this.graphColors = graphColors;
    this.columnTitles = new Array<string>();
    this.rowData = new Array<Array<string>>();
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
    this.initColumnTitles();

    this.isGridToggled = false;

    this.plotBtn = d3.select('app-o2-enrichment-form').selectAll(".btn-secondary")
      .on("click", () => {
        this.plotLine();
      });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeGraph();
    }, 100)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleResetData && !changes.toggleResetData.firstChange) {
      console.log('o2enrichmentgraph resetTableData()');
      this.resetTableData();
    }
    if (!this.isFirstChange && changes) {
      this.onChanges();
    } else {
      this.isFirstChange = false;
    }
  }

  initColumnTitles() {
    let fuelTempUnit = this.settings.temperatureMeasurement;
    this.columnTitles = ['O<sub>2</sub> in Air (%)', 'Fuel Savings (%)', 'Combustion Temp', 'Flue O<sub>2</sub>', 'Fuel Temp (' + fuelTempUnit + ')'];
  }

  // ========== export/gridline tooltip functions ==========
  // if you get a large angular error, make sure to add SimpleTooltipComponent to the imports of the calculator's module
  // for example, check motor-performance-graph.module.ts
  initTooltip(btnType: string) {

    if (btnType == 'btnExportChart') {
      this.hoverBtnExport = true;
    }
    else if (btnType == 'btnGridLines') {
      this.hoverBtnGridLines = true;
    }
    else if (btnType == 'btnExpandChart') {
      this.hoverBtnExpand = true;
    }
    else if (btnType == 'btnCollapseChart') {
      this.hoverBtnCollapse = true;
    }
    setTimeout(() => {
      this.checkHover(btnType);
    }, 700);
  }

  hideTooltip(btnType: string) {

    if (btnType == 'btnExportChart') {
      this.hoverBtnExport = false;
      this.displayExportTooltip = false;
    }
    else if (btnType == 'btnGridLines') {
      this.hoverBtnGridLines = false;
      this.displayGridLinesTooltip = false;
    }
    else if (btnType == 'btnExpandChart') {
      this.hoverBtnExpand = false;
      this.displayExpandTooltip = false;
    }
    else if (btnType == 'btnCollapseChart') {
      this.hoverBtnCollapse = false;
      this.displayCollapseTooltip = false;
    }
  }

  checkHover(btnType: string) {
    if (btnType == 'btnExportChart') {
      if (this.hoverBtnExport) {
        this.displayExportTooltip = true;
      }
      else {
        this.displayExportTooltip = false;
      }
    }
    else if (btnType == 'btnGridLines') {
      if (this.hoverBtnGridLines) {
        this.displayGridLinesTooltip = true;
      }
      else {
        this.displayGridLinesTooltip = false;
      }
    }
    else if (btnType == 'btnExpandChart') {
      if (this.hoverBtnExpand) {
        this.displayExpandTooltip = true;
      }
      else {
        this.displayExpandTooltip = false;
      }
    }
    else if (btnType == 'btnCollapseChart') {
      if (this.hoverBtnCollapse) {
        this.displayCollapseTooltip = true;
      }
      else {
        this.displayCollapseTooltip = false;
      }
    }
  }
  // ========== end tooltip functions ==========

  resizeGraph() {
    //need to update curveGraph to grab a new containing element 'panelChartContainer'
    //make sure to update html container in the graph component as well
    let curveGraph = this.ngChartContainer.nativeElement;

    //conditional sizing if graph is expanded/compressed
    if (!this.expanded) {
      this.canvasWidth = curveGraph.clientWidth;
      this.canvasHeight = this.canvasWidth * (3 / 5);
    }
    else {
      this.canvasWidth = curveGraph.clientWidth;
      this.canvasHeight = curveGraph.clientHeight * 0.9;
    }

    if (this.canvasWidth < 400) {
      this.fontSize = '8px';
      this.margin = { top: 10, right: 10, bottom: 50, left: 75 };
    } else {
      this.fontSize = '12px';
      if (!this.expanded) {
        this.margin = { top: 20, right: 20, bottom: 75, left: 120 };
      }
      else {
        this.margin = { top: 20, right: 100, bottom: 75, left: 100 };
      }
    }
    this.width = this.canvasWidth - this.margin.left - this.margin.right;
    this.height = this.canvasHeight - this.margin.top - this.margin.bottom;
    this.makeGraph();
    this.onChanges();
  }

  drawMainLine(putOnGraph = true) {
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
    this.drawCurve(this.svg, this.x, this.y, this.mainLine, true, putOnGraph);
  }

  makeGraph() {
    // Remove  all previous graphs
    this.ngChart = this.lineChartHelperService.clearSvg(this.ngChart);
    this.svg = this.lineChartHelperService.initSvg(this.ngChart, this.width, this.height, this.margin);
    this.svg = this.lineChartHelperService.applyFilter(this.svg);
    this.svg = this.lineChartHelperService.appendRect(this.svg, this.width, this.height);
    let xRange: { min: number, max: number } = { min: 0, max: this.width };
    let xDomain: { min: number, max: number } = { min: 0, max: 100 };
    this.x = this.lineChartHelperService.setScale("linear", xRange, xDomain);
    let yRange: { min: number, max: number } = { min: this.height, max: 0 };
    let yDomain: { min: number, max: number } = { min: 0, max: Math.floor((this.maxFuelSavings + 10.0) / 10) * 10 };
    this.y = this.lineChartHelperService.setScale("linear", yRange, yDomain);

    this.xAxis = this.lineChartHelperService.setXAxis(this.svg, this.x, this.height, this.isGridToggled, 4, null, null, null, d3.format("d"));
    this.yAxis = this.lineChartHelperService.setYAxis(this.svg, this.y, this.width, this.isGridToggled, 4, 0, 0, 15, d3.format("d"));

    this.svg.append("path")
      .attr("id", "areaUnderCurve");

    this.lineChartHelperService.setXAxisLabel(this.svg, this.width, this.height, 0, 70, "O2 in Air (%)");
    this.lineChartHelperService.setYAxisLabel(this.svg, this.width, this.height, -60, 0, "Fuel Savings (%)");

    this.svg.style("display", null);
    this.change = true;
  }


  drawCurve(svg, x, y, line, isFromForm, putOnGraph = true) {
    line.fuelSavings = 0.0;
    let onGraph = false;
    let data = [];

    this.o2EnrichmentPoint = {
      o2CombAir: this.o2Enrichment.o2CombAir,
      o2CombAirEnriched: 0,
      flueGasTemp: this.o2Enrichment.flueGasTemp,
      flueGasTempEnriched: line.flueGasTempEnriched,
      o2FlueGas: this.o2Enrichment.o2FlueGas,
      o2FlueGasEnriched: line.o2FlueGasEnriched,
      combAirTemp: this.o2Enrichment.combAirTemp,
      combAirTempEnriched: line.combAirTempEnriched,
      fuelConsumption: this.o2Enrichment.fuelConsumption
    };
    let graphData: { data: Array<any>, onGraph: boolean } = this.o2EnrichmentService.getGraphData(this.settings, this.o2EnrichmentPoint, line);
    onGraph = graphData.onGraph;
    data = graphData.data;

    if (!putOnGraph) {
      return;
    }

    // reload the graph and return if no points are on the graph
    // edit: ensure no recursive infinite loop occurs
    if (!onGraph) {
      this.removeLines = false;
      return;
    }

    const guideLine = d3.line()
      .x(function (d) {
        return x(d.x);
      })
      .y(function (d) {
        return y(d.y);
      })
      .curve(d3.curveNatural);

    if (isFromForm) {
      svg.append("path")
        .attr("id", "formLine")
        .data([data])
        .attr("class", "line")
        .attr("d", guideLine)
        .style("stroke-width", 10)
        .style("stroke-width", "2px")
        .style("fill", "none")
        .style("stroke", line.color)
        .style('pointer-events', 'none');
    }
    else {
      svg.append("path")
        .data([data])
        .attr("class", "line plottedLine")
        .attr("d", guideLine)
        .style("stroke-width", 10)
        .style("stroke-width", "2px")
        .style("fill", "none")
        .style("stroke", line.color)
        .style('pointer-events', 'none');
    }

    line.data = data;
    line.x = x;
    line.y = y;

    this.hoverCommands(x, y, data);

    if (this.guideLine != null) {
      this.guideLine.remove();
    }

    this.guideLine = this.svg.append("line")
      .attr("id", "guideLine")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", this.height)
      .style("stroke", "red")
      .style('pointer-events', 'none')
      .style("display", "none");

    this.drawPoint(x, y, line, isFromForm);

    this.svg.style("display", null);
  }

  hoverCommands(x, y, data) {
    const format = d3.format(",.2f");
    const bisectDate = d3.bisector(function (d) { return d.x; }).left;
    this.svg.select('#graph')
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("class", "overlay")
      .attr("fill", "#ffffff")
      .style("filter", "url(#drop-shadow)")
      .on("mouseover", () => {
        this.guideLine.style("display", null);
      })
      .on("mousemove", () => {
        this.xPosition = x.invert(d3.mouse(d3.event.currentTarget)[0]);
        this.buildTable();
        this.moveGuideLine();
      })
      .on("mouseout", () => {
        this.guideLine.style("display", "none");
        this.xPosition = null;
        this.buildTable();
      });
  }

  drawPoint(x, y, information, isFromForm) {

    if (isFromForm) {
      this.svg.selectAll("#formPoint").remove();
      this.point = this.svg.append("g")
        .attr("id", "formPoint")
        .attr("class", "focus")
        .style("display", "none")
        .style('pointer-events', 'none');
    }
    else {
      this.point = this.svg.append("g")
        .attr("class", "focus plottedPoint")
        .style("display", "none")
        .style('pointer-events', 'none');
    }

    this.point.append("circle")
      .attr("r", 7)
      .style("fill", "none")
      .style("stroke", "#000000")
      .style("stroke-width", "3px");

    this.point.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

    const fuelSavings = this.phastService.o2Enrichment(information, this.settings).fuelSavingsEnriched;

    this.point
      .style("display", null)
      .style("opacity", (fuelSavings < 0) ? 0 : 1)
      .style('pointer-events', 'none')
      .attr("transform", "translate(" + x(information.o2CombAirEnriched) + "," + y(fuelSavings) + ")");
  }

  onChanges() {
    this.change = true;
    this.maxFuelSavings = 0.0;
    this.drawMainLine(false);
    if (this.mainLine.fuelSavings > this.maxFuelSavings) {
      this.maxFuelSavings = this.mainLine.fuelSavings;
    }
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].fuelSavings > this.maxFuelSavings) {
        this.maxFuelSavings = this.lines[i].fuelSavings;
      }
    }
    this.makeGraph();
    this.redrawLines();
    this.buildTable();
  }

  redrawLines() {
    this.svg.selectAll("#formLine").remove();
    this.drawMainLine();
    if (!this.removeLines) {
      this.removeLines = true;
      return;
    }

    this.plotBtn.classed("disabled", false);

    this.svg.selectAll(".plottedLine").remove();
    this.svg.selectAll(".plottedPoint").remove();

    // Update and draw lines
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].o2CombAir = this.o2Enrichment.o2CombAir;
      this.lines[i].flueGasTemp = this.o2Enrichment.flueGasTemp;
      this.lines[i].o2FlueGas = this.o2Enrichment.o2FlueGas;
      this.lines[i].combAirTemp = this.o2Enrichment.combAirTemp;
      this.lines[i].fuelConsumption = this.o2Enrichment.fuelConsumption;
      this.drawCurve(this.svg, this.x, this.y, this.lines[i], false);
    }

    // Set mainLine as default after every change
    this.hoverCommands(this.mainLine.x, this.mainLine.y, this.mainLine.data);
  }

  plotLine() {
    if (this.change && (!this.lines.length || !this.baselineChange)) {
      let line = {
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
        color: (this.lineColors.length) ? this.lineColors.pop() : this.getRandomColor(),
        data: [],
        x: null,
        y: null
      };

      this.drawCurve(this.svg, this.x, this.y, line, false);
      this.lines.push(line);
      this.plotBtn.classed("disabled", true);
      this.change = false;
      this.buildTable();
    }
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  deleteFromTable(i: any) {
    if (i > 0) {
      for (let j = i; j < this.rowData.length - 1; j++) {
        this.rowData[j] = this.rowData[j + 1];
      }
      this.rowData.pop();
      this.deleteLine(i - 1);
      this.buildTable();
    }
  }

  resetTableData() {
    this.rowData = new Array<Array<string>>();
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
    this.deleteCount = 0;
    for (let i = 0; i < this.lines.length; i++) {
      this.deleteLine(i);
    }
  }

  buildTable() {
    let i = this.rowData.length + this.deleteCount;
    const format0 = d3.format(',.0f');
    const format1 = d3.format(",.1f");
    const format2 = d3.format(",.2f");
    this.rowData = new Array<Array<string>>();
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
    const o2EnrichmentPoint = {
      o2CombAir: this.o2Enrichment.o2CombAir,
      o2CombAirEnriched: this.xPosition,
      flueGasTemp: this.o2Enrichment.flueGasTemp,
      flueGasTempEnriched: this.mainLine.flueGasTempEnriched,
      o2FlueGas: this.o2Enrichment.o2FlueGas,
      o2FlueGasEnriched: this.mainLine.o2FlueGasEnriched,
      combAirTemp: this.o2Enrichment.combAirTemp,
      combAirTempEnriched: this.mainLine.combAirTempEnriched,
      fuelConsumption: this.o2Enrichment.fuelConsumption
    };
    let o2InAirData: string = (this.xPosition != null) ? format1(this.xPosition).toString() : format1(this.o2Enrichment.o2CombAirEnriched).toString();
    let fuelSavingsData: string;
    let fuelSavings: number;
    let combTempData: string = format0(this.o2Enrichment.combAirTempEnriched);
    let flueO2Data: string = format2(this.o2Enrichment.o2FlueGasEnriched);
    let flueTempData: string = format0(this.o2Enrichment.flueGasTempEnriched);
    if (this.xPosition != null) {
      fuelSavings = this.phastService.o2Enrichment(o2EnrichmentPoint, this.settings).fuelSavingsEnriched;
    }
    else {
      o2EnrichmentPoint.o2CombAirEnriched = this.o2Enrichment.o2CombAirEnriched;
      fuelSavings = this.phastService.o2Enrichment(o2EnrichmentPoint, this.settings).fuelSavingsEnriched;
    }
    if (fuelSavings < 0 || fuelSavings > 100) {
      fuelSavingsData = "&mdash;"
    }
    else {
      fuelSavingsData = format1(fuelSavings).toString();
    }
    let tmpRowData = [o2InAirData, fuelSavingsData, combTempData, flueO2Data, flueTempData];
    this.rowData.push(tmpRowData);
    let colors = {
      borderColor: "#000",
      fillColor: "#000"
    };
    this.keyColors.push(colors);

    for (let i = 0; i < this.lines.length; i++) {
      let o2InAirData: string;
      let fuelSavingsData: string;
      let combTempData: string;
      let flueO2Data: string;
      let fuelTempData: string;
      const o2EnrichmentPoint = {
        o2CombAir: this.o2Enrichment.o2CombAir,
        o2CombAirEnriched: this.xPosition,
        flueGasTemp: this.o2Enrichment.flueGasTemp,
        flueGasTempEnriched: this.lines[i].flueGasTempEnriched,
        o2FlueGas: this.o2Enrichment.o2FlueGas,
        o2FlueGasEnriched: this.lines[i].o2FlueGasEnriched,
        combAirTemp: this.o2Enrichment.combAirTemp,
        combAirTempEnriched: this.lines[i].combAirTempEnriched,
        fuelConsumption: this.o2Enrichment.fuelConsumption
      };
      if (this.xPosition == null) {
        o2EnrichmentPoint.o2CombAirEnriched = this.lines[i].o2CombAirEnriched;
      }
      o2InAirData = format1(o2EnrichmentPoint.o2CombAirEnriched);
      let fuelSavings = this.phastService.o2Enrichment(o2EnrichmentPoint, this.settings).fuelSavingsEnriched;
      fuelSavingsData = (fuelSavings < 0 || fuelSavings > 100) ? "&mdash;" : format1(fuelSavings);
      combTempData = format0(o2EnrichmentPoint.combAirTempEnriched).toString();
      flueO2Data = format2(o2EnrichmentPoint.o2FlueGasEnriched).toString();
      fuelTempData = format0(o2EnrichmentPoint.flueGasTempEnriched).toString();
      let tmpRowData = [o2InAirData, fuelSavingsData, combTempData, flueO2Data, fuelTempData];
      this.rowData.push(tmpRowData);
      let colors = {
        borderColor: this.lines[i].color,
        fillColor: this.lines[i].color
      };
      this.keyColors.push(colors);
    }
  }

  moveGuideLine() {
    this.guideLine
      .attr("transform", 'translate(' + this.x(this.xPosition) + ', 0)');
  }

  deleteLine(lineIndex) {
    if (this.lines.length <= 8) {
      this.lineColors.push(this.lines[lineIndex].color);
    }
    this.lines.splice(lineIndex, 1);
    this.onChanges();
    this.change = true;
  }

  toggleGrid() {
    if (this.isGridToggled) {
      this.isGridToggled = false;
      this.makeGraph();
      this.redrawLines();
    } else {
      this.isGridToggled = true;
      this.makeGraph();
      this.redrawLines();
    }
  }

  downloadChart() {
    if (!this.exportName) {
      this.exportName = "o2-enrichment-graph";
    }
    this.svgToPngService.exportPNG(this.ngChart, this.exportName);
  }

  //========= chart resize functions ==========
  expandChart() {
    this.expanded = true;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.resizeGraph();
    }, 200);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.resizeGraph();
    }, 200);
  }
  //========== end chart resize functions ==========
  @HostListener('document:keyup', ['$event'])
  closeExpandedGraph(event) {
    if (this.expanded) {
      if (event.code == 'Escape') {
        this.contractChart();
      }
    }
  }

  highlightPoint(i: any) {
  }
  unhighlightPoint(i: any) {
  }
}
