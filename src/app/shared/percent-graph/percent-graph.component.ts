import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, SimpleChanges } from '@angular/core';
import * as c3 from 'c3';

@Component({
  selector: 'app-percent-graph',
  templateUrl: './percent-graph.component.html',
  styleUrls: ['./percent-graph.component.css']
})
export class PercentGraphComponent implements OnInit {
  @Input()
  value: number;
  @Input()
  width: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.initChart();
  }
  chart: any;
  @ViewChild('ngChart', { static: false }) ngChart: ElementRef;

  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value && !changes.value.isFirstChange()) {
      this.updateChart();
    }
  }

  updateChart() {
    if (this.chart) {
      this.chart.load({
        columns: [
          ['data', this.value],
        ]
      });
    }
    else {
      this.initChart();
    }
  }

  initChart() {
    if(this.width == undefined){
      this.width = 115;
    }
    this.chart = c3.generate({
      bindto: this.ngChart.nativeElement,
      data: {
        columns: [
          ['data', this.value]
        ],
        type: 'gauge',
      },
      legend: {
        show: false
      },
      gauge: {
        label: {
          show: false
        }
      },
      color: {
        pattern: ['#52489C', '#3498DB', '#6DAFA9', '#60B044', '#FF0000'], // the three color levels for the percentage values.
        threshold: {
          values: [25, 50, 75, 101]
        }
      },
      tooltip: {
        show: false
      },
      size: {
        height: this.width,
        // width: this.chartWidth
      }
    });

    // if (this.value && this.chart) {
    //   this.updateChart();
    // }
  }
}
