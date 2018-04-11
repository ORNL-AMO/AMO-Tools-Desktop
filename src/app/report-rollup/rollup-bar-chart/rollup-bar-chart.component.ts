import { Component, OnInit, Input, ViewChild, SimpleChanges, ElementRef, SimpleChange } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ReportRollupService, PhastResultsData } from '../report-rollup.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { PhastService } from '../../phast/phast.service';
import { PhastResults, ShowResultsCategories } from '../../shared/models/phast/phast';
import { PhastResultsService } from '../../phast/phast-results.service';
import { SvgToPngService } from '../../shared/svg-to-png/svg-to-png.service';
import * as d3 from 'd3';
import * as c3 from 'c3';

@Component({
  selector: 'app-rollup-bar-chart',
  templateUrl: './rollup-bar-chart.component.html',
  styleUrls: ['./rollup-bar-chart.component.css']
})
export class RollupBarChartComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  chartContainerWidth: number;
  @Input()
  chartLabels: Array<string>;
  @Input()
  axisLabel: string;
  @Input()
  unit: string;
  @Input()
  graphColors: Array<string>;
  @Input()
  showTitle: boolean;
  @Input()
  title: string;
  @Input()
  showLegend: boolean;
  @Input()
  isUpdate: boolean;
  @Input()
  printView: boolean;
  @Input()
  chartIndex: number;
  @Input()
  assessmentType: string;

  chartContainerHeight: number;
  rotateLabels: boolean;

  // 2 Dimensional array. 
  // Each sub array will correspond to a single bar color across every category
  @Input()
  allDataColumns: Array<any>;


  @ViewChild("ngChart") ngChart: ElementRef;
  @ViewChild('btnDownload') btnDownload: ElementRef;
  exportName: string;

  barChart: any;

  constructor(private svgToPngService: SvgToPngService) { }

  ngOnInit() {

    if (this.chartLabels !== undefined) {
      if (this.chartLabels.length > 9) {
        this.chartContainerHeight = 600;
        this.rotateLabels = true;
      }
      else {
        this.chartContainerHeight = 320;
        this.rotateLabels = false;
      }
    }
    else {
      this.chartContainerHeight = 320;
    }

    if (this.graphColors === undefined) {
      this.graphColors = graphColors;
    }
  }

  ngAfterViewInit() {

    if (this.printView) {
      if (this.chartLabels !== undefined) {
        if (this.chartLabels.length > 9) {
          this.chartContainerHeight = 600;
          this.rotateLabels = true;
        }
        else {
          this.chartContainerHeight = 320;
          this.rotateLabels = false;
        }
      }
      else {
        this.chartContainerHeight = 320;
      }
      this.initChart();
    }
  }

  ngOnChanges() {
    if (!this.printView) {
      if (this.chartContainerWidth > 0) {
        this.chartContainerHeight = 320;
        this.rotateLabels = false;
        this.initChart();
      }
    }
  }

  initChart() {
    if (this.assessmentType == "phast") {
      if (this.printView) {
        this.ngChart.nativeElement.className = "printing-phast-rollup-bar-chart";
      }
    }
    else if (this.assessmentType == "psat") {
      if (this.printView) {
        this.ngChart.nativeElement.className = "printing-psat-rollup-bar-chart";
      }
    }

    let rotateAmount: number;
    let paddingRight: number;
    if (this.rotateLabels) {
      rotateAmount = 60;
      paddingRight = 20;
    }
    else {
      rotateAmount = 0;
      paddingRight = 0;
    }

    let unit = this.unit;

    if (this.allDataColumns) {
      this.barChart = c3.generate({
        bindto: this.ngChart.nativeElement,
        data: {
          columns: this.allDataColumns,
          type: 'bar',
        },
        axis: {
          x: {
            type: 'category',
            tick: {
              rotate: rotateAmount,
              multiline: !this.rotateLabels,
            },
            categories: this.chartLabels,
            height: 2.75 * rotateAmount + 40
          },
          y: {
            label: {
              text: this.title + " (" + this.unit + ")",
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
          bottom: 20,
          right: paddingRight
        },
        color: {
          pattern: this.graphColors
        },
        legend: {
          show: !this.printView,
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

      //formatting chart
      if (this.printView) {
        d3.selectAll(".c3-axis-x .tick text").style("font-size", "1.1rem").style("fill", "none").style("stroke", "#000");
        d3.selectAll(".print-bar-chart .c3-axis").style("fill", "none").style("stroke", "#000");
        d3.selectAll(".print-bar-chart .c3-axis-y-label").style("fill", "#000").style("stroke", "#000");
        d3.selectAll(".print-bar-chart .c3-ygrids").style("stroke", "#B4B2B7").style("stroke-width", "0.5px");
      }
      else {
        d3.selectAll(".c3-axis").style("fill", "none").style("stroke", "#000");
        d3.selectAll(".c3-axis-y-label").style("fill", "#000").style("stroke", "#000");
        d3.selectAll(".c3-texts").style("font-size", "10px");
        d3.selectAll(".c3-ygrids").style("stroke", "#B4B2B7").style("stroke-width", "0.5px");
      }
    }
  }

  updateChart() {
    if (this.barChart) {
      this.barChart.load({
        columns: this.allDataColumns,
        type: 'bar'
      });
      this.barChart.axis.labels({
        y: this.axisLabel
      });
    }
  }


  downloadChart() {
    if (!this.title) {
      if (this.assessmentType == "phast") {
        this.exportName = "phast-rollup-bar-graph";
      }
      else {
        this.exportName = "psat-rollup-bar-graph";
      }
    }
    else {
      this.exportName = this.assessmentType + "-" + this.title + "-graph";
    }
    this.svgToPngService.exportPNG(this.ngChart, this.exportName);
  }
}
