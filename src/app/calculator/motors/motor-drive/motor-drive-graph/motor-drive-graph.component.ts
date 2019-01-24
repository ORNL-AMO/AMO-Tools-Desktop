import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges, HostListener } from '@angular/core';
import { MotorDriveOutputs } from '../motor-drive.component';
import * as d3 from 'd3';
import * as c3 from 'c3';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';

@Component({
  selector: 'app-motor-drive-graph',
  templateUrl: './motor-drive-graph.component.html',
  styleUrls: ['./motor-drive-graph.component.css']
})
export class MotorDriveGraphComponent implements OnInit {
  @Input()
  results: MotorDriveOutputs;

  @ViewChild("ngChart") ngChart: ElementRef;

  barChart: any;
  graphColors: Array<string>;
  selectedGraphType: string = 'energyCost';
  exportName: string;

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

  constructor(private svgToPngService: SvgToPngService) { }

  ngOnInit() {
    this.graphColors = graphColors;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.buildChart();
    }, 100)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.results && !changes.results.firstChange) {
      this.buildChart();
    }
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

  setType(str: string) {
    if (str != this.selectedGraphType) {
      this.selectedGraphType = str;
      this.buildChart();
    }
  }

  buildChart() {
    let unit: string;
    let columnData: Array<Array<any>>;

    if (this.selectedGraphType == 'energyCost') {
      columnData = [
        ['V Belt Drive', this.results.vBeltResults.energyCost],
        ['Notched V Belt Drive', this.results.notchedResults.energyCost],
        ['Synchronous Belt Drive', this.results.synchronousBeltDrive.energyCost]
      ]
      unit = '$k/yr';
    } else if (this.selectedGraphType == 'energyUse') {
      columnData = [
        ['V Belt Drive', this.results.vBeltResults.annualEnergyUse],
        ['Notched V Belt Drive', this.results.notchedResults.annualEnergyUse],
        ['Synchronous Belt Drive', this.results.synchronousBeltDrive.annualEnergyUse]
      ]
      unit = 'MWh/yr';
    }
    this.barChart = c3.generate({
      bindto: this.ngChart.nativeElement,
      data: {
        columns: columnData,
        type: 'bar',
      },
      grid: {
        y: {
          show: true
        }
      },
      color: {
        pattern: this.graphColors
      },
      legend: {
        show: true,
        position: 'bottom'
      },
      bar: {
        width: {
          ratio: .5
        }
      },
      axis: {
        y: {
          label: {
            text: unit,
            position: 'outer-middle'
          }
        },
        x: {
          tick: {
            values: ['']
          }
        }
      },
      tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          let styling = "background-color: rgba(0, 0, 0, 0.7); border-radius: 5px; color: #fff; padding: 3px; font-size: 13px; display: inline-block; white-space: nowrap;";
          let html = "<div style='" + styling + "'>"
            + "<table>"
            + "<tr>"
            + "<td>"
            + d[0].name + ": "
            + "</td>"
            + "<td style='text-align: right; font-weight: bold'>"
            + Math.round(d[0].value) + " " + unit
            + "</td>"
            + "</tr>"
            + "<tr>";

          if (d[1]) {
            html = html
              + "<td>"
              + d[1].name + ": "
              + "</td>"
              + "<td style='text-align: right; font-weight: bold'>"
              + Math.round(d[1].value) + " " + unit
              + "</td>"
              + "</tr>"
          }
          if (d[2]) {
            html = html
              + "<td>"
              + d[2].name + ": "
              + "</td>"
              + "<td style='text-align: right; font-weight: bold'>"
              + Math.round(d[2].value) + " " + unit
              + "</td>"
              + "</tr>"
          }
          html = html + "</table></div>";
          return html;
        }
      }
    });
    d3.selectAll(".c3-axis").style("fill", "none").style("stroke", "#000");
    d3.selectAll(".c3-axis-y-label").style("fill", "#000").style("stroke", "#000");
    d3.selectAll(".c3-texts").style("font-size", "20px");
    d3.selectAll(".c3-ygrids").style("stroke", "#B4B2B7").style("stroke-width", "0.5px");
  }

  downloadChart() {
    if (!this.exportName) {
      this.exportName = "motor-drive-graph";
    }
    this.svgToPngService.exportPNG(this.ngChart, this.exportName);
  }

  //========= chart resize functions ==========
  expandChart() {
    this.expanded = true;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.buildChart();
    }, 200);
  }

  contractChart() {
    this.expanded = false;
    this.hideTooltip('btnExpandChart');
    this.hideTooltip('btnCollapseChart');
    setTimeout(() => {
      this.buildChart();
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
