import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as Plotly from 'plotly.js';
import { PieChartDataItem } from '../../rollup-summary-pie-chart/rollup-summary-pie-chart.component';

@Component({
  selector: 'app-report-summary-bar-chart',
  templateUrl: './report-summary-bar-chart.component.html',
  styleUrls: ['./report-summary-bar-chart.component.css']
})
export class ReportSummaryBarChartComponent implements OnInit {
  @Input()
  pieChartData: Array<PieChartDataItem>;
  @Input()
  titleStr: string;
  @Input()
  dataOption: string;
  @Input()
  energyUnit: string;

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

  @ViewChild('reportBarChart', { static: false }) reportBarChart: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges() {
    if(this.reportBarChart){
      Plotly.purge(this.reportBarChart.nativeElement);
    }
    if (this.reportBarChart) {
      this.createChart();
    }
  }

  createChart() {
    let traces = this.getTraces();
    let layout = {
      width: this.reportBarChart.nativeElement.clientWidth,
      barmode: 'group',
      showlegend: true,
      legend: { "orientation": "h" },
      font: {
        size: 14,
      },
      yaxis: {
        hoverformat: '.3r',
        title: {
          text: this.yAxisLabel,
          font: {
            family: 'Roboto',
            size: 14
          }
        },
        fixedrange: true
      },
      xaxis: {
        fixedrange: true
      },
      margin: { t: 0 }
    };

    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.newPlot(this.reportBarChart.nativeElement, traces, layout, configOptions);
  }

  getTraces(): Array<{ x: Array<string>, y: Array<number>, name: string, type: string, text: Array<string>, textposition: string, hovertemplate: string }> {
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
