import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as Plotly from 'plotly.js';
import { BarChartDataItem } from '../../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { PieChartDataItem } from '../../rollup-summary-pie-chart/rollup-summary-pie-chart.component';

@Component({
  selector: 'app-report-summary-bar-chart',
  templateUrl: './report-summary-bar-chart.component.html',
  styleUrls: ['./report-summary-bar-chart.component.css']
})
export class ReportSummaryBarChartComponent implements OnInit {
  @Input()
  yAxisLabel: string;
  @Input()
  tickFormat: string;
  @Input()
  barChartData: Array<BarChartDataItem>;
  @Input()
  printView: boolean;

  @ViewChild('reportBarChart', { static: false }) reportBarChart: ElementRef;

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
    if(this.reportBarChart){
      Plotly.purge(this.reportBarChart.nativeElement);
    }
    if (this.reportBarChart) {
      this.createBarChart();
    }
  }

  createBarChart() {
    var layout = {
      barmode: 'stack',
      showlegend: true,
      legend: {
        x: 1,
        y: 0.5
      },
      font: {
        size: 12,
      },
      yaxis: {
        hoverformat: '.3r',
        automargin: true,
        tickformat: this.tickFormat,
        fixedrange: true,
        title: {
          text: this.yAxisLabel,
          font: {
            size: 12,
          }
        }
      },
      xaxis: {
        automargin: true,
        fixedrange: true
      },
      // margin: { t: 15, b: 10 }
    };
    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };

    Plotly.newPlot(this.reportBarChart.nativeElement, this.barChartData, layout, configOptions);
  }

  createPrintChart() {
    var layout = {
      barmode: 'stack',
      showlegend: true,
      legend: {
        x: 1,
        y: 0.5,
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
    Plotly.newPlot(this.reportBarChart.nativeElement, this.barChartData, layout, configOptions);
  }


  

}
