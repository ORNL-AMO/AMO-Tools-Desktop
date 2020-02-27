import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import * as Plotly from 'plotly.js';
@Component({
  selector: 'app-plotly-bar-chart',
  templateUrl: './plotly-bar-chart.component.html',
  styleUrls: ['./plotly-bar-chart.component.css']
})
export class PlotlyBarChartComponent implements OnInit {
  @Input()
  barChartData: Array<{ labels: Array<string>, dataPoints: Array<number>, name: string }>;
  @Input()
  yAxisLabel: string;
  @Input()
  chartTitle: string;

  @ViewChild('barChart', { static: false }) barChart: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.drawChart();
  }

  ngOnChanges() {
    if (this.barChart) {
      this.drawChart();
    }
  }

  drawChart() {
    let traces: Array<{ x: Array<string>, y: Array<number>, name: string, type: string, text: Array<string>, textposition: string, hovertemplate: string }> = new Array();
    this.barChartData.forEach(bar => {
      traces.push({
        x: bar.labels,
        y: bar.dataPoints,
        text: bar.dataPoints.map((y) => { return y.toFixed(2) }),
        textposition: 'auto',
        hovertemplate: 'Power: %{y:.3r} kW<extra></extra>',
        name: bar.name,
        type: 'bar',
      })
    });
    let layout = {
      barmode: 'group',
      showlegend: true,
      legend: { "orientation": "h" },
      yaxis: {
        hoverformat: '.3r',
        title: {
          text: this.yAxisLabel,
          font: {
            family: 'Arial',
            size: 16
          }
        }
      }
    };
    Plotly.newPlot(this.barChart.nativeElement, traces, layout, { responsive: true });
  }

}
