import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, SimpleChanges } from '@angular/core';
import bb, {gauge} from "billboard.js";

@Component({
    selector: 'app-percent-graph',
    templateUrl: './percent-graph.component.html',
    styleUrls: ['./percent-graph.component.css'],
    standalone: false
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value && !changes.value.isFirstChange()) {
      this.updateChart();
    }
  }

  updateChart() {
    if (this.chart) {
      // * important: work-around for billboardjs logic where value greater than max will reset chart max
      // * ex. our previous value was 150% --> new max = 150%
      this.chart.config("gauge.max", 100)
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

    this.chart = bb.generate({
      data: {
        columns: [
      ["data", this.value]
        ],
        type: gauge(),
      },
      oninit: () => {},
      gauge: {
        label: {
          extents: function() { return ""; },
          format: function (value, ratio) {
            // important: support values over 100
            return value.toFixed(1) + "%"; 
          }
        },
        max: 100
      },
      color: {
        pattern: [
          '#52489C', '#3498DB', '#6DAFA9', '#60B044', '#FF0000'
        ],
        threshold: {
          values: [
            25, 50, 75, 101
          ]
        }
      },
      legend: {
        show: false
      },
      tooltip: {
        show: false
      },
      size: {
        height: this.width
      },
      bindto: this.ngChart.nativeElement
    });
  }
}
