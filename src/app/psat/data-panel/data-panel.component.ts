import { Component, OnInit, Input, SimpleChange, Output, EventEmitter } from '@angular/core';
import { Adjustment } from '../../shared/models/psat';
//import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-data-panel',
  templateUrl: './data-panel.component.html',
  styleUrls: ['./data-panel.component.css']
})
export class DataPanelComponent implements OnInit {
  @Input()
  adjustment: Adjustment;
  @Output('showReport')
  showReport = new EventEmitter();

  doughnutChartLabels: string[] = ['Optimization Rating', 'Potential'];
  doughnutChartData: number[];
  doughnutChartType: string = 'doughnut';
  chartOptions: any;
  chartColors: Array<any> = [{}];
  chartColorDataSet: Array<any>;

  constructor() { }

  ngOnInit() {
    if (this.adjustment) {
      this.initChart();
    }
  }

  ngOnChanges(changes: SimpleChange) {
    this.initChart();
  }

  initChart() {
    this.chartOptions = {
      legend: {
        display: false
      },
      title: {
        text: this.adjustment.name,
        display: true,
        positions: "top",
        fontStyle: "bold",
        fontSize: 22
      }
    }
    this.doughnutChartData = [this.adjustment.optimizationRating, 100-this.adjustment.optimizationRating];
    if (this.adjustment.optimizationRating >= 70) {
      this.chartColorDataSet = [
        {
          options: this.chartOptions,
          data: this.doughnutChartData,
          backgroundColor: [
            "#27AE60",
            "#CCD1D1"
          ],
          hoverBackground: [
            "#229954",
            "#B2BABB"
          ]
        }
      ]
    }else if(this.adjustment.optimizationRating < 70 && this.adjustment.optimizationRating >= 50){
      this.chartColorDataSet = [
        {
          options: this.chartOptions,
          data: this.doughnutChartData,
          backgroundColor: [
            "#EB984E",
            "#CCD1D1"

          ],
          hoverBackground: [
            "#DC7633",
            "#B2BABB"
          ]
        }
      ]
    }else{
      this.chartColorDataSet = [
        {
          options: this.chartOptions,
          data: this.doughnutChartData,
          backgroundColor: [
            "#E74C3C",
            "#CCD1D1"

          ],
          hoverBackground: [
            "#DC7633",
            "#CB4335"
          ]
        }
      ]
    }

    // this.baseChart.data = this.doughnutChartData;
    // this.baseChart.datasets = this.chartColorDataSet;
    // this.baseChart.colors = this.chartColors;
    // this.baseChart.options = this.chartOptions;
    // this.baseChart.labels = this.doughnutChartLabels;

    //TODO: Add data init here
  }

  goToReport(){
    this.showReport.emit(true);
  }

}
