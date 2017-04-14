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

  optimizationRating: number= 0;
  title: string;
  unit: string;
  constructor() { }

  ngOnInit() {
    if (this.psat) {
      this.initChart();
    }
  }

  ngOnChanges(changes: SimpleChange) {
    this.initChart();
  }

  initChart() {
    this.optimizationRating = this.psat.outputs.existing.optimization_rating * 100;
    this.title = this.psat.name || 'Baseline';
    this.unit = '%';

    // this.chartOptions = {
    //   legend: {
    //     display: false
    //   },
    //   title: {
    //     text: this.psat.name || 'Baseline',
    //     display: true,
    //     positions: "top",
    //     fontStyle: "bold",
    //     fontSize: 22
    //   }
    // }
    // this.doughnutChartData = [this.optimizationRating, 100 - this.optimizationRating];
    // if (this.optimizationRating >= 70) {
    //   this.chartColorDataSet = [
    //     {
    //       options: this.chartOptions,
    //       data: this.doughnutChartData,
    //       backgroundColor: [
    //         "#27AE60",
    //         "#CCD1D1"
    //       ],
    //       hoverBackground: [
    //         "#229954",
    //         "#B2BABB"
    //       ]
    //     }
    //   ]
    // } else if (this.optimizationRating < 70 && this.optimizationRating >= 50) {
    //   this.chartColorDataSet = [
    //     {
    //       options: this.chartOptions,
    //       data: this.doughnutChartData,
    //       backgroundColor: [
    //         "#EB984E",
    //         "#CCD1D1"

    //       ],
    //       hoverBackground: [
    //         "#DC7633",
    //         "#B2BABB"
    //       ]
    //     }
    //   ]
    // } else {
    //   this.chartColorDataSet = [
    //     {
    //       options: this.chartOptions,
    //       data: this.doughnutChartData,
    //       backgroundColor: [
    //         "#E74C3C",
    //         "#CCD1D1"

    //       ],
    //       hoverBackground: [
    //         "#DC7633",
    //         "#CB4335"
    //       ]
    //     }
    //   ]
    // }

    // this.baseChart.data = this.doughnutChartData;
    // this.baseChart.datasets = this.chartColorDataSet;
    // this.baseChart.colors = this.chartColors;
    // this.baseChart.options = this.chartOptions;
    // this.baseChart.labels = this.doughnutChartLabels;

    //TODO: Add data init here
  }


}
