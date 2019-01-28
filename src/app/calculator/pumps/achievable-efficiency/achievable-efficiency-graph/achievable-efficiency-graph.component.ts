import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, HostListener } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import * as _ from 'lodash';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import * as d3 from 'd3';
import { FormGroup } from '../../../../../../node_modules/@angular/forms';
import { LineChartHelperService } from '../../../../shared/line-chart-helper/line-chart-helper.service';

var tableFlowRate: number;
var tableAverageEfficiency: number;
var tableMaxEfficiency: number;

@Component({
  selector: 'app-achievable-efficiency-graph',
  templateUrl: './achievable-efficiency-graph.component.html',
  styleUrls: ['./achievable-efficiency-graph.component.css']
})
export class AchievableEfficiencyGraphComponent implements OnInit {
  @Input()
  efficiencyForm: FormGroup;
  @Input()
  toggleCalculate: boolean;
  @Input()
  toggleResetData: boolean;
  @Input()
  settings: Settings;

  @ViewChild("ngChartContainer") ngChartContainer: ElementRef;
  @ViewChild("ngChart") ngChart: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeGraph();
  }
  exportName: string;

  svg: d3.Selection<any>;
  x: any;
  y: any;
  xAxis: d3.Selection<any>;
  yAxis: d3.Selection<any>;
  width: number;
  height: number;
  maxLine: d3.Selection<any>;
  averageLine: d3.Selection<any>;
  maxValue: number;
  averageValue: number;
  margin: { top: number, right: number, bottom: number, left: number };
  line: d3.Selection<any>;
  filter: d3.Selection<any>;
  detailBox: d3.Selection<any>;
  detailBoxPointer: d3.Selection<any>;
  tooltipData: Array<{ label: string, value: number, unit: string, formatX: boolean }>;
  focusAvg: d3.Selection<any>;
  focusMax: d3.Selection<any>;

  //dynamic table variables
  pumpType: any;
  avgD: { x: number, y: number };
  maxD: { x: number, y: number };
  focusDMax: Array<{ x: number, y: number }>;
  focusDAvg: Array<{ x: number, y: number }>;
  curveChanged: boolean = false;
  graphColors: Array<string>;
  tableData: Array<{ borderColor: string, fillColor: string, flowRate: string, maxEfficiency: string, averageEfficiency: string }>;
  tablePointsMax: Array<d3.Selection<any>>;
  tablePointsAvg: Array<d3.Selection<any>>;
  deleteCount: number = 0;

  tableFlowRate: string;
  tableMaxEfficiency: string;
  tableAverageEfficiency: string;

  avgPoint: any;
  maxPoint: any;

  firstChange: boolean = true;
  isGridToggled: boolean;

  results: any = {
    max: 0,
    average: 0
  };

  canvasWidth: number;
  canvasHeight: number;
  fontSize: string;

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

  avgData: any;
  maxData: any;

  //exportable table variables
  columnTitles: Array<string>;
  rowData: Array<Array<string>>;
  keyColors: Array<{ borderColor: string, fillColor: string }>;
  constructor(private psatService: PsatService, private lineChartHelperService: LineChartHelperService, private convertUnitsService: ConvertUnitsService, private svgToPngService: SvgToPngService) { }

  ngOnInit() {
    this.graphColors = graphColors;
    this.tableData = new Array<{ borderColor: string, fillColor: string, flowRate: string, maxEfficiency: string, averageEfficiency: string }>();
    this.tablePointsMax = new Array<d3.Selection<any>>();
    this.tablePointsAvg = new Array<d3.Selection<any>>();
    this.focusDMax = new Array<{ x: number, y: number }>();
    this.focusDAvg = new Array<{ x: number, y: number }>();
    this.pumpType = this.efficiencyForm.controls.pumpType.value;
    this.isGridToggled = false;
    this.tooltipData = new Array<{ label: string, value: number, unit: string, formatX: boolean }>();
    this.initTooltipData();

    //init for exportable table
    this.columnTitles = new Array<string>();
    this.rowData = new Array<Array<string>>();
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
    this.initColumnTitles();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.toggleResetData) {
        this.resetTableData();
      }
      if (changes.toggleCalculate) {
        if (this.checkForm()) {
          this.makeGraph();
        }
      }
    } else {
      this.firstChange = false;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeGraph();
    }, 100)
  }

  initColumnTitles() {
    this.columnTitles = ['Flow Rate (' + this.settings.flowMeasurement + ')', 'Max Efficiency (%)', 'Avg. Efficiency (%)'];
  }

  initTooltipData() {
    this.tooltipData.push({
      label: "Flow Rate",
      value: null,
      unit: " " + this.settings.flowMeasurement,
      formatX: true
    });
    this.tooltipData.push({
      label: "Maximum",
      value: null,
      unit: "%",
      formatX: false
    });
    this.tooltipData.push({
      label: "Average",
      value: null,
      unit: "%",
      formatX: false
    });
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
      this.fontSize = "8px";
      this.margin = { top: 10, right: 10, bottom: 50, left: 75 };
    } else {
      this.fontSize = "11px";
      if (!this.expanded) {
        this.margin = { top: 10, right: 50, bottom: 75, left: 120 };

      }
      else {
        this.margin = { top: 10, right: 120, bottom: 75, left: 120 };
      }
    }
    this.width = this.canvasWidth - this.margin.left - this.margin.right;
    this.height = this.canvasHeight - (this.margin.top * 2) - this.margin.bottom;
    d3.select("app-achievable-efficiency").select("#gridToggle").style("top", (this.height + 100) + "px");
    this.makeGraph();
  }

  calculateYaverage(flow: number) {
    if (this.checkForm()) {
      let tmpResults = this.psatService.pumpEfficiency(
        this.efficiencyForm.controls.pumpType.value,
        flow,
        this.settings
      );
      return tmpResults.average;
    } else { return 0 }
  }
  calculateYmax(flow: number) {
    if (this.checkForm()) {
      let tmpResults = this.psatService.pumpEfficiency(
        this.efficiencyForm.controls.pumpType.value,
        flow,
        this.settings
      );
      return tmpResults.max;
    } else { return 0 }
  }

  checkForm() {
    if (
      this.efficiencyForm.controls.pumpType.status == 'VALID' &&
      this.efficiencyForm.controls.flowRate.status == 'VALID' &&
      this.efficiencyForm.controls.pumpType.value != 'Specified Optimal Efficiency'
    ) {
      return true;
    } else {
      return false;
    }
  }

  makeGraph() {
    if (this.efficiencyForm.controls.pumpType.value != this.pumpType) {
      this.curveChanged = true;
      this.pumpType = this.efficiencyForm.controls.pumpType.value;
    }
    //Remove  all previous graphs
    this.ngChart = this.lineChartHelperService.clearSvg(this.ngChart);
    this.svg = this.lineChartHelperService.initSvg(this.ngChart, this.width, this.height, this.margin);
    this.svg = this.lineChartHelperService.applyFilter(this.svg);
    this.svg = this.lineChartHelperService.appendRect(this.svg, this.width, this.height);
    this.avgData = this.getAvgData();
    this.maxData = this.getMaxData();
    let tmpMax: any = _.maxBy(_.union(this.avgData, this.maxData), (val: { x: number, y: number }) => { return val.y; });
    let tmpMin: any = _.minBy(_.union(this.avgData, this.maxData), (val: { x: number, y: number }) => { return val.y; });
    let max = tmpMax.y;
    let min = tmpMin.y;
    let xRange: { min: number, max: number };
    xRange = {
      min: 0,
      max: this.width
    };
    let xDomain: { min: number, max: number };
    xDomain = {
      min: 0,
      max: 5000
    };
    this.x = this.lineChartHelperService.setScale("linear", xRange, xDomain)
    this.xAxis = this.lineChartHelperService.setXAxis(this.svg, this.x, this.height, this.isGridToggled, 16, 0, 0, 0);
    let yRange: { min: number, max: number };
    yRange = {
      min: this.height,
      max: 0
    };
    let yDomain: { min: number, max: number };
    yDomain = {
      min: min - 10,
      max: max + 10
    };
    this.y = this.lineChartHelperService.setScale('linear', yRange, yDomain);
    this.yAxis = this.lineChartHelperService.setYAxis(this.svg, this.y, this.width, this.isGridToggled, 11, 0, 0, 15);
    this.lineChartHelperService.setXAxisLabel(this.svg, this.width, this.height, 0, 70, "Flow Rate (" + this.settings.flowMeasurement + ")");
    this.lineChartHelperService.setYAxisLabel(this.svg, 0, this.height, -60, 0, "Achievable Efficiency (%)");
    this.maxLine = this.lineChartHelperService.appendLine(this.svg, "#145A32", "2px");
    this.maxLine = this.lineChartHelperService.drawLine(this.maxLine, this.x, this.y, this.maxData);
    this.averageLine = this.lineChartHelperService.appendLine(this.svg, "#3498DB", "2px");
    this.averageLine = this.lineChartHelperService.drawLine(this.averageLine, this.x, this.y, this.avgData);
    this.maxPoint = this.lineChartHelperService.appendFocus(this.svg, 'maxPoint', 5, '#000000', '2px');
    this.avgPoint = this.lineChartHelperService.appendFocus(this.svg, 'avgPoint', 5, '#000000', '2px');
    // Define the div for the tooltip
    this.detailBox = this.lineChartHelperService.appendDetailBox(this.ngChart);
    this.detailBoxPointer = this.lineChartHelperService.appendDetailBoxPointer(this.ngChart);
    this.focusMax = this.lineChartHelperService.appendFocus(this.svg, 'maxFocus', 6, '#000000', '3px');
    this.focusAvg = this.lineChartHelperService.appendFocus(this.svg, 'avgFocus', 6, '#000000', '3px');
    this.updateValues();
    this.drawPoints();
    let allData: Array<Array<{ x: number, y: number }>> = [this.maxData, this.avgData];
    let allD: Array<{ x: number, y: number }> = [this.maxD, this.avgD];
    let allFocus: Array<d3.Selection<any>> = [this.focusMax, this.focusAvg];
    let format = d3.format(",.2f");
    this.lineChartHelperService.mouseOverDriver(
      this.svg,
      this.detailBox,
      this.detailBoxPointer,
      this.margin,
      allD,
      allFocus,
      allData,
      this.x,
      this.y,
      format,
      format,
      this.tooltipData,
      this.canvasWidth
    );

    //dynamic table
    if (!this.curveChanged) {
      this.replaceFocusPoints();
    }
    else {
      this.resetTableData();
    }
    this.curveChanged = false;
    this.svg.selectAll("line").style("pointer-events", "none");
  }

  //dynamic table
  buildTable() {
    let i = this.rowData.length + this.deleteCount;
    let borderColorIndex = Math.floor(i / this.graphColors.length);
    let dArray: Array<{ x: number, y: number }> = this.lineChartHelperService.getDArray();
    this.maxD = dArray[0];
    this.avgD = dArray[1];
    //max line
    let tableFocusMax: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointMax-" + this.tablePointsMax.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.maxD.x), this.y(this.maxD.y));
    this.tablePointsMax.push(tableFocusMax);
    this.focusDMax.push(this.maxD);
    //avg line
    let tableFocusAvg: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointAvg-" + this.tablePointsAvg.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.avgD.x), this.y(this.avgD.y));
    this.tablePointsAvg.push(tableFocusAvg);
    this.focusDAvg.push(this.avgD);
    let flowRate: number = this.maxD.x;
    let maxEfficiency: number = this.maxD.y;
    let avgEfficiency: number = this.avgD.y;
    let dataPiece = {
      borderColor: this.graphColors[borderColorIndex % this.graphColors.length],
      fillColor: this.graphColors[i % this.graphColors.length],
      flowRate: flowRate.toString(),
      averageEfficiency: avgEfficiency.toString(),
      maxEfficiency: maxEfficiency.toString()
    }
    this.tableData.push(dataPiece);
    let colors = {
      borderColor: this.graphColors[borderColorIndex % this.graphColors.length],
      fillColor: this.graphColors[i % this.graphColors.length]
    };
    this.keyColors.push(colors);
    let data = [tableFlowRate.toString(), tableMaxEfficiency.toString(), tableAverageEfficiency.toString()];
    this.rowData.push(data);
  }
  //dynamic table
  resetTableData() {
    this.tableData = new Array<{ borderColor: string, fillColor: string, flowRate: string, maxEfficiency: string, averageEfficiency: string }>();
    this.tablePointsMax = new Array<d3.Selection<any>>();
    this.tablePointsAvg = new Array<d3.Selection<any>>();
    this.focusDMax = new Array<{ x: number, y: number }>();
    this.focusDAvg = new Array<{ x: number, y: number }>();
    this.deleteCount = 0;
    this.rowData = new Array<Array<string>>();
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
  }
  //dynamic table
  replaceFocusPoints() {
    this.svg.selectAll('.tablePoint').remove();
    for (let i = 0; i < this.tableData.length; i++) {
      let tableFocusMax: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointMax-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusDMax[i].x), this.y(this.focusDMax[i].y));
      let tableFocusAvg: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePointAvg-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusDAvg[i].x), this.y(this.focusDAvg[i].y));
    }
  }
  deleteFromTable(i: number) {
    for (let j = i; j < this.tableData.length - 1; j++) {
      this.tableData[j] = this.tableData[j + 1];
      this.tablePointsMax[j] = this.tablePointsMax[j + 1];
      this.tablePointsAvg[j] = this.tablePointsAvg[j + 1];
      this.focusDMax[j] = this.focusDMax[j + 1];
      this.focusDAvg[j] = this.focusDAvg[j + 1];
      this.rowData[j] = this.rowData[j + 1];
      this.keyColors[j] = this.keyColors[j + 1];
    }

    if (i != this.rowData.length - 1) {
      this.deleteCount += 1;
    }
    this.tableData.pop();
    this.tablePointsMax.pop();
    this.tablePointsAvg.pop();
    this.focusDMax.pop();
    this.focusDAvg.pop();
    this.rowData.pop();
    this.keyColors.pop();
    this.replaceFocusPoints();
  }

  highlightPoint(i: number) {
    let ids: Array<string> = ['#tablePointMax-' + i, "#tablePointAvg-" + i];
    this.lineChartHelperService.tableHighlightPointHelper(this.svg, ids);
  }
  unhighlightPoint(i: number) {
    let ids: Array<string> = ['#tablePointMax-' + i, "#tablePointAvg-" + i];
    this.lineChartHelperService.tableUnhighlightPointHelper(this.svg, ids);
    this.replaceFocusPoints();
  }

  getAvgData() {
    let data = new Array();
    for (var i = 0; i < 5000; i = i + 10) {
      if (this.calculateYaverage(i) <= 100) {
        data.push({
          x: i,
          y: this.calculateYaverage(i),
          flowRate: i
        })
      }
    }
    return data;
  }
  getMaxData() {
    let data = new Array();
    for (var i = 0; i < 5000; i = i + 10) {
      if (this.calculateYmax(i) <= 100) {
        data.push({
          x: i,
          y: this.calculateYmax(i),
          flowRate: i
        })
      }
    }
    return data;
  }

  updateValues() {
    var format = d3.format(".3n");
    this.svg.append("text")
      .attr("x", 20)
      .attr("y", "20")
      .text("Achievable Efficiency (max): " + format(this.calculateYmax(this.efficiencyForm.controls.flowRate.value)) + ' %')
      .style("font-size", this.fontSize)
      .style("font-weight", "bold")
      .style("fill", "#145A32");
    this.svg.append("text")
      .attr("x", 20)
      .attr("y", "50")
      .text("Achievable Efficiency (average): " + format(this.calculateYaverage(this.efficiencyForm.controls.flowRate.value)) + ' %')
      .style("font-size", this.fontSize)
      .style("font-weight", "bold")
      .style("fill", "#3498DB");
  }

  drawPoints() {
    this.maxPoint
      .attr("transform", () => {
        if (this.y(this.calculateYmax(this.efficiencyForm.controls.flowRate.value)) >= 0) {
          return "translate(" + this.x(this.efficiencyForm.controls.flowRate.value) + "," + this.y(this.calculateYmax(this.efficiencyForm.controls.flowRate.value)) + ")";
        }
      })
      .style("display", () => {
        if (this.y(this.calculateYmax(this.efficiencyForm.controls.flowRate.value)) >= 0) {
          return null;
        } else {
          return "none";
        }
      });

    this.avgPoint
      .attr("transform", () => {
        if (this.y(this.calculateYaverage(this.efficiencyForm.controls.flowRate.value)) >= 0) {
          return "translate(" + this.x(this.efficiencyForm.controls.flowRate.value) + "," + this.y(this.calculateYaverage(this.efficiencyForm.controls.flowRate.value)) + ")";
        }
      })
      .style("display", () => {
        if (this.y(this.calculateYaverage(this.efficiencyForm.controls.flowRate.value)) >= 0) {
          return null;
        } else {
          return "none";
        }
      });
  }

  toggleGrid() {
    if (this.isGridToggled) {
      this.isGridToggled = false;
      this.makeGraph();
    }
    else {
      this.isGridToggled = true;
      this.makeGraph();
    }
  }

  downloadChart() {
    if (!this.exportName) {
      this.exportName = "achievable-efficiency-graph";
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
}
