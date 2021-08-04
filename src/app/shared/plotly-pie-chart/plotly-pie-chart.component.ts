import { Component, OnInit, ElementRef, ViewChild, Input, HostListener } from '@angular/core';
import * as Plotly from 'plotly.js';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';

@Component({
  selector: 'app-plotly-pie-chart',
  templateUrl: './plotly-pie-chart.component.html',
  styleUrls: ['./plotly-pie-chart.component.css']
})
export class PlotlyPieChartComponent implements OnInit {
  @Input()
  valuesAndLabels: Array<{ value: number, label: string }>;
  @Input()
  valuesUnit: string;
  @Input()
  title: string;
  @Input()
  isPrint: boolean;
  @Input()
  textTemplate: string;

  @ViewChild('plotlyPieChart', { static: false }) plotlyPieChart: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if (!this.isPrint) {
      this.createChart();
    } else {
      this.drawPrintPlot();
    }
  }

  ngOnChanges() {
    if (this.plotlyPieChart) {
      if (!this.isPrint) {
        this.createChart();
      } else {
        this.drawPrintPlot();
      }
    }
  }

  createChart() {
    let data = {
      values: this.valuesAndLabels.map(val => { return val.value }),
      labels: this.valuesAndLabels.map(val => { return val.label }),
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      textinfo: 'label+percent',
      texttemplate: this.textTemplate,
      hoverinfo: 'label+value',
      direction: "clockwise",
      rotation: 90,
      hovertemplate: '%{value:,.2f} ' + this.valuesUnit + ' <extra></extra>'
    };
    let layout = {
      font: {
        size: 14,
      },
      showlegend: false,
      // margin: {t: 10, b: 10, l: 30, r: 30}
    };

    let modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.react(this.plotlyPieChart.nativeElement, [data], layout, modebarBtns);
  }

  drawPrintPlot() {
    let data = {
      values: this.valuesAndLabels.map(val => { return val.value }),
      labels: this.valuesAndLabels.map(val => { return val.label }),
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      automargin: false,
      textinfo: 'label+percent',
      texttemplate: this.textTemplate,
      hoverinfo: 'label+value',
      direction: "clockwise",
      rotation: 90,
      hovertemplate: '%{value:,.2f} ' + this.valuesUnit + ' <extra></extra>'
    };

    let layout = {
      font: {
        size: 12,
      },
      showlegend: false,
      margin: { t: 0, b: 0}
    };
    let modebarBtns = {
      displaylogo: false,
      displayModeBar: false
    };

    Plotly.react(this.plotlyPieChart.nativeElement, [data], layout, modebarBtns);
  }
}
