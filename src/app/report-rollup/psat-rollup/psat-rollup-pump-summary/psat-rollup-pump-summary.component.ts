import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { BaseChartDirective } from 'ng2-charts';
import { ReportRollupService, PsatResultsData } from '../../report-rollup.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import * as d3 from 'd3';
import * as c3 from 'c3';
@Component({
  selector: 'app-psat-rollup-pump-summary',
  templateUrl: './psat-rollup-pump-summary.component.html',
  styleUrls: ['./psat-rollup-pump-summary.component.css']
})
export class PsatRollupPumpSummaryComponent implements OnInit {
  @Input()
  settings: Settings

  //chart element
  chart: any;
  chartContainerWidth: number;

  //chart text
  unit: string;
  axisLabel: string;
  chartLabels: Array<string>;

  //chart data
  dataColumns: Array<any>;
  baselineColumns: Array<any>;
  modColumns: Array<any>;

  //chart color  
  graphColors: Array<string>;

  resultData: Array<PsatResultsData>;
  graphOptions: Array<string> = [
    'Energy Use',
    'Cost'
  ]
  graphOption: string = 'Energy Use';
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.resultData = new Array();
    this.chartContainerWidth = (window.innerWidth - 30) * .55;
    this.reportRollupService.psatResults.subscribe((psats: Array<PsatResultsData>) => {
      if (psats.length != 0) {
        this.resultData = psats;
        this.buildChartData();
      }
    })
  }

  ngAfterViewInit() {
    this.initChart();
  }


  buildChartData() {
    //init arrays
    this.chartLabels = new Array();
    this.dataColumns = new Array<any>();
    this.baselineColumns = new Array<any>();
    this.baselineColumns.push("Baseline");
    this.modColumns = new Array<any>();
    this.modColumns.push("Modification");

    this.axisLabel = this.graphOption;
    let i = 1;
    this.resultData.forEach(data => {
      let num1 = 0;
      let num2 = 0;
      if (this.graphOption == 'Energy Use') {
        if (i == 1) {
          this.unit = 'kWh/yr';
          this.axisLabel = this.axisLabel + ' (' + this.unit + ')';
        }
        num1 = data.baselineResults.annual_energy;
        if (data.modName) {
          num2 = data.modificationResults.annual_energy;
        }
      } else if (this.graphOption == 'Cost') {
        if (i == 1) {
          this.unit = "$/yr";
          this.axisLabel = this.axisLabel + ' (' + this.unit + ')';
        }
        num1 = data.baselineResults.annual_cost;
        if (data.modName) {
          num2 = data.modificationResults.annual_cost;
        }
      }
      i++;
      this.addData(data.name, num1, num2);
    });

    this.initChart();
  }

  addData(label: string, baseNum: number, modNum: number) {
    this.chartLabels.push(label);
    this.baselineColumns.push(baseNum);
    this.modColumns.push(modNum);
  }


  getPayback(modCost: number, baselineCost: number, implementationCost: number) {
    if (implementationCost) {
      let val = (implementationCost / (baselineCost - modCost)) * 12;
      if (isNaN(val) == false) {
        return val;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  getSavings(modCost: number, baselineCost: number) {
    return baselineCost - modCost;
  }

  initChart() {
    let charts = document.getElementsByClassName("psat-rollup-bar-chart");
    let currentChart = charts[0];
    let unit = this.unit;

    this.chart = c3.generate({
      bindto: currentChart,
      data: {
        columns: [
          this.baselineColumns,
          this.modColumns
        ],
        type: 'bar',
      },
      axis: {
        x: {
          type: 'category',
          categories: this.chartLabels
        },
        y: {
          label: {
            text: this.graphOption,
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
    d3.selectAll(".c3-legend-item text").style("font-size", "11px");
    d3.selectAll(".c3-ygrids").style("stroke", "#B4B2B7").style("stroke-width", "0.5px");
  }

  updateChart() {
    if (this.chart) {
      this.chart.load({
        columns: [
          this.baselineColumns,
          this.modColumns
        ]
      });
    }
  }
}