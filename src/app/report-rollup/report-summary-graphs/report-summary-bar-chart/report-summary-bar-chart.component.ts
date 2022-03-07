import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { BarChartDataItem } from '../../rollup-summary-bar-chart/rollup-summary-bar-chart.component';

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

  constructor(private plotlyService: PlotlyService) { }

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
    if (this.reportBarChart) {
      this.createBarChart();
    }
  }

  createBarChart() {
    let layout = {
      barmode: 'stack',
      showlegend: true,
      legend: { "orientation": "h" },
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
      }
    };
    let configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };

    this.plotlyService.newPlot(this.reportBarChart.nativeElement, this.barChartData, layout, configOptions);
  }

  createPrintChart() {
    let layout = {
      barmode: 'stack',
      showlegend: true,
      legend: { "orientation": "h" },
      font: {
        size: 14,
      },
      yaxis: {
        hoverformat: '.3r',
        automargin: true,
        tickformat: this.tickFormat,
        fixedrange: true,
        text: this.yAxisLabel
      },
      xaxis: {
        automargin: true,
        fixedrange: true
      },

      margin: { t: 0}
    };

    let configOptions = {
      displaylogo: false,
      displayModeBar: false,
    };
    this.plotlyService.newPlot(this.reportBarChart.nativeElement, this.barChartData, layout, configOptions);
  }


  

}
