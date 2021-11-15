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
  @Input()
  hoverLabel: string;
  @Input()
  isPrint: boolean;

  @ViewChild('barChart', { static: false }) barChart: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if (!this.isPrint) {
      this.createChart();
    } else {
      this.drawPrintChart();
    }
  }

  ngOnChanges() {
    if (this.barChart) {
      if (!this.isPrint) {
        this.createChart();
      } else {
        this.drawPrintChart();
      }
    }
  }


  createChart() {
    let traces = this.getTraces();
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
            family: 'Roboto',
            size: 16
          }
        },
        fixedrange: true
      },
      xaxis: {
        fixedrange: true
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

  drawPrintChart(){
    let traces = this.getTraces();
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
            family: 'Roboto',
            size: 16
          }
        },
        fixedrange: true
      },
      xaxis: {
        fixedrange: true
      },
      margin: {t: 0}
    };

    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: false,
      responsive: false
    };
    Plotly.react(this.barChart.nativeElement, traces, layout, configOptions);

  }

  getTraces(): Array<{ x: Array<string>, y: Array<number>, name: string, type: string, text: Array<string>, textposition: string, hovertemplate: string }>{
    let traces: Array<{ x: Array<string>, y: Array<number>, name: string, type: string, text: Array<string>, textposition: string, hovertemplate: string }> = new Array();
    this.barChartDataArray.forEach(bar => {
      traces.push({
        x: bar.barChartLabels,
        y: bar.barChartValues,
        text: bar.barChartValues.map((y) => { return y.toFixed(2) }),
        textposition: 'auto',
        hovertemplate: this.hoverLabel + ': %{y:.3r} ' + this.yValueUnit + '<extra></extra>',
        name: bar.name,
        type: 'bar',
      })
    });
    return traces;
  }

}
