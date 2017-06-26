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

  // doughnutChartLabels: string[] = ['Optimization Rating', 'Potential'];
  // doughnutChartData: number[];
  // doughnutChartType: string = 'doughnut';
  // chartOptions: any;
  // chartColors: Array<any> = [{}];
  // chartColorDataSet: Array<any>;

  optimizationRating: number = 0;
  title: string;
  unit: string;
  titlePlacement: string;
  constructor() { }

  ngOnInit() {
    if (this.psat) {
      this.initChart();
    }
  }

  ngOnChanges() {
    console.log('change');
    this.initChart();
  }

  initChart() {
    this.optimizationRating = Number((Math.round(this.psat.outputs.existing.optimization_rating * 100 * 100) / 100).toFixed(0));
    console.log(this.optimizationRating);
    this.title = this.psat.name || 'Baseline';
    this.unit = '%';
    this.titlePlacement = 'top';
  }


}
