import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import * as d3 from 'd3';
import * as c3 from 'c3';
@Component({
  selector: 'app-pre-assessment-graph',
  templateUrl: './pre-assessment-graph.component.html',
  styleUrls: ['./pre-assessment-graph.component.css']
})
export class PreAssessmentGraphComponent implements OnInit {
  @Input()
  results: Array<any>;
  @Input()
  chartColors: Array<string>;

  firstChange: boolean = true;
  chart: any;
  columnData: Array<any>;
  chartContainerHeight: number;
  chartContainerWidth: number;

  pieChartLabels: Array<string>;
  pieChartData: Array<number>;

  constructor() { }

  ngOnInit() {
    this.getData();
    this.chartContainerWidth = window.innerWidth * 0.41;
    this.chartContainerHeight = 280;
  }

  ngOnChanges(changes: SimpleChange) {
    if (changes) {
      this.getData();
      if (this.firstChange) {
        this.firstChange = !this.firstChange;
      }
      else {
        this.updateChart();
      }
    }
  }

  ngAfterViewInit() {
    this.initChart();
  }

  getData() {
    this.columnData = new Array();
    this.results.forEach(val => {
      let tmpArray = new Array();
      tmpArray.push(val.name);
      tmpArray.push(val.percent);
      this.columnData.push(tmpArray);
    })
  }

  initChart() {
    this.chart = c3.generate({
      data: {
        columns: this.columnData,
        type: 'pie',
      },
      size: {
        width: this.chartContainerWidth,
        height: this.chartContainerHeight
      },
      color: {
        pattern: this.chartColors
      },
      legend: {
        show: false
      },
      tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          let styling = "background-color: rgba(0, 0, 0, 0.7); border-radius: 5px; color: #fff; padding: 3px; font-size: 13px;";
          let html = "<div style='" + styling + "'>" + d[0].name + "</div>";
          return html;
        }
      }
    })
  }

  updateChart() {
    if (this.chart) {
      this.chart.load({
        columns: this.columnData
      });
    }
  }
}