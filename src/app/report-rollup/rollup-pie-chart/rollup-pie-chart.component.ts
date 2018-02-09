import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { ReportRollupService, PhastResultsData } from '../report-rollup.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from 'electron';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { SigFigsPipe } from '../../shared/sig-figs.pipe';
import * as d3 from 'd3';
import * as c3 from 'c3';
@Component({
  selector: 'app-rollup-pie-chart',
  templateUrl: './rollup-pie-chart.component.html',
  styleUrls: ['./rollup-pie-chart.component.css']
})
export class RollupPieChartComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: Array<any>;
  @Input()
  graphColors: Array<string>;
  @Input()
  isUpdate: boolean;
  @Input()
  showLegend: boolean;
  @Input()
  labels: boolean;
  @Input()
  chartContainerWidth: number;
  @Input()
  printView: boolean;
  @Input()
  title: string;
  @Input()
  showTitle: boolean;
  @Input()
  chartIndex: number;
  @Input()
  assessmentType: string;

  pieChart: any;

  constructor() { }

  ngOnInit() {
    this.graphColors = graphColors;
  }

  ngAfterViewInit() {
    if (this.printView) {
      this.chartContainerWidth = 500;
    }
    this.initChart();
  }

  ngOnChanges() {
    if (this.isUpdate) {
      this.updateChart();
    }
  }


  initChart() {
    let currentChart;

    if (this.assessmentType == "phast") {
      if (this.printView) {
        let printChartContainers = document.getElementsByClassName("print-phast-rollup-pie-chart");
        currentChart = printChartContainers[0];
        currentChart.className = "printing-phast-rollup-bar-chart";
      }
      else {
        let appChartContainers = document.getElementsByClassName("phast-rollup-pie-chart");
        currentChart = appChartContainers[0];
      }
    }
    else if (this.assessmentType == "psat") {
      if (this.printView) {
        let printChartContainers = document.getElementsByClassName("print-psat-rollup-pie-chart");
        currentChart = printChartContainers[0];
        currentChart.className = "printing-psat-rollup-bar-chart";
      }
      else {
        let appChartContainers = document.getElementsByClassName("psat-rollup-pie-chart");
        currentChart = appChartContainers[0];
      }
    }

    this.pieChart = c3.generate({
      bindto: currentChart,
      data: {
        columns: [],
        type: 'pie',
        labels: this.labels,
      },
      legend: {
        show: this.showLegend,
        position: 'right'
      },
      color: {
        pattern: this.graphColors
      },
      size: {
        width: this.chartContainerWidth,
        height: 280
      },
      tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          let styling = "background-color: rgba(0, 0, 0, 0.7); border-radius: 5px; color: #fff; padding: 3px; font-size: 13px;";
          let html = "<div style='" + styling + "'>" + d[0].name + "</div>";
          return html;
        }
      }
    });

    for (let j = 0; j < this.results.length; j++) {
      this.pieChart.load({
        columns: [
          [this.results[j].name, this.results[j].percent]
        ],
        labels: this.labels
      });
    }

    if (this.printView) {
      //formatting chart
      d3.selectAll(".c3-legend-item text").style("font-size", "13px");
    }
  }

  updateChart() {
    if (this.pieChart) {
      for (let i = 0; i < this.results.length; i++) {
        this.pieChart.load({
          columns: [
            [this.results[i].name, this.results[i].percent]
          ],
          type: 'pie',
          labels: this.labels
        });
      }
    }
  }
}
