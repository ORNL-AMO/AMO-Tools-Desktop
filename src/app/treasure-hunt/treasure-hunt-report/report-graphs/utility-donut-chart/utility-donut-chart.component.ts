import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as c3 from 'c3';

@Component({
  selector: 'app-utility-donut-chart',
  templateUrl: './utility-donut-chart.component.html',
  styleUrls: ['./utility-donut-chart.component.css']
})
export class UtilityDonutChartComponent implements OnInit {
  @Input()
  savings: number;
  @Input()
  newCost: number;


  chart: any;
  @ViewChild('donutChartElement') donutChartElement: ElementRef;
  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() { }

  initChart() {
    this.chart = c3.generate({
      bindto: this.donutChartElement.nativeElement,
      data: {
        type: 'donut',
        columns: [
          ['Utility Savings ', this.savings],
          ['Projected Cost ', this.newCost]
        ]
      },
      // legend: {
      //   show: false
      // },
      // color: {
      //   pattern: ['#52489C', '#3498DB', '#6DAFA9', '#60B044', '#FF0000'], // the three color levels for the percentage values.
      //   threshold: {
      //     values: [25, 50]
      //   }
      // },
      // tooltip: {
      //   show: false
      // },
    });
  }
}
