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
  values: Array<number>;
  @Input()
  labels: Array<string>;
  @Input()
  valuesUnit: string;
  @Input()
  title: string;
  @Input()
  isPrint: boolean;

  @ViewChild('plotlyPieChart', { static: false }) plotlyPieChart: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.drawPlot();
  }


  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if (!this.isPrint) {
      this.drawPlot();
    } else {
      this.drawPrintPlot();
    }
  }

  ngOnChanges() {
    if (this.plotlyPieChart) {
      // Plotly.purge(this.plotlyPieChart.nativeElement);
      if (!this.isPrint) {
        this.drawPlot();
      } else {
        this.drawPrintPlot();
      }
    }
  }

  drawPlot() {
    Plotly.purge(this.plotlyPieChart.nativeElement)
    var data = [{
      values: this.values,
      labels: this.labels,
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      automargin: true,
      textinfo: 'label+percent',
      hoverformat: '.2r',
      text: this.values.map(y => { return (y).toFixed(2) + ' ' + this.valuesUnit; }),
      hoverinfo: 'text'
    }];

    var layout = {
      updatemenus: [],
      // width: this.plotlyPieChart.nativeElement.clientWidth,
      font: {
        size: 16,
      },
      showlegend: false,
      // margin: {t: 10, b: 10, l: 30, r: 30}
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true
    };
    Plotly.react(this.plotlyPieChart.nativeElement, data, layout, modebarBtns);
  }

  drawPrintPlot() {

    var data = [{
      values: this.values,
      labels: this.labels,
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      automargin: true,
      textinfo: 'label+percent',
      hoverformat: '.2r',
      text: this.values.map(y => { return (y).toFixed(2) + ' ' + this.valuesUnit; }),
      hoverinfo: 'text'
    }];

    var layout = {
      width: this.plotlyPieChart.nativeElement.clientWidth,
      font: {
        size: 16,
      },
      showlegend: false,
      margin: {t: 0, b: 0}
    };
    var modebarBtns = {
      displaylogo: false,
      displayModeBar: false
    };
    Plotly.react(this.plotlyPieChart.nativeElement, data, layout, modebarBtns);
  }
}
