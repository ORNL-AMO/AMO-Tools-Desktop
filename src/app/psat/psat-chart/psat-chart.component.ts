import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import { PSAT } from '../../shared/models/psat';

@Component({
  selector: 'app-psat-chart',
  templateUrl: './psat-chart.component.html',
  styleUrls: ['./psat-chart.component.css']
})
export class PsatChartComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  modification: PSAT;
  
  // doughnutChartLabels: string[] = ['Optimization Rating', 'Potential'];
  // doughnutChartData: number[];
  // doughnutChartType: string = 'doughnut';
  // chartOptions: any;
  // chartColors: Array<any> = [{}];
  // chartColorDataSet: Array<any>;

  annualSavings: number = 0;
  title: string;
  unit: string;
  titlePlacement: string;
  constructor() { }

  ngOnInit() {
    if (this.modification) {
      this.initChart();
    }
  }

  ngOnChanges() {
    if (this.modification) {
      this.initChart();
    }
  }

  initChart() {
    this.annualSavings = Number(Math.round(((((this.psat.outputs.annual_cost - this.modification.outputs.annual_cost)*100) / this.psat.outputs.annual_cost) * 100) / 100).toFixed(0));
    this.title = this.modification.name || 'Baseline';
    this.unit = '%';
    this.titlePlacement = 'top';
  }


}
