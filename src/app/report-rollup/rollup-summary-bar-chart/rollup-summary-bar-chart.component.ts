import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import * as Plotly from 'plotly.js';
import { BarChartDataItem } from './bar-chart-data';

@Component({
  selector: 'app-rollup-summary-bar-chart',
  templateUrl: './rollup-summary-bar-chart.component.html',
  styleUrls: ['./rollup-summary-bar-chart.component.css']
})
export class RollupSummaryBarChartComponent implements OnInit {
  @Input()
  yAxisLabel: string;
  @Input()
  tickFormat: string;
  @Input()
  barChartData: Array<BarChartDataItem>;
  @Input()
  printView: boolean;

  @ViewChild('rollupBarChart', { static: false }) rollupBarChart: ElementRef;
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if (!this.printView) {
      this.createBarChart();
    } else {
      this.createPrintChart();
    }
  }

  ngOnChanges() {
    if (this.rollupBarChart && !this.printView) {
      this.createBarChart();
    } else if (this.rollupBarChart && this.printView) {
      this.createPrintChart();
    }
  }
  createBarChart() {
    var layout = {
      barmode: 'stack',
      showlegend: true,
      legend: {
        x: .25,
        y: 1.3,
        orientation: "h"
      },
      font: {
        size: 14,
      },
      yaxis: {
        hoverformat: '.3r',
        // automargin: true,
        tickformat: this.tickFormat,
        fixedrange: true,
        title: {
          text: this.yAxisLabel,
          font: {
            size: 14,
          }
        }
      },
      xaxis: {
        automargin: true,
        fixedrange: true
      },
      margin: { t: 15, b: 10 }
    };
    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };

    Plotly.react(this.rollupBarChart.nativeElement, this.barChartData, layout, configOptions);
  }

  createPrintChart() {
    var layout = {
      barmode: 'stack',
      showlegend: true,
      legend: {
        x: .25,
        y: 1.3,
        orientation: "h"
      },
      font: {
        size: 14,
      },
      yaxis: {
        hoverformat: '.3r',
        // automargin: true,
        tickformat: this.tickFormat,
        fixedrange: true,
        text: this.yAxisLabel
      },
      xaxis: {
        automargin: true,
        fixedrange: true
      },

      width: 1000,
      margin: { t: 20, l: 100, r: 30, b: 40 }
    };

    var configOptions = {
      // modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: false,
    };
    Plotly.react(this.rollupBarChart.nativeElement, this.barChartData, layout, configOptions);
  }

}
