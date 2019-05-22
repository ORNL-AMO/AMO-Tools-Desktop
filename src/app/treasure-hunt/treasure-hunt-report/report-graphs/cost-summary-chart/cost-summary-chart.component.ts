import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

@Component({
  selector: 'app-cost-summary-chart',
  templateUrl: './cost-summary-chart.component.html',
  styleUrls: ['./cost-summary-chart.component.css']
})
export class CostSummaryChartComponent implements OnInit {
  @Input()
  dataSetTitles: Array<string>;
  @Input()
  data: Array<Array<number>>;
  graphColors: Array<string>;
  constructor() { }

  ngOnInit() {
    this.graphColors = graphColors;
  }

}
