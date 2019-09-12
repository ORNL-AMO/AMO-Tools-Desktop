import { Component, OnInit, Input, ViewChild, HostListener, ElementRef, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { CostSummaryChartService } from './cost-summary-chart.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-cost-summary-chart',
  templateUrl: './cost-summary-chart.component.html',
  styleUrls: ['./cost-summary-chart.component.css']
})
export class CostSummaryChartComponent implements OnInit {
  //data set titles describe the different sections of each bar, i.e. the legend titles
  @Input()
  dataSetTitles: Array<string>;

  //data titles describe each bar, i.e. all the x-axis labels for each complete bar
  @Input()
  dataTitles: Array<string>;

  //data holds all the numerical data to be visualized in bar chart
  @Input()
  data: Array<Array<number>>;

  @Input()
  chartContainerWidth: number;
  @Input()
  chartContainerHeight: number;
  @Input()
  settings: Settings;

  @ViewChild('ngChart', { static: false }) ngChart: ElementRef;

  exportName: string;
  graphColors: Array<string>;
  format: any = d3.format(',.2f');

  svg: d3.Selection<any>;
  xScale: any;
  yScale: any;
  xAxis: d3.Selection<any>;
  yAxis: d3.Selection<any>;
  width: number;
  height: number;
  margin: { top: number, right: number, bottom: number, left: number } = {
    top: 24,
    right: 93,
    bottom: 105,
    left: 100
  };

  minHeight: number = 310;

  canvasWidth: number;
  canvasHeight: number;
  fontSize: string;

  //add this boolean to keep track if graph has been expanded
  expanded: boolean = false;

  constructor(private costSummaryChartService: CostSummaryChartService) { }

  ngOnInit() {
    this.graphColors = graphColors;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeGraph();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.chartContainerHeight && !changes.chartContainerHeight.firstChange) {
      this.resizeGraph();
    } else if (changes.chartContainerWidth && !changes.chartContainerWidth.firstChange) {
      this.resizeGraph();
    }
  }

  resizeGraph() {
    this.width = this.chartContainerWidth - this.margin.left - this.margin.right;
    if (this.chartContainerHeight < this.minHeight) {
      this.chartContainerHeight = this.minHeight;
    }
    this.height = this.chartContainerHeight - this.margin.top - this.margin.bottom;
    this.makeGraph();
  }

  makeGraph() {
    this.ngChart = this.costSummaryChartService.clearSvg(this.ngChart);
    this.svg = this.costSummaryChartService.initSvg(this.ngChart, this.width, this.height, this.margin);
    this.costSummaryChartService.setNodeWidth(this.data, this.width);
    this.svg = this.costSummaryChartService.applyFilter(this.svg);
    this.svg = this.costSummaryChartService.appendRect(this.svg, this.width, this.height);
    let maxY = this.getMaxDataValue();
    let xRange: { min: number, max: number } = {
      min: 0,
      max: this.width
    };
    this.xScale = this.costSummaryChartService.setCategoryScale(xRange, this.dataTitles);
    this.xAxis = this.costSummaryChartService.setXAxis(this.svg, this.xScale, this.height, this.dataTitles.length, 0, 0, 0);
    let yRange: { min: number, max: number } = {
      min: this.height,
      max: 0
    };
    let yDomain: { min: number, max: number } = {
      min: 0,
      max: maxY + (maxY * 0.1)
    };
    this.yScale = this.costSummaryChartService.setScale(yRange, yDomain);
    for (let i = 0; i < this.data.length; i++) {
      this.costSummaryChartService.appendSourceNode(this.svg, this.data[i], i, this.graphColors, this.yScale);
    }
    this.yAxis = this.costSummaryChartService.setYAxis(this.svg, this.yScale, this.width, 11, 0, 0, 15);

    this.costSummaryChartService.appendLegend(this.svg, this.width, this.height, this.graphColors, this.dataSetTitles);

  }

  getMaxDataValue(): number {
    let max: number = 0;
    for (let i = 0; i < this.data.length; i++) {
      let tmpMax = 0;
      for (let j = 0; j < this.data[i].length; j++) {
        tmpMax += this.data[i][j];
      }
      if (tmpMax > max) {
        max = tmpMax;
      }
    }
    return max;
  }

}
