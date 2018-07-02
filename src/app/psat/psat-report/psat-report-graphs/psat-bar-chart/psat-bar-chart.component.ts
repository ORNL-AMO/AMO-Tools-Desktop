import { Component, OnInit, Input, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';
import * as d3 from 'd3';
import * as c3 from 'c3';

@Component({
  selector: 'app-psat-bar-chart',
  templateUrl: './psat-bar-chart.component.html',
  styleUrls: ['./psat-bar-chart.component.css']
})
export class PsatBarChartComponent implements OnInit {
  @Input()
  settings: Settings
  @Input()
  printView: boolean;
  @Input()
  graphColors: Array<string>;
  @Input()
  labels: Array<string>;
  @Input()
  psat1Name: string;
  @Input()
  psat2Name: string;
  @Input()
  psat1Values: Array<number>;
  @Input()
  psat2Values: Array<number>;
  @Input()
  chartContainerWidth: number;
  chartContainerHeight: number;

  @ViewChild("ngChart") ngChart: ElementRef;
  @ViewChild("btnDownload") btnDownload: ElementRef;

  exportName: string;

  doc: any;
  window: any;
  resultsWidth: number;
  chart: any;

  barData1: Array<any>;
  barData2: Array<any>;
  chartData: Array<any>;

  //booleans for tooltip
  hoverBtnExport: boolean = false;
  displayExportTooltip: boolean = false;
  hoverBtnGridLines: boolean = false;
  displayGridLinesTooltip: boolean = false;

  constructor(private windowRefService: WindowRefService, private svgToPngService: SvgToPngService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (!this.printView) {
      if (this.chartContainerWidth > 877) {
        this.chartContainerWidth = 877;
      }
      else {
        this.chartContainerWidth = this.chartContainerWidth * 0.58;
      }
      this.chartContainerHeight = 280;
    }
    else {
      this.chartContainerWidth = 950;
      this.chartContainerHeight = 370;
    }
    this.setBarLabels();
    this.prepBarData();
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.printView) {
      if (changes.psat1Values || changes.psat2Values || changes.psat1Name || changes.psat2Name) {
        this.prepBarData();
        this.updateChart();
      }
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
  }
  // ========== end tooltip functions ==========

  setBarLabels() {
    this.labels = new Array<string>();
    this.labels.push('Energy Input');
    this.labels.push('Motor Losses');
    this.labels.push('Drive Losses');
    this.labels.push('Pump Losses');
    this.labels.push('Useful Output');
  }

  prepBarData() {
    this.barData1 = new Array<any>();
    this.barData2 = new Array<any>();

    this.barData1.push(this.psat1Name);
    this.barData2.push(this.psat2Name);

    for (let i = 0; i < this.psat1Values.length; i++) {
      this.barData1.push(this.psat1Values[i].toFixed(2));
    }
    for (let i = 0; i < this.psat2Values.length; i++) {
      this.barData2.push(this.psat2Values[i].toFixed(2));
    }

    this.chartData = [this.barData1, this.barData2];
  }


  initChart() {
    let unit = this.settings.powerMeasurement;
    let yAxisLabel: string;
    if (this.printView) {
      yAxisLabel = "";
      this.ngChart.nativeElement.className = "print-bar-chart";
    }
    else {
      yAxisLabel = "Power (" + unit + ")";
    }


    this.chart = c3.generate({
      bindto: this.ngChart.nativeElement,
      data: {
        columns: this.chartData,
        type: 'bar',
      },
      axis: {
        x: {
          type: 'category',
          categories: this.labels
        },
        y: {
          label: {
            text: yAxisLabel,
            position: 'outer-middle'
          },
          tick: {
            format: d3.format('.1f')
          },
        }
      },
      grid: {
        y: {
          show: true
        }
      },
      size: {
        width: this.chartContainerWidth,
        height: this.chartContainerHeight
      },
      padding: {
        bottom: 20
      },
      color: {
        pattern: this.graphColors
      },
      legend: {
        position: 'bottom'
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
            + d[0].value + " " + unit
            + "</td>"
            + "</tr>"
            + "<tr>";

          if (d[1]) {
            html = html
              + "<td>"
              + d[1].name + ": "
              + "</td>"
              + "<td style='text-align: right; font-weight: bold'>"
              + d[1].value + " " + unit
              + "</td>"
              + "</tr>"
          }
          html = html + "</table></div>";
          return html;
        }
      }
    });
    if (this.printView) {
      d3.selectAll(".print-bar-chart .c3-legend-item text").style('font-size', '1.0rem');
      d3.selectAll(".print-bar-chart .c3-axis").style("fill", "none").style("stroke", "#000");
      d3.selectAll(".print-bar-chart .c3-axis-y-label").style("fill", "#000").style("stroke", "#000");
      d3.selectAll(".print-bar-chart .c3-ygrids").style("stroke", "#B4B2B7").style("stroke-width", "0.5px");
      // d3.selectAll(".print-bar-chart .c3-axis-x g.tick text tspan").style("font-size", "0.9rem").style("fill", "#000").style("stroke", "#000").style("line-height", "20px");
      d3.selectAll(".print-bar-chart .c3-axis-y g.tick text tspan").style("font-size", "0.9rem");
    }
    else {
      d3.selectAll(".c3-axis").style("fill", "none").style("stroke", "#000");
      d3.selectAll(".c3-axis-y-label").style("fill", "#000").style("stroke", "#000");
      d3.selectAll(".c3-texts").style("font-size", "20px");
      d3.selectAll(".c3-ygrids").style("stroke", "#B4B2B7").style("stroke-width", "0.5px");
    }
  }

  updateChart() {
    if (this.chart !== undefined && this.chart !== null) {
      this.chart.load({
        unload: true,
        columns: [this.barData1, this.barData2]
      });
    }
  }

  downloadChart() {
    if (!this.exportName) {
      this.exportName = "psat-report-bar-graph";
    }
    this.svgToPngService.exportPNG(this.ngChart, this.exportName);
  }
}
