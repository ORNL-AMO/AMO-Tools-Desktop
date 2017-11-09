import { Component, OnInit, Input, ViewChild, SimpleChange } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { PACKAGE_ROOT_URL } from '@angular/core/src/application_tokens';
@Component({
  selector: 'app-pre-assessment-graph',
  templateUrl: './pre-assessment-graph.component.html',
  styleUrls: ['./pre-assessment-graph.component.css']
})
export class PreAssessmentGraphComponent implements OnInit {
  @Input()
  results: Array<any>;
  @ViewChild(BaseChartDirective) private baseChart;
  
  chartData: any = {
    pieChartLabels: new Array<string>(),
    pieChartData: new Array<number>()
  }

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

  ngOnChanges(changes: SimpleChange){
    if(changes){
      this.getData();
    }
  }

  getData(){
    this.chartData = {
      pieChartLabels: new Array<string>(),
      pieChartData: new Array<number>()
    }
    this.results.forEach(val => {
      this.chartData.pieChartData.push(val.value);
      this.chartData.pieChartLabels.push(val.name);
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
