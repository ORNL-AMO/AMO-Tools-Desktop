import { Component, OnInit, Input, ViewChild, SimpleChange } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
@Component({
  selector: 'app-pre-assessment-graph',
  templateUrl: './pre-assessment-graph.component.html',
  styleUrls: ['./pre-assessment-graph.component.css']
})
export class PreAssessmentGraphComponent implements OnInit {
  @Input()
  results: Array<any>;

  
  @ViewChild(BaseChartDirective) private baseChart;


  pieChartLabels: Array<string>;
  pieChartData: Array<number>;
  chartColors: Array<any>;
  //chartColorDataSet: Array<any>;

  options: any = {
    legend: {
      display: false
    }
  }

  constructor() { }

  ngOnInit() {
    this.getData();
    this.getColors();
  }

  ngOnChanges(changes: SimpleChange) {
    if (changes) {
      this.getData();
    }
  }

  getData() {
    this.pieChartData = new Array();
    this.pieChartLabels = new Array();
    this.results.forEach(val => {
      this.pieChartData.push(val.percent);
      this.pieChartLabels.push(val.name);
    })
  }

  getColors() {
    this.chartColors = [
      {
        backgroundColor: graphColors
      }
    ]
  }
}
