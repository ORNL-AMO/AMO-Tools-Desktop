import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ReportRollupService, PhastResultsData } from '../report-rollup.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { PhastService } from '../../phast/phast.service';
import { PhastResults, ShowResultsCategories } from '../../shared/models/phast/phast';
import { PhastResultsService } from '../../phast/phast-results.service';
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

  // 2 Dimensional array. 
  // Each sub array will correspond to a single bar color across every category
  @Input()
  allDataColumns: Array<any>;


  barChart: any;


  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnChanges() {
    if (this.isUpdate && !this.printView) {
      this.initChart();
    }
  }

  initChart() {
    let currentChart;

    if (this.assessmentType == "phast") {
      if (this.printView) {
        let printChartContainers = document.getElementsByClassName("print-phast-rollup-bar-chart");
        currentChart = printChartContainers[0];
        currentChart.className = "printing-phast-rollup-bar-chart";
      }
      else {
        let appChartContainers = document.getElementsByClassName("phast-rollup-bar-chart");
        currentChart = appChartContainers[0];
      }
    }
    else if (this.assessmentType == "psat") {
      if (this.printView) {
        let printChartContainers = document.getElementsByClassName("print-psat-rollup-bar-chart");
        currentChart = printChartContainers[0];
        currentChart.className = "printing-psat-rollup-bar-chart";
      }
      else {
        let appChartContainers = document.getElementsByClassName("psat-rollup-bar-chart");
        currentChart = appChartContainers[0];
      }
    }

    let unit = this.unit;

    if (this.allDataColumns) {
        this.barChart = c3.generate({
        bindto: currentChart,
        data: {
          columns: this.allDataColumns,
          type: 'bar',
        },
        axis: {
          x: {
            type: 'category',
            categories: this.chartLabels
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
          height: 320
        },
        padding: {
          bottom: 20
        },
        color: {
          pattern: this.graphColors
        },
        legend: {
          show: this.showLegend,
          position: 'right'
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
      d3.selectAll(".c3-axis").style("fill", "none").style("stroke", "#000");
      d3.selectAll(".c3-axis-y-label").style("fill", "#000").style("stroke", "#000");
      d3.selectAll(".c3-texts").style("font-size", "10px");
      d3.selectAll(".c3-legend-item text").style("font-size", "15px");
      d3.selectAll(".c3-ygrids").style("stroke", "#B4B2B7").style("stroke-width", "0.5px");
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
}
