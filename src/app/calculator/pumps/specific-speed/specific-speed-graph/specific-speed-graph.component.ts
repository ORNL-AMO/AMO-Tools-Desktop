import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, HostListener } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import * as d3 from 'd3';
import { FormGroup } from '@angular/forms';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';
import { LineChartHelperService } from '../../../../shared/line-chart-helper/line-chart-helper.service';
import { SpecificSpeedService } from '../specific-speed.service';

var tableEfficiencyCorrection: number;
var tableSpecificSpeed: number;

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

  @ViewChild("ngChartContainer") ngChartContainer: ElementRef;
  @ViewChild("ngChart") ngChart: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeGraph();
  }
  exportName: string;

  svg: d3.Selection<any>;
  xAxis: d3.Selection<any>;
  yAxis: d3.Selection<any>;
  x: any;
  y: any;
  width: number;
  height: number;
  line: d3.Selection<any>;
  filter: d3.Selection<any>;
  calcPoint: d3.Selection<any>;
  focus: d3.Selection<any>;

  //dynamic table variables
  d: { x: number, y: number };
  focusD: Array<{ x: number, y: number }>;
  tablePoints: Array<d3.Selection<any>>;

  detailBox: d3.Selection<any>;
  detailBoxPointer: d3.Selection<any>;
  tooltipData: Array<{ label: string, value: number, unit: string, formatX: boolean }>;

  curveChanged: boolean = false;
  graphColors: Array<string>;
  tableData: Array<{ borderColor: string, fillColor: string, specificSpeed: string, efficiencyCorrection: string }>;
  deleteCount: number;

  margin: { top: number, right: number, bottom: number, left: number };
  firstChange: boolean = true;

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

  //tmpPumpType: string;

  //add this boolean to keep track if graph has been expanded
  expanded: boolean = false;
  isGridToggled: boolean;

  //exportable table variables
  columnTitles: Array<string>;
  rowData: Array<Array<string>>;
  keyColors: Array<{ borderColor: string, fillColor: string }>;

  @Input()
  toggleCalculate: boolean;
  constructor(private psatService: PsatService, private lineChartHelperService: LineChartHelperService, private svgToPngService: SvgToPngService, private specificSpeedService: SpecificSpeedService) { }

  ngOnInit() {
   // this.tmpPumpType = this.speedForm.controls.pumpType.value;
    this.deleteCount = 0;
    this.graphColors = graphColors;
    this.tableData = new Array<{ borderColor: string, fillColor: string, specificSpeed: string, efficiencyCorrection: string }>();
    this.tablePoints = new Array<d3.Selection<any>>();
    this.focusD = new Array<{ x: number, y: number }>();
    this.tooltipData = new Array<{ label: string, value: number, unit: string, formatX: boolean }>();
    this.curveChanged = false;
    this.isGridToggled = false;
    this.initTooltipData();
    d3.select('app-specific-speed').selectAll('#gridToggleBtn')
      .on("click", () => {
        this.toggleGrid();
      });

    //init for exportable table
    //if(!this.specificSpeedService.keyColors && !this.inPsat){
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
    this.rowData = new Array<Array<string>>();
    // }else{
    //   this.rowData = this.specificSpeedService.rowData;
    //   this.keyColors = this.specificSpeedService.keyColors;
    // }
    this.columnTitles = new Array<string>();
    this.initColumnTitles();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeGraph();
    }, 100)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.resetData) {
        this.resetTableData();
      }
      if (changes.toggleCalculate) {
        if (this.checkForm()) {
          // if (this.speedForm.controls.pumpType.value != this.tmpPumpType) {
          //   this.curveChanged = true;
          // }
          // this.tmpPumpType = this.speedForm.controls.pumpType.value;
          this.makeGraph();
          this.svg.style("display", null);
        }
      }
    } else {
      this.firstChange = false;
    }
  }

  initTooltipData() {
    this.tooltipData.push({
      label: "Specific Speed",
      value: null,
      unit: "",
      formatX: true
    });
    this.tooltipData.push({
      label: "Efficiency Correction",
      value: null,
      unit: "%",
      formatX: false
    });
  }

  initColumnTitles() {
    this.columnTitles = ['Specific Speed', 'Efficiency Correction (%)'];
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
    if (curveGraph) {
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
        this.margin = { top: 10, right: 10, bottom: 50, left: 75 };
      } else {
        if (!this.expanded) {
          this.margin = { top: 10, right: 50, bottom: 75, left: 120 };

        }
        else {
          this.margin = { top: 10, right: 120, bottom: 75, left: 120 };
        }
      }
      this.width = this.canvasWidth - this.margin.left - this.margin.right;
      this.height = this.canvasHeight - (this.margin.top * 2) - this.margin.bottom;
      if (this.checkForm()) {
        this.makeGraph();
      }
    }
  }

  getEfficiencyCorrection() {
    if (this.checkForm()) {
      return this.psatService.achievableEfficiency(this.speedForm.controls.pumpType.value, this.getSpecificSpeed());
    } else {
      return 0;
    }
  }
  getSpecificSpeed(): number {
    if (this.checkForm()) {
      return this.speedForm.controls.pumpRPM.value * Math.pow(this.speedForm.controls.flowRate.value, 0.5) / Math.pow(this.speedForm.controls.head.value, .75);
    } else {
      return 0;
    }
  }

  checkForm() {
    //not specified pump efficiency
    if (
      this.speedForm.valid &&
      this.speedForm.controls.pumpType.value != 11
    ) {
      return true;
    } else {
      return false;
    }
  }

  makeGraph() {
    if (this.height > 0 && this.width > 0) {
      //Remove  all previous graphs
      this.ngChart = this.lineChartHelperService.clearSvg(this.ngChart);
      this.svg = this.lineChartHelperService.initSvg(this.ngChart, this.width, this.height, this.margin);
      this.svg = this.lineChartHelperService.applyFilter(this.svg);
      this.svg = this.lineChartHelperService.appendRect(this.svg, this.width, this.height);
      let xRange: { min: number, max: number };
      xRange = {
        min: 0,
        max: this.width
      };
      let xDomain: { min: number, max: number };
      xDomain = {
        min: 100,
        max: 100000
      };
      this.x = this.lineChartHelperService.setScale("log", xRange, xDomain);
      let yRange: { min: number, max: number };
      yRange = {
        min: this.height,
        max: 0
      };
      let yDomain: { min: number, max: number };
      yDomain = {
        min: 0,
        max: 6
      };
      this.y = this.lineChartHelperService.setScale('linear', yRange, yDomain);
      let xTickFormat = d3.format("d");
      this.xAxis = this.lineChartHelperService.setXAxis(this.svg, this.x, this.height, this.isGridToggled, 3, 0, 0, 0, xTickFormat);
      this.yAxis = this.lineChartHelperService.setYAxis(this.svg, this.y, this.width, this.isGridToggled, 6, 0, 0, 15);
      let data: Array<{ x: number, y: number }> = this.getData();
      this.line = this.lineChartHelperService.appendLine(this.svg, "#145A32", "2px");
      this.line = this.lineChartHelperService.drawLine(this.line, this.x, this.y, data);
      this.lineChartHelperService.setYAxisLabel(this.svg, this.width, this.height, -60, 0, "Efficiency Correction (%)");
      this.lineChartHelperService.setXAxisLabel(this.svg, this.width, this.height, 0, 70, "Specific Speed (U.S.)");
      this.calcPoint = this.lineChartHelperService.appendFocus(this.svg, "calcPoint", 5, "#000000", "2px");
      // Define the div for the tooltip
      this.detailBox = this.lineChartHelperService.appendDetailBox(this.ngChart);
      this.detailBoxPointer = this.lineChartHelperService.appendDetailBoxPointer(this.ngChart);
      this.focus = this.lineChartHelperService.appendFocus(this.svg, "focus");
      let allData: Array<Array<{ x: number, y: number }>> = [data];
      let allD: Array<{ x: number, y: number }> = [this.d];
      let allFocus: Array<d3.Selection<any>> = [this.focus];
      var format = d3.format(",.2f");
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
      if (this.curveChanged) {
        this.resetTableData();
        this.curveChanged = false;
      }
      else {
        this.replaceFocusPoints();
      }
      this.drawPoint();
      d3.selectAll("line").style("pointer-events", "none");
    }
  }

  getData(): Array<{ x: number, y: number }> {
    let data: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
    //vertical turbine
    if (this.speedForm.controls.pumpType.value === 9) {

      for (let i = 1720; i < 16350; i = i + 25) {
        let efficiencyCorrection: number = this.psatService.achievableEfficiency(this.speedForm.controls.pumpType.value, i);
        if (efficiencyCorrection <= 5.5) {
          data.push({
            x: i,
            y: efficiencyCorrection
          });
        }
      }
    } else {
      for (let i = 680; i < 7300; i = i + 25) {
        let efficiencyCorrection: number = this.psatService.achievableEfficiency(this.speedForm.controls.pumpType.value, i);
        if (efficiencyCorrection <= 5.5) {
          data.push({
            x: i,
            y: efficiencyCorrection
          });
        }
      }
    }
    return data;
  }

  //dynamic table
  buildTable() {
    let i = this.rowData.length + this.deleteCount;
    let borderColorIndex = Math.floor(i / this.graphColors.length);
    let dArray: Array<{ x: number, y: number }> = this.lineChartHelperService.getDArray();
    this.d = dArray[0];

    let tableFocus: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePoint-" + this.tablePoints.length, this.graphColors[i % this.graphColors.length], this.graphColors[borderColorIndex % this.graphColors.length], this.x(this.d.x), this.y(this.d.y));
    this.focusD.push(this.d);
    this.tablePoints.push(tableFocus);

    let tableSpecificSpeed: number = this.d.x;
    let tableEfficiencyCorrection: number = this.d.y;
    let dataPiece = {
      borderColor: this.graphColors[borderColorIndex % this.graphColors.length],
      fillColor: this.graphColors[i % this.graphColors.length],
      specificSpeed: tableSpecificSpeed.toString(),
      efficiencyCorrection: tableEfficiencyCorrection.toString()
    };
    this.tableData.push(dataPiece);
    let colors = {
      borderColor: this.graphColors[borderColorIndex % this.graphColors.length],
      fillColor: this.graphColors[i % this.graphColors.length]
    };
    this.keyColors.push(colors);
    let data = [tableSpecificSpeed.toString(), tableEfficiencyCorrection.toString()];
    this.rowData.push(data);
  }

  //dynamic table
  resetTableData() {
    this.tableData = new Array<{ borderColor: string, fillColor: string, specificSpeed: string, efficiencyCorrection: string }>();
    this.tablePoints = new Array<d3.Selection<any>>();
    this.focusD = new Array<{ x: number, y: number }>();
    this.deleteCount = 0;
    this.rowData = new Array<Array<string>>();
    this.keyColors = new Array<{ borderColor: string, fillColor: string }>();
  }

  //dynamic table
  replaceFocusPoints() {
    this.svg.selectAll('.tablePoint').remove();
    for (let i = 0; i < this.tablePoints.length; i++) {
      let tableFocus: d3.Selection<any> = this.lineChartHelperService.tableFocusHelper(this.svg, "tablePoint-" + i, this.tableData[i].fillColor, this.tableData[i].borderColor, this.x(this.focusD[i].x), this.y(this.focusD[i].y));
    }
  }

  //dynamic table
  deleteFromTable(i: number) {
    for (let j = i; j < this.tableData.length - 1; j++) {
      this.tableData[j] = this.tableData[j + 1];
      this.tablePoints[j] = this.tablePoints[j + 1];
      this.focusD[j] = this.focusD[j + 1];
      this.rowData[j] = this.rowData[j + 1];
      this.keyColors[j] = this.keyColors[j + 1];
    }
    if (i != this.tableData.length - 1) {
      this.deleteCount += 1;
    }
    this.tableData.pop();
    this.tablePoints.pop();
    this.focusD.pop();
    this.rowData.pop();
    this.keyColors.pop();
    this.replaceFocusPoints();
  }

  //dynamic table
  highlightPoint(i: number) {
    let ids: Array<string> = ['#tablePoint-' + i];
    this.lineChartHelperService.tableHighlightPointHelper(this.svg, ids);
  }
  unhighlightPoint(i: number) {
    let ids: Array<string> = ['#tablePoint-' + i];
    this.lineChartHelperService.tableUnhighlightPointHelper(this.svg, ids);
    this.replaceFocusPoints();
  }

  //dynamic table
  drawPoint() {
    var specificSpeed = this.psatService.roundVal(this.getSpecificSpeed(), 3);
    var efficiencyCorrection = this.psatService.achievableEfficiency(this.speedForm.controls.pumpType.value, specificSpeed);
    this.calcPoint
      .attr("transform", () => {
        if (this.y(efficiencyCorrection) >= 0) {
          return "translate(" + this.x(specificSpeed) + "," + this.y(efficiencyCorrection) + ")";
        }
      })
      .style("display", () => {
        //vertical turbine
        if (this.speedForm.controls.pumpType.value === 9) {
          if (specificSpeed >= 1720 && specificSpeed <= 16350) {
            return null;
          } else {
            return "none";
          }
        } else {
          if (specificSpeed >= 680 && specificSpeed <= 7300) {
            return null;
          } else {
            return "none";
          }
        }
      });
    this.svg.append("text")
      .attr("x", "20")
      .attr("y", "20")
      .text("Specific Speed: " + specificSpeed)
      .style("font-size", "13px")
      .style("font-weight", "bold");
    this.svg.append("text")
      .attr("x", this.width - 200)
      .attr("y", "20")
      .text("Efficiency Correction: " + efficiencyCorrection + ' %')
      .style("font-size", "13px")
      .style("font-weight", "bold");
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
      this.exportName = "specific-speed-graph";
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
