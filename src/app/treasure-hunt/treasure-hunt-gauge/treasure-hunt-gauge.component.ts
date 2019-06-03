import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, SimpleChanges } from '@angular/core';
import * as c3 from 'c3';
@Component({
  selector: 'app-treasure-hunt-gauge',
  templateUrl: './treasure-hunt-gauge.component.html',
  styleUrls: ['./treasure-hunt-gauge.component.css']
})
export class TreasureHuntGaugeComponent implements OnInit {
  @Input()
  value: number;
  @Input()
  chartHeight: number;
  @Input()
  chartWidth: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.initChart();
  }
  chart: any;
  @ViewChild('tHuntChart') tHuntChart: ElementRef;
  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value && !changes.value.isFirstChange()) {
      this.updateChart();
    }
  }

  updateChart() {
    if (this.chart) {
      this.chart.load({
        columns: [
          ['data', this.value]
        ]
      });
    }
    else {
      this.initChart();
    }
  }

  initChart() {
    this.chart = c3.generate({
      bindto: this.tHuntChart.nativeElement,
      data: {
        columns: [
          ['data', 0]
        ],
        type: 'gauge',
        min: 0,
        max: 50
      },
      legend: {
        show: false
      },
      gauge: {
        label: {
          show: false,
          format: function (value: number, ratio) {
            return value.toFixed(2) + '%'; //returning here the value and not the ratio
          }
        },
        min: 0,
        max: 50
      },
      color: {
        pattern: ['#52489C', '#3498DB', '#6DAFA9', '#60B044', '#FF0000'], // the three color levels for the percentage values.
        threshold: {
          values: [25, 50]
        }
      },
      tooltip: {
        show: false
      },
      size: {
        height: this.chartHeight,
        width: this.chartWidth
      }
    });

    if (this.value && this.chart) {
      this.updateChart();
    }
  }
}
