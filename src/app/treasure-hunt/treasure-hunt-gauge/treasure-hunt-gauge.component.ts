import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, SimpleChanges } from '@angular/core';
import bb, {gauge} from "billboard.js";

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
  @ViewChild('tHuntChart', { static: false }) tHuntChart: ElementRef;
  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initChart();
    }, 100);
    
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
        this.chart = bb.generate({
      data: {
        columns: [
      ["data", this.value]
        ],
        type: gauge(),
      },
      gauge: {
        background: '#DEE2E6',
        label: {
          extents: function() { return ""; }
        }
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
        width: this.chartWidth,
        height: this.chartHeight,
      },
      bindto: this.tHuntChart.nativeElement
    });
  }
}
