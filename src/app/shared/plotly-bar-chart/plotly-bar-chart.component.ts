import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import * as Plotly from 'plotly.js';
@Component({
  selector: 'app-plotly-bar-chart',
  templateUrl: './plotly-bar-chart.component.html',
  styleUrls: ['./plotly-bar-chart.component.css']
})
export class PlotlyBarChartComponent implements OnInit {
  @Input()
  barChartDataArray: Array<{ barChartLabels: Array<string>, barChartValues: Array<number>, name: string }>;
  @Input()
  yAxisLabel: string;
  @Input()
  chartTitle: string;
  @Input()
  yValueUnit: string;

  @ViewChild('barChart', { static: false }) barChart: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.drawChart();
  }

  ngOnChanges() {
    if (this.barChart) {
      Plotly.purge(this.barChart.nativeElement);
      this.drawChart();
    }
  }

  drawChart() {
    let traces: Array<{ x: Array<string>, y: Array<number>, name: string, type: string, text: Array<string>, textposition: string, hovertemplate: string }> = new Array();
    this.barChartDataArray.forEach(bar => {
      traces.push({
        x: bar.barChartLabels,
        y: bar.barChartValues,
        text: bar.barChartValues.map((y) => { return y.toFixed(2) }),
        textposition: 'auto',
        hovertemplate: 'Power: %{y:.3r} ' + this.yValueUnit + '<extra></extra>',
        name: bar.name,
        type: 'bar',
      })
    });
    let layout = {
      width: this.barChart.nativeElement.clientWidth,
      barmode: 'group',
      showlegend: true,
      legend: { "orientation": "h" },
      font: {
        size: 16,
      },
      yaxis: {
        hoverformat: '.3r',
        title: {
          text: this.yAxisLabel,
          font: {
            family: 'Arial',
            size: 16
          }
        }
      },
      margin: {t: 0}
    };

    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.react(this.barChart.nativeElement, traces, layout, configOptions);
  }

}
